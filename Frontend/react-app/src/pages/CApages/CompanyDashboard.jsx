import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./CompanyDashboard.css";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobPosts: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    upcomingInterviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    api
      .get(`/company/dashboard/stats/${companyId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Total Job Posts",
      value: stats.totalJobPosts,
      icon: "💼",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: "👤",
    },
    {
      title: "Shortlisted Candidates",
      value: stats.shortlistedCandidates,
      icon: "🤝",
    },
    {
      title: "Upcoming Interviews",
      value: stats.upcomingInterviews,
      icon: "📋",
    },
  ];

  const quickLinks = [
    { label: "Job Management", path: "/job-management" },
    { label: "Application Management", path: "/application-management" },
    { label: "Company Admin Profile", path: "/company/settings" },
    { label: "Create Job", path: "/create-job" },
  ];

  return (
    <DashboardLayout>
      <div className="cd-page">
        <div className="cd-container">

          {/* Stats Grid */}
          <div className="cd-stats-grid">
            {statCards.map((card, idx) => (
              <div key={idx} className="cd-stat-card">
                <div className="cd-stat-icon">{card.icon}</div>
                <div className="cd-stat-info">
                  <div className="cd-stat-title">{card.title}</div>
                  <div className="cd-stat-value">
                    {loading ? "..." : card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="cd-links-grid">
            {quickLinks.map((link, idx) => (
              <button
                key={idx}
                className="cd-link-btn"
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}