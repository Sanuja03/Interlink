import { useState, useEffect } from "react";
import api from "../../lib/api";
import "./InterviewPopups.css";


const FinalizedPanelPopup = ({
  open,
  onClose,
  onBack,                      
  interviewDetails = {},
  acceptedInterviewers = [],
  scorecards = [],
  onSendDetails,
  onSent,
  viewOnly = false,
  requestId = null,
}) => {
  const [meetingLink, setMeetingLink]                 = useState("");
  const [interviewLocation, setInterviewLocation]     = useState("");
  const [selectedScorecardId, setSelectedScorecardId] = useState("");
  const [sending, setSending]                         = useState(false);
  const [sendError, setSendError]                     = useState("");
  const [sent, setSent]                               = useState(false);

  const [loadedData, setLoadedData] = useState(null);
  const [loadError, setLoadError]   = useState("");
  const [loading, setLoading]       = useState(false);

  //only runs in view only mode
  useEffect(() => {
    if (!open || !viewOnly || !requestId) return;
    setLoading(true);
    setLoadError("");
    setLoadedData(null);
    api.get(`/company/interview-scheduling/${requestId}`)
      .then((res) => {
        setLoadedData(res.data);
        if (res.data?.scorecardId) setSelectedScorecardId(res.data.scorecardId);
        if (res.data?.meetingLink) setMeetingLink(res.data.meetingLink);
        if (res.data?.interviewLocation) setInterviewLocation(res.data.interviewLocation);
      })
      .catch((err) => setLoadError(err?.response?.data?.error || err?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [open, viewOnly, requestId]);

  // Action mode: pull the venue straight from the interview request (it's already
  // stored there) so the read-only Interview Location box shows it. The view-only
  // loader above covers the post-finalize case.
  useEffect(() => {
    if (!open || viewOnly || !requestId) return;
    let cancelled = false;
    api.get(`/company/interview-requests/${requestId}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data?.interviewLocation) setInterviewLocation(res.data.interviewLocation);
      })
      .catch(() => { /* non-fatal: box falls back to a dash */ });
    return () => { cancelled = true; };
  }, [open, viewOnly, requestId]);

  //if popup closes refresh
  useEffect(() => {
    if (!open) {
      setMeetingLink("");
      setInterviewLocation("");
      setSelectedScorecardId("");
      setSendError("");
      setSent(false);
      setLoadedData(null);
      setLoadError("");
    }
  }, [open]);

  if (!open) return null;

  const finalizedCards = scorecards.filter((c) => c.finalized);

  const details = viewOnly && loadedData
    ? {
        interviewId: loadedData.interviewId   || interviewDetails.interviewId,
        jobTitle:    interviewDetails.jobTitle || "—",
        mode:        loadedData.mode          || interviewDetails.mode,
        date:        loadedData.interviewDate || interviewDetails.date,
        time:        loadedData.interviewTime || interviewDetails.time,
        adminNotes:  loadedData.adminNotes    || interviewDetails.adminNotes,
        meetingLink:       loadedData.meetingLink,
        interviewLocation: loadedData.interviewLocation,
        status:            loadedData.status,
      }
    : interviewDetails;

  const isOnline = (details.mode || "").toLowerCase() === "online";

  const displayInterviewers = viewOnly && loadedData?.acceptedInterviewers
    ? loadedData.acceptedInterviewers.map((iv) => ({ id: iv.userId, name: iv.fullName, role: iv.role }))
    : acceptedInterviewers;

  const selectedCard = finalizedCards.find((c) => c.id === selectedScorecardId) || null;
  const isLocked     = sent || viewOnly;

  // Show Back button only in action mode 
  const showBackBtn = !viewOnly && !sent && typeof onBack === "function";

  const handleSend = async () => {
    setSendError("");
    if (!selectedScorecardId) { setSendError("Please select a scorecard template."); return; }
    if (isOnline && !meetingLink.trim()) { setSendError("Please enter a meeting link."); return; }
    setSending(true);
    
    try {
      if (typeof onSendDetails === "function") {
        await onSendDetails({ meetingLink: meetingLink || null, interviewLocation: interviewLocation || null, scorecard: selectedCard });
      }
      setSent(true);
      if (typeof onSent === "function") onSent();
    } catch (err) {
      setSendError(err?.response?.data?.error || err?.message || "Failed to save.");
    } finally {
      setSending(false);
    }
  };

  if (viewOnly && loading) {
    return (
      <div className="ip-overlay" onClick={onClose}>
        <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="ip-title">Finalized Interview Panel</h2>
          <div className="ip-card">
            <p className="ip-person-role" style={{ textAlign: "center", padding: 24 }}>Loading…</p>
          </div>
          <div className="ip-actions"><button className="ip-danger-btn" onClick={onClose}>Close</button></div>
        </div>
      </div>
    );
  }

  if (viewOnly && loadError) {
    return (
      <div className="ip-overlay" onClick={onClose}>
        <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="ip-title">Finalized Interview Panel</h2>
          <div className="ip-card">
            <div className="ip-note-box" style={{ color: "crimson" }}>{loadError}</div>
          </div>
          <div className="ip-actions"><button className="ip-danger-btn" onClick={onClose}>Close</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Finalized Interview Panel</h2>

        <div className="ip-card">

          {/* Success banner (after send)*/}
          {sent && (
            <div className="ip-note-box" style={{
              background: "#f0fdf4", border: "1px solid #86efac", color: "#166534",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20 }}>✓</span>
              <span>
                <strong>Interview details sent successfully!</strong> The scorecard and
                schedule have been saved. You can close this window.
              </span>
            </div>
          )}

          {/*  success banner (permanant) */}
          {viewOnly && !sent && (
            <div className="ip-note-box" style={{
              background: "#f0fdf4", border: "1px solid #86efac", color: "#166534",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <span>
                <strong>Panel Finalized</strong> — This interview has been scheduled.
                {details.status && (
                  <span style={{ marginLeft: 8, textTransform: "capitalize" }}>
                    Status: <strong>{details.status}</strong>
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Interview details */}
          <div className="ip-info-grid ip-info-grid-2">
            {details.interviewId && (
              <div className="ip-info-box">
                <span className="ip-info-label">Interview ID</span>
                <span className="ip-info-value">{details.interviewId}</span>
              </div>
            )}
            <div className="ip-info-box">
              <span className="ip-info-label">Job Role</span>
              <span className="ip-info-value">{details.jobTitle || "—"}</span>
            </div>
            <div className="ip-info-box">
              <span className="ip-info-label">Mode</span>
              <span className="ip-info-value">{details.mode || "—"}</span>
            </div>
            <div className="ip-info-box">
              <span className="ip-info-label">Interview Date</span>
              <span className="ip-info-value">{details.date || "—"}</span>
            </div>
            <div className="ip-info-box">
              <span className="ip-info-label">Interview Time</span>
              <span className="ip-info-value">{details.time || "—"}</span>
            </div>
            {details.adminNotes && (
              <div className="ip-info-box" style={{ gridColumn: "1 / -1" }}>
                <span className="ip-info-label">Admin Notes</span>
                <span className="ip-info-value" style={{ fontSize: 15, fontWeight: 500 }}>{details.adminNotes}</span>
              </div>
            )}
          </div>

          {/* Interviewers */}
          <div className="ip-field">
            <label className="ip-label">Finalized Interviewers</label>
            <div className="ip-status-list">
              {displayInterviewers.length > 0
                ? displayInterviewers.map((person) => (
                    <div key={person.id} className="ip-status-card">
                      <div>
                        <p className="ip-person-name">{person.name}</p>
                        <p className="ip-person-role">{person.role}</p>
                      </div>
                      <span className="ip-badge ip-status-accepted">Accepted</span>
                    </div>
                  ))
                : <div className="ip-note-box">No accepted interviewers.</div>
              }
            </div>
          </div>

          {/* Meeting link save and dispay*/}
          {isOnline && isLocked && (details.meetingLink || meetingLink) && (
            <div className="ip-field">
              <label className="ip-label">Meeting Link</label>
              <div className="ip-info-box">
                <a
                  href={details.meetingLink || meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563eb",wordBreak: "break-all", fontSize: 15 }}
                >
                  {details.meetingLink || meetingLink}
                </a>
              </div>
            </div>
          )}

          {/* Meeting link editable*/}
          {isOnline && !isLocked && (
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
          )}

          {/* Physical location — view-only, inherited from the interview request */}
          {!isOnline && (
            <div className="ip-field">
              <label className="ip-label">Interview Location</label>
              <div className="ip-info-box">
                <span className="ip-info-value">
                  {details.interviewLocation || interviewLocation || "—"}
                </span>
              </div>
            </div>
          )}

          {/* Scorecard */}
          <div className="ip-field">
            <label className="ip-label">Evaluation Scorecard</label>

            {isLocked ? (
              selectedCard ? (
                <div className="ip-info-box">
                  <span className="ip-info-label">Selected Template</span>
                  <span className="ip-info-value" style={{ fontSize: 16 }}>{selectedCard.name}</span>
                  <div className="ip-scorecard-preview" style={{ marginTop: 8 }}>
                    <p className="ip-scorecard-preview-title">Fields:</p>
                    <div className="ip-scorecard-chips">
                      {selectedCard.fields.map((f) => (
                        <span key={f.id} className="ip-scorecard-chip">{f.label} (max {f.maxScore})</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ip-note-box">No scorecard attached yet.</div>
              )
            ) : (
              finalizedCards.length > 0 ? (
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

                  {selectedCard && (
                    <div className="ip-scorecard-preview">
                      <p className="ip-scorecard-preview-title">Fields in this scorecard:</p>
                      <div className="ip-scorecard-chips">
                        {selectedCard.fields.map((f) => (
                          <span key={f.id} className="ip-scorecard-chip">{f.label} (max {f.maxScore})</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="ip-note-box">
                  No finalized scorecard templates available. Please create and finalize one first.
                </div>
              )
            )}
          </div>

          {sendError && (
            <div className="ip-note-box" style={{ color: "crimson", marginTop: 12 }}>{sendError}</div>
          )}
        </div>

        {/* Actions */}
        <div className="ip-actions">
          {showBackBtn && (
            <button className="ip-small-btn" style={{ background: "#6b7280" }} onClick={onBack}>
              ← Back to Status
            </button>
          )}

          {isLocked ? (
            <button
              className="ip-primary-btn"
              disabled
              style={{ background: "#166534", cursor: "not-allowed", opacity: 1, boxShadow: "none", width: 320 }}
            >
              ✓ Details Sent
            </button>
          ) : (
            <button
              className="ip-primary-btn"
              disabled={sending || !selectedScorecardId || (isOnline && !meetingLink.trim()) || displayInterviewers.length === 0}
              onClick={handleSend}
            >
              {sending ? "Saving…" : "Send Scheduled Interview Details"}
            </button>
          )}
          <button className="ip-danger-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FinalizedPanelPopup;