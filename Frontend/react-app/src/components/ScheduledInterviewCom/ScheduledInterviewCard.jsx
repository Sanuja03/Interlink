import { useState } from "react";
import { Link } from "react-router-dom";
import "./ScheduledInterviewCard.css";

const ScheduledInterviewCard = ({ interview }) => {
  const [showPanelInfo, setShowPanelInfo] = useState(false);

  const {
    interviewId,
    date,
    time,
    jobTitle,
    meetingStatus,
    mode,
    meetingLink,
    panelMembers,
    adminNote,
  } = interview;

  const handleOpenPanelInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPanelInfo(true);
  };

  const handleClosePanelInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPanelInfo(false);
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    setShowPanelInfo(false);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  const statusClass =
    meetingStatus?.toLowerCase() === "ongoing"
      ? "status-ongoing"
      : "status-scheduled";

  const modeClass =
    mode?.toLowerCase() === "online" ? "si-mode-online" : "si-mode-physical";

  return (
    <>
      <div className="si-card si-card-clickable">
        <div className="si-header">
          <h3 className="si-title">{interviewId}</h3>
          <span className={`si-badge ${statusClass}`}>{meetingStatus}</span>
        </div>

        <div className="si-body">
          <div className="si-details">
            <div className="si-row">
              <span className="si-label">Date</span>
              <span className="si-value">{date}</span>
            </div>

            <div className="si-row">
              <span className="si-label">Time</span>
              <span className="si-value">{time}</span>
            </div>

            <div className="si-row">
              <span className="si-label">Job Role</span>
              <span className="si-value si-job">{jobTitle}</span>
            </div>

            <div className="si-row">
              <span className="si-label">Mode</span>
              <span className={`si-mode-pill ${modeClass}`}>{mode}</span>
            </div>
          </div>

          {mode?.toLowerCase() === "online" && (
            <button className="si-join" onClick={handleJoinMeeting}>
              Join Meeting
            </button>
          )}

          <div className="si-divider"></div>

          <button className="si-panel-btn" onClick={handleOpenPanelInfo}>
            View Panel Info
          </button>

          <p className="si-hint"></p>

          <Link
            to={`/SingleView/${interviewId}`}
            state={{ interview }}
            className="si-view-link"
          >
            View Details
          </Link>
        </div>
      </div>

      {showPanelInfo && (
        <div className="si-overlay" onClick={handleOverlayClick}>
          <div className="si-modal" onClick={handleModalClick}>
            <div className="si-modal-header">
              <h3 className="si-modal-title">Panel Information</h3>
              <button className="si-close" onClick={handleClosePanelInfo}>
                ✕
              </button>
            </div>

            <div className="si-modal-body">
              <div className="si-table-wrap">
                <table className="si-table">
                  <thead>
                    <tr>
                      <th>Employee No</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panelMembers && panelMembers.length > 0 ? (
                      panelMembers.map((member) => (
                        <tr key={member.emNo}>
                          <td>{member.emNo}</td>
                          <td>{member.name}</td>
                          <td>{member.position}</td>
                          <td>{member.mobile}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="si-no-data">
                          No panel members available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="si-admin-note">
                <h4 className="si-admin-title">Admin Note</h4>
                <p className="si-admin-text">
                  {adminNote && adminNote.trim() !== ""
                    ? adminNote
                    : "No admin notes available for this interview."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduledInterviewCard;