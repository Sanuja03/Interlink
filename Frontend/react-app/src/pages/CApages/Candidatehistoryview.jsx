import React from "react";
import "./CandidateHistory.css";



// Find the last stage in pipeline order that is Completed. The pipeline list
// itself is the source of truth, so the "Current Status" is just a friendly
// label for whichever stage the candidate has most recently cleared.
function lastCompletedStage(stages = []) {
  let last = null;
  for (const s of stages) {
    if (s.status === "Completed") last = s;
  }
  return last;
}

export function resolveDisplayStatus(rawStatus, stages = []) {
  const upper = (rawStatus || "").toUpperCase();

  // A rejection anywhere overrides the pipeline position.
  if (upper === "REJECTED") return "Rejected";

  const last = lastCompletedStage(stages);

  if (!last) {
    // Nothing cleared yet — still awaiting the shortlist decision.
    return "Pending Review";
  }

  const label = last.stage;

  // Whole process finished.
  if (label === "Feedback Received") return "Process Completed";

  // A round that has been PASSED (e.g. "Interview Round 1" / "Interview").
  if (label.startsWith("Interview") && !label.includes("Scheduled")) {
    return `${label} Completed`;
  }

  // The furthest thing done is a scheduling step — interview booked, not held.
  if (label.includes("Scheduled")) {
    return label; // e.g. "Interview Round 2 Scheduled" / "Interview Scheduled"
  }

  if (label === "Shortlisted") return "Shortlisted";
  if (label === "Applied") return "Pending Review";

  return label;
}

export function statusBadgeClass(rawStatus, stages = []) {
  const upper = (rawStatus || "").toUpperCase();
  if (upper === "REJECTED") return "ch-badge ch-badge--rejected";

  const last = lastCompletedStage(stages);
  if (!last) return "ch-badge ch-badge--pending";

  const label = last.stage;
  if (label === "Feedback Received") return "ch-badge ch-badge--completed";
  if (label.startsWith("Interview")) return "ch-badge ch-badge--interview";
  if (label === "Shortlisted") return "ch-badge ch-badge--shortlisted";
  if (label === "Applied") return "ch-badge ch-badge--pending";
  return "ch-badge ch-badge--default";
}

export default function CandidateHistoryView({
  historyData,
  candidate,
  loading,
  onBack,
  aiQuestionScores = [],
  aiQuestionScoreLoading = false,
}) {
  if (loading) {
    return (
      <div className="ch-page">
        <p>Loading history...</p>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="ch-page">
        <p>No history found</p>
        <button className="ch-backBtn" onClick={onBack}>← Back</button>
      </div>
    );
  }

  const stages = historyData.stages || [];
  const applicationId = historyData.jobApplicationId;
  const displayStatus = resolveDisplayStatus(historyData.currentStatus, stages);
  const badgeClass = statusBadgeClass(historyData.currentStatus, stages);

  return (
    <div className="ch-page">
      <h1 className="ch-pageTitle">History</h1>

      {/* Profile Card */}
      <section className="ch-profileCard">
        <div className="ch-profileLeft">
          <img
            src={
              candidate?.profilePictureUrl ||
              "https://randomuser.me/api/portraits/men/32.jpg"
            }
            alt="Candidate"
            className="ch-profilePhoto"
          />
          <div className="ch-profileText">
            <h2 className="ch-name">{historyData.candidateName || "Unknown"}</h2>
            <p className="ch-roleCompany">{candidate?.currentCompany || "—"}</p>
            <p className="ch-role">
              {candidate?.currentRole || candidate?.headline || "—"}
            </p>
          </div>
        </div>

        <div className="ch-stats">
          <div className="ch-statCard">
            <div className="ch-statValue">
              {candidate?.yearsOfExperience
                ? `${candidate.yearsOfExperience}+`
                : "—"}
            </div>
            <div className="ch-statLabel">Years Exp</div>
          </div>
          <div className="ch-statCard">
            <div className="ch-statValue">{candidate?.skills?.length || 0}</div>
            <div className="ch-statLabel">Skills</div>
          </div>
          <div className="ch-statCard">
            <div className="ch-statValue">
              {historyData.aiScore != null ? `${historyData.aiScore}%` : "—"}
            </div>
            <div className="ch-statLabel">AI Score</div>
          </div>
          <div className="ch-statCard">
            <div className="ch-statValue">{candidate?.education?.length || 0}</div>
            <div className="ch-statLabel">Degrees</div>
          </div>
        </div>
      </section>

      {/* History Table */}
      <section className="ch-historyBox">
        <h2 className="ch-historyTitle">Candidate History Tracker Screen</h2>

        <div className="ch-tableWrap">
          <table className="ch-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((row, index) => (
                <tr key={index}>
                  <td>{row.stage}</td>
                  <td>
                    <div className="ch-statusCell">
                      <span
                        className={`ch-statusDot ${
                          row.status === "Completed" ? "green" : "red"
                        }`}
                      ></span>
                      <span>{row.status}</span>
                    </div>
                  </td>
                  <td>{row.date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Job Info */}
        <div className="ch-jobInfo">
          <p><strong>Job Title:</strong> {historyData.jobTitle || "—"}</p>
          <p><strong>Application ID:</strong> #{applicationId ?? "—"}</p>
          {historyData.currentStatus && (
            <p>
              <strong>Current Status:</strong>{" "}
              <span className={badgeClass}>{displayStatus}</span>
            </p>
          )}
        </div>
      </section>

      {/* AI Question Score */}
      <section className="ch-historyBox ch-qsBox">
        <h2 className="ch-historyTitle">AI Question Score</h2>

        {aiQuestionScoreLoading ? (
          <p className="ch-qsEmpty">Loading AI interview history...</p>
        ) : aiQuestionScores.length === 0 ? (
          <p className="ch-qsEmpty">
            No AI interview question/answer history found for this candidate.
          </p>
        ) : (
          aiQuestionScores.map((session, sIdx) => (
            <div className="ch-qsSession" key={session.id || sIdx}>
              <div className="ch-qsScoreBar">
                <span className="ch-qsScoreLabel">
                  Score{session.savedAt ? ` — ${session.savedAt}` : ""}
                </span>
                <span className="ch-qsScoreValue">{session.score ?? 0}%</span>
              </div>

              <div className="ch-qsList">
                {(session.qaPairs || []).map((pair, qIdx) => (
                  <div className="ch-qsItem" key={qIdx}>
                    <div className="ch-qsQuestion">
                      {qIdx + 1}. {pair.question}
                    </div>
                    <div className="ch-qsAnswer">{pair.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Back Button */}
      <div className="ch-backWrap">
        <button className="ch-backBtn" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}