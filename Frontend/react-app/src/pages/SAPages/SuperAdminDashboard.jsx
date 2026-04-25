import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RecentActivities from "../../components/SuperAdminComponents/activity_logs/RecentActivities";
import { fetchDashboardData } from "../../api/SAdminDashboardApi";
import GlobalSearch from "../../components/SuperAdminComponents/Layout/GlobalSearch";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleViewAll = () => {
    navigate("/admin/AllActivities");
  };

  const actions = [
    { name: "Companies", path: "/admin/Companies" },
    { name: "Interviews", path: "/admin/Interviews" },
    { name: "Jobs", path: "/admin/Jobs" },
    { name: "Users", path: "/admin/Users" },
  ];

  // Fetch + Auto refresh
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDashboardData();
        setData(res);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-outfit">

      {/* SEARCH */}
      <div className="flex items-center gap-4">
        <GlobalSearch />
      </div>

      {/* NAV PILLS */}
      <div className="grid grid-cols-4 gap-6">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={() => navigate(action.path)}
            className="bg-[#0C3E56] text-white py-3 rounded-full font-medium shadow hover:bg-[#092c3d]"
          >
            {action.name}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-2 gap-6">

        {/* INSIGHTS */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
          <h3 className="font-semibold text-[#24698B] mb-4">Insights</h3>

          {loading ? (
            <p className="text-gray-500">Loading dashboard...</p>
          ) : (
            <div className="space-y-4">

              {/* COMPANIES (MAIN CARD) */}
              <div className="bg-[#24698B]/15 rounded-xl p-5 border-l-4 border-[#24698B]">
                <p className="text-sm">Companies</p>
                <p className="text-3xl font-bold text-[#24698B]">
                  {data?.companies?.total || 0}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Total companies
                </p>

                <div className="flex gap-6 mt-2 text-lg">
                  <span className="text-green-600">
                    Approved: {data?.companies?.approved || 0}
                  </span>

                  <span className="text-yellow-600">
                    Pending: {data?.companies?.pending || 0}
                  </span>
                </div>
              </div>

              {/* JOBS + APPLICATIONS */}
              <div className="grid grid-cols-2 gap-4">
                <InsightCard
                  title="Jobs"
                  value={data?.jobs?.total || 0}
                  subtitle="Total jobs"
                />

                <InsightCard
                  title="Applications"
                  value={data?.applications?.total || 0}
                  subtitle="Total applications"
                />
              </div>

              {/* USERS WITH BREAKDOWN (future-ready) */}
              <div className="bg-[#24698B]/15 rounded-xl p-5 border-l-4 border-[#24698B]">
                <p className="text-sm">Users</p>
                <p className="text-3xl font-bold text-[#24698B]">
                  {data?.users?.total || 0}
                </p>

                {/* If backend later sends breakdown, it will show automatically */}
                <div className="grid grid-cols-3 mt-3 text-sm text-gray-700">
                  <p>Candidates: {data?.users?.candidates || "-"}</p>
                  <p>Interviewers: {data?.users?.interviewers || "-"}</p>
                  <p>Company Admins: {data?.users?.companyAdmins || "-"}</p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
          <RecentActivities onViewAll={handleViewAll} />
        </div>

      </div>

      {/* SUPPORT */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[#24698B]">Support Tickets</h3>

          <button className="text-sm text-white bg-[#24698B] px-3 py-1 rounded-md hover:bg-[#1e5873]">
            View All
          </button>
        </div>

        <div className="p-4 bg-[#24698B]/10 rounded-lg text-sm border border-[#24698B]/20">
          #TKT-1245 — Unable to post job listings (payment issue)
        </div>
      </div>

    </div>
  );
}

function InsightCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#24698B]/15 rounded-xl p-4 border-l-4 border-[#24698B]
                    hover:bg-[#24698B]/20 transition">
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-semibold text-[#24698B]">{value}</p>
      <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
    </div>
  );
}