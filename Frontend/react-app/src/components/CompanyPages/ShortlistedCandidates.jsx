import { useState } from "react";
import DashboardLayout from "../InterviewerPages/Layout/DashboardLayout";
import "./ShortlistedCandidates.css";

import InterviewRequestPopup from "./InterviewRequestPopup";
import RequestStatusPopup from "./RequestStatusPopup";
import FinalizedPanelPopup from "./FinalizedPanelPopup";

const ShortlistedCandidates = () => {

  const [openRequest, setOpenRequest] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openFinalized, setOpenFinalized] = useState(false);

  const candidate = {
    candidateId: "CAND001",
    candidateName: "Amal Dissanayaka",
    email: "amal@gmail.com",
    contact: "0771234567",
    jobTitle: "UI/UX Designer",
    jobPostId: "JOB101",
    round: "Round 2 (Technical)",
    cvScore: "85%",
    status: "Shortlisted",
    notes: "Strong portfolio and good communication skills.",
  };

  return (
    <>
      <DashboardLayout>
        <div className="sc-page">
          <div className="sc-container">

            <h2 className="sc-title">Shortlisted Candidates</h2>

            <div className="sc-job-card">
              <div>
                <p className="sc-job-label">Selected Job Post</p>
                <h3 className="sc-job-title">UI/UX Designer</h3>
              </div>

              <div className="sc-job-meta-wrap">
                <div className="sc-job-meta-box">
                  <span className="sc-job-meta-label">Job Post ID</span>
                  <span className="sc-job-meta-value">{candidate.jobPostId}</span>
                </div>

                <div className="sc-job-meta-box">
                  <span className="sc-job-meta-label">Shortlisted Count</span>
                  <span className="sc-job-meta-value">1</span>
                </div>
              </div>
            </div>

            <div className="sc-table-card">
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Candidate ID</th>
                      <th>Candidate Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Job Title</th>
                      <th>Round</th>
                      <th>CV Score</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="sc-bold">{candidate.candidateId}</td>
                      <td>{candidate.candidateName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.contact}</td>
                      <td>{candidate.jobTitle}</td>
                      <td>{candidate.round}</td>
                      <td>{candidate.cvScore}</td>
                      <td>{candidate.status}</td>
                      <td className="sc-notes">{candidate.notes}</td>

                      <td>
                        <div className="sc-action-group">

                          <button
                            className="sc-request-btn"
                            onClick={() => setOpenRequest(true)}
                          >
                            Request
                          </button>

                          <button
                            className="sc-status-btn"
                            onClick={() => setOpenStatus(true)}
                          >
                            Status
                          </button>

                          <button
                            className="sc-final-btn"
                            onClick={() => setOpenFinalized(true)}
                          >
                            Finalized Panel
                          </button>

                        </div>
                      </td>

                    </tr>
                  </tbody>

                </table>
              </div>
            </div>

          </div>
        </div>
      </DashboardLayout>


      {/* POPUPS */}

      <InterviewRequestPopup
        open={openRequest}
        onClose={() => setOpenRequest(false)}
        candidate={candidate}
      />

<RequestStatusPopup
  open={openStatus}
  onClose={() => setOpenStatus(false)}
  panelSize={2}
  interviewers={[
    {
      id: 1,
      name: "Nadeesha Perera",
      role: "Senior UI/UX Designer",
      requestStatus: "Accepted",
    },
    {
      id: 2,
      name: "Kavindu Silva",
      role: "Product Designer",
      requestStatus: "Pending",
    },
    {
      id: 3,
      name: "Tharushi Fernando",
      role: "UX Researcher",
      requestStatus: "Rejected",
    },
    {
        id: 4,
        name: "Nadeesha Perera",
        role: "Senior UI/UX Designer",
        requestStatus: "Accepted",
      },
  ]}
  onResendRequest={(id) => console.log("Resend to", id)}
  onFinalizePanel={() => console.log("Finalize panel")}
/>

<FinalizedPanelPopup
  open={openFinalized}
  onClose={() => setOpenFinalized(false)}
  interviewDetails={{
    jobTitle: "UI/UX Designer",
    date: "2026-03-15",
    time: "10:30 AM",
    mode: "Online"
  }}
  acceptedInterviewers={[
    { id: 1, name: "Nadeesha Perera", role: "Senior UI/UX Designer" },
    { id: 4, name: "Sahan Jayawardena", role: "Design Lead" }
  ]}
/>

    </>
  );
};

export default ShortlistedCandidates;