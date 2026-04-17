import "./CompletedInterviewsList.css";

const CompletedInterviewsList = ({
  rows,
  modeDotClass,
  onViewHistory,
  onSingleView,
}) => {
  return (
    <div className="completed-card">
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
              <th>Single View</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.interviewId}>
                <td className="bold">{r.interviewId}</td>
                <td>{r.candidate}</td>
                <td>{r.jobTitle}</td>
                <td>{r.date}</td>
                <td>{r.time}</td>

                <td>
                  <div className="mode-cell">
                    <span className={`mode-dot ${modeDotClass(r.mode)}`} />
                    <span>{r.mode}</span>
                  </div>
                </td>

                <td className="notes-cell">{r.notes}</td>

                <td>
                  <button
                    className="history-btn"
                    onClick={() => onViewHistory(r)}
                  >
                    View
                  </button>
                </td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() => onSingleView(r)}
                  >
                    View
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

export default CompletedInterviewsList;