import { useState, useEffect } from "react";
import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";
import Footer from "../../components/CandidatePages/CandidateDashboard/Footer";
import StatCard from "../../components/CandidatePages/CandidateDashboard/StatCard";
import UpcomingInterviews from "../../components/CandidatePages/CandidateDashboard/UpcomingInterviews";
import ApplicationTracker from "../../components/CandidatePages/CandidateDashboard/ApplicationTracker";
import Searchbar from "../../components/CandidatePages/CandidateJobPosts/Searchbar";
import api from "../../lib/api";

/* ── Static Data (Used for Icons) ──────────────────────────────────────── */
const statsIcons = [
    {
        label: "Interviews",
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        label: "Applications",
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Pending",
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        label: "Rejected",
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

/* ── Styles ─────────────────────────────────────────────── */
const dashStyles = `
  .db-root {
    display: flex;
    min-height: 100vh;
    background: #f3f7fa;
    font-family: 'Inter', 'Segoe UI', sans-serif;
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
    padding: 20px 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .db-top-row {
    display: flex;
    gap: 18px;
    align-items: stretch;
    flex-wrap: wrap;
  }

  /* Stats grid — 2×2 on left */
  .db-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 14px;
    flex: 0 0 auto;
    width: 320px;
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(26,63,92,0.07);
  }

  /* Upcoming interviews panel — right */
  .db-interviews {
    flex: 1;
    min-width: 260px;
  }

  /* Search bar area */
  .db-search-wrap {
    margin: 0 -24px;
  }

  /* Loading State Area */
  .db-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    color: #1a6a82;
  }

  @media (max-width: 768px) {
    .db-top-row {
      flex-direction: column;
    }
    .db-stats {
      width: 100%;
    }
    .db-content {
      padding: 14px 12px 24px;
    }
    .db-search-wrap {
      margin: 0 -12px;
    }
  }
`;

/* ── Component ──────────────────────────────────────────── */
const Dashboard = () => {
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
                <div className="db-loading">Loading Dashboard Data...</div>
            </>
        );
    }

    const summary = dashboardData?.summary || dashboardData?.stats || {};
    const upcomingInterviews = dashboardData?.upcomingInterviews || dashboardData?.interviews || [];
    const applicationTracker = dashboardData?.applicationTracker || dashboardData?.applications || [];

    // Safely map fetched statistics for StatCards
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

    // Safely map backend "date" fields to frontend's expected properties
    const dynamicApplications = applicationTracker.map(app => ({
        ...app,
        applied: app.appliedDate || "-",
        shortlisted: app.shortlistedDate || "-",
        interview: app.interviewDate || "-",
        result: app.status || app.result || "PENDING"
    }));

    return (
        <>
            <style>{dashStyles}</style>
            <div className="db-root">
                <Sidebar />

                <div className="db-main">
                    {/* Searchbar replaces old top navbar */}
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
                                window.location.href = `/candidate/jobposts${query ? '?' + query : ''}`;
                            }}
                        />
                    </div>

                    <div className="db-content">
                        {/* Top row: Stats + Upcoming Interviews */}
                        <div className="db-top-row">
                            {/* 2×2 stats */}
                            <div className="db-stats">
                                {dynamicStats.map((s) => (
                                    <StatCard key={s.label} label={s.label} count={s.count} icon={s.icon} />
                                ))}
                            </div>

                            {/* Upcoming interviews */}
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
