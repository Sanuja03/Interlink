import { useState, useRef, useEffect } from "react";
import "./PendingRequestsList.css";

/* ── Display helpers (formatting only — underlying data is unchanged) ── */

// Title-case each word and lowercase the rest:
// "ui/ux design" → "Ui/Ux Design", "dewmi durga" → "Dewmi Durga"
const toTitle = (value) => {
  if (value == null) return "";
  const s = String(value).trim();
  if (!s || s === "—") return s;
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
};

// "04:00" or "14:30:00" → "4:00 AM" / "2:30 PM"
const toAmPm = (value) => {
  if (!value) return value || "";
  const m = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return value; // leave anything unexpected as-is
  let h = parseInt(m[1], 10);
  const min = m[2];
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${period}`;
};

/**
 * Location pill shown only on Physical rows. Reveals the full address in a
 * tooltip on hover / focus / tap. Fixed positioning so the table's
 * horizontal-scroll container can't clip it.
 */
const LocationBadge = ({ location }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const show = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 280;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    setCoords({ top: r.bottom + 8, left });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <span className="loc-wrap">
      <button
        ref={btnRef}
        type="button"
        className="loc-trigger"
        aria-label={`Interview location: ${location}`}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span className="pin" aria-hidden="true"></span>
        <span>Location</span>
      </button>
      {open && (
        <span
          className="loc-popover"
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
        >
          {location}
        </span>
      )}
    </span>
  );
};

const PendingRequestsList = ({
  rows,
  onToggle,
  onSend,
  onViewHistory,
  modeDotClass,
}) => {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <div className="schedule-card">
      <div
        className="table-wrapper"
        role="region"
        aria-label="Pending interview requests"
        tabIndex={0}
      >
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="col-id">Interview ID</th>
              <th className="col-candidate">Candidate</th>
              <th className="col-job">Job Title</th>
              <th className="col-date">Date</th>
              <th className="col-time">Time</th>
              <th className="col-mode">Mode</th>
              <th className="col-notes">Admin Notes</th>
              <th className="col-history">History</th>
              <th className="col-decision">Decision</th>
              <th className="col-send align-right">Send</th>
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr className="empty-row">
                <td colSpan={10}>
                  <div className="empty-state">No pending requests.</div>
                </td>
              </tr>
            )}

            {hasRows &&
              rows.map((row, index) => {
                const showLocation =
                  row.mode === "Physical" && !!row.interviewLocation;

                return (
                  <tr key={row.requestId || row.interviewId}>
                    {/* Interview ID left exactly as-is */}
                    <td className="bold col-id">{row.interviewId}</td>

                    <td className="col-candidate">{row.candidate}</td>
                    <td className="col-job" title={row.jobTitle}>
                      <span className="truncate">{row.jobTitle}</span>
                    </td>
                    <td className="col-date">{row.date}</td>
                    <td className="col-time">{toAmPm(row.time)}</td>

                    {/* Mode, with the Location pill on its own line below for Physical */}
                    <td className="col-mode">
                      <div className="mode-block">
                        <div className="mode-cell">
                          <span className={`mode-dot ${modeDotClass(row.mode)}`} />
                          <span className="mode-label">{toTitle(row.mode)}</span>
                        </div>
                        {showLocation && (
                          <LocationBadge location={row.interviewLocation} />
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="notes-cell col-notes" title={toTitle(row.notes)}>
                      <span className="truncate">{toTitle(row.notes) || "—"}</span>
                    </td>

                    {/* History */}
                    <td className="col-history">
                      <button
                        className="history-btn"
                        onClick={() => onViewHistory(row)}
                      >
                        View
                      </button>
                    </td>

                    {/* Accept / Reject toggle */}
                    <td className="col-decision">
                      <div className="decision-cell">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={row.accepted}
                            onChange={() => onToggle(index)}
                          />
                          <span className="slider" />
                        </label>
                        <span
                          className={`decision-label ${
                            row.accepted ? "is-accept" : "is-reject"
                          }`}
                        >
                          {row.accepted ? "Accept" : "Reject"}
                        </span>
                      </div>
                    </td>

                    {/* Send */}
                    <td className="col-send align-right">
                      <button className="send-btn" onClick={() => onSend(row)}>
                        Send
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRequestsList;