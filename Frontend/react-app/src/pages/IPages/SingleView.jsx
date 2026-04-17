import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import EvaluationForm from "../../components/InterviewerPages/SingleViewLayout/EvaluationForm";
import CandidateCard from "../../components/InterviewerPages/SingleViewLayout/CandidateCard";
import "./SingleView.css";

const SingleView = () => {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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

              <CandidateCard candidate={candidate} />
            </div>

            <EvaluationForm />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleView;