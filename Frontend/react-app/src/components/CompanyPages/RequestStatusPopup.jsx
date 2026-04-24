import { useEffect, useState, useCallback } from "react";
import api from "../../lib/api"; // adjust path if needed
import "./InterviewPopups.css";

/**
 * RequestStatusPopup
 *
 * Shows the currently-active interview request for a (candidate, jobApplication)
 * pair, pulling invited interviewers and their response statuses from the
 * backend's GET /api/company/interview-requests/current endpoint.
 *
 * The backend already filters out rows whose status = 'cancelled', so if the
 * admin "Edit"-ed an old request (which cancels the old row and inserts a new
 * one), this popup will automatically show the NEW interviewer list — old
 * interviewers from the cancelled request are dropped, and newly added ones
 * appear.
 *
 * Response-status mapping (DB → UI):
 *   pending   → "Pending"
 *   accepted  → "Accepted"
 *   rejected  → "Rejected"
 *
 * Props:
 *   open         : boolean — show/hide
 *   onClose      : () => void
 *   candidate    : { candidateId, jobApplicationId, candidateName?, jobTitle? }
 *   onResendRequest : (interviewerUserId) => void   // optional
 *   onFinalizePanel : (requestId) => void           // optional
 *   onEditRequest   : () => void                    // optional — opens InterviewRequestPopup
 */
const RequestStatusPopup = ({
  open,
  onClose,
  candidate,
  onResendRequest,
  onFinalizePanel,
  onEditRequest,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);

  const fetchActiveRequest = useCallback(async () => {
    if (!candidate?.candidateId || !candidate?.jobApplicationId) return;

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/company/interview-requests/current", {
        params: {
          candidateId: candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });

      // 204 No Content → no active (non-cancelled) request exists
      if (res.status === 204 || !res.data) {
        setActiveRequest(null);
      } else {
        setActiveRequest(res.data);
      }
    } catch (err) {
      console.error("[RequestStatusPopup] fetch failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
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

  // ── Map backend response_status → UI label + CSS class ──
  const normalizeStatus = (raw) => {
    if (!raw) return "Pending";
    const s = String(raw).toLowerCase();
    if (s === "accepted") return "Accepted";
    if (s === "rejected") return "Rejected";
    if (s === "timed_out" || s === "timeout") return "Timed Out";
    return "Pending";
  };

  const getStatusClass = (uiStatus) => {
    if (uiStatus === "Accepted") return "ip-status-accepted";
    if (uiStatus === "Rejected") return "ip-status-rejected";
    if (uiStatus === "Pending") return "ip-status-pending";
    if (uiStatus === "Timed Out") return "ip-status-timeout";
    return "";
  };

  // ── Build interviewer list from backend payload ──
  const invited = activeRequest?.invitedInterviewers || [];
  const interviewers = invited.map((p) => ({
    id: p.userId,
    name: p.fullName,
    role: p.role,
    requestStatus: normalizeStatus(p.responseStatus),
    rawStatus: p.responseStatus,
  }));

  const panelSize = activeRequest?.panelSize || 0;
  const acceptedCount = interviewers.filter(
    (p) => p.requestStatus === "Accepted"
  ).length;
  const canFinalize = panelSize > 0 && acceptedCount === panelSize;

  const handleResend = (interviewerUserId) => {
    if (typeof onResendRequest === "function") {
      onResendRequest(interviewerUserId, activeRequest?.requestId);
    }
  };

  const handleFinalize = () => {
    if (typeof onFinalizePanel === "function") {
      onFinalizePanel(activeRequest?.requestId);
    }
  };

  // ── Render body depending on state ──
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
          <div className="ip-note-box" style={{ color: "crimson" }}>
            {error}
          </div>
        </div>
      );
    }

    if (!activeRequest) {
      return (
        <div className="ip-card">
          <div className="ip-note-box">
            No active interview request found for this candidate.
            {candidate?.candidateName ? (
              <>
                <br />
                Send a new request for <b>{candidate.candidateName}</b> to see
                its status here.
              </>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className="ip-card">
        {/* ── Header info row ── */}
        <div className="ip-info-grid ip-info-grid-2">
          <div className="ip-info-box">
            <span className="ip-info-label">Interview ID</span>
            <span className="ip-info-value">
              {activeRequest.interviewId || "—"}
            </span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Request Status</span>
            <span className="ip-info-value">
              {activeRequest.status || "pending"}
            </span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Candidate</span>
            <span className="ip-info-value">
              {candidate?.candidateName || "—"}
            </span>
          </div>

          <div className="ip-info-box">
            <span className="ip-info-label">Date & Time</span>
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
            <span className="ip-info-label">Accepted Count</span>
            <span className="ip-info-value">
              {acceptedCount}/{panelSize}
            </span>
          </div>
        </div>

        {/* ── Interviewers list with statuses ── */}
        <div className="ip-status-list">
          {interviewers.length === 0 && (
            <p className="ip-person-role">
              No interviewers invited to this request.
            </p>
          )}

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
                  person.requestStatus === "Timed Out") &&
                  typeof onResendRequest === "function" && (
                    <button
                      className="ip-small-btn"
                      onClick={() => handleResend(person.id)}
                    >
                      Resend
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>

        {!canFinalize && panelSize > 0 && (
          <div className="ip-note-box">
            Finalize button will be enabled only when exactly{" "}
            <b>{panelSize}</b> interviewers have accepted.
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