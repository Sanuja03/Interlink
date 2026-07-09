import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import "./ApplicationManagement.css";
import CvAnalysisPopup from "../../components/TicketSubsPages/CvAnalysisPopup";

export default function ApplicationManagement() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {

      const { data: sessionData } = await supabase.auth.getSession();  // take session data from supabase auth
      const session = sessionData?.session;
      if (!session) return;

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("company_id")     // get company id for the logged in user
        .eq("user_id", session.user.id)
        .single();

      if (companyError || !companyData) return;

      setCompanyId(companyData.company_id);   // store company id in state for later use

      const { data, error } = await supabase   // fetch all applications for jobs of this company
        .from("job_applications")
        .select("id, candidate_name, job_title, score, score_details, status, resume_url, job_id, candidate_id")
        .eq("Company_Id", companyData.company_id)
        .order("id", { ascending: false });

      if (!error && data) setApplications(data);
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const handleScoreSaved = (appId, score, scoreDetails) => {   // runs after CV analysis is done and score is saved to db — update the ui
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, score, score_details: scoreDetails } : a)
    );
  };

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
                      <th className="am-th">AI Score</th>
                      <th className="am-th">Status</th>
                      <th className="am-th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((r) => (   // gives the value for r in visible rows
                      <tr key={r.id}>
                        <td className="am-td">{r.candidate_name || "—"}</td>
                        <td className="am-td">{r.job_title || "—"}</td>

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
                          <button
                            className="am-btn am-view"
                            onClick={() => navigate("/candidate-profile")}
                          >
                            View Profile
                          </button>

                          <button
                            className="am-btn"
                            style={{ background: "#24698B", color: "white" }}
                            onClick={() => setSelectedApp(r)}    // current row in visible rows
                          >
                            Analyse CV
                          </button>

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

      {selectedApp && (
        <CvAnalysisPopup
          application={selectedApp}
          companyId={companyId}
          onClose={() => setSelectedApp(null)}
          onScoreSaved={handleScoreSaved}
        />
      )}

    </DashboardLayout>
  );
}