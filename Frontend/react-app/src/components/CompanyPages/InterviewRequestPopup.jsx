import { useEffect, useState } from "react";
import api from "../../lib/api"; 
import "./InterviewPopups.css";

const InterviewRequestPopup = ({ open, onClose, candidate, startInEditMode = false }) => {
  const [panelSize, setPanelSize] = useState(2);
  const [mode, setMode] = useState("Online");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const [isSent, setIsSent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [otherInterviewers, setOtherInterviewers] = useState([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [requestedInterviewers, setRequestedInterviewers] = useState([]);

  const [generatedInterviewId, setGeneratedInterviewId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // when open, check for existing active request
  useEffect(() => {
    if (!open || !candidate) return;

    setPanelSize(2);
    setMode("Online");
    setDate("");
    setTime("");
    setAdminNotes("");
    setIsSent(false);
    setShowDropdown(false);
    setSelectedInterviewers([]);
    setRequestedInterviewers([]);
    setGeneratedInterviewId(null);
    setSubmitError("");
    setFetchError("");

    let cancelled = false;

    const loadExisting = async () => {
      if (!candidate.candidateId || !candidate.jobApplicationId) return;

      setLoadingExisting(true);
      try {
        const res = await api.get("/company/interview-requests/current", {
          params: {
            candidateId: candidate.candidateId,
            jobApplicationId: candidate.jobApplicationId,
          },
        });

        if (cancelled) return;
        if (res.status === 204 || !res.data) {
          setLoadingExisting(false);
          return;
        }

        const data = res.data;
        setPanelSize(data.panelSize || 2);
        setMode(data.mode || "Online");
        setDate(data.interviewDate || "");
        setTime(data.interviewTime || "");
        setAdminNotes(data.adminNotes || "");
        setGeneratedInterviewId(data.interviewId);

        const invitedMapped = (data.invitedInterviewers || []).map((p) => ({
          id: p.userId,
          name: p.fullName,
          role: p.role,
          responseStatus: p.responseStatus,
        }));

        setSelectedInterviewers(invitedMapped);
        setRequestedInterviewers(invitedMapped);

        // If opened from "Cancel & Redo", skip the locked view so the admin
        // can immediately edit all fields and send a fresh request.

        setIsSent(startInEditMode ? false : true);
      } catch (err) {
        if (cancelled) return;
        console.error("[InterviewRequestPopup] load existing failed:", err);
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    };

    loadExisting();
    return () => { cancelled = true; };
  }, [open, candidate]);

  //  fetch assignable interviewers on date change 
  useEffect(() => {
    if (!open || !date || isSent) return;

    let cancelled = false;
    const fetchAssignable = async () => {
      setLoadingInterviewers(true);
      setFetchError("");
      try {
        const res = await api.get("/company/interview-requests/assignable", {
          params: { date },
        });
        if (cancelled) return;

        const data = res.data || {};
        const mapItem = (p) => ({
          id: p.userId,
          interviewerId: p.interviewerId,
          name: p.fullName,
          role: p.role,
          branch: p.branch,
        });
        setAvailableInterviewers((data.available || []).map(mapItem));
        setOtherInterviewers((data.other || []).map(mapItem));
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load interviewers";
        console.error("[InterviewRequestPopup] assignable fetch failed:", err);
        setFetchError(`${msg}${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`);
        setAvailableInterviewers([]);
        setOtherInterviewers([]);
      } finally {
        if (!cancelled) setLoadingInterviewers(false);
      }
    };

    fetchAssignable();
    return () => { cancelled = true; };
  }, [open, date, isSent]);

  if (!open || !candidate) return null;

  const isChecked = (pid) => selectedInterviewers.some((x) => x.id === pid);

  const handleToggle = (person) => {
    const exists = selectedInterviewers.some((x) => x.id === person.id);
    if (exists) {
      setSelectedInterviewers((prev) => prev.filter((x) => x.id !== person.id));
    } else {
      setSelectedInterviewers((prev) => [...prev, person]);
    }
  };

  const handleRemoveSelected = (pid) =>
    setSelectedInterviewers((prev) => prev.filter((x) => x.id !== pid));

  const handleSendRequest = async () => {
    setSubmitError("");
    if (!date || !time) {
      setSubmitError("Please set date and time.");
      return;
    }
    if (selectedInterviewers.length < panelSize) {
      setSubmitError(`Select at least ${panelSize} interviewers.`);
      return;
    }

    const body = {
      candidateId: candidate.candidateId,
      jobApplicationId: candidate.jobApplicationId,
      jobId: candidate.jobId || null,
      
      // historyId is a plain number (bigint). Send null if missing.
      historyId: candidate.historyId != null ? Number(candidate.historyId) : null,
      panelSize,
      interviewDate: date,
      interviewTime: time,
      mode,
      adminNotes,
      interviewerUserIds: selectedInterviewers.map((p) => p.id),
    };

    try {
      setSubmitting(true);
      const res = await api.post("/company/interview-requests", body);
      const data = res.data;

      setGeneratedInterviewId(data.interviewId);
      setRequestedInterviewers([...selectedInterviewers]);
      setIsSent(true);
      setShowDropdown(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send request";
      console.error("[InterviewRequestPopup] create failed:", err);
      setSubmitError(`${msg}${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsSent(false);
    setSubmitError("");
  };

  const canSend = selectedInterviewers.length >= panelSize && date && time;

  if (loadingExisting) {
    return (
      <div className="ip-overlay" onClick={onClose}>
        <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="ip-title">Interview Request</h2>
          <div className="ip-card">
            <p className="ip-person-role">Loading…</p>
          </div>
          <div className="ip-actions">
            <button className="ip-danger-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Interview Request</h2>

        <div className="ip-card">
          <div className="ip-info-grid ip-info-grid-2">
            <div className="ip-info-box">
              <span className="ip-info-label">Interview ID</span>
              <span className="ip-info-value">
                {generatedInterviewId || "Auto-generated"}
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
              <span className="ip-info-value">
                {candidate.historyId != null ? `#${candidate.historyId}` : "—"}
              </span>
            </div>
          </div>

          <div className="ip-field">
            <label className="ip-label">Panel Size</label>
            <input
              type="number" className="ip-input"
              min="1" max="50"
              value={panelSize}
              onChange={(e) => setPanelSize(Number(e.target.value))}
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Interview Date</label>
            <input
              type="date" className="ip-input"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Interview Time</label>
            <input
              type="time" className="ip-input"
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
              className="ip-textarea" rows="4"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes for interviewers"
              disabled={isSent}
            />
          </div>

          <div className="ip-field">
            <label className="ip-label">Assign Interviewers</label>
            <button
              type="button" className="ip-dropdown-btn"
              onClick={() => !isSent && setShowDropdown(!showDropdown)}
              disabled={isSent || !date}
            >
              {!date
                ? "Pick a date first"
                : showDropdown ? "Hide Interviewers" : "Show Available Interviewers"}
            </button>

            {showDropdown && !isSent && (
              <div className="ip-dropdown-panel">
                {loadingInterviewers ? (
                  <p className="ip-person-role">Loading interviewers…</p>
                ) : fetchError ? (
                  <p className="ip-person-role" style={{ color: "crimson" }}>{fetchError}</p>
                ) : (
                  <>
                    <div className="ip-group-block">
                      <p className="ip-group-title">Available ({availableInterviewers.length})</p>
                      {availableInterviewers.length === 0 && (
                        <p className="ip-person-role">
                          No interviewers submitted availability for this date.
                        </p>
                      )}
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
                      <p className="ip-group-title">Other ({otherInterviewers.length})</p>
                      {otherInterviewers.length === 0 && (
                        <p className="ip-person-role">No other interviewers in your company.</p>
                      )}
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
                  </>
                )}
              </div>
            )}
          </div>

          {selectedInterviewers.length > 0 && !isSent && (
            <div className="ip-field">
              <label className="ip-label">
                Selected Interviewers ({selectedInterviewers.length}/{panelSize})
              </label>
              <div className="ip-selected-list">
                {selectedInterviewers.map((person) => (
                  <div key={person.id} className="ip-selected-card">
                    <div>
                      <p className="ip-person-name">{person.name}</p>
                      <p className="ip-person-role">{person.role}</p>
                    </div>
                    <button
                      type="button" className="ip-remove-mini-btn"
                      onClick={() => handleRemoveSelected(person.id)}
                    >✕</button>
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
                      <p className="ip-person-role">
                        {person.role}
                        {person.responseStatus && person.responseStatus !== "pending" && (
                          <span style={{ marginLeft: 8, fontWeight: 600 }}>
                            — {person.responseStatus}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!canSend && !isSent && (
            <div className="ip-note-box">
              You must select at least <b>{panelSize}</b> interviewers and pick a date &amp; time.
            </div>
          )}

          {submitError && (
            <div className="ip-note-box" style={{ color: "crimson" }}>{submitError}</div>
          )}

          {isSent && (
            <div className="ip-note-box">
              Interview request <b>{generatedInterviewId}</b> is active.
              Click Edit to cancel this request and send a new one.
            </div>
          )}
        </div>

        <div className="ip-actions">
          {!isSent ? (
            <button
              className="ip-primary-btn"
              disabled={!canSend || submitting}
              onClick={handleSendRequest}
            >{submitting ? "Sending…" : "Send Request"}</button>
          ) : (
            <button className="ip-primary-btn" onClick={handleEdit}>Edit</button>
          )}
          <button className="ip-danger-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRequestPopup;