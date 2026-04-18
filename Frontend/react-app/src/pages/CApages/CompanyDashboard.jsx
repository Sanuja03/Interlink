import "./CompanyDashboard.css";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CalendarSection from "../../components/layout/CalendarSection";

// 🔥 NEW IMPORTS
import axios from "axios";
import { useEffect, useState } from "react";

// IMPORT ICONS
import jobIcon from "../../assets/icons/job.png";
import applyIcon from "../../assets/icons/apply.png";
import handIcon from "../../assets/icons/hand.png";
import calendarIcon from "../../assets/icons/calendar.png";

// 🔥 Stat Card Component
function StatCard({ title, value, icon }) {
  return (
    <div className="il-stat-card">
      <div className="il-icon-box">
        <img src={icon} alt={title} className="il-stat-icon" />
      </div>

      <div className="il-stat-content">
        <div className="il-stat-title">{title}</div>
        <div className="il-stat-value">{value}</div>
      </div>
    </div>
  );
}

export default function CompanyDashboard() {
  const navigate = useNavigate();

  // 🔥 STATE
  const [users, setUsers] = useState([]);

  // 🔥 FETCH DATA FROM BACKEND
  useEffect(() => {
    axios
      .get("http://localhost:8080/users")
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔥 DYNAMIC STATS
  const stats = [
    { title: "Total Users", value: users.length, icon: jobIcon },
    { title: "Total Applications", value: "128", icon: applyIcon },
    { title: "Shortlisted Candidates", value: "23", icon: handIcon },
    { title: "Upcoming Interviews", value: "18", icon: calendarIcon },
  ];

  return (
    <DashboardLayout>
      <div className="il-dashboard">

        {/* Stats Section */}
        <div className="il-panel">
          <div className="il-stats-grid">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="il-actions">
          <button
            className="il-action-btn"
            onClick={() => navigate("/job-management")}
          >
            Job Management
          </button>

          <button
            className="il-action-btn"
            onClick={() => navigate("/application-management")}
          >
            Application Management
          </button>

          <button
            className="il-action-btn"
            onClick={() => navigate("/company-admin-settings")}
          >
            Company Admin Settings
          </button>

          <button
            className="il-action-btn"
            onClick={() => navigate("/create-job")}
          >
            Create Job
          </button>
        </div>

        {/* Calendar Section */}
        <CalendarSection />

      </div>
    </DashboardLayout>
  );
}