import { useEffect, useState } from "react";
import api from "../../lib/api";
import "./InterviewPopups.css";

const DURATION_OPTIONS = [
  { label: "30 minutes",   value: 30  },
  { label: "1 hour",       value: 60  },
  { label: "1.5 hours",    value: 90  },
  { label: "2 hours",      value: 120 },
  { label: "2.5 hours",    value: 150 },
  { label: "3 hours",      value: 180 },
];

const MIN_LEAD_MINUTES = 60; // interviews must start at least 1 hour from now

const InterviewRequestPopup = ({ open, onClose, candidate, startInEditMode = false }) => {
  const [panelSize, setPanelSize]         = useState(2);
  const [mode, setMode]                   = useState("Online");
  const [date, setDate]                   = useState("");
  const [time, setTime]                   = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60); // default 1 hour
  const [interviewLocation, setInterviewLocation] = useState(""); // Physical venue
  const [adminNotes, setAdminNotes]       = useState("");

  const [isSent, setIsSent]               = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);

  const [availableInterviewers, setAvailableInterviewers]   = useState([]);
  const [otherInterviewers, setOtherInterviewers]           = useState([]);
  const [unavailableInterviewers, setUnavailableInterviewers] = useState([]); // conflict group
  const [loadingInterviewers, setLoadingInterviewers]       = useState(false);
  const [fetchError, setFetchError]                         = useState("");

  const [selectedInterviewers, setSelectedInterviewers]     = useState([]);

  const [generatedInterviewId, setGeneratedInterviewId]     = useState(null);
  const [submitError, setSubmitError]                       = useState("");
  const [submitting, setSubmitting]                         = useState(false);
  const [loadingExisting, setLoadingExisting]               = useState(false);

  // Reset + prefill on open
  useEffect(() => {
    if (!open || !candidate) return;

    setPanelSize(2);
    setMode("Online");
    setDate("");
    setTime("");
    setDurationMinutes(60);
    setInterviewLocation("");
    setAdminNotes("");
    setIsSent(false);
    setShowDropdown(false);
    setSelectedInterviewers([]);
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
            candidateId:      candidate.candidateId,
            jobApplicationId: candidate.jobApplicationId,
          },
        });
        if (cancelled) return;
        if (res.status === 204 || !res.data) { setLoadingExisting(false); return; }

        const data = res.data;

        // Round-mismatch guard: the /current endpoint is not round-aware —
        // it returns whatever request exists for the jobApplicationId. When a
        // candidate moves to a new round, this would return the previous
        // round's (finalized) request, prefilling all fields and setting
        // isSent=true. Guard against both cases:
        //   1. historyId returned and doesn't match → different round's request
        //   2. overallStatus is "finalized" → belongs to a completed round
        if (candidate.historyId != null && data.historyId != null &&
            String(data.historyId) !== String(candidate.historyId)) {
          setLoadingExisting(false);
          return;
        }
        // The /current DTO field is "status", not "overallStatus".
        // The backend query returns any non-cancelled request, including finalized ones.
        if (data.status === "finalized") {
          setLoadingExisting(false);
          return;
        }

        setPanelSize(data.panelSize || 2);
        setMode(data.mode || "Online");
        setDate(data.interviewDate || "");
        setTime(data.interviewTime || "");
        setDurationMinutes(data.durationMinutes || 60);
        setInterviewLocation(data.interviewLocation || "");
        setAdminNotes(data.adminNotes || "");
        setGeneratedInterviewId(data.interviewId);

        const invitedMapped = (data.invitedInterviewers || []).map((p) => ({
          id:   p.userId,
          name: p.fullName,
          role: p.role,
          responseStatus: p.responseStatus,
        }));
        setSelectedInterviewers(invitedMapped);

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

  // Fetch assignable interviewers whenever date, time, or duration changes
  useEffect(() => {
    if (!open || !date || !time || isSent) return;

    let cancelled = false;
    const fetchAssignable = async () => {
      setLoadingInterviewers(true);
      setFetchError("");
      try {
        const res = await api.get("/company/interview-requests/assignable", {
          params: { date, time, durationMinutes },
        });
        if (cancelled) return;

        const data = res.data || {};
        const mapItem = (p) => ({
          id:             p.userId,
          interviewerId:  p.interviewerId,
          name:           p.fullName,
          role:           p.role,
          branch:         p.branch,
          conflictInfo:   p.conflictInfo || null, // "HH:MM – HH:MM" label from backend
        });
        setAvailableInterviewers((data.available    || []).map(mapItem));
        setOtherInterviewers(    (data.other        || []).map(mapItem));
        setUnavailableInterviewers((data.unavailable || []).map(mapItem));
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error   ||
          err?.message                 ||
          "Failed to load interviewers";
        setFetchError(`${msg}${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`);
        setAvailableInterviewers([]);
        setOtherInterviewers([]);
        setUnavailableInterviewers([]);
      } finally {
        if (!cancelled) setLoadingInterviewers(false);
      }
    };

    fetchAssignable();
    return () => { cancelled = true; };
  }, [open, date, time, durationMinutes, isSent]);

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
    if (!date || !time) { setSubmitError("Please set date and time."); return; }
    if (!durationMinutes) { setSubmitError("Please select a duration."); return; }
    if (mode === "Physical" && !interviewLocation.trim()) {
      setSubmitError("Please enter the interview location for Physical interviews.");
      return;
    }
    if (selectedInterviewers.length < panelSize) {
      setSubmitError(`Select at least ${panelSize} interviewers.`);
      return;
    }

    const body = {
      candidateId:       candidate.candidateId,
      jobApplicationId:  candidate.jobApplicationId,
      jobId:             candidate.jobId || null,
      historyId:         null, // candidate.historyId is a candidate_history_stages PK, not candidate_history PK — sending it violates the FK on interview_requests
      panelSize,
      interviewDate:     date,
      interviewTime:     time,
      durationMinutes,
      mode,
      adminNotes,
      interviewLocation: mode === "Physical" ? interviewLocation : null,
      interviewerUserIds: selectedInterviewers.map((p) => p.id),
    };

    try {
      setSubmitting(true);
      const res  = await api.post("/company/interview-requests", body);
      const data = res.data;
      setGeneratedInterviewId(data.interviewId);
      setIsSent(true);
      setShowDropdown(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        err?.message                 ||
        "Failed to send request";
      setSubmitError(`${msg}${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Date / time helpers ──
  // Local calendar date (NOT toISOString, which is UTC — that lets "yesterday"
  // stay selectable during the early-morning hours in UTC+offset timezones).
  const _now = new Date();
  const todayStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;
  const isToday  = date === todayStr;

  // Generate :00 and :30 slots; filter past slots when today is selected
  const timeSlots = (() => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const hh   = String(h).padStart(2, "0");
        const mm   = String(m).padStart(2, "0");
        const val  = `${hh}:${mm}`;
        const ampm = h >= 12 ? "PM" : "AM";
        const h12  = h % 12 || 12;
        slots.push({ val, label: `${h12}:${mm} ${ampm}` });
      }
    }
    if (!isToday) return slots;
    const now = new Date();
    const cutoffMin = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_MINUTES;
    return slots.filter((s) => {
      const [h, m] = s.val.split(":").map(Number);
      return h * 60 + m >= cutoffMin;
    });
  })();

  const canSend = selectedInterviewers.length >= panelSize && date && time && durationMinutes;

  // ── Loading state ──
  if (loadingExisting) {
    return (
      <div className="ip-overlay" onClick={onClose}>
        <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="ip-title">Interview Request</h2>
          <div className="ip-card"><p className="ip-person-role">Loading…</p></div>
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
          {/* Read-only info */}
          <div className="ip-info-grid ip-info-grid-2">
            <div className="ip-info-box">
              <span className="ip-info-label">Interview ID</span>
              <span className="ip-info-value">{generatedInterviewId || "Auto-generated"}</span>
            </div>

            {/* Empty slot — keeps the 2-column rhythm without drawing a box */}
            <div />

            <div className="ip-info-box">
              <span className="ip-info-label">Job Title</span>
              <span className="ip-info-value">{candidate.jobTitle}</span>
            </div>
            <div className="ip-info-box">
              <span className="ip-info-label">Candidate Name</span>
              <span className="ip-info-value">{candidate.candidateName}</span>
            </div>
          </div>

          {/* Panel size */}
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

          {/* Date */}
          <div className="ip-field">
            <label className="ip-label">Interview Date</label>
            <input
              type="date" className="ip-input"
              value={date}
              min={todayStr}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              disabled={isSent}
            />
          </div>

          {/* Time — :00/:30 dropdown */}
          <div className="ip-field">
            <label className="ip-label">Interview Time</label>
            <select
              className="ip-select"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isSent || !date}
            >
              <option value="">— Select a time —</option>
              {timeSlots.map((slot) => (
                <option key={slot.val} value={slot.val}>{slot.label}</option>
              ))}
            </select>
            {isToday && timeSlots.length === 0 && (
              <span style={{ fontSize: 11, color: "#dc2626", marginTop: 4, display: "block" }}>
                Not enough time left today — please pick a future date.
              </span>
            )}
            {isToday && timeSlots.length > 0 && (
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                Showing slots at least 1 hour from now.
              </span>
            )}
          </div>

          {/* Duration */}
          <div className="ip-field">
            <label className="ip-label">Duration</label>
            <select
              className="ip-select"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              disabled={isSent}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
              Interviewers with a conflicting request in this window will be shown as Unavailable.
            </span>
          </div>

          {/* Mode */}
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

          {/* Physical location */}
          {mode === "Physical" && (
            <div className="ip-field">
              <label className="ip-label">Interview Location</label>
              <input
                type="text"
                className="ip-input"
                placeholder="e.g. Room 3B, Head Office, Colombo"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                disabled={isSent}
              />
            </div>
          )}

          {/* Admin notes */}
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

          {/* Interviewer picker */}
          <div className="ip-field">
            <label className="ip-label">Assign Interviewers</label>
            <button
              type="button" className="ip-dropdown-btn"
              onClick={() => !isSent && setShowDropdown(!showDropdown)}
              disabled={isSent || !date || !time}
            >
              {!date || !time
                ? "Pick a date and time first"
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
                    {/* Available group */}
                    <div className="ip-group-block">
                      <p className="ip-group-title">Available ({availableInterviewers.length})</p>
                      {availableInterviewers.length === 0 && (
                        <p className="ip-person-role">No interviewers submitted availability for this date.</p>
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

                    {/* Other group */}
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

                    {/* Unavailable group — conflict, cannot select */}
                    {unavailableInterviewers.length > 0 && (
                      <div className="ip-group-block">
                        <p className="ip-group-title" style={{ color: "#dc2626" }}>
                          Unavailable — Schedule Conflict ({unavailableInterviewers.length})
                        </p>
                        {unavailableInterviewers.map((person) => (
                          <div
                            key={person.id}
                            className="ip-dropdown-item"
                            style={{ opacity: 0.55, cursor: "not-allowed", background: "#fef2f2", borderColor: "#fecaca" }}
                          >
                            <div>
                              <p className="ip-person-name">{person.name}</p>
                              <p className="ip-person-role">{person.role}</p>
                              {person.conflictInfo && (
                                <p className="ip-person-role" style={{ color: "#dc2626", fontSize: 11 }}>
                                  Busy: {person.conflictInfo}
                                </p>
                              )}
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: "#dc2626",
                              background: "#fee2e2", padding: "3px 8px", borderRadius: 999,
                            }}>
                              Conflict
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selected interviewers */}
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

          {!canSend && !isSent && (
            <div className="ip-note-box">
              You must select at least <b>{panelSize}</b> interviewers and pick a date, time &amp; duration.
            </div>
          )}

          {submitError && (
            <div className="ip-note-box" style={{ color: "crimson" }}>{submitError}</div>
          )}
        </div>

        <div className="ip-actions">
          <button
            className="ip-primary-btn"
            disabled={!canSend || submitting || isSent}
            onClick={handleSendRequest}
          >
            {submitting ? "Sending…" : "Send Request"}
          </button>
          <button className="ip-danger-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InterviewRequestPopup;