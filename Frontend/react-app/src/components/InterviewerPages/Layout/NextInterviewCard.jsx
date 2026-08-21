import defaultAvatar from "../../../assets/default-avatar.png";
import "./NextInterviewCard.css";

const NextInterviewCard = ({ interview }) => {
  const isEmpty = !interview;

  return (
    <div className="next-card">

      {/* title */}
      <div className="next-card-header">
        <h3 className="next-card-title">Next Interview</h3>

        {/* changing colour of the badge */}
        <span
          className={`status-badge ${
            isEmpty
              ? "status-pending"
              : interview.meetingStatus === "CONFIRMED"
              ? "status-confirmed"
              : "status-pending"
          }`}
        >
          {isEmpty ? "NONE" : interview.meetingStatus}
        </span>
      </div>

      {/* card body */}
      <div className="next-card-body">

        {/* if empty */}
        {isEmpty ? (
          <div className="next-empty">
            <p className="next-empty-title">No upcoming interviews</p>
            <p className="next-empty-sub">
              Your next interview will be shown here if there is.
            </p>
          </div>
        ) : (
          <>
            {/* interview details */}
            <div className="interview-details">
              <div className="detail-row">
                <span className="label">Interview ID</span>
                <span className="value">{interview.interviewId}</span>
              </div>

              <div className="detail-row">
                <span className="label">Date</span>
                <span className="value">{interview.date}</span>
              </div>

              <div className="detail-row">
                <span className="label">Time</span>
                <span className="value">{interview.time}</span>
              </div>

              <div className="detail-row">
                <span className="label">Job</span>
                <span className="value job-title">{interview.jobTitle}</span>
              </div>
            </div>

            {/* join button — only for online interviews with link */}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="join-btn"
              >
                Join Meeting
              </a>
            )}

            {/* divider */}
            <div className="divider" />

            {/* candidate data */}
            <div className="candidate">
              {/* candidate's own picture if they uploaded one, default avatar otherwise */}
              <img
                src={interview.candidate?.image || defaultAvatar}
                alt="candidate"
                className="candidate-avatar"
                onError={(e) => { e.target.src = defaultAvatar; }}
              />

              <div className="candidate-info">
                <p className="candidate-name">{interview.candidate?.name}</p>


                {interview.candidate?.note && (
                  <p className="admin-note">{interview.candidate.note}</p>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default NextInterviewCard;