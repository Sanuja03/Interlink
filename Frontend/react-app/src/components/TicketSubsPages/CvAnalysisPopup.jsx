import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { API_BASE_URL } from "../../lib/api";

export default function CvAnalysisPopup({ application, companyId, onClose, onScoreSaved }) {
    const [stage, setStage] = useState("idle");
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
  
    const scoreColor = (s) => s >= 70 ? "#22c55e" : s >= 45 ? "#f59e0b" : "#ef4444";
    const scoreLabel = (s) => s >= 70 ? "✓ Recommended" : "✗ Not Recommended";
  
    const analyze = async () => {
      setStage("analyzing");
      try {
  
        const { data: subData, error: subError } = await supabase
          .from("active_subscriptions")
          .select("ai_cv_used, subscription_plans!active_subscriptions_plan_id_fkey(ai_cv_limit, is_unlimited, name)")
          .eq("company_id", companyId)
          .single();
  
        if (subError || !subData) throw new Error("Could not verify your subscription.");
  
        const plan = subData.subscription_plans;
        if (!plan) throw new Error("Could not load your plan details.");
        const used = subData.ai_cv_used ?? 0;
        const limit = plan.ai_cv_limit;
        const isUnlimited = plan.is_unlimited;
  
        if (!isUnlimited && limit !== null && used >= limit) {
          throw new Error(
            `CV analysis limit reached. Your ${plan.name} plan allows ${limit} CV analyses.`
          );
        }
  
        const fileRes = await fetch(application.resumeUrl);
        if (!fileRes.ok) throw new Error("Could not fetch CV file from storage");
        const blob = await fileRes.blob();
        const filename = application.resumeUrl.split("/").pop();
        const file = new File([blob], filename, { type: blob.type });
  
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
  
        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobId", String(application.jobId));
        formData.append("companyId", companyId);
  
        const res = await fetch(`${API_BASE_URL}/api/score/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        });
  
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText);
        }
        const scoreData = await res.json();
  
        await supabase
          .from("job_applications")
          .update({ score: scoreData.score, score_details: scoreData })
          .eq("id", application.id);
  
        setResult(scoreData);
        setStage("done");
        onScoreSaved(application.id, scoreData.score, scoreData);
  
      } catch (err) {
        setErrorMsg(err.message);
        setStage("error");
      }
    };
  
    return (
      <div className="cv-overlay">
        <div className="cv-modal">
  
          <div className="cv-header">
            <div>
              <h2 className="cv-header-title">CV Analysis</h2>
              <p className="cv-header-sub">{application.candidateName} · {application.jobTitle}</p>
            </div>
            <button className="cv-close-btn" onClick={onClose}>×</button>
          </div>
  
          <div className="cv-body">
  
            {stage === "idle" && (
              <div className="cv-idle">
                <div className="cv-idle-icon">
                  <svg width="30" height="30" fill="none" stroke="#1a6a82" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <p>Click below to run AI analysis on this candidate's CV against the job requirements.</p>
                <button className="cv-analyse-btn" onClick={analyze}>Analyse CV</button>
              </div>
            )}
  
            {stage === "analyzing" && (
              <div className="cv-analyzing">
                <div className="cv-ping-wrap">
                  <div className="cv-ping-ring" />
                  <div className="cv-ping-ring2" />
                  <div className="cv-ping-center">
                    <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                </div>
                <h3>Analysing CV...</h3>
                <p>Extracting skills and comparing with job requirements</p>
                <div className="cv-tags">
                  <span className="cv-tag">Skills</span>
                  <span className="cv-tag">Experience</span>
                  <span className="cv-tag">Education</span>
                </div>
              </div>
            )}
  
            {stage === "done" && result && (
              <div className="cv-done">
                <div className="cv-score-circle-wrap">
                  <div className="cv-score-circle">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle cx="48" cy="48" r="40" fill="none"
                        stroke={scoreColor(result.score)} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(result.score / 100) * 251} 251`} />
                    </svg>
                    <div className="cv-score-text">
                      <span className="cv-score-num" style={{ color: scoreColor(result.score) }}>
                        {Math.round(result.score)}
                      </span>
                      <span className="cv-score-denom">/ 100</span>
                    </div>
                  </div>
                  <div className="cv-badge" style={{ background: scoreColor(result.score) }}>
                    {scoreLabel(result.score)}
                  </div>
                </div>
  
                <div className="cv-breakdown">
                  {[
                    { label: "🎯 Skill Match",  value: result.skillScore, weight: "50%" },
                    { label: "💼 Experience",   value: result.expScore,   weight: "30%" },
                    { label: "🎓 Education",    value: result.eduScore,   weight: "20%" },
                  ].map(({ label, value, weight }) => (
                    <div className="cv-bar-row" key={label}>
                      <div className="cv-bar-header">
                        <span className="cv-bar-label">{label}</span>
                        <div className="cv-bar-meta">
                          <span className="cv-bar-weight">weight {weight}</span>
                          <span className="cv-bar-value" style={{ color: scoreColor(value) }}>{value}%</span>
                        </div>
                      </div>
                      <div className="cv-bar-track">
                        <div className="cv-bar-fill" style={{ width: `${value}%`, background: scoreColor(value) }} />
                      </div>
                    </div>
                  ))}
                </div>
  
                <div className="cv-formula">
                  Final Score = (Skills × 50%) + (Experience × 30%) + (Education × 20%)
                </div>
  
                <button className="cv-done-btn" onClick={onClose}>Done</button>
              </div>
            )}
  
            {stage === "error" && (
              <div className="cv-error">
                <div className="cv-error-icon">⚠️</div>
                <p>{errorMsg}</p>
                <div className="cv-error-actions">
                  <button className="cv-retry-btn" onClick={() => setStage("idle")}>Try Again</button>
                  <button className="cv-error-close-btn" onClick={onClose}>Close</button>
                </div>
              </div>
            )}
  
          </div>
        </div>
      </div>
    );
  }