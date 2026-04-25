import { useEffect, useState, useCallback } from "react";
import api from "../../lib/api"; // adjust path if needed
import "./InterviewPopups.css";

/**
 * RequestStatusPopup
 *
 * Fetches from the EXISTING endpoint (same one ShortlistedCandidates uses):
 *   GET /api/company/interview-requests/current
 *         ?candidateId=…&jobApplicationId=…
 *   → returns ExistingRequestResponse  (field: invitedInterviewers[])
 *
 * Remove an interviewer:
 *   DELETE /api/company/interview-requests/status/{requestId}/interviewers/{userId}
 *   (requires InterviewRequestStatusController to be deployed)
 *
 * Props:
 *   open            : boolean
 *   onClose         : () => void
 *   candidate       : { candidateId, jobApplicationId, candidateName?, jobTitle? }
 *   onResendRequest : (interviewerUserId, requestId) => void   // optional
 *   onFinalizePanel : (requestId) => void                      // optional
 *   onEditRequest   : () => void                               // optional
 */
const RequestStatusPopup = ({
  open,
  onClose,
  candidate,
  onResendRequest,
  onFinalizePanel,
  onEditRequest,
}) => {
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [removingId, setRemovingId]       = useState(null);
  const [resendingId, setResendingId]     = useState(null);
  const [removeError, setRemoveError]     = useState("");
  // Track IDs the admin removed — persisted in localStorage so the
  // "Removed" badge survives logout/refresh.
  // Key: "removed_interviewers:<requestId>"  Value: JSON array of userIds
  const getStoredRemovedIds = (requestId) => {
    if (!requestId) return new Set();
    try {
      const raw = localStorage.getItem(`removed_interviewers:${requestId}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  };

  const [removedIds, setRemovedIds] = useState(new Set());

  // ── Fetch from the existing /current endpoint ──
  // Returns ExistingRequestResponse which has:
  //   requestId, interviewId, status, panelSize, interviewDate,
  //   interviewTime, mode, adminNotes, historyId,
  //   invitedInterviewers: [{ userId, fullName, role, responseStatus }]
  const fetchActiveRequest = useCallback(async () => {
    if (!candidate?.candidateId || !candidate?.jobApplicationId) return;

    setLoading(true);
    setError("");
    setRemoveError("");
    // Don't clear removedIds here — keep them so the "Removed" badge
    // persists after the re-fetch that follows a remove action.
    try {
      const res = await api.get("/company/interview-requests/current", {
        params: {
          candidateId:      candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });

      // 204 No Content → no active (non-cancelled) request exists
      if (res.status === 204 || !res.data) {
        setActiveRequest(null);
        setRemovedIds(new Set());
      } else {
        setActiveRequest(res.data);
        // Hydrate from localStorage so "Removed" badges survive refresh/logout
        setRemovedIds(getStoredRemovedIds(res.data.requestId));
      }
    } catch (err) {
      console.error("[RequestStatusPopup] fetch failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        err?.message                 ||
        "Failed to load request status";
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

  // ── Map DB responseStatus → UI label ──
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

  // ExistingRequestResponse uses `invitedInterviewers` as the field name
  const invited      = activeRequest?.invitedInterviewers || [];
  const interviewers = invited.map((p) => ({
    id:            p.userId,
    name:          p.fullName,
    role:          p.role,
    requestStatus: normalizeStatus(p.responseStatus),
    rawStatus:     p.responseStatus,
    // If the admin removed this person this session, flag it so we can
    // show "Removed" instead of the generic "Rejected" badge.
    adminRemoved:  removedIds.has(p.userId),
  }));

  const panelSize     = activeRequest?.panelSize || 0;
  const acceptedCount = interviewers.filter((p) => p.requestStatus === "Accepted").length;
  // Finalize enabled when accepted >= panelSize
  const canFinalize   = panelSize > 0 && acceptedCount >= panelSize;

  // ── Remove handler ──
  // Calls the InterviewRequestStatus controller DELETE endpoint.
  // If that controller isn't deployed yet this will 404 — the error
  // is shown inline so the rest of the popup stays usable.
  const handleRemove = async (interviewerUserId) => {
    if (!activeRequest?.requestId) return;

    setRemovingId(interviewerUserId);
    setRemoveError("");
    try {
      await api.delete(
        `/company/interview-requests/status/${activeRequest.requestId}/interviewers/${interviewerUserId}`
      );
      // Persist to localStorage so the badge survives refresh/logout
      setRemovedIds((prev) => {
        const next = new Set(prev).add(interviewerUserId);
        if (activeRequest?.requestId) {
          try {
            localStorage.setItem(
              `removed_interviewers:${activeRequest.requestId}`,
              JSON.stringify([...next])
            );
          } catch { /* storage full or private mode — fail silently */ }
        }
        return next;
      });
      // Re-fetch so the list reflects the updated state from DB
      await fetchActiveRequest();
    } catch (err) {
      console.error("[RequestStatusPopup] remove failed:", err);
      const msg =
        err?.response?.data?.error   ||
        err?.response?.data?.message ||
        err?.message                 ||
        "Failed to remove interviewer";
      setRemoveError(msg);
    } finally {
      setRemovingId(null);
    }
  };

  // Resend — resets a rejected interviewer back to "pending" inline.
  // No redirect needed; the popup re-fetches and the badge updates.
  const handleResend = async (interviewerUserId) => {
    if (!activeRequest?.requestId) return;
    setResendingId(interviewerUserId);
    setRemoveError("");
    try {
      await api.put(
        `/company/interview-requests/status/${activeRequest.requestId}/interviewers/${interviewerUserId}/resend`
      );
      // Also clear from removedIds and localStorage in case it was admin-removed
      // previously and admin wants to re-invite them.
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(interviewerUserId);
        if (activeRequest?.requestId) {
          try {
            localStorage.setItem(
              `removed_interviewers:${activeRequest.requestId}`,
              JSON.stringify([...next])
            );
          } catch { /* ignore */ }
        }
        return next;
      });
      await fetchActiveRequest();
    } catch (err) {
      console.error("[RequestStatusPopup] resend failed:", err);
      const msg =
        err?.response?.data?.error   ||
        err?.response?.data?.message ||
        err?.message                 ||
        "Failed to resend request";
      setRemoveError(msg);
    } finally {
      setResendingId(null);
    }
  };

  const handleFinalize = () => {
    if (typeof onFinalizePanel === "function") {
      onFinalizePanel(activeRequest?.requestId);
    }
  };

  // ── Render ──
  const renderBody = () => {
    if (loading) {
      return (
        <div className="ip-card">
          <p className="ip-person-role">Loading request status…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ip-card">
          <div className="ip-note-box" style={{ color: "crimson" }}>{error}</div>
        </div>
      );
    }

    if (!activeRequest) {
      return (
        <div className="ip-card">
          <div className="ip-note-box">
            No active interview request found for this candidate.
            {candidate?.candidateName && (
              <><br />Send a new request for <b>{candidate.candidateName}</b> to see its status here.</>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="ip-card">

        {/* ── Header info ── */}
        <div className="ip-info-grid ip-info-grid-2">
          <div className="ip-info-box">
            <span className="ip-info-label">Interview ID</span>
            <span className="ip-info-value">{activeRequest.interviewId || "—"}</span>
          </div>
          <div className="ip-info-box">
            <span className="ip-info-label">Request Status</span>
            <span className="ip-info-value">{activeRequest.status || "pending"}</span>
          </div>
          <div className="ip-info-box">
            <span className="ip-info-label">Candidate</span>
            <span className="ip-info-value">{candidate?.candidateName || "—"}</span>
          </div>
          <div className="ip-info-box">
            <span className="ip-info-label">Date &amp; Time</span>
            <span className="ip-info-value">
              {activeRequest.interviewDate} {activeRequest.interviewTime}
            </span>
          </div>
        </div>

        {/* ── Panel summary ── */}
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

        {/* ── Interviewer rows ── */}
        <div className="ip-status-list">
          {interviewers.length === 0 && (
            <p className="ip-person-role">No interviewers invited to this request.</p>
          )}

          {interviewers.map((person) => (
            <div key={person.id} className="ip-status-card">
              <div>
                <p className="ip-person-name">{person.name}</p>
                <p className="ip-person-role">{person.role}</p>
              </div>

              <div className="ip-status-right">
                {/* Status badge — "Removed" for admin-removed, normal otherwise */}
                {person.adminRemoved ? (
                  <span className="ip-badge ip-status-removed">
                    Removed
                  </span>
                ) : (
                  <span className={`ip-badge ${getStatusClass(person.requestStatus)}`}>
                    {person.requestStatus}
                  </span>
                )}

                {/* Resend — only for Rejected (interviewer declined).
                    Resets their status to Pending inline, no redirect. */}
                {!person.adminRemoved &&
                  person.requestStatus === "Rejected" && (
                    <button
                      className="ip-small-btn"
                      disabled={resendingId === person.id}
                      onClick={() => handleResend(person.id)}
                    >
                      {resendingId === person.id ? "Resending…" : "Resend"}
                    </button>
                  )}

                {/* Remove button — shown for ALL statuses except already-removed.
                    Accepted interviewers can also be removed if needed. */}
                {!person.adminRemoved && (
                  <button
                    className="ip-remove-btn"
                    disabled={removingId === person.id}
                    onClick={() => handleRemove(person.id)}
                  >
                    {removingId === person.id ? "Removing…" : "Remove"}
                  </button>
                )}


              </div>
            </div>
          ))}
        </div>

        {/* Remove error */}
        {removeError && (
          <div className="ip-note-box" style={{ color: "crimson", marginTop: 12 }}>
            {removeError}
          </div>
        )}

        {/* Finalize hint */}
        {!canFinalize && panelSize > 0 && (
          <div className="ip-note-box">
            Finalize button will be enabled only when at least{" "}
            <b>{panelSize}</b> interviewer{panelSize > 1 ? "s have" : " has"} accepted.
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

        <div className="ip-actions">
          {activeRequest && typeof onEditRequest === "function" && (
            <button className="ip-small-btn" onClick={onEditRequest}>
              Edit Request
            </button>
          )}

          {activeRequest && (
            <button
              className="ip-primary-btn"
              onClick={handleFinalize}
              disabled={!canFinalize || typeof onFinalizePanel !== "function"}
            >
              Finalize Panel
            </button>
          )}

          <button className="ip-danger-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestStatusPopup;