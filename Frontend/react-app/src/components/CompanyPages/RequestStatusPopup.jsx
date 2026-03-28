import "./InterviewPopups.css";

const RequestStatusPopup = ({
  open,
  onClose,
  panelSize = 2,
  interviewers = [],
  onResendRequest,
  onFinalizePanel,
}) => {
  if (!open) return null;

  const acceptedCount = interviewers.filter(
    (person) => person.requestStatus === "Accepted"
  ).length;

  const canFinalize = acceptedCount === panelSize;

  const getStatusClass = (status) => {
    if (status === "Accepted") return "ip-status-accepted";
    if (status === "Rejected") return "ip-status-rejected";
    if (status === "Pending") return "ip-status-pending";
    if (status === "Timed Out") return "ip-status-timeout";
    return "";
  };

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Request Status</h2>

        <div className="ip-card">
          <div className="ip-panel-top">
            <div className="ip-panel-box">
              <span className="ip-info-label">Panel Size</span>
              <span className="ip-info-value">{panelSize}</span>
            </div>

            <div className="ip-panel-box">
              <span className="ip-info-label">Accepted Count</span>
              <span className="ip-info-value">{acceptedCount}</span>
            </div>
          </div>

          <div className="ip-status-list">
            {interviewers.map((person) => (
              <div key={person.id} className="ip-status-card">
                <div>
                  <p className="ip-person-name">{person.name}</p>
                  <p className="ip-person-role">{person.role}</p>
                </div>

                <div className="ip-status-right">
                  <span
                    className={`ip-badge ${getStatusClass(person.requestStatus)}`}
                  >
                    {person.requestStatus}
                  </span>

                  {(person.requestStatus === "Rejected" ||
                    person.requestStatus === "Pending" ||
                    person.requestStatus === "Timed Out") && (
                    <button
                      className="ip-small-btn"
                      onClick={() => onResendRequest(person.id)}
                    >
                      Resend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!canFinalize && (
            <div className="ip-note-box">
              Finalize button will be enabled only when exactly{" "}
              <b>{panelSize}</b> interviewers have accepted.
            </div>
          )}
        </div>

        <div className="ip-actions">
          <button
            className="ip-primary-btn"
            onClick={onFinalizePanel}
            disabled={!canFinalize}
          >
            Finalize Panel
          </button>

          <button className="ip-danger-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestStatusPopup;