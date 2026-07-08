import { useNavigate } from "react-router-dom";

/* ============================================================
   ApplicationTracker — CSS + JSX in one file
   ============================================================ */
//try now
const atStyles = `
  .at-section {
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 18px;
    padding: 22px 24px 18px;
    box-shadow: 0 2px 8px rgba(26,63,92,0.07);
    overflow-x: auto;
  }

  .at-title {
    font-size: 1rem;
    font-weight: 800;
    color: #1a3f5c;
    margin: 0 0 16px;
    text-align: center;
  }

  .at-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 560px;
  }

  .at-table thead th {
    font-size: 0.78rem;
    font-weight: 700;
    color: #1a6a82;
    text-align: left;
    padding: 8px 12px;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .at-table tbody tr {
    transition: background 0.15s;
  }

  .at-table tbody tr:hover {
    background: #f0f9ff;
  }

  .at-table tbody td {
    font-size: 0.82rem;
    color: #374151;
    padding: 9px 12px;
    border-bottom: 1px solid #f3f4f6;
    white-space: nowrap;
  }

  .at-table tbody tr:last-child td {
    border-bottom: none;
  }

  .at-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .at-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .at-result--pending  { color: #92400e; }
  .at-result--rejected { color: #b91c1c; }
  .at-result--accepted { color: #15803d; }
  .at-result--selected { color: #15803d; }
  .at-result--shortlisted { color: #1d4ed8; }

  .at-action-btn {
    background: linear-gradient(135deg, #1a6a82, #1a3f5c);
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(26, 106, 130, 0.15);
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .at-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(26, 106, 130, 0.25);
    background: linear-gradient(135deg, #1d7994, #204e72);
  }

  .at-action-btn:active {
    transform: translateY(0);
  }

  .at-action-expired {
    font-size: 0.75rem;
    font-weight: 600;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 6px 14px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    cursor: not-allowed;
  }

  .at-action-attempted {
    font-size: 0.75rem;
    font-weight: 600;
    color: #047857;
    background: #d1fae5;
    padding: 6px 14px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    cursor: not-allowed;
  }
`;

const resultStyle = (r) => {
  const result = String(r || "").toUpperCase();
  if (result === "REJECTED") return "at-result--rejected";
  if (result === "ACCEPTED") return "at-result--accepted";
  if (result === "SELECTED") return "at-result--selected";
  if (result === "SHORTLISTED") return "at-result--shortlisted";
  return "at-result--pending";
};

const dotColor = (r) => {
  const result = String(r || "").toUpperCase();
  if (result === "REJECTED") return "#ef4444";
  if (result === "ACCEPTED" || result === "SELECTED") return "#22c55e";
  if (result === "SHORTLISTED") return "#3b82f6";
  return "#f59e0b";
};

const displayResult = (result) => {
  if (!result) return "-";
  return String(result)
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
};

const isDeadlinePassed = (deadlineStr) => {
  if (!deadlineStr) return false;
  const deadlineDate = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};

const ApplicationTracker = ({ applications }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>{atStyles}</style>
      <div className="at-section">
        <h3 className="at-title">Application Status Tracker</h3>
        <table className="at-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Applied</th>
              <th>Shortlisted</th>
              <th>Interview</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, i) => (
              <tr key={i}>
                <td>{app.jobTitle}</td>
                <td>{app.company}</td>
                <td>{app.applied}</td>
                <td>{app.shortlisted}</td>
                <td>
                  <span className="at-badge">
                    <span className="at-dot" style={{ background: dotColor(app.result) }} />
                    {app.interview}
                  </span>
                </td>
                <td>
                  <span className={`at-badge ${resultStyle(app.result)}`}>
                    {displayResult(app.result)}
                  </span>
                </td>
                <td>
                  {app.quizAttempted ? (
                    <span className="at-action-attempted" title="You have already completed the AI interview quiz for this job.">
                      Attempted
                    </span>
                  ) : !isDeadlinePassed(app.deadline) ? (
                    <button
                      className="at-action-btn"
                      onClick={() => navigate('/Candidate/aiquestions', {
                        state: {
                          job: {
                            id: app.jobId,
                            title: app.jobTitle,
                            company: app.company,
                            deadline: app.deadline
                          }
                        }
                      })}
                    >
                      Practice with AI ✨
                    </button>
                  ) : (
                    <span className="at-action-expired" title="The deadline for this job post has passed.">
                      Deadline Passed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ApplicationTracker;
