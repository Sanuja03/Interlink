import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./ShortlistedCandidates.css";

import ManageScorecardsButton from "./ManageScorecardsButton";
import CandidateActionButtons from "./CandidateActionButtons";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";

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

  /** finalizedMap: { [jobApplicationId]: requestId } */
  const [finalizedMap, setFinalizedMap] = useState({});

  // ─────────────────────────────────────────────────────────────
  //  Fetch jobs immediately (no longer waits for /me)
  //  This is the key fix: we removed the /company/me call entirely
  //  because the backend already knows who you are from the JWT.
  // ─────────────────────────────────────────────────────────────
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

  
  //  When the selected job changes:
  //  Fetch candidates AND scorecards IN PARALLEL (not sequentially)
  
  useEffect(() => {
    let cancelled = false;
    setLoadingCandidates(true);
    setCandidatesError("");
    setFinalizedMap({}); // reset; new job means new finalized states

    const params = selectedJobId ? { jobId: selectedJobId } : {};

    // Run both API calls in parallel using Promise.all
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


  useEffect(() => {
    if (candidates.length === 0) { setFinalizedMap({}); return; }
    let cancelled = false;

    Promise.all(
      candidates.map(async (c) => {
        try {
          const res = await api.get("/company/interview-requests/status/current", {
            params: { candidateId: c.candidateId, jobApplicationId: c.jobApplicationId },
          });
          if (!cancelled && res.data?.overallStatus === "finalized" && res.data?.requestId) {
            return { jobApplicationId: c.jobApplicationId, requestId: res.data.requestId };
          }
        } catch { /* ignore */ }
        return null;
      })
    ).then((results) => {
      if (cancelled) return;
      const next = {};
      results.forEach((r) => { if (r) next[r.jobApplicationId] = r.requestId; });
      setFinalizedMap(next);
    });

    return () => { cancelled = true; };
  }, [candidates]);


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


  const handleOpenForCandidate = async (candidate) => {
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setEditMode(false);

    const knownRid = finalizedMap[candidate.jobApplicationId];
    if (knownRid) {
      setFinalizedRequestId(knownRid);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }

    try {
      const res = await api.get("/company/interview-requests/status/current", {
        params: { candidateId: candidate.candidateId, jobApplicationId: candidate.jobApplicationId },
      });

      if (res.status === 204 || !res.data) {
        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
      } else if (res.data.overallStatus === "finalized") {
        const rid = res.data.requestId;
        setFinalizedMap((prev) => ({ ...prev, [candidate.jobApplicationId]: rid }));
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

  const handleOpenFinalizedDirect = (candidate) => {
    const rid = finalizedMap[candidate.jobApplicationId];
    if (!rid) return;
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setFinalizedRequestId(rid);
    setShowRequestPopup(false);
    setShowStatusPopup(false);
    setShowFinalizedPopup(true);
  };

  const closeAllPopups = () => {
    setShowRequestPopup(false);
    setShowStatusPopup(false);
    setShowFinalizedPopup(false);
    setFinalizedRequestId(null);
    setSelectedCandidate(null);
    candidateRef.current = null;
    setEditMode(false);
  };

  const handleEditFromStatus = () => {
    setEditMode(true);
    setShowStatusPopup(false);
    setShowRequestPopup(true);
  };

  const handleFinalize = (requestId) => {
    const candidate = candidateRef.current || selectedCandidate;
    if (candidate && requestId) {
      setFinalizedMap((prev) => ({ ...prev, [candidate.jobApplicationId]: requestId }));
      setFinalizedRequestId(requestId);
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
                <span className="sc-job-meta-label">Round</span>
                <span className="sc-job-meta-value">Round 1</span>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {(loadingJobs && jobs.length === 0) && (
                    <tr><td colSpan={selectedJobId ? 4 : 5} style={{ textAlign: "center", padding: 24 }}>
                      Loading…
                    </td></tr>
                  )}

                  {!loadingJobs && !jobsError && jobs.length === 0 && (
                    <tr><td colSpan={selectedJobId ? 4 : 5} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      No shortlisted candidates yet. Once candidates are shortlisted for a job, they'll show up here.
                    </td></tr>
                  )}

                  {jobs.length > 0 && loadingCandidates && (
                    <tr><td colSpan={selectedJobId ? 4 : 5} style={{ textAlign: "center", padding: 24 }}>
                      Loading candidates…
                    </td></tr>
                  )}

                  {jobs.length > 0 && !loadingCandidates && candidatesError && (
                    <tr><td colSpan={selectedJobId ? 4 : 5} style={{ textAlign: "center", color: "crimson", padding: 24 }}>
                      {candidatesError}
                    </td></tr>
                  )}

                  {jobs.length > 0 && !loadingCandidates && !candidatesError && candidates.length === 0 && (
                    <tr><td colSpan={selectedJobId ? 4 : 5} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      {selectedJobId ? "No shortlisted candidates for this job." : "No shortlisted candidates."}
                    </td></tr>
                  )}

                  {!loadingCandidates && !candidatesError && candidates.map((candidate, idx) => (
                    <tr key={`${candidate.jobApplicationId}-${idx}`}>
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
                      <td>
                        <CandidateActionButtons
                          isFinalized={!!finalizedMap[candidate.jobApplicationId]}
                          onOpenRequest={() => handleOpenForCandidate(candidate)}
                          onOpenFinalized={() => handleOpenFinalizedDirect(candidate)}
                        />
                      </td>
                    </tr>
                  ))}
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
        scorecards={scorecards}
        onEditRequest={handleEditFromStatus}
        onFinalizePanel={handleFinalize}
      />

      {showFinalizedPopup && finalizedRequestId && (
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