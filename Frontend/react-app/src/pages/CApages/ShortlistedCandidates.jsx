import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api"; // same axios instance used by InterviewRequestPopup
import "./ShortlistedCandidates.css";

// ─── Component imports ───
import ManageScorecardsButton from "./ManageScorecardsButton";
import CandidateActionButtons from "./CandidateActionButtons";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";

const ShortlistedCandidates = () => {

  // ─── Scorecard state (shared across components via props) ───
  const [scorecards, setScorecards] = useState([]);

  // ─── Logged-in admin's company ID (fetched on mount) ───
  const [loggedInCompanyId, setLoggedInCompanyId] = useState(null);

  // ─── Popup orchestration state ───
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCompanyId = async () => {
      try {
        // Adjust this endpoint to match your app's "get my company" route.
        // The JWT is sent automatically by the api (axios) interceptor.
        const res = await api.get("/company/me");
        if (!cancelled && res.data?.companyId) {
          setLoggedInCompanyId(res.data.companyId);
        }
      } catch (err) {
        console.error("[ShortlistedCandidates] failed to fetch company:", err);
      }
    };
    fetchCompanyId();
    return () => { cancelled = true; };
  }, []);

  // ════════════════════════════════════════════════════════════════
  // ▼▼▼ TEAMMATE'S PART — HARDCODED FOR NOW ▼▼▼
  // This section will later be replaced by an API call that fetches
  // shortlisted candidates for the logged-in company admin's jobs.
  //
  // Expected backend endpoint (when your teammate builds it):
  //   GET /api/company/shortlisted-candidates
  //   → returns rows from this SQL query:
  //
  //   SELECT ja.candidate_id,
  //          ja.id              AS job_application_id,
  //          ja.job_id,
  //          ch.history_id,
  //          ja.candidate_name,
  //          j.job_title,
  //          j.id               AS job_post_id,
  //          j.company_id
  //     FROM job_applications ja
  //     JOIN jobs j              ON ja.job_id = j.id
  //     JOIN candidate_history ch ON ch.candidate_id = ja.candidate_id
  //    WHERE j.company_id = <admin's company_id>
  //      AND ja.status = 'shortlisted';
  //
  // The values below are REAL rows copied from Supabase so the
  // interview-request popup actually works against the DB.
  //
  // ⚠️  IMPORTANT: Each candidate now has a `companyId` field
  //     matching the company_id of the job they applied to.
  //     Replace the placeholder UUIDs below with REAL company_id
  //     values from your Supabase `jobs` table:
  //       SELECT id, company_id FROM jobs WHERE id IN (26, 27);
  // ════════════════════════════════════════════════════════════════
  const allCandidates = [
    {
      candidateId:      "050e8591-fe88-4a6a-a48e-6f7ead2a710e",
      jobApplicationId: 6,
      jobId:            27,
      historyId:        6,
      candidateName:    "Senithi Malalanayake",
      jobTitle:         "Frontend Developer",
      jobPostId:        "JOB27",
      companyId:        "300b294a-5e53-4088-a86b-83badb77462a",  // company owning job 27
    },
    {
      candidateId:      "050e8591-fe88-4a6a-a48e-6f7ead2a710e",
      jobApplicationId: 8,
      jobId:            26,
      historyId:        6,
      candidateName:    "Senithi Vihara",
      jobTitle:         "Frontend Developer",
      jobPostId:        "JOB26",
      companyId:        "0c97e983-ff86-48cb-95a4-96076da055c4",  // company owning job 26
    },
    {
      candidateId:      "050e8591-fe88-4a6a-a48e-6f7ead2a710e",
      jobApplicationId: 7,
      jobId:            26,
      historyId:        6,
      candidateName:    "Sanuja Alphonsus",
      jobTitle:         "Frontend Developer",
      jobPostId:        "JOB26",
      companyId:        "0c97e983-ff86-48cb-95a4-96076da055c4",  // company owning job 26
    },
  ];
  // ▲▲▲ END TEAMMATE'S PART ▲▲▲
  // ════════════════════════════════════════════════════════════════

  // ─── Filter: only show candidates belonging to logged-in admin's company ───
  const candidates = useMemo(() => {
    if (!loggedInCompanyId) return []; // still loading
    return allCandidates.filter((c) => c.companyId === loggedInCompanyId);
  }, [loggedInCompanyId]);


  // ─── Job-card meta (derived from first candidate row) ───
  // If your page shows ONE job at a time, this stays simple.
  // If it eventually shows multiple jobs, group `candidates` by jobId.
  const firstCandidate = candidates[0] || {};
  const jobPostId = firstCandidate.jobPostId || "—";
  const jobTitle  = firstCandidate.jobTitle  || "—";

  // ════════════════════════════════════════════════════════════════
  // ─── Popup orchestration handlers ───
  // ════════════════════════════════════════════════════════════════

  /**
   * Called when admin clicks the action button on a candidate row.
   * Decides which popup to open based on whether an active request exists.
   */
  const handleOpenForCandidate = async (candidate) => {
    setSelectedCandidate(candidate);

    try {
      const res = await api.get("/company/interview-requests/current", {
        params: {
          candidateId: candidate.candidateId,
          jobApplicationId: candidate.jobApplicationId,
        },
      });

      // 204 No Content OR empty body → no active request → open create popup
      if (res.status === 204 || !res.data) {
        setShowRequestPopup(true);
        setShowStatusPopup(false);
      } else {
        // Active request exists → show status popup with live statuses
        setShowStatusPopup(true);
        setShowRequestPopup(false);
      }
    } catch (err) {
      console.error("[ShortlistedCandidates] status check failed:", err);
      // On error, fall back to the create popup so admin isn't blocked
      setShowRequestPopup(true);
    }
  };

  const closeAllPopups = () => {
    setShowRequestPopup(false);
    setShowStatusPopup(false);
    setSelectedCandidate(null);
  };

  /**
   * From the status popup, admin clicks "Edit Request".
   * We close the status popup and open the request popup, which will
   * auto-pre-fill from GET /current.
   */
  const handleEditFromStatus = () => {
    setShowStatusPopup(false);
    setShowRequestPopup(true);
  };

  /**
   * Optional: resend to a single interviewer.
   * Currently the backend doesn't have a per-interviewer resend endpoint,
   * so the simplest path is to reopen the create popup pre-selecting the
   * existing interviewers — the admin can keep/remove/add and re-submit,
   * which auto-cancels the old row and creates a new one.
   */
  const handleResend = (_interviewerUserId) => {
    setShowStatusPopup(false);
    setShowRequestPopup(true);
  };

  const handleFinalize = async (requestId) => {
    // TODO: wire to your finalize endpoint, e.g.
    // await api.put(`/company/interview-requests/${requestId}/finalize`);
    console.log("Finalize requested for", requestId);
  };

  return (
    <DashboardLayout>
      <div className="sc-page">
        <div className="sc-container">

          <h2 className="sc-title">Shortlisted Candidates</h2>

          {/* ─── Job Card ─── */}
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
                scorecards={scorecards}
                onSave={(updated) => setScorecards(updated)}
              />
            </div>
          </div>

          {/* ─── Candidates Table ─── */}
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
                  {candidates.map((candidate, idx) => (
                    <tr key={`${candidate.jobApplicationId}-${idx}`}>
                      <td className="sc-bold" title={candidate.candidateId}>
                        {String(candidate.candidateId).slice(0, 8)}…
                      </td>
                      <td>{candidate.candidateName}</td>
                      <td className="sc-bold">
                        {candidate.historyId != null ? `#${candidate.historyId}` : "—"}
                      </td>
                      <td>
                        {/* ═══════════════════════════════════════════════════
                            ▼ YOUR PART — Interview Request flow ▼
                            The action button now triggers handleOpenForCandidate,
                            which checks for an existing active request and opens
                            either the Status popup (if one exists) or the
                            Request popup (if none exists).
                            ═══════════════════════════════════════════════════ */}
                        <CandidateActionButtons
                          candidate={candidate}
                          scorecards={scorecards}
                          onOpenRequest={() => handleOpenForCandidate(candidate)}
                          onResendRequest={(id) => console.log("Resend to", id)}
                          onFinalizePanel={() => console.log("Finalize panel")}
                          onSendDetails={(payload) => console.log("Send details:", payload)}
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

      {/* ─── Interview Request Popup (create / edit) ─── */}
      <InterviewRequestPopup
        open={showRequestPopup}
        onClose={closeAllPopups}
        candidate={selectedCandidate}
        /* After a successful send, InterviewRequestPopup sets isSent=true
           and stays open with the confirmation view. If you want to auto-
           switch to the status popup instead, expose an onSent callback
           from InterviewRequestPopup and call:
             setShowRequestPopup(false);
             setShowStatusPopup(true);
        */
      />

      {/* ─── Request Status Popup (view live statuses of active request) ─── */}
      <RequestStatusPopup
        open={showStatusPopup}
        onClose={closeAllPopups}
        candidate={selectedCandidate}
        onEditRequest={handleEditFromStatus}
        onResendRequest={handleResend}
        onFinalizePanel={handleFinalize}
      />
    </DashboardLayout>
  );
};

export default ShortlistedCandidates; 