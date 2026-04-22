import "./CompanyDashboard.css";
import { useNavigate } from "react-router-dom";

// ✅ FIXED
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CalendarSection from "../../components/CompanyPages/layout/CalendarSection";

// 🔥 NEW IMPORTS
import axios from "axios";
import { useEffect, useState } from "react";

// IMPORT ICONS (these are already correct ✅)
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

  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/users")
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const stats = [
    { title: "Total Users", value: users.length, icon: jobIcon },
    { title: "Total Applications", value: "128", icon: applyIcon },
    { title: "Shortlisted Candidates", value: "23", icon: handIcon },
    { title: "Upcoming Interviews", value: "18", icon: calendarIcon },
  ];

  return (
    <DashboardLayout>
      <div className="il-dashboard">

        <div className="il-panel">
          <div className="il-stats-grid">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
        </div>

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

        <CalendarSection />

      </div>
    </DashboardLayout>
  );
}