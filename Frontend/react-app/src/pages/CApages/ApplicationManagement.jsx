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
      const res = await api.get("/company/applications/" + companyId);
      setApplications(res.data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(function () {
    fetchApplications();
  }, []);

  const total = applications.length;
  const pending = applications.filter(function (a) { return a.status === "PENDING"; }).length;
  const underReview = applications.filter(function (a) { return a.status === "UNDER_REVIEW"; }).length;
  const shortlisted = applications.filter(function (a) { return a.status === "SHORTLISTED"; }).length;
  const rejected = applications.filter(function (a) { return a.status === "REJECTED"; }).length;
  const accepted = applications.filter(function (a) { return a.status === "ACCEPTED"; }).length;

  const visibleRows = showAll ? applications : applications.slice(0, 4);

  const getStatusColor = function (status) {
    switch (status) {
      case "PENDING":      return "yellow";
      case "UNDER_REVIEW": return "blue";
      case "ACCEPTED":     return "green";
      case "SHORTLISTED":  return "green";
      case "INTERVIEW":    return "blue";
      case "REJECTED":     return "red";
      default:             return "gray";
    }
  };

  const formatStatus = function (status) {
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
                <div className="am-statValue">{total}</div>
              </div>
              <div className="am-statCard">
                <div className="am-statTitle">Pending</div>
                <div className="am-statValue">{pending + underReview}</div>
              </div>
              <div className="am-statCard">
                <div className="am-statTitle">Shortlisted</div>
                <div className="am-statValue">{shortlisted + accepted}</div>
              </div>
              <div className="am-statCard">
                <div className="am-statTitle">Rejected</div>
                <div className="am-statValue">{rejected}</div>
              </div>
            </div>

            <div className="am-table-section">
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
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map(function (r) {
                      return (
                        <tr key={r.id}>
                          <td className="am-td">
                            {r.candidateName || "Unknown"}
                          </td>
                          <td className="am-td">
                            {r.jobTitle || "N/A"}
                          </td>
                          <td className="am-td">
                            {r.aiScore != null ? r.aiScore + "%" : "N/A"}
                          </td>
                          <td className="am-td">
                            <span className={"am-statusDot " + getStatusColor(r.status)}></span>
                            {formatStatus(r.status)}
                          </td>
                          <td className="am-td">
                            <button
                              className="am-btn am-view"
                              onClick={function () {
                                navigate("/company/candidate-profile/" + r.candidateId + "?applicationId=" + r.id);
                              }}
                            >
                              View Profile
                            </button>

                            <button
                              className="am-btn am-change-status"
                              onClick={function () {
                                navigate("/company/shortlist/" + r.id);
                              }}
                            >
                              Change Status
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {applications.length > 4 && (
                <div className="am-see-more">
                  <button onClick={function () { setShowAll(!showAll); }}>
                    {showAll ? "Show Less" : "See More"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}