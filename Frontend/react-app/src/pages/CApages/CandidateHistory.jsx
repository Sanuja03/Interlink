import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./CandidateHistory.css";

import companyLogo from "../../assets/images/default-avatar.png";

/**
 * Converts the raw DB status + stage list into a friendly human-readable label.
 *
 * Priority order:
 *  1. If any stage contains "Round N" and is completed → "Interview Round N In Progress"
 *     (or "Interview In Progress" for single-round jobs)
 *  2. REJECTED  → "Rejected"
 *  3. PENDING   → "Pending Review"
 *  4. SHORTLISTED but no interview stages completed yet → "Shortlisted"
 *  5. All stages completed including Feedback → "Completed"
 *  6. Fallback  → title-case of the raw value
 */
function resolveDisplayStatus(rawStatus, stages = []) {
  const upper = (rawStatus || "").toUpperCase();

  // Check Feedback Received
  const feedback = stages.find((s) => s.stage === "Feedback Received");
  if (feedback?.status === "Completed") return "Completed";

  // Find the furthest completed interview stage
  const completedInterviews = stages.filter(
    (s) => s.stage.startsWith("Interview") &&
           !s.stage.includes("Scheduled") &&
           s.status === "Completed"
  );
  if (completedInterviews.length > 0) {
    const last = completedInterviews[completedInterviews.length - 1];
    // e.g. "Interview Round 2" → "Interview Round 2 In Progress"
    // e.g. "Interview"         → "Interview In Progress"
    return `${last.stage} In Progress`;
  }

  // Check if at least one "Scheduled" stage is completed (interview requested but not done)
  const scheduledDone = stages.some(
    (s) => s.stage.includes("Scheduled") && s.status === "Completed"
  );
  if (scheduledDone) return "Interview Scheduled";

  if (upper === "REJECTED")    return "Rejected";
  if (upper === "PENDING")     return "Pending Review";
  if (upper === "SHORTLISTED") return "Shortlisted";
  if (upper === "INTERVIEW")   return "Interview In Progress";

  // Title-case fallback for anything unexpected
  return rawStatus
    ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()
    : "—";
}

/** Returns the CSS class for the status badge */
function statusBadgeClass(rawStatus, stages = []) {
  const upper = (rawStatus || "").toUpperCase();
  const feedback = stages.find((s) => s.stage === "Feedback Received");
  if (feedback?.status === "Completed") return "ch-badge ch-badge--completed";
  if (stages.some((s) => s.stage.includes("Interview") && s.status === "Completed"))
    return "ch-badge ch-badge--interview";
  if (stages.some((s) => s.stage.includes("Scheduled") && s.status === "Completed"))
    return "ch-badge ch-badge--interview";
  if (upper === "REJECTED")    return "ch-badge ch-badge--rejected";
  if (upper === "PENDING")     return "ch-badge ch-badge--pending";
  if (upper === "SHORTLISTED") return "ch-badge ch-badge--shortlisted";
  return "ch-badge ch-badge--default";
}

export default function CandidateHistory() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    loadHistory();
  }, [applicationId]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const historyRes = await api.get(`/company/history/application/${applicationId}`);
      setHistoryData(historyRes.data);

      if (historyRes.data.candidateId) {
        const profileRes = await api.get(
          `/company/candidate-profile/${historyRes.data.candidateId}?applicationId=${applicationId}`
        );
        setCandidate(profileRes.data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="ch-page">
          <p>Loading history...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!historyData) {
    return (
      <DashboardLayout>
        <div className="ch-page">
          <p>No history found</p>
          <button className="ch-backBtn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </DashboardLayout>
    );
  }

  const displayStatus  = resolveDisplayStatus(historyData.currentStatus, historyData.stages || []);
  const badgeClass     = statusBadgeClass(historyData.currentStatus, historyData.stages || []);

  return (
    <DashboardLayout>
      <div className="ch-page">
        <h1 className="ch-pageTitle">History</h1>

        {/* Profile Card */}
        <section className="ch-profileCard">
          <div className="ch-profileLeft">
            <img
              src={candidate?.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Candidate"
              className="ch-profilePhoto"
            />
            <div className="ch-profileText">
              <h2 className="ch-name">{historyData.candidateName || "Unknown"}</h2>
              <p className="ch-roleCompany">{candidate?.currentCompany || "—"}</p>
              <p className="ch-role">{candidate?.currentRole || candidate?.headline || "—"}</p>
            </div>
          </div>

          <div className="ch-stats">
            <div className="ch-statCard">
              <div className="ch-statValue">
                {candidate?.yearsOfExperience ? `${candidate.yearsOfExperience}+` : "—"}
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
                {historyData.stages?.map((row, index) => (
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
            <p><strong>Application ID:</strong> #{applicationId}</p>
            {historyData.currentStatus && (
              <p>
                <strong>Current Status:</strong>{" "}
                <span className={badgeClass}>{displayStatus}</span>
              </p>
            )}
          </div>
        </section>

        {/* Back Button */}
        <div className="ch-backWrap">
          <button className="ch-backBtn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
