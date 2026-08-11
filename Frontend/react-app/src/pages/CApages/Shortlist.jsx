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
  const [aiQuestionScores, setAiQuestionScores] = useState([]);
  const [aiQuestionScoreLoading, setAiQuestionScoreLoading] = useState(false);

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

        if (appData.jobId) {
          setAiQuestionScoreLoading(true);
          try {
            const qsRes = await api.get("/company/ai-question-score", {
              params: {
                candidateId: appData.candidateId,
                jobId: appData.jobId,
              },
            });
            setAiQuestionScores(qsRes.data || []);
          } catch (qsErr) {
            console.error("Failed to load AI question score history:", qsErr);
            setAiQuestionScores([]);
          } finally {
            setAiQuestionScoreLoading(false);
          }
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


  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const companyId = localStorage.getItem("companyId");

      if (manualDecision === "Recommended") {
        if (isAlreadyShortlisted) {

          alert("Candidate is already shortlisted.");
          return;
        }


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

        if (isAlreadyShortlisted) {

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


        <div className="sl-two-col">

          <section className="sl-box sl-ai-box">
            <h3 className="sl-box-title sl-ai-title">AI CV Analysis</h3>

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


        <section className="sl-box sl-qs-box">
          <h3 className="sl-box-title sl-qs-title">AI Question Score</h3>

          {aiQuestionScoreLoading ? (
            <div className="sl-no-skills">Loading AI interview history...</div>
          ) : aiQuestionScores.length === 0 ? (
            <div className="sl-no-skills">
              No AI interview question/answer history found for this candidate.
            </div>
          ) : (
            aiQuestionScores.map((session, sIdx) => {
              const sessionScore = session.score ?? 0;
              const sessionRecommended = session.recommended;
              return (
                <div className="sl-qs-session" key={session.id || sIdx}>
                  <div className="sl-score-bar">
                    <span className="sl-score-label">
                      AI Question Score{session.savedAt ? ` — ${session.savedAt}` : ""}
                    </span>
                    <span className="sl-score-value">{sessionScore}%</span>
                    <span
                      className={`sl-score-dot ${
                        sessionRecommended ? "sl-dot-green" : "sl-dot-red"
                      }`}
                    />
                  </div>

                  <div className="sl-qs-list">
                    {(session.qaPairs || []).map((pair, qIdx) => (
                      <div className="sl-qs-item" key={qIdx}>
                        <div className="sl-qs-question">
                          <span className="sl-skill-num">{qIdx + 1}.</span> {pair.question}
                        </div>
                        <div className="sl-qs-answer">{pair.answer}</div>
                      </div>
                    ))}
                  </div>

                  <div className="sl-suggestion-row">
                    <span className="sl-suggestion-label">AI Suggestion</span>
                    <span
                      className={`sl-suggestion-badge ${
                        sessionRecommended ? "sl-badge-green" : "sl-badge-red"
                      }`}
                    >
                      {sessionRecommended ? "Recommended" : "Not Recommended"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </section>


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
