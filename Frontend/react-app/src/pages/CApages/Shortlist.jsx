import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./Shortlist.css";

export default function ShortlistPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualDecision, setManualDecision] = useState("Shortlist");
  const [manualNotes, setManualNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) return;
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get application details (includes candidateId, score, jobId, etc.)
      const appRes = await api.get(`/company/applications/detail/${applicationId}`);
      const appData = appRes.data;
      setApplication(appData);

      // Get candidate profile
      if (appData.candidateId) {
        const profileRes = await api.get(
          `/company/candidate-profile/${appData.candidateId}?applicationId=${applicationId}`
        );
        setCandidate(profileRes.data);
      }
    } catch (err) {
      console.error("Failed to load shortlist data:", err);
      setError("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  // Parse score_details JSON for skill breakdown
  const getSkillBreakdown = () => {
    if (!application?.scoreDetails) return [];
    try {
      const details =
        typeof application.scoreDetails === "string"
          ? JSON.parse(application.scoreDetails)
          : application.scoreDetails;

      if (Array.isArray(details)) return details;
      if (details.skills) return details.skills;
      if (details.breakdown) return details.breakdown;

      // If it's key-value pairs like { "React.js": true, "Node.js": false }
      return Object.entries(details).map(([skill, matched]) => ({
        skill,
        matched: matched === true || matched === "true" || matched >= 70,
      }));
    } catch {
      return [];
    }
  };

  const aiScore = application?.score || candidate?.aiScore || 0;
  const aiSuggestion = aiScore >= 70 ? "Recommended" : "Not Recommended";
  const skillBreakdown = getSkillBreakdown();

  const getFinalStatus = () => {
    if (manualDecision === "Shortlist") return "Recommended";
    if (manualDecision === "Reject") return "Not Recommended";
    return aiSuggestion;
  };

  // Handle Confirm (Shortlist)
  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const companyId = localStorage.getItem("companyId");

      await api.post("/company/shortlist", {
        candidateId: application.candidateId,
        companyId: companyId,
        jobId: application.jobId,
        jobApplicationId: Number(applicationId),
        manualDecision: manualDecision,
        manualNotes: manualNotes,
      });

      alert("Candidate shortlisted successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Shortlist failed:", err);
      const msg =
        err?.response?.data?.message || "Failed to shortlist candidate";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    try {
      setSubmitting(true);
      const companyId = localStorage.getItem("companyId");

      await api.post("/company/shortlist/reject", {
        candidateId: application.candidateId,
        companyId: companyId,
        jobId: application.jobId,
        jobApplicationId: Number(applicationId),
        manualDecision: "Reject",
        manualNotes: manualNotes,
      });

      alert("Candidate rejected.");
      navigate(-1);
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject candidate");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="sl-page">
          <div className="sl-loading">
            <div className="sl-spinner" />
            <p>Loading candidate details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="sl-page">
          <div className="sl-error">
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="sl-back-btn">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="sl-page">
        <h1 className="sl-page-title">Shortlist</h1>

        {/* ═══ Candidate Profile Card ═══ */}
        <section className="sl-profile-card">
          <div className="sl-profile-left">
            <div className="sl-avatar-wrap">
              {candidate?.profilePictureUrl ? (
                <img
                  src={candidate.profilePictureUrl}
                  alt={candidate?.fullName}
                  className="sl-avatar"
                />
              ) : (
                <div className="sl-avatar-placeholder">
                  {candidate?.fullName?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className="sl-profile-info">
              <h2 className="sl-name">{candidate?.fullName || "Unknown"}</h2>
              <p className="sl-company-name">
                {candidate?.currentCompany || "—"}
              </p>
              <p className="sl-role">{candidate?.currentRole || candidate?.headline || "—"}</p>
            </div>
          </div>

          <div className="sl-stats-row">
            {[
              { value: candidate?.yearsOfExperience ? `${candidate.yearsOfExperience}+` : "—", label: "Years Exp" },
              { value: candidate?.skills?.length || 0, label: "Skills" },
              { value: `${aiScore}%`, label: "AI Score" },
              { value: candidate?.education?.length || 0, label: "Degrees" },
            ].map((stat, i) => (
              <div key={i} className="sl-stat-box">
                <span className="sl-stat-value">{stat.value}</span>
                <span className="sl-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Two-Column: AI Box + Manual Box ═══ */}
        <div className="sl-two-col">
          {/* ── AI Shortlisting Box ── */}
          <section className="sl-box sl-ai-box">
            <h3 className="sl-box-title sl-ai-title">AI Shortlisting Box</h3>

            <div className="sl-score-bar">
              <span className="sl-score-label">AI Score</span>
              <span className="sl-score-value">{aiScore}%</span>
              <span
                className={`sl-score-dot ${aiScore >= 70 ? "sl-dot-green" : "sl-dot-red"}`}
              />
            </div>

            {/* Skill Breakdown */}
            <div className="sl-skills-list">
              {skillBreakdown.length > 0 ? (
                skillBreakdown.map((item, idx) => (
                  <div key={idx} className="sl-skill-row">
                    <span className="sl-skill-num">{idx + 1}.</span>
                    <span className="sl-skill-name">
                      {item.skill || item.name || item}
                    </span>
                    <span className="sl-skill-icon">
                      {item.matched ? "✅" : "❌"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="sl-no-skills">
                  {candidate?.skills?.map((skill, idx) => (
                    <div key={idx} className="sl-skill-row">
                      <span className="sl-skill-num">{idx + 1}.</span>
                      <span className="sl-skill-name">{skill}</span>
                      <span className="sl-skill-icon">✅</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sl-suggestion-row">
              <span className="sl-suggestion-label">AI Suggestion</span>
              <span
                className={`sl-suggestion-badge ${
                  aiSuggestion === "Recommended"
                    ? "sl-badge-green"
                    : "sl-badge-red"
                }`}
              >
                {aiSuggestion}
              </span>
            </div>
          </section>

          {/* ── Manual Shortlisting Box ── */}
          <section className="sl-box sl-manual-box">
            <h3 className="sl-box-title sl-manual-title">
              Manual Shortlisting Box
            </h3>

            <div className="sl-field">
              <label className="sl-label">Select Decision</label>
              <select
                className="sl-select"
                value={manualDecision}
                onChange={(e) => setManualDecision(e.target.value)}
              >
                <option value="Shortlist">Shortlist</option>
                <option value="Reject">Reject</option>
                <option value="Hold">Hold</option>
              </select>
            </div>

            <div className="sl-field">
              <label className="sl-label">Add Note</label>
              <textarea
                className="sl-textarea"
                rows={5}
                placeholder="Notes"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
              />
            </div>

            <button className="sl-save-btn" onClick={() => {}}>
              Save
            </button>
          </section>
        </div>

        {/* ═══ Summary Bar ═══ */}
        <section className="sl-summary-bar">
          <div className="sl-summary-item">
            <span className="sl-summary-heading">AI Suggestion</span>
            <span
              className={`sl-summary-badge ${
                aiSuggestion === "Recommended"
                  ? "sl-badge-green"
                  : "sl-badge-red"
              }`}
            >
              {aiSuggestion}
            </span>
          </div>

          <div className="sl-summary-item">
            <span className="sl-summary-heading">Manual Suggestion</span>
            <span
              className={`sl-summary-badge ${
                manualDecision === "Shortlist"
                  ? "sl-badge-green"
                  : manualDecision === "Reject"
                  ? "sl-badge-red"
                  : "sl-badge-yellow"
              }`}
            >
              {manualDecision === "Shortlist"
                ? "Recommended"
                : manualDecision === "Reject"
                ? "Not Recommended"
                : "On Hold"}
            </span>
          </div>

          <div className="sl-summary-item">
            <span className="sl-summary-heading">Final Status</span>
            <span
              className={`sl-summary-badge ${
                getFinalStatus() === "Recommended"
                  ? "sl-badge-green"
                  : "sl-badge-red"
              }`}
            >
              {getFinalStatus()}
            </span>
          </div>
        </section>

        {/* ═══ Action Buttons ═══ */}
        <div className="sl-actions">
          <button
            className="sl-confirm-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Confirm"}
          </button>
          <button
            className="sl-reject-btn"
            onClick={handleReject}
            disabled={submitting}
          >
            Reject
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
