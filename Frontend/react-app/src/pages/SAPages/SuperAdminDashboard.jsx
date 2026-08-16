import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RecentActivities from "../../components/SuperAdminComponents/activity_logs/RecentActivities";
import { fetchDashboardData } from "../../api/SAdminDashboardApi";
import GlobalSearch from "../../components/SuperAdminComponents/Layout/GlobalSearch";
import api from "../../lib/api";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  // Dashboard data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Navigate to activity logs page
  const handleViewAll = () => {
    navigate("/admin/AllActivities");
  };

  // Quick navigation buttons
  const actions = [
    { name: "Companies", path: "/admin/Companies" },
    { name: "Interviews", path: "/admin/Interviews" },
    { name: "Jobs", path: "/admin/Jobs" },
    { name: "Users", path: "/admin/Users" },
  ];

  // Fetch support tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setTicketsLoading(true);

        const res = await api.get("/tickets");

        // Priority order for statuses
        const STATUS_PRIORITY = {
          OPEN: 0,
          PENDING: 1,
          RESOLVED: 2,
          CLOSED: 3,
        };

        // Sort by status first, then newest
        const sorted = [...res.data].sort((a, b) => {
          const statusDiff =
            (STATUS_PRIORITY[a.status] ?? 99) -
            (STATUS_PRIORITY[b.status] ?? 99);

          if (statusDiff !== 0) return statusDiff;

          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Show only top 5
        setTickets(sorted.slice(0, 5));
      } catch (err) {
        console.error("Failed to load tickets:", err);
      } finally {
        setTicketsLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Fetch dashboard data and refresh every 30 seconds
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

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tw-preflight space-y-6 font-outfit">

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <GlobalSearch />
      </div>

      {/* Navigation buttons */}
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

      {/* Main content */}
      <div className="grid grid-cols-2 gap-6">

        {/* Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
          <h3 className="font-semibold text-[#24698B] mb-4">Insights</h3>

          {loading ? (
            <p className="text-gray-500">Loading dashboard...</p>
          ) : (
            <div className="space-y-4">

              {/* Companies */}
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

              {/* Jobs and applications */}
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

              {/* Users */}
              <div className="bg-[#24698B]/15 rounded-xl p-5 border-l-4 border-[#24698B]">
                <p className="text-sm">Users</p>
                <p className="text-3xl font-bold text-[#24698B]">
                  {data?.users?.total || 0}
                </p>

                <div className="grid grid-cols-3 mt-3 text-sm text-gray-700">
                  <p>Candidates: {data?.users?.candidates || "-"}</p>
                  <p>Interviewers: {data?.users?.interviewers || "-"}</p>
                  <p>Company Admins: {data?.users?.companyAdmins || "-"}</p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Recent activities */}
        <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
          <RecentActivities onViewAll={handleViewAll} />
        </div>

      </div>

      {/* Support tickets */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DADEE0] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[#24698B]">Support Tickets</h3>
          <button
            onClick={() => navigate("/admin/tickets")}
            className="text-sm text-white bg-[#24698B] px-3 py-1 rounded-md hover:bg-[#1e5873]"
          >
            View All
          </button>
        </div>

        {ticketsLoading ? (
          // Show loading state while fetching
          <p className="text-sm text-gray-400">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          // Show empty state after loading
          <p className="text-sm text-gray-400">No tickets found.</p>
        ) : (
          // Show tickets
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* Small reusable card */
function InsightCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#24698B]/15 rounded-xl p-4 border-l-4 border-[#24698B] hover:bg-[#24698B]/20 transition">
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-semibold text-[#24698B]">{value}</p>
      <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
    </div>
  );
}

/* Status colors */
const STATUS_STYLES = {
  OPEN: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

/* Priority colors */
const PRIORITY_STYLES = {
  URGENT: "text-red-500",
  MEDIUM: "text-amber-500",
  LOW: "text-gray-400",
};

/* Ticket row component */
function TicketRow({ ticket }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-blue-100 transition rounded-lg border border-[#24698B]/10">

      <div className="min-w-0 flex-1 pr-4">
        <p className="text-sm font-medium text-gray-800 truncate">
          {ticket.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {ticket.submittedBy} ·{" "}
          {new Date(ticket.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {ticket.priority && (
          <span className={`text-xs font-semibold ${PRIORITY_STYLES[ticket.priority] ?? "text-gray-400"}`}>
            {ticket.priority}
          </span>
        )}

        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[ticket.status] ?? "bg-gray-100 text-gray-500"}`}>
          {ticket.status}
        </span>
      </div>

    </div>
  );
}