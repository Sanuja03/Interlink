import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import "./SingleView.css";

const SingleView = () => {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);

  const interview = location.state?.interview;

  const candidate = interview?.candidate || {
    image: "https://via.placeholder.com/120",
    id: "CAND-001",
    name: "Candidate Name",
    cvName: "candidate_cv.pdf",
    profileLink: "#",
    history:
      "Candidate background, previous applications, skills, experience, and other relevant details will be shown here.",
  };

  return (
    <DashboardLayout>
      <div className="singleview-page">
        <div className="singleview-top">
          <h1 className="singleview-title">Interview Details</h1>
          <button className="singleview-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        {!interview ? (
          <div className="singleview-empty-card">
            <p className="singleview-empty-text">
              No interview data found for <strong>{interviewId}</strong>.
            </p>
            <p className="singleview-empty-sub">
              This can happen if the page was refreshed directly.
            </p>
          </div>
        ) : (
          <>
            <div className="singleview-main-layout">
              {/* LEFT */}
              <div className="singleview-left-panel">
                <div className="singleview-info-box">
                  <span className="singleview-box-label">Interview ID</span>
                  <span className="singleview-box-value">
                    {interview.interviewId}
                  </span>
                </div>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Date - Time</span>
                  <span className="singleview-box-value">
                    {interview.date} - {interview.time}
                  </span>
                </div>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Job Applied</span>
                  <span className="singleview-box-value">
                    {interview.jobTitle}
                  </span>
                </div>

                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="singleview-meeting-link"
                >
                  Meeting Link
                </a>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Meeting Status</span>
                  <span
                    className={`singleview-status-badge ${
                      interview.meetingStatus === "ONGOING"
                        ? "singleview-status-ongoing"
                        : "singleview-status-scheduled"
                    }`}
                  >
                    {interview.meetingStatus}
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="singleview-right-panel">
                <div className="singleview-candidate-top">
                  <div className="singleview-image-wrap">
                    <img
                      src={candidate.image}
                      alt=""
                      className="singleview-candidate-image"
                    />
                  </div>

                  <div className="singleview-candidate-basic">
                    <div className="singleview-small-box">
                      <span className="singleview-small-label">
                        Candidate ID
                      </span>
                      <span className="singleview-small-value">
                        {candidate.id}
                      </span>
                    </div>

                    <div className="singleview-small-box">
                      <span className="singleview-small-label">
                        Candidate Name
                      </span>
                      <span className="singleview-small-value">
                        {candidate.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="singleview-candidate-details-box">
                  <p className="singleview-detail-line">
                    <strong>CV:</strong> {candidate.cvName}
                  </p>

                  <p className="singleview-detail-line">
                    <strong>Profile:</strong>{" "}
                    <a
                      href={candidate.profileLink}
                      target="_blank"
                      rel="noreferrer"
                      className="singleview-profile-link"
                    >
                      View Profile
                    </a>
                  </p>

                  <p className="singleview-detail-line">
                    <strong>Details:</strong> {candidate.history}
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="singleview-score-card">
              <h2 className="singleview-section-title">
                Candidate Evaluation Form
              </h2>

              <div className="singleview-form-grid">
                <input className="singleview-input" placeholder="Technical (0-10)" />
                <input className="singleview-input" placeholder="Communication (0-10)" />
                <input className="singleview-input" placeholder="Problem Solving (0-10)" />
                <input className="singleview-input" placeholder="Confidence (0-10)" />

                <textarea
                  className="singleview-textarea"
                  placeholder="Comments"
                />

                <select className="singleview-input">
                  <option value="">Recommendation</option>
                  <option>Strong Hire</option>
                  <option>Hire</option>
                  <option>Hold</option>
                  <option>Reject</option>
                </select>
              </div>

              <div className="singleview-action-row">
                <button className="singleview-draft-btn">Save Draft</button>

                <button
                  className={`singleview-submit-btn ${
                    submitted ? "disabled-btn" : ""
                  }`}
                  onClick={() => setSubmitted(true)}
                  disabled={submitted}
                >
                  {submitted ? "Submitted" : "Submit Evaluation"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleView;