import { useEffect, useState, useCallback } from "react";
import api from "../../lib/api";
import "./InterviewPopups.css";


const RequestStatusPopup = ({
  open,
  onClose,
  candidate,
  onEditRequest,
  onRequestFinalize,
}) => {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [removingId, setRemovingId]   = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const [showAddPanel, setShowAddPanel]   = useState(false);
  const [addCandidates, setAddCandidates] = useState([]);
  const [addSelected, setAddSelected]     = useState([]);
  const [loadingAdd, setLoadingAdd]       = useState(false);
  const [addError, setAddError]           = useState("");
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const getStoredRemovedIds = (requestId) => {
    if (!requestId) return new Set();
    try {
      const raw = localStorage.getItem(`removed_interviewers:${requestId}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  };

  const [removedIds, setRemovedIds] = useState(new Set());

  const fetchActiveRequest = useCallback(async () => {
    if (!candidate?.candidateId || !candidate?.jobApplicationId) return;
    setLoading(true);
    setError("");
    setRemoveError("");
    try {
      const res = await api.get("/company/interview-requests/status/current", {
        params: {
          candidateId:      candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });
      if (res.status === 204 || !res.data) {
        setActiveRequest(null);
        setRemovedIds(new Set());
      } else {
        setActiveRequest(res.data);
        setRemovedIds(getStoredRemovedIds(res.data.requestId));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error ||
                  err?.message || "Failed to load request status";
      setError(msg);
      setActiveRequest(null);
    } finally {
      setLoading(false);
    }
  }, [candidate]);

  useEffect(() => {
    if (!open) return;
    fetchActiveRequest();
  }, [open, fetchActiveRequest]);

  if (!open) return null;

  
  const normalizeStatus = (raw) => {
    if (!raw) return "Pending";
    const s = String(raw).toLowerCase();
    if (s === "accepted")                     return "Accepted";
    if (s === "rejected")                     return "Rejected";
    if (s === "timed_out" || s === "timeout") return "Timed Out";
    return "Pending";
  };

  const getStatusClass = (uiStatus) => {
    if (uiStatus === "Accepted")  return "ip-status-accepted";
    if (uiStatus === "Rejected")  return "ip-status-rejected";
    if (uiStatus === "Pending")   return "ip-status-pending";
    if (uiStatus === "Timed Out") return "ip-status-timeout";
    return "";
  };

  //WAT IS DISPLAYED
  const invited      = activeRequest?.interviewers || [];
  const interviewers = invited.map((p) => ({
    id:            p.userId,
    name:          p.fullName,
    role:          p.role,
    requestStatus: normalizeStatus(p.responseStatus),
    adminRemoved:  removedIds.has(p.userId),
  }));

  const panelSize     = activeRequest?.panelSize || 0;
  const acceptedCount = interviewers.filter((p) => p.requestStatus === "Accepted").length;
  const canFinalize   = panelSize > 0 && acceptedCount >= panelSize;

  
  const overallStatus = activeRequest?.overallStatus;
  const isFinalised   = overallStatus === "finalized";
  const isCancelled   = overallStatus === "cancelled";
  const isClosed      = isFinalised || isCancelled;

  // Remove interviewer
  const handleRemove = async (interviewerUserId) => {
    if (!activeRequest?.requestId) return;
    setRemovingId(interviewerUserId);
    setRemoveError("");
    try {
      await api.delete(
        `/company/interview-requests/status/${activeRequest.requestId}/interviewers/${interviewerUserId}`
      );

      //remember that this interviewer was removed to show the removed badge - store in local storage since backend doesnt hv it now
      setRemovedIds((prev) => {
        const next = new Set(prev).add(interviewerUserId);
        try { localStorage.setItem(`removed_interviewers:${activeRequest.requestId}`, JSON.stringify([...next])); } catch {}
        return next;
      });
      await fetchActiveRequest();
    } catch (err) {
      setRemoveError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to remove interviewer");
    } finally {
      setRemovingId(null);
    }
  };

  // Resend to interviewer
  const handleResend = async (interviewerUserId) => {
    if (!activeRequest?.requestId) return;
    setResendingId(interviewerUserId);
    setRemoveError("");
    try {
      await api.put(
        `/company/interview-requests/status/${activeRequest.requestId}/interviewers/${interviewerUserId}/resend`
      );

      //if this interviewer was removed earlier after rejecting then unmark from the removed list
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(interviewerUserId);
        try { localStorage.setItem(`removed_interviewers:${activeRequest.requestId}`, JSON.stringify([...next])); } catch {}
        return next;
      });
      await fetchActiveRequest();
    } catch (err) {
      setRemoveError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to resend");
    } finally {
      setResendingId(null);
    }
  };

  // open Add panel
  const openAddPanel = async () => {
    if (!activeRequest?.interviewDate) return;
    setShowAddPanel(true);
    setAddSelected([]);
    setAddError("");
    setLoadingAdd(true);
    try {
      const res = await api.get("/company/interview-requests/assignable", { params: { date: activeRequest.interviewDate } });
      const all = [...(res.data?.available || []), ...(res.data?.other || [])];
      const existingIds = new Set((activeRequest?.interviewers || []).map((p) => p.userId));
      setAddCandidates(all.filter((iv) => !existingIds.has(iv.userId)));
    } catch {
      setAddError("Failed to load interviewers");
    } finally {
      setLoadingAdd(false);
    }
  };

  const toggleAddSelect = (userId) =>
    setAddSelected((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);

  //add interviewers
  const handleAddSubmit = async () => {
    if (addSelected.length === 0) return;
    setSubmittingAdd(true);
    setAddError("");
    try {
      await api.post(
        `/company/interview-requests/status/${activeRequest.requestId}/interviewers/add`,
        { interviewerUserIds: addSelected }
      );
      setShowAddPanel(false);
      setAddSelected([]);
      await fetchActiveRequest();
    } catch (err) {
      setAddError(err?.response?.data?.error || err?.message || "Failed to add interviewers");
    } finally {
      setSubmittingAdd(false);
    }
  };

  
  const handleFinalizeClick = () => {
    if (!activeRequest) return;
    if (typeof onRequestFinalize === "function") {
      onRequestFinalize(activeRequest);
    }
  };


  const renderBody = () => {
    if (loading) return <div className="ip-card"><p className="ip-person-role">Loading request status…</p></div>;
    if (error)   return <div className="ip-card"><div className="ip-note-box" style={{ color: "crimson" }}>{error}</div></div>;
    if (!activeRequest) {
      return (
        <div className="ip-card">
          <div className="ip-note-box">
            No active interview request found for this candidate.
            {candidate?.candidateName && <><br />Send a new request for <b>{candidate.candidateName}</b>.</>}
          </div>
        </div>
      );
    }

    return (
      <div className="ip-card">

        {/* Lapsed request — the interview date passed before a panel was confirmed */}
        {isCancelled && (
          <div
            className="ip-note-box"
            style={{
              marginTop: 0,
              marginBottom: 16,
              background: "#fef2f2",
              borderColor: "#fecaca",
              color: "#b91c1c",
            }}
          >
            <b>Request cancelled.</b> The interview date passed before the panel
            was confirmed. Interviewers who never responded are marked{" "}
            <b>Timed Out</b>. Send a new request to reschedule.
          </div>
        )}

        <div className="ip-info-grid ip-info-grid-2">
          <div className="ip-info-box">
            <span className="ip-info-label">Interview ID</span>
            <span className="ip-info-value">{activeRequest.interviewId || "—"}</span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Mode</span>
            <span className="ip-info-value" style={{ textTransform: "capitalize" }}>
              {activeRequest.mode || "—"}
            </span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Candidate</span>
            <span className="ip-info-value">{candidate?.candidateName || "—"}</span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Date &amp; Time</span>
            <span className="ip-info-value">{activeRequest.interviewDate} {activeRequest.interviewTime}</span>
          </div>
        </div>

        <div className="ip-panel-top">
          <div className="ip-panel-box">
            <span className="ip-info-label">Panel Size</span>
            <span className="ip-info-value">{panelSize}</span>
          </div>

          <div className="ip-panel-box">
            <span className="ip-info-label">Accepted</span>
            <span className="ip-info-value">{acceptedCount}/{panelSize}</span>
          </div>
        </div>


        <div className="ip-status-list">
          {interviewers.length === 0 && <p className="ip-person-role">No interviewers invited.</p>}

          {interviewers.map((person) => (
            <div key={person.id} className="ip-status-card">
              <div>
                <p className="ip-person-name">{person.name}</p>
                <p className="ip-person-role">{person.role}</p>
              </div>
              <div className="ip-status-right">
                {person.adminRemoved ? (
                  <span className="ip-badge ip-status-removed">Removed</span>
                ) : (
                  // status badge for not admin removed ones
                  <span className={`ip-badge ${getStatusClass(person.requestStatus)}`}>{person.requestStatus}</span>
                )}
                {/* resend button for rejected ones — hidden once the request is closed */}
                {!person.adminRemoved && person.requestStatus === "Rejected" && !isClosed && (
                  <button className="ip-small-btn" disabled={resendingId === person.id} onClick={() => handleResend(person.id)}>
                    {resendingId === person.id ? "Resending…" : "Resend"}
                  </button>
                )}
                {/* remove button for not adminremoved ones — hidden once the request is closed */}
                {!person.adminRemoved && !isClosed && (
                  <button className="ip-remove-btn" disabled={removingId === person.id} onClick={() => handleRemove(person.id)}>
                    {removingId === person.id ? "Removing…" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Interviewers   */}
        {showAddPanel && (
          <div className="ip-add-panel">
            <p className="ip-group-title">Select interviewers to add</p>
            {loadingAdd && <p className="ip-person-role">Loading…</p>}
            {!loadingAdd && addCandidates.length === 0 && <p className="ip-person-role">No other interviewers available.</p>}
            {!loadingAdd && addCandidates.map((iv) => (
              <label key={iv.userId} className="ip-dropdown-item">
                <div>
                  <p className="ip-person-name">{iv.fullName}</p>
                  <p className="ip-person-role">{iv.role}</p>
                </div>
                <input type="checkbox" checked={addSelected.includes(iv.userId)} onChange={() => toggleAddSelect(iv.userId)} />
              </label>
            ))}
            {addError && <p className="ip-person-role" style={{ color: "crimson" }}>{addError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>

              <button className="ip-primary-btn" style={{ flex: 1, minHeight: 44, fontSize: 15 }}
                disabled={addSelected.length === 0 || submittingAdd} onClick={handleAddSubmit}>
                {submittingAdd ? "Adding…" : `Add${addSelected.length > 0 ? ` (${addSelected.length})` : ""}`}
              </button>

              <button className="ip-danger-btn" style={{ flex: 1, minHeight: 44, fontSize: 15 }}
                onClick={() => { setShowAddPanel(false); setAddSelected([]); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {removeError && <div className="ip-note-box" style={{ color: "crimson", marginTop: 12 }}>{removeError}</div>}

        {!canFinalize && panelSize > 0 && !isClosed && (
          <div className="ip-note-box">
            Finalize button enabled when at least <b>{panelSize}</b> interviewer{panelSize > 1 ? "s have" : " has"} accepted.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ip-overlay" onClick={onClose}>
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="ip-title">Request Status</h2>

        {renderBody()}

        <div className="ip-actions" style={{ flexWrap: "wrap", gap: 14 }}>

          {activeRequest && !isClosed && (
            <button className="ip-small-btn"
              onClick={() => showAddPanel ? setShowAddPanel(false) : openAddPanel()}>
              {showAddPanel ? "Hide Add" : "Add Interviewers"}
            </button>
          )}


          {activeRequest && !isClosed && typeof onEditRequest === "function" && (
            <button className="ip-small-btn" style={{ background: "#6b7280" }}
              onClick={() => {
                if (activeRequest?.requestId) {
                  try { localStorage.removeItem(`removed_interviewers:${activeRequest.requestId}`); } catch {}
                }
                setRemovedIds(new Set());
                setShowAddPanel(false);
                onEditRequest();
              }}>
              Cancel &amp; Redo
            </button>
          )}


          {activeRequest && !isClosed && (
            <button className="ip-primary-btn" onClick={handleFinalizeClick}
              disabled={!canFinalize}>
              Finalize Panel
            </button>
          )}

          <button className="ip-danger-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RequestStatusPopup;