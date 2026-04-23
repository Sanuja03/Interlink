import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import "./ApplicationManagement.css";

// ═══════════════════════════════════════════════════════════════
// ✅ YOUR MODULE: CV Analysis Popup
// Triggered by "View Profile" button — runs AI scoring pipeline
// ═══════════════════════════════════════════════════════════════
function CvAnalysisPopup({ application, onClose, onScoreSaved }) {
  const [stage, setStage] = useState("idle"); // idle | analyzing | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ YOUR CODE: score color logic matches ScoringService threshold (>=70 = recommended)
  const scoreColor = (s) => s >= 70 ? "#22c55e" : s >= 45 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (s) => s >= 70 ? "✓ Recommended" : "✗ Not Recommended";

  // ✅ YOUR CODE: fetch CV from storage → call Spring /api/score/analyze → save result
  const analyze = async () => {
    setStage("analyzing");
    try {
      const fileRes = await fetch(application.resume_url);
      if (!fileRes.ok) throw new Error("Could not fetch CV file from storage");
      const blob = await fileRes.blob();
      const filename = application.resume_url.split("/").pop();
      const file = new File([blob], filename, { type: blob.type });

      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobId", String(application.job_id));

      const res = await fetch("http://localhost:8080/api/score/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const scoreData = await res.json();

      // ✅ YOUR CODE: persist score to job_applications table
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

        {/* Header */}
        <div className="cv-header">
          <div>
            <h2 className="cv-header-title">CV Analysis</h2>
            <p className="cv-header-sub">{application.candidate_name} · {application.job_title}</p>
          </div>
          <button className="cv-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cv-body">

          {/* ── IDLE: show analyse button ── */}
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

          {/* ── ANALYZING: pulsing animation ── */}
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

          {/* ── DONE: score results ── */}
          {stage === "done" && result && (
            <div className="cv-done">

              {/* Circular score */}
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

              {/* ✅ YOUR CODE: Score breakdown showing how each component was calculated */}
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

          {/* ── ERROR ── */}
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
// ═══════════════════════════════════════════════════════════════
// END YOUR MODULE
// ═══════════════════════════════════════════════════════════════


export default function ApplicationManagement() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // ✅ YOUR CODE: controls which application's popup is open
  const [selectedApp, setSelectedApp] = useState(null);

  // Fetch real applications for logged-in company
  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: companyData } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (!companyData) return;

      const { data, error } = await supabase
        .from("job_applications")
        .select("id, candidate_name, job_title, score, score_details, status, resume_url, job_id, candidate_id")
        .eq("Company_Id", companyData.company_id)
        .order("id", { ascending: false });

      if (!error && data) setApplications(data);
      setLoading(false);
    };
    fetchApplications();
  }, []);

  // ✅ YOUR CODE: update score in local state after analysis — no full refetch needed
  const handleScoreSaved = (appId, score, scoreDetails) => {
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, score, score_details: scoreDetails } : a)
    );
  };

  // Stats from real data
  const total       = applications.length;
  const shortlisted = applications.filter(a => a.status === "Shortlisted").length;
  const rejected    = applications.filter(a => a.status === "Rejected").length;
  const underReview = applications.filter(a => !a.status || a.status === "Applied" || a.status === "Under Review").length;

  const visibleRows = showAll ? applications : applications.slice(0, 4);

  const scoreColorClass = (score) => {
    if (score === null || score === undefined) return "";
    if (score >= 70) return "green";
    if (score >= 45) return "yellow";
    return "red";
  };

  const statusColorClass = (status) => {
    if (status === "Shortlisted") return "green";
    if (status === "Rejected")    return "red";
    if (status === "Interview")   return "yellow";
    return "blue";
  };

  return (
    <DashboardLayout>
      <div className="am-page">
        <div className="am-container">

          {/* Stats */}
          <div className="am-stats">
            <div className="am-statCard">
              <div className="am-statTitle">Total Applications</div>
              <div className="am-statValue">{loading ? "—" : total}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Under Review</div>
              <div className="am-statValue">{loading ? "—" : underReview}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Shortlisted</div>
              <div className="am-statValue">{loading ? "—" : shortlisted}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Rejected</div>
              <div className="am-statValue">{loading ? "—" : rejected}</div>
            </div>
          </div>

          {/* Table */}
          <div className="am-card">
            <div className="am-cardTitle">Application Status Tracker</div>

            {loading ? (
              <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>No applications yet for your jobs.</p>
            ) : (
              <>
                <table className="am-table">
                  <thead>
                    <tr>
                      <th className="am-th">Candidate</th>
                      <th className="am-th">Job Title</th>
                      {/* ✅ YOUR CODE: AI Score column */}
                      <th className="am-th">AI Score</th>
                      <th className="am-th">Status</th>
                      <th className="am-th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((r) => (
                      <tr key={r.id}>
                        <td className="am-td">{r.candidate_name || "—"}</td>
                        <td className="am-td">{r.job_title || "—"}</td>

                        {/* ✅ YOUR CODE: blank if not analysed, score% if analysed */}
                        <td className="am-td">
                          {r.score !== null && r.score !== undefined ? (
                            <>
                              <span className={`am-statusDot ${scoreColorClass(r.score)}`} />
                              {Math.round(r.score)}%
                            </>
                          ) : (
                            <span className="am-score-blank">Not analysed</span>
                          )}
                        </td>

                        <td className="am-td">
                          <span className={`am-statusDot ${statusColorClass(r.status)}`} />
                          {r.status || "Applied"}
                        </td>

                        <td className="am-td">
                          {/* ✅ YOUR CODE: triggers CV analysis popup */}
                          <button
  className="am-btn am-view"
  onClick={() => navigate("/candidate-profile")}
>
  View Profile
</button>

{/* ✅ YOUR CODE: triggers CV analysis popup */}
<button
  className="am-btn"
  style={{ background: "#24698B", color: "white" }}
  onClick={() => setSelectedApp(r)}
>
  Analyse CV
</button>

                          {/* TEMP: teammate to wire these to update status in job_applications */}
                          <button className="am-btn am-shortlist">Shortlist</button>
                          <button className="am-btn am-reject">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {applications.length > 4 && (
                  <div className="am-see-more">
                    <button onClick={() => setShowAll(!showAll)}>
                      {showAll ? "▲ Show Less" : "▼ See More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ✅ YOUR CODE: CV Analysis popup — mounts when a row's View Profile is clicked */}
      {selectedApp && (
        <CvAnalysisPopup
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onScoreSaved={handleScoreSaved}
        />
      )}

    </DashboardLayout>
  );
}