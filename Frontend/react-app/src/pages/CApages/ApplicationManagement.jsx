import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ApplicationManagement.css";

export default function ApplicationManagement() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const BASE_URL = "http://localhost:8080/api/applications";

  // ✅ Fetch data
  const fetchApplications = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 🔥 STATUS UPDATE (IMPORTANT)
  const updateStatus = async (id, action) => {
    try {
      await axios.put(`${BASE_URL}/${id}/status?action=${action}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Stats
  const total = applications.length;
  const underReview = applications.filter(a => a.status === "UNDER_REVIEW").length;
  const shortlisted = applications.filter(a => a.status === "SHORTLISTED").length;
  const rejected = applications.filter(a => a.status === "REJECTED").length;

  const visibleRows = showAll ? applications : applications.slice(0, 4);

  // 🎨 Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "UNDER_REVIEW": return "orange";
      case "SHORTLISTED": return "green";
      case "INTERVIEW": return "blue";
      case "REJECTED": return "red";
      default: return "gray";
    }
  };

  // 🧠 Friendly status text
  const formatStatus = (status) => {
    switch (status) {
      case "UNDER_REVIEW": return "Under Review";
      case "SHORTLISTED": return "Shortlisted";
      case "INTERVIEW": return "Interview";
      case "REJECTED": return "Rejected";
      default: return status;
    }
  };

  // 🔥 Dynamic button label
  const getNextActionLabel = (status) => {
    if (status === "UNDER_REVIEW") return "Shortlist";
    if (status === "SHORTLISTED") return "Interview";
    return null;
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
                  <th className="am-th">Candidate ID</th>
                  <th className="am-th">Job ID</th>
                  <th className="am-th">AI Score</th>
                  <th className="am-th">Status</th>
                  <th className="am-th"></th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.id}>
                    <td className="am-td">{r.candidateId}</td>
                    <td className="am-td">{r.jobId}</td>
                    <td className="am-td">{r.aiScore}%</td>

                    {/* STATUS */}
                    <td className="am-td">
                      <span className={`am-statusDot ${getStatusColor(r.status)}`}></span>
                      {formatStatus(r.status)}
                    </td>

                    {/* ACTIONS */}
                    <td className="am-td">

                      {/* View */}
                      <button
                        className="am-btn am-view"
                        onClick={() => navigate(`/candidate-profile/${r.candidateId}`)}
                      >
                        View Profile
                      </button>

                      {/* 🔥 PROGRESS BUTTON */}
                      {getNextActionLabel(r.status) && (
                        <button
                          className="am-btn am-shortlist"
                          onClick={() => updateStatus(r.id, "PROGRESS")}
                        >
                          {getNextActionLabel(r.status)}
                        </button>
                      )}

                      {/* ❗ REJECT BUTTON */}
                      {r.status !== "REJECTED" && (
                        <button
                          className="am-btn am-reject"
                          onClick={() => updateStatus(r.id, "REJECT")}
                        >
                          Reject
                        </button>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* See More */}
            {applications.length > 4 && (
              <div className="am-see-more">
                <button onClick={() => setShowAll(!showAll)}>
                  {showAll ? "▲ Show Less" : "▼ See More"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}