import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./ShortlistedCandidates.css";

import ManageScorecardsButton from "./ManageScorecardsButton";
import CandidateActionButtons from "./CandidateActionButtons";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";

/**
 * ════════════════════════════════════════════════════════════════════════
 * FRONTEND-ONLY FIX — NO BACKEND CHANGES — SAFE FALLBACK VERSION
 * ════════════════════════════════════════════════════════════════════════
 *
 * NOTE: An earlier version of this file additionally called
 * /company/shortlist/me and /company/shortlist/me/job/{jobId} to recover
 * full multi-round history (Round 1, Round 2, etc. as separate rows).
 * Those two endpoints currently 400 on the backend because of a real bug:
 * Application.java's `companyId` field is annotated with MySQL-style
 * backtick quoting (`Company_Id`) instead of Postgres double-quoting
 * ("Company_Id"). That breaks Spring Data JPA's auto-generated
 * findAllById() query the moment anything calls it — which only happens
 * via those two endpoints. This is a one-line backend fix, not something
 * fixable from the frontend.
 *
 * Until that's fixed, THIS file only calls the one endpoint that is known
 * to work end-to-end: /company/shortlisted-candidates. That endpoint is
 * fast (single SQL query, no N+1) and round-aware for whichever round is
 * CURRENT for each application, but it intentionally collapses earlier,
 * already-completed rounds out of the response (it only returns the
 * latest one). So with this fallback:
 *   - The page loads fast and without errors.
 *   - Each candidate shows their CURRENT round only (the one needing
 *     action), with accurate History ID / Round / Finalized status.
 *   - Already-completed earlier rounds will NOT appear as separate rows
 *     until the backend bug above is fixed — at which point we can swap
 *     back to the multi-round-aware version.
 *
 * CONSTRAINT: We do NOT have access to edit any backend code. The
 * /company/interview-requests/status/current endpoint only accepts
 * candidateId + jobApplicationId — it does NOT know about "rounds". Since
 * a candidate can have multiple shortlisted_candidates rows for the SAME
 * jobApplicationId (one per interview round), this endpoint will return
 * whatever single active/finalized request exists for that application —
 * which may belong to a DIFFERENT round than the one being looked at.
 *
 * THE FIX (entirely in this file):
 *   1. Each row's OWN finalized state is sourced from the LIST endpoint
 *      response (`/company/shortlisted-candidates`), which already returns
 *      one row per round with its own `historyId`, `isFinalized`, and
 *      `finalizedRequestId` fields. We trust THIS per-row data for whether
 *      to show the green "Finalized" button — never the live status-check
 *      endpoint — because the list endpoint is round-aware (it's keyed by
 *      historyId) while the status-check endpoint is not.
 *
 *   2. finalizedMap / pendingFinalizeMap are keyed by a per-ROW key
 *      (historyId-based via rowKey()), not by jobApplicationId, so
 *      different rounds are tracked completely independently inside this
 *      component's own state.
 *
 *   3. When the admin clicks "Request / Status" on a round-row that the
 *      list endpoint says is NOT finalized, we still have to ask the
 *      backend "is there a pending/sent request right now for this
 *      application?" — because that's needed to know whether to show the
 *      "create new request" form or the "manage existing pending request"
 *      view. BUT since the backend can return a request belonging to a
 *      DIFFERENT round, we GUARD the response:
 *        - If the returned request's historyId matches this row's
 *          historyId → trust it, show status popup.
 *        - If it does NOT match (or is missing) → we cannot be sure this
 *          request belongs to THIS round, so we treat it as "no active
 *          request for this round" and open a blank Request popup,
 *          letting the admin create a brand new interview request for
 *          this specific round.
 *
 *      This guard is the key frontend-only safeguard: it prevents a stale/
 *      foreign round's request from leaking into a round that hasn't been
 *      requested yet.
 * ════════════════════════════════════════════════════════════════════════
 */

/**
 * Builds a unique key for a single shortlist row.
 * A candidate can appear multiple times for the SAME jobApplicationId —
 * once per interview round. historyId uniquely identifies the round-row.
 */
const rowKey = (candidate) => {
  if (candidate.historyId != null) return `h:${candidate.historyId}`;
  return `a:${candidate.jobApplicationId}:r:${candidate.round ?? 1}`;
};

