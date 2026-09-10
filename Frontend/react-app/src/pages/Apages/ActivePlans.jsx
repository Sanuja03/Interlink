import { useEffect, useMemo, useState } from "react";
import ActivePlanTable from "../../components/TicketSubsPages/ActivePlanTable";
import SubscriptionLogsModal from "../../components/TicketSubsPages/SubscriptionLogsModal";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 10;

export default function ActivePlans() {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showLogs,    setShowLogs]    = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/active-subscriptions");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter by company or plan name, client-side — this page's subscription
  // list is small enough (dozens of companies, not thousands) that a
  // dedicated paginated backend endpoint isn't worth the added risk.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (row) =>
        (row.companyName || "").toLowerCase().includes(q) ||
        (row.planName || "").toLowerCase().includes(q)
    );
  }, [data, search]);

  // Reset to page 1 whenever the search changes (done inline in the
  // handler below rather than in a useEffect, to avoid the extra render)
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages - 1);
  const paginated   = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Active Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage company subscriptions. Confirm payment to schedule renewal at cycle end, or change plans immediately.
        </p>
      </div>

      <div className="mb-4">
        <SearchFilterBar
          search={search}
          onSearch={handleSearchChange}
          placeholder="Search by company or plan..."
          onClear={() => handleSearchChange("")}
          actions={
            <button
              onClick={() => setShowLogs(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0C3E56] text-white text-sm font-medium
                hover:bg-[#0a3247] transition whitespace-nowrap"
            >
              Billing Activity
            </button>
          }
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Loading subscriptions...
        </div>
      ) : (
        <>
          <ActivePlanTable data={paginated} refresh={fetchData} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="px-4 py-2 rounded-lg bg-[#24698B] text-white text-sm
                  disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {safePage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="px-4 py-2 rounded-lg bg-[#24698B] text-white text-sm
                  disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showLogs && <SubscriptionLogsModal onClose={() => setShowLogs(false)} />}
    </div>
  );
}
