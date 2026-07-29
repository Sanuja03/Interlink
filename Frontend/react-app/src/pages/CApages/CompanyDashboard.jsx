import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CalendarSection from "../../components/CompanyPages/layout/CalendarSection";
import api from "../../lib/api";
import { getCompanyId } from "../../lib/getCompanyId";
import "./CompanyDashboard.css";

// ICONS
import jobIcon from "../../assets/job.png";
import manIcon from "../../assets/Man.png";
import shortlistIcon from "../../assets/Shortlist.png";
import interviewIcon from "../../assets/Interview.png";

export default function CompanyDashboard() {
  const navigate = useNavigate();

  const [companyId, setCompanyId] = useState(null);
  const [stats, setStats] = useState({
    totalJobPosts: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    upcomingInterviews: 0,
  });

  const [loading, setLoading] = useState(true);

  // LOAD DATA
  useEffect(() => {
    const loadStats = async () => {
      try {
        const cid = await getCompanyId();
        if (!cid) return;
        setCompanyId(cid);

        const res = await api.get(`/company/dashboard/stats/${cid}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);


  const cards = [
    {
      title: "Total Job Posts",
      value: stats.totalJobPosts,
      icon: jobIcon,
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: manIcon,
    },
    {
      title: "Shortlisted Candidates",
      value: stats.shortlistedCandidates,
      icon: shortlistIcon,
    },
    {
      title: "Upcoming Interviews",
      value: stats.upcomingInterviews,
      icon: interviewIcon,
    },
  ];

  return (
    <DashboardLayout>
      <div className="cd-page">
        <h1 className="cd-title">Dashboard</h1>

        <div className="cd-card">

          <div className="cd-stats-grid">
            {cards.map((card, index) => (
              <div key={index} className="cd-stat-card">
                <div className="cd-stat-icon">
                  <img src={card.icon} alt={card.title} />
                </div>

                <div className="cd-stat-info">
                  <div className="cd-stat-title">{card.title}</div>
                  <div className="cd-stat-value">
                    {loading ? "..." : card.value}
                  </div>
                </div>
              </div>
            ))}
          </div>


          <div className="cd-links-grid">

            <button
              className="cd-link-btn"
              onClick={() => navigate("/company/job-management")}
            >
              Job Management
            </button>

            <button
              className="cd-link-btn"
              onClick={() => navigate("/company/application-management")}
            >
              Application Management
            </button>

            <button
              className="cd-link-btn"
              onClick={() => navigate("/company/settings")}
            >
              Company Admin Profile
            </button>

            <button
              className="cd-link-btn"
              onClick={() => navigate("/company/create-job")}
            >
              Create Job
            </button>

          </div>
        </div>


        <div style={{ marginTop: "32px" }}>
          <CalendarSection companyId={companyId} />
        </div>

      </div>
    </DashboardLayout>
  );
}