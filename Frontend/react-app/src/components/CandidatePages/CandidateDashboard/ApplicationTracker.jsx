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

const ApplicationTracker = ({ applications }) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export default ApplicationTracker;
