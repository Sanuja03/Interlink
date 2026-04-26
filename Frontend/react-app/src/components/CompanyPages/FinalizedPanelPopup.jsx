import { useState } from "react";
import "./InterviewPopups.css";

/**
 * FinalizedPanelPopup
 *
 * Updated to include a scorecard template selector.
 * Only FINALIZED templates can be chosen here.
 *
 * New props:
 *  - scorecards : array — full list of scorecard templates for this job
 */
const FinalizedPanelPopup = ({
  open,
  onClose,
  interviewDetails = {},
  acceptedInterviewers = [],
  scorecards = [],
  onSendDetails,
}) => {
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedScorecardId, setSelectedScorecardId] = useState("");

  if (!open) return null;

  // Only show finalized scorecards in the dropdown
  const finalizedCards = scorecards.filter((c) => c.finalized);

  const selectedCard = finalizedCards.find((c) => c.id === selectedScorecardId) || null;

  const handleSend = () => {
    if (!selectedScorecardId) {
      alert("Please select a scorecard template before sending.");
      return;
    }

    const payload = {
      meetingLink,
      interviewDetails,
      interviewers: acceptedInterviewers,
      scorecard: selectedCard,
    };

    if (onSendDetails) {
      onSendDetails(payload);
    } else {
      console.log("Sending interview schedule:", payload);
      alert("Interview details sent to accepted interviewers with scorecard: " + selectedCard?.name);
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
                    <span className="ip-badge ip-accepted">Accepted</span>
                  </div>
                ))
              ) : (
                <div className="ip-note-box">
                  No accepted interviewers available.
                </div>
              )}
            </div>
          </div>

          {/* Scorecard Template Selector */}
          <div className="ip-field">
            <label className="ip-label">Evaluation Scorecard</label>

            {finalizedCards.length > 0 ? (
              <>
                <select
                  className="ip-input ip-select"
                  value={selectedScorecardId}
                  onChange={(e) => setSelectedScorecardId(e.target.value)}
                >
                  <option value="">— Select a scorecard template —</option>
                  {finalizedCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.fields.length} fields, max{" "}
                      {card.fields.reduce((s, f) => s + Number(f.maxScore || 0), 0)} pts)
                    </option>
                  ))}
                </select>

                {/* Preview selected scorecard fields */}
                {selectedCard && (
                  <div className="ip-scorecard-preview">
                    <p className="ip-scorecard-preview-title">Fields in this scorecard:</p>
                    <div className="ip-scorecard-chips">
                      {selectedCard.fields.map((f) => (
                        <span key={f.id} className="ip-scorecard-chip">
                          {f.label} (max {f.maxScore})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="ip-note-box">
                No finalized scorecard templates available. Please create and finalize a
                scorecard template first.
              </div>
            )}
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
            disabled={
              !meetingLink ||
              !selectedScorecardId ||
              acceptedInterviewers.length === 0
            }
            onClick={handleSend}
          >
            Send Scheduled Interview Details
          </button>

          <button className="ip-danger-btn" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default FinalizedPanelPopup;