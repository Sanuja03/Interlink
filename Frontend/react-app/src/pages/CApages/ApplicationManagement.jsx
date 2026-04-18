import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ApplicationManagement.css";

export default function ApplicationManagement() {
  const navigate = useNavigate();

  const [showAll, setShowAll] = useState(false); // ✅ toggle

  const rows = [
    { name: "Amal Dissanayaka", title: "UI/UX Designer", score: "80%", status: "Shortlisted", color: "green" },
    { name: "Sumudu Perera", title: "Software Engineer", score: "89%", status: "Interview", color: "yellow" },
    { name: "Kamal Ranjan", title: "QA", score: "30%", status: "Rejected", color: "red" },
    { name: "Nilkamal perera", title: "HR manager", score: "90%", status: "Under Review", color: "blue" },

    { name: "User 1", title: "Dev", score: "70%", status: "Shortlisted", color: "green" },
    { name: "User 2", title: "Dev", score: "60%", status: "Rejected", color: "red" },
    { name: "User 3", title: "Dev", score: "85%", status: "Interview", color: "yellow" },
    { name: "User 4", title: "Dev", score: "92%", status: "Under Review", color: "blue" },
    { name: "User 5", title: "Dev", score: "75%", status: "Shortlisted", color: "green" },
  ];

  const visibleRows = showAll ? rows : rows.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="am-page">
        <div className="am-container">

          {/* Stats */}
          <div className="am-stats">
            <div className="am-statCard">
              <div className="am-statTitle">Total Applications</div>
              <div className="am-statValue">129</div>
            </div>

            <div className="am-statCard">
              <div className="am-statTitle">Under review</div>
              <div className="am-statValue">56</div>
            </div>

            <div className="am-statCard">
              <div className="am-statTitle">Shortlisted</div>
              <div className="am-statValue">46</div>
            </div>

            <div className="am-statCard">
              <div className="am-statTitle">Rejected</div>
              <div className="am-statValue">29</div>
            </div>
          </div>

          {/* Table */}
          <div className="am-card">
            <div className="am-cardTitle">Application Status Tracker</div>

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
                {visibleRows.map((r, i) => (
                  <tr key={i}>
                    <td className="am-td">{r.name}</td>
                    <td className="am-td">{r.title}</td>
                    <td className="am-td">{r.score}</td>

                    <td className="am-td">
                      <span className={`am-statusDot ${r.color}`}></span>
                      {r.status}
                    </td>

                    <td className="am-td">
                      <button
                        className="am-btn am-view"
                        onClick={() => navigate("/candidate-profile")}
                      >
                        View Profile
                      </button>

                      <button className="am-btn am-shortlist">
                        Shortlist
                      </button>

                      <button className="am-btn am-reject">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ SEE MORE BUTTON */}
            {rows.length > 4 && (
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