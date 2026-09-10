import { useEffect, useMemo, useState } from "react";
import { fetchActivityLogs } from "../../api/ActivityLogsApi";

const PAGE_SIZE = 8;

// Colour-code the four billing actions this page can produce
const ACTION_COLOR = {
  CONFIRM_PAYMENT: "bg-emerald-100 text-emerald-700",
  CHANGE_PLAN:      "bg-blue-100 text-blue-700",
  AUTO_RENEW:       "bg-teal-100 text-teal-700",
  AUTO_DOWNGRADE:   "bg-amber-100 text-amber-700",
};

/**
 * SubscriptionLogsModal
 * Small popup showing recent billing/subscription activity — reuses the
 * existing shared activity-log system (entityType "SUBSCRIPTION"), fetched
 * once and then searched/paginated client-side since the volume here is
 * small. Covers both admin-triggered events (Confirm Pay, Change Plan) and
 * system-triggered ones (auto-renew, auto-downgrade to Free).
 *
 * Props:
 *  - onClose {function}  closes the modal
 */
export default function SubscriptionLogsModal({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchActivityLogs({ search: "subscription", page: 0, size: 200 })
      .then((res) => setLogs(res.data?.content ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        (l.description || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q)
    );
  }, [logs, search]);

  // Reset to page 1 whenever the search changes (done inline in the
  // handler below rather than in a useEffect, to avoid the extra render)
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap gap-2 items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Billing Activity</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 pt-4 shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by company, plan, or action..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
              focus:outline-none focus:border-[#24698B]"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
          ) : pageItems.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">
              No billing activity found.
            </p>
          ) : (
            pageItems.map((l) => (
              <div
                key={l.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-3
                  bg-gray-50 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                      whitespace-nowrap ${ACTION_COLOR[l.action] || "bg-gray-100 text-gray-600"}`}
                  >
                    {l.action}
                  </span>
                  <p className="text-xs text-gray-700">{l.description || "—"}</p>
                </div>
                <span className="shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
                  {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}
                </span>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-6 py-3 border-t border-gray-100 shrink-0">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-[#24698B] text-white text-xs
                disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-[#24698B] text-white text-xs
                disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
