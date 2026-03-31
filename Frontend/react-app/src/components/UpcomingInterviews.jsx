/* ============================================================
   UpcomingInterviews — CSS + JSX in one file
   ============================================================ */

const uiStyles = `
  .ui-panel {
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 18px;
    padding: 20px 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(26,63,92,0.07);
    min-width: 0;
  }

  .ui-panel__heading {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1a3f5c;
    text-align: center;
    margin: 0 0 4px;
  }

  .ui-card {
    background: linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%);
    border-radius: 14px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ui-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ui-card__company {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .ui-card__role {
    font-size: 0.82rem;
    font-weight: 600;
    color: #a8d8ea;
    margin: 0;
    text-align: right;
  }

  .ui-card__meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .ui-card__meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
    color: #cfe8f3;
    font-weight: 500;
  }

  .ui-card__meta-icon {
    width: 14px;
    height: 14px;
    opacity: 0.8;
    flex-shrink: 0;
    color: #a8d8ea;
  }

  .ui-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ui-card__mode {
    font-size: 0.72rem;
    color: #a8d8ea;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .ui-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .ui-badge--completed {
    background: rgba(34,197,94,0.18);
    color: #bbf7d0;
  }

  .ui-badge--scheduled {
    background: rgba(59,130,246,0.18);
    color: #bfdbfe;
  }

  .ui-badge--rescheduled {
    background: rgba(234,179,8,0.18);
    color: #fef08a;
  }

  .ui-badge__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ui-badge--completed .ui-badge__dot { background: #22c55e; }
  .ui-badge--scheduled .ui-badge__dot  { background: #3b82f6; }
  .ui-badge--rescheduled .ui-badge__dot { background: #eab308; }
`;

const statusClass = (s) => {
  if (s === "Completed") return "ui-badge--completed";
  if (s === "Scheduled") return "ui-badge--scheduled";
  if (s === "Rescheduled") return "ui-badge--rescheduled";
  return "ui-badge--scheduled";
};

const CalIcon = () => (
  <svg className="ui-card__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const UpcomingInterviews = ({ interviews }) => (
  <>
    <style>{uiStyles}</style>
    <div className="ui-panel">
      <h3 className="ui-panel__heading">Upcoming Interviews</h3>
      {interviews.map((iv, i) => (
        <div className="ui-card" key={i}>
          <div className="ui-card__header">
            <p className="ui-card__company">{iv.company}</p>
            <p className="ui-card__role">{iv.role}</p>
          </div>
          <div className="ui-card__meta">
            <span className="ui-card__meta-item"><CalIcon />{iv.date}</span>
            <span className="ui-card__meta-item"><ClockIcon />{iv.time}</span>
          </div>
          <div className="ui-card__footer">
            <span className="ui-card__mode"><LinkIcon />{iv.mode}</span>
            <span className={`ui-badge ${statusClass(iv.status)}`}>
              <span className="ui-badge__dot" />
              {iv.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default UpcomingInterviews;
