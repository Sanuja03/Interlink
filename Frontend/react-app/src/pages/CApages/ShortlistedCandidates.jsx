import { useState, useEffect, useMemo, useRef } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./ShortlistedCandidates.css";

import ManageScorecardsButton from "./ManageScorecardsButton";
import CandidateActionButtons from "./CandidateActionButtons";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";

const ShortlistedCandidates = () => {
  const [jobGroups, setJobGroups] = useState([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popup state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showFinalizedPopup, setShowFinalizedPopup] = useState(false);
  const [finalizedRequestId, setFinalizedRequestId] = useState(null);
  const candidateRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [finalizedMap, setFinalizedMap] = useState({});

  // Fetch shortlisted candidates grouped by job
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    setLoading(true);
    api
      .get(`/company/shortlist/company/${companyId}`)
      .then((res) => {
        setJobGroups(res.data || []);
        setSelectedJobIndex(0);
      })
      .catch((err) => {
        console.error("Failed to fetch shortlisted candidates:", err);
        setJobGroups([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Current selected job group
  const currentJob = jobGroups[selectedJobIndex] || null;
  const candidates = currentJob?.candidates || [];
  const jobTitle = currentJob?.jobTitle || "—";
  const jobId = currentJob?.jobId || null;
  const jobPostId = jobId ? `JOB${jobId}` : "—";

  // Load scorecards when job changes
  useEffect(() => {
    if (!jobId) return;
    api
      .get("/company/scorecards", { params: { jobId } })
      .then((res) => setScorecards(res.data))
      .catch((err) =>
        console.error("Load scorecards failed:", err)
      );
  }, [jobId]);

  // Pre-check finalized status
  useEffect(() => {
    if (candidates.length === 0) return;
    let cancelled = false;

    Promise.all(
      candidates.map(async (c) => {
        try {
          const res = await api.get(
            "/company/interview-requests/status/current",
            {
              params: {
                candidateId: c.candidateId,
                jobApplicationId: c.jobApplicationId,
              },
            }
          );
          if (
            !cancelled &&
            res.data?.overallStatus === "finalized" &&
            res.data?.requestId
          ) {
            return {
              jobApplicationId: c.jobApplicationId,
              requestId: res.data.requestId,
            };
          }
        } catch {
          /* ignore */
        }
        return null;
      })
    ).then((results) => {
      if (cancelled) return;
      const updates = {};
      results.forEach((r) => {
        if (r) updates[r.jobApplicationId] = r.requestId;
      });
      if (Object.keys(updates).length > 0)
        setFinalizedMap((prev) => ({ ...prev, ...updates }));
    });

    return () => {
      cancelled = true;
    };
  }, [candidates.length, selectedJobIndex]);

  // Popup handlers
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
      const res = await api.get(
        "/company/interview-requests/status/current",
        {
          params: {
            candidateId: candidate.candidateId,
            jobApplicationId: candidate.jobApplicationId,
          },
        }
      );

      if (res.status === 204 || !res.data) {
        setShowFinalizedPopup(false);
        setShowStatusPopup(false);
        setShowRequestPopup(true);
      } else if (res.data.overallStatus === "finalized") {
        const rid = res.data.requestId;
        setFinalizedMap((prev) => ({
          ...prev,
          [candidate.jobApplicationId]: rid,
        }));
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
      console.error("Status check failed:", err);
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
      setFinalizedMap((prev) => ({
        ...prev,
        [candidate.jobApplicationId]: requestId,
      }));
      setFinalizedRequestId(requestId);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="sc-page">
          <p>Loading shortlisted candidates...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="sc-page">
        <div className="sc-container">
          <h2 className="sc-title">Shortlisted Candidates</h2>

          {/* Job Selector — if multiple jobs have shortlisted candidates */}
          {jobGroups.length > 1 && (
            <div className="sc-job-selector">
              <label>Select Job: </label>
              <select
                value={selectedJobIndex}
                onChange={(e) =>
                  setSelectedJobIndex(Number(e.target.value))
                }
                className="sc-job-select"
              >
                {jobGroups.map((group, idx) => (
                  <option key={group.jobId} value={idx}>
                    {group.jobTitle} ({group.shortlistedCount} candidates)
                  </option>
                ))}
              </select>
            </div>
          )}

          {jobGroups.length === 0 ? (
            <div className="sc-empty">
              <p>No shortlisted candidates yet.</p>
            </div>
          ) : (
            <>
              {/* Job Card */}
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
                    <span className="sc-job-meta-label">
                      Shortlisted Count
                    </span>
                    <span className="sc-job-meta-value">
                      {currentJob?.shortlistedCount || 0}
                    </span>
                  </div>
                  <ManageScorecardsButton
                    jobTitle={jobTitle}
                    jobPostId={jobPostId}
                    jobId={jobId}
                    scorecards={scorecards}
                    onSave={(updated) => setScorecards(updated)}
                  />
                </div>
              </div>

              {/* Candidates Table */}
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
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
                            No candidates shortlisted for this job
                          </td>
                        </tr>
                      ) : (
                        candidates.map((candidate, idx) => (
                          <tr
                            key={`${candidate.shortlistId}-${idx}`}
                          >
                            <td
                              className="sc-bold"
                              title={candidate.candidateId}
                            >
                              {String(candidate.candidateId).slice(0, 8)}…
                            </td>
                            <td>{candidate.candidateName}</td>
                            <td className="sc-bold">
                              {candidate.historyId != null
                                ? `#${candidate.historyId}`
                                : "—"}
                            </td>
                            <td>
                              <CandidateActionButtons
                                isFinalized={
                                  !!finalizedMap[
                                    candidate.jobApplicationId
                                  ]
                                }
                                onOpenRequest={() =>
                                  handleOpenForCandidate(candidate)
                                }
                                onOpenFinalized={() =>
                                  handleOpenFinalizedDirect(candidate)
                                }
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popups */}
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
            jobTitle:
              (candidateRef.current || selectedCandidate)?.jobTitle ||
              "—",
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