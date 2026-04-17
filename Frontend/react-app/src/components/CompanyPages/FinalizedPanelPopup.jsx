import { useState } from "react";
import "./InterviewPopups.css";

const FinalizedPanelPopup = ({
  open,
  onClose,
  interviewDetails = {},
  acceptedInterviewers = [],
  onSendDetails,
}) => {
  const [meetingLink, setMeetingLink] = useState("");

  if (!open) return null;

  const handleSend = () => {
    const payload = {
      meetingLink,
      interviewDetails,
      interviewers: acceptedInterviewers,
    };

    if (onSendDetails) {
      onSendDetails(payload);
    } else {
      console.log("Sending interview schedule:", payload);
      alert("Interview details sent to accepted interviewers");
    }
  };

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Finalized Interview Panel</h2>

        <div className="ip-card">

          {/* Interview Details */}
          <div className="ip-info-grid ip-info-grid-2">

            <div className="ip-info-box">
              <span className="ip-info-label">Job Role</span>
              <span className="ip-info-value">
                {interviewDetails.jobTitle || "UI/UX Designer"}
              </span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">Mode</span>
              <span className="ip-info-value">
                {interviewDetails.mode || "Online"}
              </span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">Interview Date</span>
              <span className="ip-info-value">
                {interviewDetails.date || "2026-03-15"}
              </span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">Interview Time</span>
              <span className="ip-info-value">
                {interviewDetails.time || "10:30 AM"}
              </span>
            </div>

          </div>

          {/* Accepted Interviewers */}
          <div className="ip-field">
            <label className="ip-label">Finalized Interviewers</label>

            <div className="ip-status-list">

              {acceptedInterviewers.length > 0 ? (
                acceptedInterviewers.map((person) => (
                  <div key={person.id} className="ip-status-card">

                    <div>
                      <p className="ip-person-name">{person.name}</p>
                      <p className="ip-person-role">{person.role}</p>
                    </div>

                    <span className="ip-badge ip-accepted">
                      Accepted
                    </span>

                  </div>
                ))
              ) : (
                <div className="ip-note-box">
                  No accepted interviewers available.
                </div>
              )}

            </div>
          </div>

          {/* Meeting Link */}
          <div className="ip-field">
            <label className="ip-label">Meeting Link</label>

            <input
              className="ip-input"
              type="text"
              placeholder="Enter Google Meet / Zoom / Teams link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

        </div>

        <div className="ip-actions">

          <button
            className="ip-primary-btn"
            disabled={!meetingLink || acceptedInterviewers.length === 0}
            onClick={handleSend}
          >
            Send Scheduled Interview Details
          </button>

          <button
            className="ip-danger-btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default FinalizedPanelPopup;