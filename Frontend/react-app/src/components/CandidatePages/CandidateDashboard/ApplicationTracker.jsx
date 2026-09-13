import { useNavigate } from "react-router-dom";

/* ============================================================
   ApplicationTracker — Modern, responsive application tracking table
   ============================================================ */

const atStyles = `
  .at-section {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 24px 26px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    overflow-x: auto;
    transition: box-shadow 0.2s ease;
  }

  .at-section:hover {
    box-shadow: 0 4px 16px rgba(26, 63, 92, 0.06);
  }

  .at-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f1f5f9;
  }

  .at-title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .at-icon-badge {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f0f9fb;
    color: #1a6a82;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .at-title {
    font-size: 1rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .at-subtitle {
    font-size: 0.78rem;
    color: #64748b;
    margin: 2px 0 0;
  }

  .at-count-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: #1a6a82;
    background: #e6f4f8;
    padding: 4px 12px;
    border-radius: 9999px;
    white-space: nowrap;
  }

  .at-table-container {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
  }

  .at-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 620px;
    text-align: left;
  }

  .at-table thead th {
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
  }

  .at-table tbody tr {
    transition: background-color 0.15s ease;
    border-bottom: 1px solid #f1f5f9;
  }

  .at-table tbody tr:hover {
    background-color: #f8fafc;
  }

  .at-table tbody tr:last-child {
    border-bottom: none;
  }

  .at-table tbody td {
    font-size: 0.85rem;
    color: #334155;
    padding: 14px 16px;
    white-space: nowrap;
    vertical-align: middle;
  }

  .at-job-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.88rem;
  }

  .at-company {
    font-size: 0.76rem;
    color: #64748b;
    margin-top: 2px;
  }

  .at-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 9999px;
  }

  .at-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .at-result--pending {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }
  .at-result--rejected {
    background: #ffe4e6;
    color: #be123c;
    border: 1px solid #fecdd3;
  }
  .at-result--accepted,
  .at-result--selected {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }
  .at-result--shortlisted {
    background: #dbeafe;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .at-action-btn {
    background: linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%);
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 7px 16px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(26, 106, 130, 0.25);
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .at-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(26, 106, 130, 0.35);
    opacity: 0.95;
  }

  .at-action-btn:active {
    transform: translateY(0);
  }

  .at-action-attempted {
    font-size: 0.75rem;
    font-weight: 700;
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    padding: 5px 12px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .at-action-expired {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 5px 12px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    cursor: not-allowed;
  }

  .at-empty {
    text-align: center;
    padding: 40px 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1.5px dashed #cbd5e1;
  }

  .at-empty__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px;
  }

  .at-empty__sub {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 14px;
  }

  .at-empty__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 7px 18px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
  }

  @media (max-width: 767px) {
    .at-section {
      padding: 18px 16px 14px;
      border-radius: 16px;
    }
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
  if (!result) return "Pending";
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

const ApplicationTracker = ({ applications = [] }) => {
  const navigate = useNavigate();
  const hasApplications = Array.isArray(applications) && applications.length > 0;

  return (
    <>
      <style>{atStyles}</style>
      <div className="at-section">
        <div className="at-header">
          <div className="at-title-group">
            <div className="at-icon-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="at-title">Application Status Tracker</h3>
              <p className="at-subtitle">Monitor and practice for your submitted job applications</p>
            </div>
          </div>
          <span className="at-count-badge">
            {hasApplications ? `${applications.length} Applications` : "0 Tracked"}
          </span>
        </div>

        {hasApplications ? (
          <div className="at-table-container">
            <table className="at-table">
              <thead>
                <tr>
                  <th>Job Title & Company</th>
                  <th>Applied</th>
                  <th>Shortlisted</th>
                  <th>Interview Date</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr key={i}>
                    <td>
                      <div className="at-job-title">{app.jobTitle || "Job Position"}</div>
                      <div className="at-company">{app.company || "—"}</div>
                    </td>
                    <td>{app.applied || "—"}</td>
                    <td>{app.shortlisted || "—"}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="at-dot" style={{ background: dotColor(app.result) }} />
                        {app.interview || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`at-badge ${resultStyle(app.result)}`}>
                        {displayResult(app.result)}
                      </span>
                    </td>
                    <td>
                      {app.quizAttempted ? (
                        <span
                          className="at-action-attempted"
                          title="You have already completed the AI interview quiz for this job."
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Attempted
                        </span>
                      ) : !isDeadlinePassed(app.deadline) ? (
                        <button
                          className="at-action-btn"
                          onClick={() =>
                            navigate('/Candidate/aiquestions', {
                              state: {
                                job: {
                                  id: app.jobId,
                                  title: app.jobTitle,
                                  company: app.company,
                                  deadline: app.deadline,
                                },
                              },
                            })
                          }
                        >
                          Practice with AI ✨
                        </button>
                      ) : (
                        <span
                          className="at-action-expired"
                          title="The deadline for this job post has passed."
                        >
                          Deadline Passed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="at-empty">
            <p className="at-empty__title">No applications tracked yet</p>
            <p className="at-empty__sub">
              When you apply for open positions, their review status and AI assessments will appear here.
            </p>
            <button
              type="button"
              className="at-empty__btn"
              onClick={() => navigate('/candidate/jobposts')}
            >
              Explore Job Posts →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ApplicationTracker;
