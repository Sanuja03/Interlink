import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./ShortlistedCandidates.css";

import ManageScorecardsButton from "./ManageScorecardsButton";
import CandidateActionButtons from "./CandidateActionButtons";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";




const rowKey = (candidate) => {
  if (candidate.historyId != null) return `h:${candidate.historyId}`;
  return `a:${candidate.jobApplicationId}:r:${candidate.round ?? 1}`;
};


const requestBelongsToRow = (responseData, candidate, candidates) => {
  if (!responseData) return false;


  if (responseData.historyId != null && candidate.historyId != null) {
    return String(responseData.historyId) === String(candidate.historyId);
  }


  const sameApp = candidates.filter(
    (c) => c.jobApplicationId === candidate.jobApplicationId
  );
  if (sameApp.length <= 1) return true;

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


  const [pendingFinalizeRequest, setPendingFinalizeRequest] = useState(null);


  const [finalizedMap, setFinalizedMap] = useState({});


  const [pendingFinalizeMap, setPendingFinalizeMap] = useState({});


  // Bumped after a cancel so the candidate list reloads and the row drops its
  // finalized flag (the backend stops reporting cancelled schedules as finalized).
  const [refreshTick, setRefreshTick] = useState(0);


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
  }, [selectedJobId, refreshTick]);


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
    const key = rowKey(candidate);
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setEditMode(false);


    const known = finalizedMap[key];
    if (known) {
      setFinalizedRequestId(known.requestId);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }


    const pendingReq = pendingFinalizeMap[key];
    if (pendingReq) {
      setPendingFinalizeRequest(pendingReq);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }


    try {
      const res = await api.get("/company/interview-requests/status/current", {
        params: {
          candidateId: candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });

      const hasData = res.status !== 204 && !!res.data;

      if (!hasData) {

        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
        return;
      }


      const belongsHere = requestBelongsToRow(res.data, candidate, candidates);

      if (!belongsHere) {

        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
        return;
      }


      if (res.data.overallStatus === "finalized") {
        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
        return;
      }


      setShowFinalizedPopup(false);
      setShowRequestPopup(false);
      setShowStatusPopup(true);
    } catch (err) {
      console.error("[ShortlistedCandidates] status check failed:", err);
      setShowFinalizedPopup(false);
      setShowStatusPopup(false);
      setShowRequestPopup(true);
    }
  };


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

  // After a cancel the schedule and its request are both cancelled, so the row is
  // no longer finalized — reloading drops it back to the Interview Request popup.
  const handleInterviewCancelled = () => {
    closeAllPopups();
    setRefreshTick((t) => t + 1);
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

          <div className="sc-outer-card">
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
          onCancelled={handleInterviewCancelled}
        />
      )}
    </DashboardLayout>
  );
};

export default ShortlistedCandidates;