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
  const [manualDecision, setManualDecision] = useState("Recommended");
  const [manualNotes, setManualNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isAlreadyShortlisted, setIsAlreadyShortlisted] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const appRes = await api.get(`/company/applications/detail/${applicationId}`);
      const appData = appRes.data;
      setApplication(appData);

      if (appData.candidateId) {
        const profileRes = await api.get(
          `/company/candidate-profile/${appData.candidateId}?applicationId=${applicationId}`
        );
        setCandidate(profileRes.data);

        // Check if already shortlisted (Case 3)
        try {
          const statusRes = await api.get("/company/shortlist/status", {
            params: {
              candidateId: appData.candidateId,
              jobApplicationId: applicationId,
            },
          });
          if (statusRes.data.isShortlisted) {
            setIsAlreadyShortlisted(true);
            setManualDecision("Recommended");
            if (statusRes.data.manualNotes) {
              setManualNotes(statusRes.data.manualNotes);
            }
          }
        } catch (statusErr) {
          console.error("Failed to check shortlist status:", statusErr);
        }
      }
    } catch (err) {
      console.error("Failed to load shortlist data:", err);
      setError("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

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
    if (isAlreadyShortlisted && manualDecision === "Recommended") return "Shortlisted";
    if (manualDecision === "Recommended") return "Shortlisted";
    return "Rejected";
  };

  // Handle Confirm
  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const companyId = localStorage.getItem("companyId");

      if (manualDecision === "Recommended") {
        if (isAlreadyShortlisted) {
          // Case 3: Already shortlisted, no change needed
          alert("Candidate is already shortlisted.");
          return;
        }

        // Case 1: Recommended + Confirm → shortlist
        await api.post("/company/shortlist", {
          candidateId: application.candidateId,
          companyId,
          jobId: application.jobId,
          jobApplicationId: Number(applicationId),
          manualDecision: "Recommended",
          manualNotes,
        });

        alert("Candidate shortlisted successfully!");
      } else {
        // manualDecision === "Not Recommended"
        if (isAlreadyShortlisted) {
          // Case 4: Already shortlisted → changed to Not Recommended → remove & reject
          await api.post("/company/shortlist/remove-and-reject", {
            candidateId: application.candidateId,
            companyId,
            jobId: application.jobId,
            jobApplicationId: Number(applicationId),
            manualDecision: "Not Recommended",
            manualNotes,
          });

          alert("Candidate removed from shortlist and rejected.");
        } else {
          // Case 2: Not Recommended + Confirm (new) → reject only
          await api.post("/company/shortlist/reject", {
            candidateId: application.candidateId,
            companyId,
            jobId: application.jobId,
            jobApplicationId: Number(applicationId),
            manualDecision: "Not Recommended",
            manualNotes,
          });

          alert("Candidate rejected.");
        }
      }

      navigate(-1);
    } catch (err) {
      console.error("Action failed:", err);
      const msg = err?.response?.data?.message || err?.response?.data || "Operation failed";
      alert(msg);
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
              <p className="sl-role">
                {candidate?.currentRole || candidate?.headline || "—"}
              </p>
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

            {isAlreadyShortlisted && (
              <div className="sl-already-badge">
                ✅ Currently Shortlisted
              </div>
            )}

            <div className="sl-field">
              <label className="sl-label">Select Decision</label>
              <select
                className="sl-select"
                value={manualDecision}
                onChange={(e) => setManualDecision(e.target.value)}
              >
                <option value="Recommended">Recommended</option>
                <option value="Not Recommended">Not Recommended</option>
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
                manualDecision === "Recommended"
                  ? "sl-badge-green"
                  : "sl-badge-red"
              }`}
            >
              {manualDecision}
            </span>
          </div>

          <div className="sl-summary-item">
            <span className="sl-summary-heading">Final Status</span>
            <span
              className={`sl-summary-badge ${
                getFinalStatus() === "Shortlisted"
                  ? "sl-badge-green"
                  : "sl-badge-red"
              }`}
            >
              {getFinalStatus()}
            </span>
          </div>
        </section>

        {/* ═══ Action Button ═══ */}
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
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
