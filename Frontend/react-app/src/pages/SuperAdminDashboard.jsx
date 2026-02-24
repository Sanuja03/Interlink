import { useNavigate } from "react-router-dom";
import RecentActivities from "../components/activity_logs/RecentActivities";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/SuperAdmin/AllActivities");
    };
    
    const actions = [
    { name: "Companies", path: "/SuperAdmin/Companies" },
    { name: "Interviews", path: "/SuperAdmin/Interviews" },
    { name: "Jobs", path: "/SuperAdmin/Jobs" },
    { name: "Users", path: "/SuperAdmin/Users" },
  ];
  

  return (
    <div className="space-y-6 text-black font-outfit">

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search ..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />

        <button className="w-12 h-12 rounded-full bg-[#24698B] text-white shadow flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>          
        </button>

      </div>

      {/* Quick Action Buttons */}
     <div className="grid grid-cols-4 gap-6">
      {actions.map((action) => (
        <button
          key={action.name}
          onClick={() => navigate(action.path)} // Redirect on click
          className="bg-[#0C3E56] text-white py-3 rounded-full font-medium shadow 
                     hover:opacity-90 transition"
        >
          {action.name}
        </button>
        ))}
      </div>

      {/* Insights + Recent Activities */}
      <div className="grid grid-cols-2 gap-6">

        {/* INSIGHTS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-[#24698B] mb-4">
            ■ Insights
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <InsightCard
              title="Companies"
              value="248"
              subtitle="185 accepted · 63 pending"
            />
            <InsightCard
              title="Jobs"
              value="1542"
              subtitle="185 accepted · 63 pending"
            />
            <InsightCard
              title="Job Applications"
              value="2215"
              subtitle="185 accepted · 63 pending"
            />
            <InsightCard
              title="Interviewers"
              value="512"
              subtitle="185 accepted · 63 pending"
            />
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="bg-white rounded-xl shadow p-6">
          <RecentActivities onViewAll={handleViewAll} />
        </div>

      </div>

      {/* SUPPORT TICKETS */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[#24698B]">
            ■ Support Tickets
          </h3>

          <button
            className="text-sm font-medium text-[#24698B]
                       border border-[#24698B] rounded-md px-3 py-1
                       hover:bg-[#24698B]/10 transition"
          >
            View All
          </button>
        </div>

        <div className="p-4 bg-[#24698B]/20 rounded-lg text-sm">
          #TKT-1245 — Unable to post job listings (payment issue)
        </div>
      </div>

    </div>
  );
}

/* Insight Card */
function InsightCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#24698B]/20 rounded-xl p-4 border-l-4 border-[#24698B]">
      <p className="text-sm text-black">{title}</p>
      <p className="text-2xl font-semibold text-[#24698B]">{value}</p>
      <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
    </div>
  );
}