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

  // ── Auth / company ──
  const [loggedInCompanyId, setLoggedInCompanyId] = useState(null);

  // ── Jobs that this company has shortlisted candidates for ──
  const [jobs, setJobs]               = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError]     = useState("");

  // ── Shortlisted candidates for the selected job ──
  const [candidates, setCandidates]               = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidatesError, setCandidatesError]     = useState("");

  // ── Scorecards (per job) ──
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

  // ════════════════════════════════════════════════════════════════
  // 1) Fetch logged-in company id
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    let cancelled = false;
    api.get("/company/me")
      .then((res) => {
        if (!cancelled && res.data?.companyId) setLoggedInCompanyId(res.data.companyId);
      })
      .catch((err) => console.error("[ShortlistedCandidates] fetch company failed:", err));
    return () => { cancelled = true; };
  }, []);

  // ════════════════════════════════════════════════════════════════
  // 2) Fetch jobs that have shortlisted candidates
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!loggedInCompanyId) return;
    let cancelled = false;
    setLoadingJobs(true);
    setJobsError("");

    api.get("/company/shortlisted-candidates/jobs")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setJobs(list);
        // Auto-select the first job (most recent) so the table shows something on load.
        if (list.length > 0) setSelectedJobId(list[0].jobId);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[ShortlistedCandidates] fetch jobs failed:", err);
        setJobsError(err?.response?.data?.error || err?.message || "Failed to load jobs.");
      })
      .finally(() => { if (!cancelled) setLoadingJobs(false); });

    return () => { cancelled = true; };
  }, [loggedInCompanyId]);

  // ════════════════════════════════════════════════════════════════
  // 3) Fetch shortlisted candidates whenever the selected job changes
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!selectedJobId) {
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setLoadingCandidates(true);
    setCandidatesError("");

    api.get("/company/shortlisted-candidates", { params: { jobId: selectedJobId } })
      .then((res) => {
        if (cancelled) return;
        setCandidates(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[ShortlistedCandidates] fetch shortlisted failed:", err);
        setCandidatesError(err?.response?.data?.error || err?.message || "Failed to load candidates.");
        setCandidates([]);
      })
      .finally(() => { if (!cancelled) setLoadingCandidates(false); });

    return () => { cancelled = true; };
  }, [selectedJobId]);

  // ════════════════════════════════════════════════════════════════
  // 4) Load scorecards for the selected job
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!selectedJobId) { setScorecards([]); return; }
    api.get("/company/scorecards", { params: { jobId: selectedJobId } })
      .then((res) => setScorecards(res.data || []))
      .catch((err) => console.error("[ShortlistedCandidates] load scorecards failed:", err));
  }, [selectedJobId]);

  // ════════════════════════════════════════════════════════════════
  // 5) Pre-check finalized state for each candidate in the list
  // ════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════
  // Job picker helpers
  // ════════════════════════════════════════════════════════════════
  const selectedJob = jobs.find((j) => j.jobId === selectedJobId) || {};
  const jobTitle    = selectedJob.jobTitle  || "—";
  const jobPostId   = selectedJob.jobPostId || "—";

  // ════════════════════════════════════════════════════════════════
  // Popup orchestration (unchanged logic)
  // ════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="sc-page">
        <div className="sc-container">

          <h2 className="sc-title">Shortlisted Candidates</h2>

          {/* ── Job Picker ── */}
          {!loadingJobs && jobs.length > 1 && (
            <div className="sc-job-picker">
              <label className="sc-job-picker-label">Job Post:</label>
              <select
                className="sc-job-picker-select"
                value={selectedJobId || ""}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
              >
                {jobs.map((j) => (
                  <option key={j.jobId} value={j.jobId}>
                    {j.jobTitle} ({j.jobPostId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Job Card ── */}
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
              <ManageScorecardsButton
                jobTitle={jobTitle}
                jobPostId={jobPostId}
                jobId={selectedJobId}
                scorecards={scorecards}
                onSave={(updated) => setScorecards(updated)}
              />
            </div>
          </div>

          {/* ── Candidates Table ── */}
          <div className="sc-table-card">
            <div className="sc-table-wrap">
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>Candidate ID</th>
                    <th>Candidate Name</th>
                    <th>History ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {/* Top-level loading: still figuring out which job to show */}
                  {(loadingJobs || (loggedInCompanyId && !selectedJobId && jobs.length === 0 && !jobsError)) && (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      Loading…
                    </td></tr>
                  )}

                  {/* Job fetch error */}
                  {!loadingJobs && jobsError && (
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "crimson", padding: 24 }}>
                      {jobsError}
                    </td></tr>
                  )}

                  {/* No jobs found at all */}
                  {!loadingJobs && !jobsError && jobs.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      No shortlisted candidates yet. Once candidates are shortlisted for a job, they'll show up here.
                    </td></tr>
                  )}

                  {/* Candidate fetch in progress */}
                  {selectedJobId && loadingCandidates && (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      Loading candidates…
                    </td></tr>
                  )}

                  {/* Candidate fetch error */}
                  {selectedJobId && !loadingCandidates && candidatesError && (
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "crimson", padding: 24 }}>
                      {candidatesError}
                    </td></tr>
                  )}

                  {/* No candidates for the selected job */}
                  {selectedJobId && !loadingCandidates && !candidatesError && candidates.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>
                      No shortlisted candidates for this job.
                    </td></tr>
                  )}

                  {/* Real rows */}
                  {selectedJobId && !loadingCandidates && !candidatesError && candidates.map((candidate, idx) => (
                    <tr key={`${candidate.jobApplicationId}-${idx}`}>
                      <td className="sc-bold" title={candidate.candidateId}>
                        {String(candidate.candidateId).slice(0, 8)}…
                      </td>
                      <td>{candidate.candidateName}</td>
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

      {/* ── Interview Request Popup ── */}
      <InterviewRequestPopup
        open={showRequestPopup}
        onClose={closeAllPopups}
        candidate={selectedCandidate}
        startInEditMode={editMode}
      />

      {/* ── Request Status Popup ── */}
      <RequestStatusPopup
        open={showStatusPopup}
        onClose={closeAllPopups}
        candidate={candidateRef.current || selectedCandidate}
        scorecards={scorecards}
        onEditRequest={handleEditFromStatus}
        onFinalizePanel={handleFinalize}
      />

      {/* ── Finalized Panel Popup (view-only, direct) ── */}
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