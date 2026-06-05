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

  // Holds the active request data when we go from Status -> Finalized (action mode)
  const [pendingFinalizeRequest, setPendingFinalizeRequest] = useState(null);

  /** finalizedMap: { [jobApplicationId]: requestId } — for already-finalized panels */
  const [finalizedMap, setFinalizedMap] = useState({});


  const [pendingFinalizeMap, setPendingFinalizeMap] = useState({});

  //  Loads the jobs dropdown
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


  // When a job is selected, loads candidates and scorecards in parallel
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

    Promise.all([candidatesPromise, scorecardsPromise]) // load both at same time

    //onsuccess
      .then(([candidatesRes, scorecardsRes]) => {
        if (cancelled) return;
        const candidateList = Array.isArray(candidatesRes.data) ? candidatesRes.data : [];
        setCandidates(candidateList);
        setScorecards(scorecardsRes.data || []);
      })
    //onfailure  
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


  // After candidates load, checks each one's finalized status
  // and if finalized put to finalisezed map
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

//runs when request/status is clicked - which popup to show in which situations 
  const handleOpenForCandidate = async (candidate) => {
    candidateRef.current = candidate;
    setSelectedCandidate(candidate);
    setEditMode(false);

    // 1) Already finalized (sent details) → open Finalized in VIEW mode
    const knownRid = finalizedMap[candidate.jobApplicationId];
    if (knownRid) {
      setFinalizedRequestId(knownRid);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }

    // 2) Mid-finalize (admin clicked Finalize Panel earlier but hasn't submitted)
    const pendingReq = pendingFinalizeMap[candidate.jobApplicationId];
    if (pendingReq) {
      setPendingFinalizeRequest(pendingReq);
      setShowRequestPopup(false);
      setShowStatusPopup(false);
      setShowFinalizedPopup(true);
      return;
    }

    // 3) Otherwise check backend for active request
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

  //runs when green finalised button is clicked
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

//runs when close button inside popups is clicked  
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

//runs when cancel and redo  is clicked from status popup
  const handleEditFromStatus = () => {
    setEditMode(true);
    setShowStatusPopup(false);
    setShowRequestPopup(true);
  };

//runs when finalise panel clicked from status page
  const handleRequestFinalize = (activeRequest) => {
    const candidate = candidateRef.current || selectedCandidate;
    if (candidate) {
      setPendingFinalizeMap((prev) => ({
        ...prev,
        [candidate.jobApplicationId]: activeRequest,
      }));
    }
    setPendingFinalizeRequest(activeRequest);
    setShowStatusPopup(false);
    setShowFinalizedPopup(true);
  };

  //runs when back to status is clicked from finalised page in action mode
  const handleBackToStatus = () => {
    const candidate = candidateRef.current || selectedCandidate;
    if (candidate) {
      setPendingFinalizeMap((prev) => {
        const next = { ...prev };
        delete next[candidate.jobApplicationId];
        return next;
      });
    }
    setPendingFinalizeRequest(null);
    setShowFinalizedPopup(false);
    setShowStatusPopup(true);
  };

  // finalize API call — called by FinalizedPanelPopup when admin clicks "Send Scheduled Interview Details".
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

      // Move candidate from "pending finalize" to "finalized"
      const candidate = candidateRef.current || selectedCandidate;
      if (candidate) {
        setFinalizedMap((prev) => ({ ...prev, [candidate.jobApplicationId]: requestId }));
        setPendingFinalizeMap((prev) => {
          const next = { ...prev };
          delete next[candidate.jobApplicationId];
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

                  {/*-----*/}
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
                          onOpenRequest={() => handleOpenForCandidate(candidate)} // function to call when request/status button is clicked
                          onOpenFinalized={() => handleOpenFinalizedDirect(candidate)}//function to call when finalised green button is clicked
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

{/* render the popup whne showRequestPopup = true */} 
      <InterviewRequestPopup
        open={showRequestPopup}
        onClose={closeAllPopups}
        candidate={selectedCandidate}
        startInEditMode={editMode}
      />

{/* render the popup whne showStatusPopup = true */} 
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