const PendingRequestsList = ({
  rows,
  onToggle,
  onSend,
  onViewHistory,
  modeDotClass,
}) => {
  if (!rows || rows.length === 0) {
    return <p className="empty-state">No pending requests.</p>;
  }

  return (
    <div className="pending-list">
      {rows.map((row, index) => (
        <div key={row.requestId || row.interviewId} className="pending-row">
          <div className="row-main">
            <div className="row-id">{row.interviewId}</div>
            <div className="row-candidate">{row.candidate}</div>
            <div className="row-job">{row.jobTitle}</div>
            <div className="row-date">{row.date}</div>
            <div className="row-time">{row.time}</div>
            <div className="row-mode">
              <span className={`mode-dot ${modeDotClass(row.mode)}`}></span>
              {row.mode}
            </div>
            <div className="row-notes">{row.notes}</div>
          </div>

          <div className="row-actions">
            <button
              className="view-btn"
              onClick={() => onViewHistory(row)}
            >
              View History
            </button>

            <label className="toggle">
              <input
                type="checkbox"
                checked={row.accepted}
                onChange={() => onToggle(index)}
              />
              <span>{row.accepted ? "Accept" : "Reject"}</span>
            </label>

            <button
              className="send-btn"
              onClick={() => onSend(row)}
            >
              Send
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequestsList;