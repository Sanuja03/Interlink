import "./PendingRequestsList.css";

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
    <div className="schedule-card">
      <div className="table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Interview ID</th>
              <th>Candidate</th>
              <th>Job Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Mode</th>
              <th>Admin Notes</th>
              <th>History</th>
              <th>Decision</th>
              <th className="align-right">Send</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={row.requestId || row.interviewId}>
                <td className="bold">{row.interviewId}</td>
                <td>{row.candidate}</td>
                <td>{row.jobTitle}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>
                  <div className="mode-cell">
                    <span className={`mode-dot ${modeDotClass(row.mode)}`} />
                    {row.mode}
                  </div>
                </td>
                <td className="notes-cell">{row.notes}</td>

                {/* History */}
                <td>
                  <button
                    className="history-btn"
                    onClick={() => onViewHistory(row)}
                  >
                    View
                  </button>
                </td>

                {/* Accept / Reject toggle */}
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={row.accepted}
                      onChange={() => onToggle(index)}
                    />
                    <span className="slider" />
                  </label>
                  <span className="decision-label">
                    {row.accepted ? "Accept" : "Reject"}
                  </span>
                </td>

                {/* Send */}
                <td className="align-right">
                  <button
                    className="view-btn"
                    onClick={() => onSend(row)}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRequestsList;