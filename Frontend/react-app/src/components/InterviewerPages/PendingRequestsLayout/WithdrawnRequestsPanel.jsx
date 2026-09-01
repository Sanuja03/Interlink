import { useMemo, useState } from "react";
import { UserMinus, CalendarX, CalendarClock, X, ChevronDown } from "lucide-react";
import "./WithdrawnRequestsPanel.css";

/* ── Display helpers ── */

// "2026-08-19" → "19 Aug 2026"
const toNiceDate = (value) => {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// "14:30" → "2:30 PM"
const toAmPm = (value) => {
  if (!value) return "";
  const m = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return value;
  let h = parseInt(m[1], 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m[2]} ${period}`;
};

// ISO timestamp → "just now" / "3h ago" / "2 days ago"
const toRelative = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
};

/**
 * Copy for each outcome. `accepted` says whether this browser recorded the
 * interviewer accepting the request — the stored row can't prove it (an admin
 * removal and a self-decline both land on "rejected" server-side), so the
 * wording only claims an acceptance when we actually saw one.
 */
const describe = (item, accepted) => {
  switch (item.outcome) {
    case "cancelled":
      return {
        kind: "cancelled",
        Icon: CalendarX,
        title: "Interview cancelled",
        detail: accepted
          ? "You had accepted this — the company has since cancelled it."
          : "The company cancelled this interview request.",
      };
    case "rescheduled":
      return {
        kind: "rescheduled",
        Icon: CalendarClock,
        title: "Cancelled & rescheduled",
        detail: item.invitedAgain
          ? "It was re-created at a new slot and you've been invited again — see your pending list below."
          : "It was re-created at a new slot without you on the panel.",
      };
    default:
      return {
        kind: "removed",
        Icon: UserMinus,
        title: "Removed from panel",
        detail: accepted
          ? "You had accepted this — the company has since taken you off the panel."
          : "You're no longer on the panel for this interview.",
      };
  }
};

/**
 * Notice panel above the pending list: interviews this interviewer was on and
 * no longer holds — removed from the panel, cancelled, or cancelled and redone.
 *
 * Items are dismissible; dismissals live in localStorage (the same approach the
 * company-admin status popup already uses for its "Removed" badges).
 */
const WithdrawnRequestsPanel = ({ items, decisions, onDismiss }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Anything the interviewer declined themselves isn't news to them.
  const visible = useMemo(
    () => (items || []).filter((i) => decisions?.[i.requestId] !== "rejected"),
    [items, decisions]
  );

  if (visible.length === 0) return null;

  return (
    <section
      className={`wrp-card ${collapsed ? "is-collapsed" : ""}`}
      aria-label="Changes to your interview requests"
    >
      <header className="wrp-head">
        <span className="wrp-head-dot" aria-hidden="true" />
        <div className="wrp-head-text">
          <h2 className="wrp-title">Changes to your interviews</h2>
          <p className="wrp-sub">
            {visible.length} {visible.length === 1 ? "request is" : "requests are"} no
            longer yours
          </p>
        </div>
        <button
          type="button"
          className="wrp-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <ChevronDown size={18} aria-hidden="true" />
          <span className="wrp-sr">{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </header>

      {!collapsed && (
        <ul className="wrp-list">
          {visible.map((item) => {
            const accepted = decisions?.[item.requestId] === "accepted";
            const { kind, Icon, title, detail } = describe(item, accepted);

            return (
              <li key={item.requestId} className={`wrp-item is-${kind}`}>
                <span className="wrp-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>

                <div className="wrp-body">
                  <div className="wrp-line">
                    <span className="wrp-badge">{title}</span>
                    {item.interviewId && (
                      <span className="wrp-id">{item.interviewId}</span>
                    )}
                    {accepted && (
                      <span className="wrp-accepted">You accepted</span>
                    )}
                    {item.withdrawnAt && (
                      <span className="wrp-when">{toRelative(item.withdrawnAt)}</span>
                    )}
                  </div>

                  <p className="wrp-who">
                    <strong>{item.candidateName}</strong>
                    <span className="wrp-sep">•</span>
                    {item.jobTitle}
                  </p>

                  <p className="wrp-slot">
                    <span className={kind === "rescheduled" ? "wrp-struck" : ""}>
                      {toNiceDate(item.interviewDate)} at {toAmPm(item.interviewTime)}
                    </span>
                    {kind === "rescheduled" && item.newInterviewDate && (
                      <>
                        <span className="wrp-arrow" aria-hidden="true">
                          →
                        </span>
                        <span className="wrp-new">
                          {toNiceDate(item.newInterviewDate)} at{" "}
                          {toAmPm(item.newInterviewTime)}
                        </span>
                      </>
                    )}
                  </p>

                  <p className="wrp-detail">{detail}</p>
                </div>

                <button
                  type="button"
                  className="wrp-dismiss"
                  onClick={() => onDismiss(item.requestId)}
                  aria-label={`Dismiss notice for ${item.interviewId || item.candidateName}`}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default WithdrawnRequestsPanel;
