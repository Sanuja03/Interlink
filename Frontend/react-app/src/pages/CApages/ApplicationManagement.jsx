import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import "./ApplicationManagement.css";

export default function ApplicationManagement() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const fetchApplications = async () => {
    try {
      const companyId = localStorage.getItem("companyId");

      if (!companyId) {
        console.error("No companyId found");
        return;
      }

      const res = await api.get(`/company/applications/${companyId}`);
      setApplications(res.data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const total = applications.length;
  const underReview = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  const visibleRows = showAll ? applications : applications.slice(0, 4);

  const getStatusColor = (status) => {
    switch (status) {
      case "UNDER_REVIEW": return "orange";
      case "SHORTLISTED": return "green";
      case "INTERVIEW": return "blue";
      case "REJECTED": return "red";
      default: return "gray";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "UNDER_REVIEW": return "Under Review";
      case "SHORTLISTED": return "Shortlisted";
      case "INTERVIEW": return "Interview";
      case "REJECTED": return "Rejected";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="am-page">
        <div className="am-container">

          {/* Stats */}
          <div className="am-stats">
            <div className="am-statCard">
              <div className="am-statTitle">Total Applications</div>
              <div className="am-statValue">{total}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Under Review</div>
              <div className="am-statValue">{underReview}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Shortlisted</div>
              <div className="am-statValue">{shortlisted}</div>
            </div>
            <div className="am-statCard">
              <div className="am-statTitle">Rejected</div>
              <div className="am-statValue">{rejected}</div>
            </div>
          </div>

          {/* Table */}
          <div className="am-card">
            <div className="am-cardTitle">Application Status Tracker</div>

            <table className="am-table">
              <thead>
                <tr>
                  <th className="am-th">Candidate</th>
                  <th className="am-th">Job</th>
                  <th className="am-th">AI Score</th>
                  <th className="am-th">Status</th>
                  <th className="am-th"></th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.id}>
                    <td className="am-td">
                      {r.candidateName || r.candidateId}
                    </td>
                    <td className="am-td">
                      {r.jobTitle || r.jobId}
                    </td>
                    <td className="am-td">{r.aiScore}%</td>
                    <td className="am-td">
                      <span className={`am-statusDot ${getStatusColor(r.status)}`}></span>
                      {formatStatus(r.status)}
                    </td>
                    <td className="am-td">
                      <button
                        className="am-btn am-view"
                        onClick={() =>
                          navigate(`/company/candidate-profile/${r.candidateId}?applicationId=${r.id}`)
                        }
                      >
                        View Profile
                      </button>

                      <button
                        className="am-btn am-shortlist"
                        onClick={() => navigate(`/company/shortlist/${r.id}`)}
                        disabled={r.status === "SHORTLISTED" || r.status === "REJECTED"}
                      >
                        Shortlist
                      </button>

                      <button
                        className="am-btn am-reject"
                        onClick={async () => {
                          if (!window.confirm("Are you sure you want to reject this candidate?")) return;
                          try {
                            const companyId = localStorage.getItem("companyId");
                            await api.post("/company/shortlist/reject", {
                              candidateId: r.candidateId,
                              companyId: companyId,
                              jobId: r.jobId,
                              jobApplicationId: r.id,
                              manualDecision: "Reject",
                              manualNotes: "",
                            });
                            alert("Candidate rejected.");
                            fetchApplications();
                          } catch (err) {
                            console.error("Reject failed:", err);
                            alert("Failed to reject candidate");
                          }
                        }}
                        disabled={r.status === "REJECTED" || r.status === "SHORTLISTED"}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {applications.length > 4 && (
              <div className="am-see-more">
                <button onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show Less" : "See More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}