import "./CompanyDashboard.css";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";

// IMPORT ICONS
import jobIcon from "../../assets/icons/job.png";
import applyIcon from "../../assets/icons/apply.png";
import handIcon from "../../assets/icons/hand.png";
import calendarIcon from "../../assets/icons/calendar.png";

const stats = [
  { title: "Total Job Posts", value: "10", icon: jobIcon },
  { title: "Total Applications", value: "128", icon: applyIcon },
  { title: "Shortlisted Candidates", value: "23", icon: handIcon },
  { title: "Upcoming Interviews", value: "18", icon: calendarIcon },
];

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

      </div>
    </DashboardLayout>
  );
}