/**
 * Frontend-only guard: decides whether a request object returned by the
 * (round-unaware) backend status endpoint actually belongs to THIS row.
 *
 * Since the backend doesn't accept/return historyId scoping, we do the
 * best we can with what it gives us:
 *   - If the response includes a historyId field and it matches this row's
 *     historyId → safe to trust.
 *   - If the response includes NO historyId field at all — we cannot
 *     verify it, so we conservatively treat it as belonging to this row
 *     ONLY if this is the row with the highest round number we have data
 *     for (i.e. the most recently created round), since the backend tends
 *     to return the most recent active request. For any earlier round
 *     row, we do NOT trust an unscoped response.
 */
const requestBelongsToRow = (responseData, candidate, candidates) => {
  if (!responseData) return false;

  // If the backend response carries its own historyId, use it directly.
  if (responseData.historyId != null && candidate.historyId != null) {
    return String(responseData.historyId) === String(candidate.historyId);
  }

  // No historyId on the response — fall back to "is this the latest round
  // for this application?" as a best-effort guard.
  const sameApp = candidates.filter(
    (c) => c.jobApplicationId === candidate.jobApplicationId
  );
  if (sameApp.length <= 1) return true; // only one round exists, safe to trust

  const maxRound = Math.max(...sameApp.map((c) => c.round ?? 1));
  const thisRound = candidate.round ?? 1;
  return thisRound === maxRound;
};

