/* ============================================================
   UpcomingInterviews — Modern, responsive interview schedule panel
   ============================================================ */

const uiStyles = `
  .ui-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 22px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
    transition: box-shadow 0.2s ease;
  }

  .ui-panel:hover {
    box-shadow: 0 4px 16px rgba(26, 63, 92, 0.06);
  }

  .ui-panel__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }

  .ui-panel__title-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ui-panel__icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #f0f9fb;
    color: #1a6a82;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ui-panel__heading {
    font-size: 0.92rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .ui-panel__badge {
    font-size: 0.72rem;
    font-weight: 700;
    color: #1a6a82;
    background: #e6f4f8;
    padding: 3px 10px;
    border-radius: 9999px;
  }

  .ui-cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    max-height: 280px;
    padding-right: 2px;
  }

  .ui-cards-list::-webkit-scrollbar {
    width: 4px;
  }
  .ui-cards-list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .ui-card {
    background: linear-gradient(135deg, #1a6a82 0%, #174b68 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(26, 63, 92, 0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .ui-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26, 63, 92, 0.22);
  }

  .ui-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .ui-card__company {
    font-size: 0.95rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .ui-card__role {
    font-size: 0.8rem;
    font-weight: 600;
    color: #bfe8f6;
    margin: 2px 0 0;
  }

  .ui-card__meta {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px;
  }

  .ui-card__meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: #e0f2fe;
    font-weight: 500;
  }

  .ui-card__meta-icon {
    width: 14px;
    height: 14px;
    color: #7dd3fc;
    flex-shrink: 0;
  }

  .ui-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ui-card__mode {
    font-size: 0.74rem;
    color: #bfe8f6;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
  }

  .ui-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .ui-badge--completed {
    background: rgba(34, 197, 94, 0.25);
    color: #bbf7d0;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .ui-badge--scheduled {
    background: rgba(56, 189, 248, 0.22);
    color: #e0f2fe;
    border: 1px solid rgba(56, 189, 248, 0.35);
  }

  .ui-badge--rescheduled {
    background: rgba(234, 179, 8, 0.25);
    color: #fef08a;
    border: 1px solid rgba(234, 179, 8, 0.3);
  }

  .ui-badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ui-badge--completed .ui-badge__dot { background: #4ade80; }
  .ui-badge--scheduled .ui-badge__dot  { background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }
  .ui-badge--rescheduled .ui-badge__dot { background: #facc15; }

  .ui-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 36px 16px;
    flex: 1;
    min-height: 160px;
    background: #f8fafc;
    border: 1.5px dashed #cbd5e1;
    border-radius: 16px;
  }

  .ui-empty__icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e6f4f8;
    color: #1a6a82;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .ui-empty__icon {
    width: 24px;
    height: 24px;
  }

  .ui-empty__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px;
  }

  .ui-empty__sub {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    max-width: 260px;
    line-height: 1.4;
  }

  @media (max-width: 767px) {
    .ui-panel {
      padding: 18px 16px 16px;
      border-radius: 16px;
    }
  }
`;

const statusClass = (s) => {
  const status = String(s || "").toUpperCase();
  if (status === "COMPLETED") return "ui-badge--completed";
  if (status === "SCHEDULED") return "ui-badge--scheduled";
  if (status === "RESCHEDULED") return "ui-badge--rescheduled";
  return "ui-badge--scheduled";
};

const formatTime = (time) => {
  if (!time) return "-";
  const [hourValue, minute = "00"] = String(time).split(":");
  const hour = Number(hourValue);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
};

const displayStatus = (status) => {
  if (!status) return "Scheduled";
  return String(status)
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
};

const CalIcon = ({ className = "ui-card__meta-icon" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="ui-card__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="ui-card__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const UpcomingInterviews = ({ interviews }) => {
  const hasInterviews = Array.isArray(interviews) && interviews.length > 0;

  return (
    <>
      <style>{uiStyles}</style>
      <div className="ui-panel">
        <div className="ui-panel__top">
          <div className="ui-panel__title-group">
            <div className="ui-panel__icon-badge">
              <CalIcon className="w-4 h-4" />
            </div>
            <h3 className="ui-panel__heading">Upcoming Interviews</h3>
          </div>
          <span className="ui-panel__badge">
            {hasInterviews ? `${interviews.length} Scheduled` : "None"}
          </span>
        </div>

        {hasInterviews ? (
          <div className="ui-cards-list">
            {interviews.map((iv, i) => (
              <div className="ui-card" key={i}>
                <div className="ui-card__header">
                  <div>
                    <p className="ui-card__company">{iv.company || "-"}</p>
                    <p className="ui-card__role">{iv.jobTitle || iv.role || "-"}</p>
                  </div>
                  <span className={`ui-badge ${statusClass(iv.status)}`}>
                    <span className="ui-badge__dot" />
                    {displayStatus(iv.status)}
                  </span>
                </div>

                <div className="ui-card__meta">
                  <span className="ui-card__meta-item">
                    <CalIcon />
                    {iv.date || "-"}
                  </span>
                  <span className="ui-card__meta-item">
                    <ClockIcon />
                    {formatTime(iv.time)}
                  </span>
                </div>

                <div className="ui-card__footer">
                  <span className="ui-card__mode">
                    <LinkIcon />
                    {iv.mode || "Online Interview"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ui-empty">
            <div className="ui-empty__icon-wrap">
              <CalIcon className="ui-empty__icon" />
            </div>
            <p className="ui-empty__title">No upcoming interviews</p>
            <p className="ui-empty__sub">
              You don't have any interviews scheduled at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UpcomingInterviews;
