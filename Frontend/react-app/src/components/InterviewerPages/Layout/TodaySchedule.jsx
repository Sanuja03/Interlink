import { Link } from "react-router-dom";
import "./TodaySchedule.css";

const TodaySchedule = ({ rows = [], loading = false }) => {
  const hasSchedule = rows.length > 0;

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  // Build the interview object SingleView expects via location.state.interview
  const buildInterviewState = (r) => ({
    interviewId:      r.interviewId,
    scheduledId:      r.scheduledId,
    requestId:        r.requestId,
    date:             r.date,
    time:             r.time,
    jobTitle:         r.jobTitle,
    mode:             r.mode,
    meetingLink:      r.meetingLink || "",
    meetingStatus:    r.meetingStatus || "SCHEDULED",
    candidateId:      r.candidateId,
    jobApplicationId: r.jobApplicationId,
    candidateName:    r.candidate,
    panelMembers:     r.panelMembers || [],
    adminNote:        r.adminNote || "",
  });

  return (
    <div className="schedule-card">
      <h2 className="schedule-title">Today Schedule</h2>

      {loading ? (
        <div className="schedule-empty">
          <p className="schedule-empty-title">Loading…</p>
        </div>
      ) : hasSchedule ? (
        <div className="table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Interview ID</th>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Time</th>
                <th>Mode</th>
                <th className="align-right"></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.interviewId}>
                  <td className="bold">{r.interviewId}</td>
                  <td>{r.candidate}</td>
                  <td>{r.jobTitle}</td>
                  <td>{r.time}</td>

                  <td>
                    <div className="mode-cell">
                      <span className={`mode-dot ${modeDotClass(r.mode)}`} />
                      <span>{r.mode}</span>
                    </div>
                  </td>

                  <td className="align-right">
                    <Link
                      to={`/interviewer/single-view/${r.interviewId}`}
                      state={{ interview: buildInterviewState(r) }}
                      className="view-btn"
                    >
                      {r.action || "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="schedule-empty">
          <div className="schedule-empty-icon"></div>
          <p className="schedule-empty-title">Enjoy a Calm and Productive Day.</p>
          <p className="schedule-empty-sub">
            There are no interviews scheduled for today.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodaySchedule;