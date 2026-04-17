import { useState } from "react";
import "./InterviewPopups.css";

const InterviewRequestPopup = ({ open, onClose, candidate }) => {
  const [panelSize, setPanelSize] = useState(2);
  const [mode, setMode] = useState("Online");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [requestedInterviewers, setRequestedInterviewers] = useState([]);

  const availableInterviewers = [
    { id: 1, name: "Nadeesha Perera", role: "Senior UI/UX Designer" },
    { id: 2, name: "Kavindu Silva", role: "Product Designer" },
  ];

  const otherInterviewers = [
    { id: 3, name: "Tharushi Fernando", role: "UX Researcher" },
    { id: 4, name: "Sahan Jayawardena", role: "Design Lead" },
    { id: 5, name: "Kasuni Jayasekara", role: "UI Engineer" },
  ];

  if (!open || !candidate) return null;

  const isChecked = (personId) =>
    selectedInterviewers.some((item) => item.id === personId);

  const handleToggle = (person) => {
    const exists = selectedInterviewers.some((item) => item.id === person.id);

    if (exists) {
      setSelectedInterviewers((prev) =>
        prev.filter((item) => item.id !== person.id)
      );
    } else {
      setSelectedInterviewers((prev) => [...prev, person]);
    }
  };

  const handleRemoveSelected = (personId) => {
    setSelectedInterviewers((prev) =>
      prev.filter((item) => item.id !== personId)
    );
  };

  const handleSendRequest = () => {
    if (selectedInterviewers.length < panelSize) return;
    setRequestedInterviewers([...selectedInterviewers]);
    setIsSent(true);
    setShowDropdown(false);
  };

  const handleEdit = () => {
    setIsSent(false);
  };

  const canSend = selectedInterviewers.length >= panelSize;

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Interview Request</h2>

        <div className="ip-card">
          <div className="ip-info-grid ip-info-grid-2">
            <div className="ip-info-box">
              <span className="ip-info-label">Interview ID</span>
              <span className="ip-info-value">
                {candidate.interviewId || "IN5690"}
              </span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">Candidate Name</span>
              <span className="ip-info-value">{candidate.candidateName}</span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">Job Title</span>
              <span className="ip-info-value">{candidate.jobTitle}</span>
            </div>

            <div className="ip-info-box">
              <span className="ip-info-label">History</span>
              <span className="ip-info-value">History</span>
            </div>
          </div>

          <div className="ip-field">
            <label className="ip-label">Panel Size</label>
            <input
              type="number"
              className="ip-input"
              min="1"
              value={panelSize}
              onChange={(e) => setPanelSize(Number(e.target.value))}
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Interview Date</label>
            <input
              type="date"
              className="ip-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Interview Time</label>
            <input
              type="time"
              className="ip-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Mode</label>
            <select
              className="ip-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={isSent}
            >
              <option>Online</option>
              <option>Physical</option>
            </select>
          </div>

          <div className="ip-field">
            <label className="ip-label">Admin Notes</label>
            <textarea
              className="ip-textarea"
              rows="4"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes for interviewers"
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Assign Interviewers</label>

            <button
              type="button"
              className="ip-dropdown-btn"
              onClick={() => !isSent && setShowDropdown(!showDropdown)}
              disabled={isSent}
            >
              {showDropdown ? "Hide Interviewers" : "Show Available Interviewers"}
            </button>

            {showDropdown && !isSent && (
              <div className="ip-dropdown-panel">
                <div className="ip-group-block">
                  <p className="ip-group-title">Available</p>

                  {availableInterviewers.map((person) => (
                    <label key={person.id} className="ip-dropdown-item">
                      <div>
                        <p className="ip-person-name">{person.name}</p>
                        <p className="ip-person-role">{person.role}</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked(person.id)}
                        onChange={() => handleToggle(person)}
                      />
                    </label>
                  ))}
                </div>

                <div className="ip-group-block">
                  <p className="ip-group-title">Other</p>

                  {otherInterviewers.map((person) => (
                    <label key={person.id} className="ip-dropdown-item">
                      <div>
                        <p className="ip-person-name">{person.name}</p>
                        <p className="ip-person-role">{person.role}</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked(person.id)}
                        onChange={() => handleToggle(person)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedInterviewers.length > 0 && !isSent && (
            <div className="ip-field">
              <label className="ip-label">Selected Interviewers</label>

              <div className="ip-selected-list">
                {selectedInterviewers.map((person) => (
                  <div key={person.id} className="ip-selected-card">
                    <div>
                      <p className="ip-person-name">{person.name}</p>
                      <p className="ip-person-role">{person.role}</p>
                    </div>

                    <button
                      type="button"
                      className="ip-remove-mini-btn"
                      onClick={() => handleRemoveSelected(person.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSent && requestedInterviewers.length > 0 && (
            <div className="ip-field">
              <div className="ip-note-box">Requested For These Interviewers</div>

              <div className="ip-person-list">
                {requestedInterviewers.map((person) => (
                  <div key={person.id} className="ip-person-card">
                    <div>
                      <p className="ip-person-name">{person.name}</p>
                      <p className="ip-person-role">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!canSend && !isSent && (
            <div className="ip-note-box">
              You must select at least <b>{panelSize}</b> interviewers.
            </div>
          )}

          {isSent && (
            <div className="ip-note-box">
              Interview request sent successfully. Click Edit to modify and resend.
            </div>
          )}
        </div>

        <div className="ip-actions">
          {!isSent ? (
            <button
              className="ip-primary-btn"
              disabled={!canSend}
              onClick={handleSendRequest}
            >
              Send Request
            </button>
          ) : (
            <button className="ip-primary-btn" onClick={handleEdit}>
              Edit
            </button>
          )}

          <button className="ip-danger-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRequestPopup;