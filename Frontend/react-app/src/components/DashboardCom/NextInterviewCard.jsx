import "./NextInterviewCard.css";

const NextInterviewCard = ({ interview }) => {
  const isEmpty = !interview;

  return (
    <div className="next-card">

      {/* HEADER */}
      <div className="next-card-header">
        <h3 className="next-card-title">Next Interview</h3>

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

      {/* cards body */}
      <div className="next-card-body">

        {/* if empty */}
        {isEmpty ? (
          <div className="next-empty">
         
            <p className="next-empty-title">No upcoming interviews</p>
            <p className="next-empty-sub">
               New interviews will appear here once scheduled.
            </p>
          </div>
        ) : (
          <>
            {/* interview detais*/}
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

            {/* join button */}
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
              <img
                src={interview.candidate.image}
                alt="candidate"
                className="candidate-avatar"
              />

              <div className="candidate-info">
                <p className="candidate-name">{interview.candidate.name}</p>
                <p className="candidate-id">
                  Candidate ID: {interview.candidate.id}
                </p>

                <div className="candidate-links">
                  <span className="cv-name">
                    {interview.candidate.cvName}
                  </span>
                  <a
                    href={interview.candidate.profileLink}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-link"
                  >
                    Profile
                  </a>
                </div>

                <p className="candidate-note">
                  {interview.candidate.note}
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default NextInterviewCard;
