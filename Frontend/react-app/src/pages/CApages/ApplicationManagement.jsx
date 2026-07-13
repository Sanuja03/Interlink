import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
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
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) return;

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (companyError || !companyData) return;

      setCompanyId(companyData.company_id);

      try {
        const res = await api.get(`/company/applications/${companyData.company_id}`);
        setApplications(res.data || []);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleScoreSaved = (appId, score, scoreDetails) => {
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, aiScore: score, scoreDetails } : a)
    );
  };

  const total       = applications.length;
  const underReview = applications.filter(a => !a.status || a.status === "PENDING" || a.status === "UNDER_REVIEW").length;
  const shortlisted = applications.filter(a => a.status === "SHORTLISTED" || a.status === "ACCEPTED").length;
  const rejected    = applications.filter(a => a.status === "REJECTED").length;

  const visibleRows = showAll ? applications : applications.slice(0, 4);

  const scoreColorClass = (score) => {
    if (score === null || score === undefined) return "";
    if (score >= 70) return "green";
    if (score >= 45) return "yellow";
    return "red";
  };

  const statusColorClass = (status) => {
    switch (status) {
      case "PENDING":      return "yellow";
      case "UNDER_REVIEW": return "blue";
      case "ACCEPTED":
      case "SHORTLISTED":  return "green";
      case "INTERVIEW":    return "blue";
      case "REJECTED":     return "red";
      default:             return "gray";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING":      return "Pending";
      case "UNDER_REVIEW": return "Under Review";
      case "ACCEPTED":     return "Accepted";
      case "SHORTLISTED":  return "Shortlisted";
      case "INTERVIEW":    return "Interview";
      case "REJECTED":     return "Rejected";
      default:             return status || "N/A";
    }
  };

  return (
    <DashboardLayout>
      <div className="am-page">
        <div className="am-container">

          <h1 className="am-title">Application Management</h1>

          <div className="am-outer-card">
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

            <div className="am-table-section">
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
                      {visibleRows.map((r) => (
                        <tr key={r.id}>
                          <td className="am-td">{r.candidateName || "—"}</td>
                          <td className="am-td">{r.jobTitle || "—"}</td>

                          <td className="am-td">
                            {r.aiScore !== null && r.aiScore !== undefined ? (
                              <>
                                <span className={`am-statusDot ${scoreColorClass(r.aiScore)}`} />
                                {Math.round(r.aiScore)}%
                              </>
                            ) : (
                              <span className="am-score-blank">Not analysed</span>
                            )}
                          </td>

                          <td className="am-td">
                            <span className={`am-statusDot ${statusColorClass(r.status)}`} />
                            {formatStatus(r.status)}
                          </td>

                          <td className="am-td">
                            <button
                              className="am-btn am-view"
                              onClick={() =>
                                navigate("/company/candidate-profile/" + r.candidateId + "?applicationId=" + r.id)
                              }
                            >
                              View Profile
                            </button>

                            <button
                              className="am-btn"
                              style={{ background: "#24698B", color: "white" }}
                              onClick={() => setSelectedApp(r)}
                            >
                              Analyse CV
                            </button>

                            <button
                              className="am-btn am-change-status"
                              onClick={() => navigate("/company/shortlist/" + r.id)}
                            >
                              Change Status
                            </button>
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