const ShortlistedCandidates = () => {

  // ── Jobs ──
  const [jobs, setJobs]                     = useState([]);
  const [selectedJobId, setSelectedJobId]   = useState(null);
  const [loadingJobs, setLoadingJobs]       = useState(true);
  const [jobsError, setJobsError]           = useState("");

  // ── Candidates ──
  const [candidates, setCandidates]               = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError]     = useState("");

  // ── Scorecards ──
  const [scorecards, setScorecards] = useState([]);

  // ── Popup state ──
  const [selectedCandidate, setSelectedCandidate]   = useState(null);
  const [showRequestPopup, setShowRequestPopup]     = useState(false);
  const [showStatusPopup, setShowStatusPopup]       = useState(false);
  const [showFinalizedPopup, setShowFinalizedPopup] = useState(false);
  const [finalizedRequestId, setFinalizedRequestId] = useState(null);
  const candidateRef = useRef(null);
  const [editMode, setEditMode] = useState(false);

  // Holds the active request data when we go from Status -> Finalized (action mode)
  const [pendingFinalizeRequest, setPendingFinalizeRequest] = useState(null);

  /**
   * finalizedMap: { [rowKey]: { requestId, historical } }
   *
   * Keyed by rowKey(candidate) — i.e. by historyId — NOT by jobApplicationId.
   * Seeded directly from the LIST endpoint's per-row isFinalized /
   * finalizedRequestId fields, which ARE round-aware (each row in that
   * response corresponds to one specific round). This is the most
   * trustworthy source of "is THIS round finalized" we have without
   * backend changes.
   */
  const [finalizedMap, setFinalizedMap] = useState({});

  // pendingFinalizeMap: { [rowKey]: activeRequestObject }
  const [pendingFinalizeMap, setPendingFinalizeMap] = useState({});

  // ── Load jobs dropdown ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingJobs(true);
    setJobsError("");

    api.get("/company/shortlisted-candidates/jobs")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0].jobId);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[ShortlistedCandidates] fetch jobs failed:", err);
        setJobsError(err?.response?.data?.error || err?.message || "Failed to load jobs.");
      })
      .finally(() => { if (!cancelled) setLoadingJobs(false); });

    return () => { cancelled = true; };
  }, []);


  // ── Load candidates + scorecards when job changes ──────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingCandidates(true);
    setCandidatesError("");
    setFinalizedMap({});
    setPendingFinalizeMap({});

    const params = selectedJobId ? { jobId: selectedJobId } : {};

    // Only call the endpoint that is known to work end-to-end. See the
    // header comment for why /company/shortlist/me and
    // /company/shortlist/me/job/{jobId} are NOT called here right now.
    const candidatesPromise = api.get("/company/shortlisted-candidates", { params });
    const scorecardsPromise = selectedJobId
      ? api.get("/company/scorecards", { params: { jobId: selectedJobId } })
      : Promise.resolve({ data: [] });

    Promise.all([candidatesPromise, scorecardsPromise])
      .then(([candidatesRes, scorecardsRes]) => {
        if (cancelled) return;
        const candidateList = Array.isArray(candidatesRes.data) ? candidatesRes.data : [];
        setCandidates(candidateList);
        setScorecards(scorecardsRes.data || []);

        // Seed the finalized map directly from the LIST endpoint's per-row
        // data — this is round-aware (one row per round), unlike the live
        // status-check endpoint.
        const newFinalizedMap = {};
        candidateList.forEach((c) => {
          if (c.isFinalized && c.finalizedRequestId) {
            newFinalizedMap[rowKey(c)] = { requestId: c.finalizedRequestId, historical: false };
          }
        });
        setFinalizedMap(newFinalizedMap);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[ShortlistedCandidates] fetch failed:", err);
        setCandidatesError(err?.response?.data?.error || err?.message || "Failed to load candidates.");
        setCandidates([]);
        setScorecards([]);
      })
      .finally(() => { if (!cancelled) setLoadingCandidates(false); });

    return () => { cancelled = true; };
  }, [selectedJobId]);


  const selectedJob = jobs.find((j) => j.jobId === selectedJobId) || {};
  const jobTitle    = selectedJobId ? (selectedJob.jobTitle  || "—") : "All Jobs";
  const jobPostId   = selectedJobId ? (selectedJob.jobPostId || "—") : "—";

  const handleJobChange = (e) => {
    const val = e.target.value;
    if (val === "ALL") {
      setSelectedJobId(null);
    } else {
      setSelectedJobId(Number(val));
    }
  };

  // Runs when Request/Status button is clicked for a specific row
  const handleOpenForCandidate = async (candidate) => {
    const key = rowKey(candidate);
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setEditMode(false);

    // 1) This specific round-row is already finalized (per LIST endpoint
    //    data, which is round-aware) → open Finalized in VIEW mode.
    const known = finalizedMap[key];
    if (known) {
      setFinalizedRequestId(known.requestId);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }

    // 2) Mid-finalize for this round-row (admin clicked Finalize Panel but
    //    hasn't submitted yet) — purely local state, safe to trust.
    const pendingReq = pendingFinalizeMap[key];
    if (pendingReq) {
      setPendingFinalizeRequest(pendingReq);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }

    // 3) Ask the backend for an active (pending/sent) request. NOTE: this
    //    endpoint is NOT round-aware (we can't change the backend), so its
    //    response might actually belong to a DIFFERENT round of the same
    //    application. We guard against that below before trusting it.
    try {
      const res = await api.get("/company/interview-requests/status/current", {
        params: {
          candidateId: candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });

      const hasData = res.status !== 204 && !!res.data;

      if (!hasData) {
        // No active request at all for this application → safe either way.
        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
        return;
      }

      // FRONTEND-ONLY GUARD: verify the returned request actually belongs
      // to THIS round before trusting it. Without this check, an older
      // round's finalized/pending request could incorrectly surface here.
      const belongsHere = requestBelongsToRow(res.data, candidate, candidates);

      if (!belongsHere) {
        // The backend gave us a request from a different round — for THIS
        // round there's effectively no active request yet, so let the
        // admin create a brand new one.
        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
        return;
      }

      if (res.data.overallStatus === "finalized") {
        const rid = res.data.requestId;
        setFinalizedMap((prev) => ({ ...prev, [key]: { requestId: rid, historical: false } }));
        setFinalizedRequestId(rid);
        setShowRequestPopup(false);
        setShowStatusPopup(false);
        setShowFinalizedPopup(true);
      } else {
        setShowFinalizedPopup(false);
        setShowRequestPopup(false);
        setShowStatusPopup(true);
      }
    } catch (err) {
      console.error("[ShortlistedCandidates] status check failed:", err);
      setShowFinalizedPopup(false);
      setShowStatusPopup(false);
      setShowRequestPopup(true);
    }
  };

  // Runs when the green "Finalized" button is clicked directly for a row
  const handleOpenFinalizedDirect = (candidate) => {
    const key = rowKey(candidate);
    const known = finalizedMap[key];
    if (!known) return;
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setFinalizedRequestId(known.requestId);
    setShowRequestPopup(false);
    setShowStatusPopup(false);
    setShowFinalizedPopup(true);
  };

  const closeAllPopups = () => {
    setShowRequestPopup(false);
    setShowStatusPopup(false);
    setShowFinalizedPopup(false);
    setFinalizedRequestId(null);
    setPendingFinalizeRequest(null);
    setSelectedCandidate(null);
    candidateRef.current = null;
    setEditMode(false);
  };

  const handleEditFromStatus = () => {
    setEditMode(true);
    setShowStatusPopup(false);
    setShowRequestPopup(true);
  };

  const handleRequestFinalize = (activeRequest) => {
    const candidate = candidateRef.current || selectedCandidate;
    if (candidate) {
      const key = rowKey(candidate);
      setPendingFinalizeMap((prev) => ({
        ...prev,
        [key]: activeRequest,
      }));
    }
    setPendingFinalizeRequest(activeRequest);
    setShowStatusPopup(false);
    setShowFinalizedPopup(true);
  };

  const handleBackToStatus = () => {
    const candidate = candidateRef.current || selectedCandidate;
    if (candidate) {
      const key = rowKey(candidate);
      setPendingFinalizeMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setPendingFinalizeRequest(null);
    setShowFinalizedPopup(false);
    setShowStatusPopup(true);
  };

  const handleFinalizeSubmit = async ({ meetingLink, scorecard }) => {
    if (!pendingFinalizeRequest?.requestId) return;
    const requestId = pendingFinalizeRequest.requestId;

    try {
      await api.post("/company/interview-scheduling/finalize", {
        requestId,
        meetingLink: meetingLink || null,
      });

      if (scorecard?.id) {
        await api.patch(
          `/company/interview-scheduling/${requestId}/scorecard`,
          { scorecardId: scorecard.id }
        );
      }

      const candidate = candidateRef.current || selectedCandidate;
      if (candidate) {
        const key = rowKey(candidate);
        setFinalizedMap((prev) => ({ ...prev, [key]: { requestId, historical: false } }));
        setPendingFinalizeMap((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setFinalizedRequestId(requestId);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Failed to finalize";
      throw new Error(msg);
    }
  };


  return (
    <DashboardLayout>
      <div className="sc-page">
        <div className="sc-container">

          <h2 className="sc-title">Shortlisted Candidates</h2>

          <div className="sc-job-picker">
            <label className="sc-job-picker-label" htmlFor="sc-job-picker-select">
              Job Picker:
            </label>
            <select
              id="sc-job-picker-select"
              className="sc-job-picker-select"
              value={selectedJobId == null ? "ALL" : String(selectedJobId)}
              onChange={handleJobChange}
              disabled={loadingJobs || jobs.length === 0}
            >
              <option value="ALL">— All Jobs —</option>
              {jobs.map((j) => (
                <option key={j.jobId} value={j.jobId}>
                  {j.jobTitle} ({j.jobPostId})
                </option>
              ))}
            </select>
            {loadingJobs && (
              <span className="sc-job-picker-hint">Loading jobs…</span>
            )}
            {!loadingJobs && jobs.length === 0 && !jobsError && (
              <span className="sc-job-picker-hint">No jobs with shortlisted candidates yet.</span>
            )}
            {!loadingJobs && jobsError && (
              <span className="sc-job-picker-hint sc-job-picker-error">{jobsError}</span>
            )}
          </div>

          <div className="sc-job-card">
            <div>
              <p className="sc-job-label">Selected Job Post</p>
              <h3 className="sc-job-title">{jobTitle}</h3>
            </div>
            <div className="sc-job-meta-wrap">
              <div className="sc-job-meta-box">
                <span className="sc-job-meta-label">Job Post ID</span>
                <span className="sc-job-meta-value">{jobPostId}</span>
              </div>
              <div className="sc-job-meta-box">
                <span className="sc-job-meta-label">Shortlisted Count</span>
                <span className="sc-job-meta-value">{candidates.length}</span>
              </div>

              {selectedJobId && (
                <ManageScorecardsButton
                  jobTitle={jobTitle}
                  jobPostId={jobPostId}
                  jobId={selectedJobId}
                  scorecards={scorecards}
                  onSave={(updated) => setScorecards(updated)}
                />
              )}
            </div>
          </div>

          <div className="sc-table-card">
            <div className="sc-table-wrap">
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>Candidate ID</th>
                    <th>Candidate Name</th>
                    {!selectedJobId && <th>Job Title</th>}
                    <th>History ID</th>
                    <th>Round</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {(loadingJobs && jobs.length === 0) && (
                    <tr><td colSpan={selectedJobId ? 5 : 6} style={{ textAlign: "center", padding: 24 }}>
                      Loading…
                    </td></tr>
                  )}

                  {!loadingJobs && !jobsError && jobs.length === 0 && (
                    <tr><td colSpan={selectedJobId ? 5 : 6} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      No shortlisted candidates yet. Once candidates are shortlisted for a job, they'll show up here.
                    </td></tr>
                  )}

                  {jobs.length > 0 && loadingCandidates && (
                    <tr><td colSpan={selectedJobId ? 5 : 6} style={{ textAlign: "center", padding: 24 }}>
                      Loading candidates…
                    </td></tr>
                  )}

                  {jobs.length > 0 && !loadingCandidates && candidatesError && (
                    <tr><td colSpan={selectedJobId ? 5 : 6} style={{ textAlign: "center", color: "crimson", padding: 24 }}>
                      {candidatesError}
                    </td></tr>
                  )}

                  {jobs.length > 0 && !loadingCandidates && !candidatesError && candidates.length === 0 && (
                    <tr><td colSpan={selectedJobId ? 5 : 6} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      {selectedJobId ? "No shortlisted candidates for this job." : "No shortlisted candidates."}
                    </td></tr>
                  )}

                  {!loadingCandidates && !candidatesError && candidates.map((candidate) => {
                    const key = rowKey(candidate);
                    const isFinalized = !!finalizedMap[key];
                    return (
                      <tr key={key}>
                        <td className="sc-bold" title={candidate.candidateId}>
                          {String(candidate.candidateId).slice(0, 8)}…
                        </td>
                        <td>{candidate.candidateName}</td>
                        {!selectedJobId && (
                          <td>
                            {candidate.jobTitle || "—"}
                            {candidate.jobPostId && (
                              <span style={{ color: "#6b7280", marginLeft: 6, fontSize: 12 }}>
                                ({candidate.jobPostId})
                              </span>
                            )}
                          </td>
                        )}
                        <td className="sc-bold">
                          {candidate.historyId != null ? `#${candidate.historyId}` : "—"}
                        </td>
                        <td className="sc-bold">
                          {candidate.round != null ? `Round ${candidate.round}` : "—"}
                        </td>
                        <td>
                          <CandidateActionButtons
                            isFinalized={isFinalized}
                            onOpenRequest={() => handleOpenForCandidate(candidate)}
                            onOpenFinalized={() => handleOpenFinalizedDirect(candidate)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <InterviewRequestPopup
        open={showRequestPopup}
        onClose={closeAllPopups}
        candidate={selectedCandidate}
        startInEditMode={editMode}
      />

      <RequestStatusPopup
        open={showStatusPopup}
        onClose={closeAllPopups}
        candidate={candidateRef.current || selectedCandidate}
        onEditRequest={handleEditFromStatus}
        onRequestFinalize={handleRequestFinalize}
      />

      {/* Action Mode */}
      {showFinalizedPopup && pendingFinalizeRequest && (
        <FinalizedPanelPopup
          open={showFinalizedPopup}
          onClose={closeAllPopups}
          onBack={handleBackToStatus}
          interviewDetails={{
            interviewId: pendingFinalizeRequest.interviewId,
            jobTitle:    (candidateRef.current || selectedCandidate)?.jobTitle || "—",
            mode:        pendingFinalizeRequest.mode,
            date:        pendingFinalizeRequest.interviewDate,
            time:        pendingFinalizeRequest.interviewTime,
            adminNotes:  pendingFinalizeRequest.adminNotes,
          }}
          acceptedInterviewers={
            (pendingFinalizeRequest.interviewers || [])
              .filter((p) => p.responseStatus === "accepted")
              .map((p) => ({ id: p.userId, name: p.fullName, role: p.role }))
          }
          scorecards={scorecards}
          viewOnly={false}
          requestId={pendingFinalizeRequest.requestId}
          onSendDetails={handleFinalizeSubmit}
          onSent={() => {}}
        />
      )}

      {/* View Mode */}
      {showFinalizedPopup && !pendingFinalizeRequest && finalizedRequestId && (
        <FinalizedPanelPopup
          open={showFinalizedPopup}
          onClose={closeAllPopups}
          interviewDetails={{
            jobTitle: (candidateRef.current || selectedCandidate)?.jobTitle || "—",
          }}
          acceptedInterviewers={[]}
          scorecards={scorecards}
          viewOnly={true}
          requestId={finalizedRequestId}
        />
      )}
    </DashboardLayout>
  );
};

export default ShortlistedCandidates;
