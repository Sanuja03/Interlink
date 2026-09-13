import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";
import Footer from "../../components/CandidatePages/CandidateDashboard/Footer";
import StatCard from "../../components/CandidatePages/CandidateDashboard/StatCard";
import UpcomingInterviews from "../../components/CandidatePages/CandidateDashboard/UpcomingInterviews";
import ApplicationTracker from "../../components/CandidatePages/CandidateDashboard/ApplicationTracker";
import Searchbar from "../../components/CandidatePages/CandidateJobPosts/Searchbar";
import api from "../../lib/api";

const statsIcons = [
    {
        label: "Interviews",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        label: "Applications",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Pending",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        label: "Rejected",
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

const dashStyles = `
  .db-root {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .db-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-x: hidden;
  }

  .db-content {
    flex: 1;
    padding: 24px 28px 40px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .db-welcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding-bottom: 2px;
  }

  .db-welcome-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .db-welcome-sub {
    font-size: 0.85rem;
    color: #64748b;
    margin: 3px 0 0;
  }

  .db-welcome-date {
    font-size: 0.78rem;
    font-weight: 600;
    color: #1a6a82;
    background: #e6f4f8;
    padding: 6px 14px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .db-search-wrap {
    width: 100%;
  }

  .db-top-row {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 20px;
    align-items: stretch;
  }

  .db-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 14px;
    height: 100%;
  }

  .db-interviews {
    min-width: 0;
    height: 100%;
  }

  .db-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a6a82;
    background: #f8fafc;
    gap: 14px;
  }

  .db-loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #1a6a82;
    border-radius: 50%;
    animation: db-spin 0.8s linear infinite;
  }

  @keyframes db-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1080px) {
    .db-top-row {
      grid-template-columns: 1fr;
    }
    .db-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .db-content {
      padding: 16px 14px 28px;
      gap: 18px;
    }
    .db-stats {
      grid-template-columns: 1fr;
    }
    .db-welcome-title {
      font-size: 1.25rem;
    }
  }
`;

const Dashboard = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/candidate/me");
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <>
                <style>{dashStyles}</style>
                <div className="db-loading">
                    <div className="db-loading-spinner" />
                    <span>Loading your dashboard...</span>
                </div>
            </>
        );
    }

    const summary = dashboardData?.summary || dashboardData?.stats || {};
    const upcomingInterviews = dashboardData?.upcomingInterviews || dashboardData?.interviews || [];
    const applicationTracker = dashboardData?.applicationTracker || dashboardData?.applications || [];

    const dynamicStats = [
        {
            label: "Interviews",
            count: summary.interviews || 0,
            icon: statsIcons[0].icon
        },
        {
            label: "Applications",
            count: summary.applications || 0,
            icon: statsIcons[1].icon
        },
        {
            label: "Pending",
            count: summary.pending || 0,
            icon: statsIcons[2].icon
        },
        {
            label: "Rejected",
            count: summary.rejected || 0,
            icon: statsIcons[3].icon
        }
    ];

    const dynamicApplications = applicationTracker.map(app => ({
        ...app,
        jobId: app.jobId,
        deadline: app.deadline,
        quizAttempted: app.quizAttempted,
        applied: app.appliedDate || "-",
        shortlisted: app.shortlistedDate || "-",
        interview: app.interviewDate || "-",
        result: app.status || app.result || "PENDING"
    }));

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <>
            <style>{dashStyles}</style>
            <div className="db-root">
                <Sidebar />

                <div className="db-main">
                    <div className="db-content">
                        {/* Welcome Header */}
                        <div className="db-welcome">
                            <div>
                                <h1 className="db-welcome-title">Dashboard</h1>
                            </div>
                            <div className="db-welcome-date">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{formattedDate}</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="db-search-wrap">
                            <Searchbar
                                keyword={keyword}
                                onKeywordChange={setKeyword}
                                onSearch={({ keyword: kw, category, experience }) => {
                                    const params = new URLSearchParams();
                                    if (kw) params.set('keyword', kw);
                                    if (category) params.set('category', category);
                                    if (experience) params.set('experience', experience);
                                    const query = params.toString();
                                    navigate(`/candidate/jobposts${query ? '?' + query : ''}`);
                                }}
                            />
                        </div>

                        {/* Top Row: Metrics & Interviews */}
                        <div className="db-top-row">
                            <div className="db-stats">
                                {dynamicStats.map((s) => (
                                    <StatCard key={s.label} label={s.label} count={s.count} icon={s.icon} />
                                ))}
                            </div>

                            <div className="db-interviews">
                                <UpcomingInterviews interviews={upcomingInterviews} />
                            </div>
                        </div>

                        {/* Application Tracker */}
                        <ApplicationTracker applications={dynamicApplications} />
                    </div>

                    <Footer />
                </div>
            </div>
        </>
    );
};

export default Dashboard;
