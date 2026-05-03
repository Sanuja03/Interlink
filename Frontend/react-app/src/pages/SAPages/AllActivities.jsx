import { useEffect, useState } from "react";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { fetchActivityLogs } from "../../api/ActivityLogsApi";

const ROLE_OPTS = [
  { label: "Super Admin",   value: "ADMIN"         },
  { label: "Company Admin", value: "COMPANY_ADMIN" },
  { label: "Candidate",     value: "Candidate"     },
  { label: "Interviewer",   value: "Interviewer"   },
];

// Badge color per action type
const ACTION_COLOR = {
  LOGIN:   "bg-blue-100 text-blue-700",
  UPDATE:  "bg-yellow-100 text-yellow-700",
  SUSPEND: "bg-red-100 text-red-700",
  RESTORE: "bg-green-100 text-green-700",
  FLAG:    "bg-orange-100 text-orange-700",
  UNFLAG:  "bg-gray-100 text-gray-600",
  APPROVE: "bg-teal-100 text-teal-700",
  REJECT:  "bg-red-100 text-red-700",
};

export default function AllActivitiesPage() {
  const [activities,      setActivities]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState("");
  const [fromDate,        setFromDate]        = useState("");
  const [toDate,          setToDate]          = useState("");
  const [currentPage,     setCurrentPage]     = useState(0);
  const [totalPages,      setTotalPages]      = useState(1);

  // Debounce search input to avoid firing on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch logs whenever filters or page change
  useEffect(() => {
    setLoading(true);
    fetchActivityLogs({
      userRole: roleFilter        || "",
      fromDate: fromDate          || null,
      toDate:   toDate            || null,
      search:   debouncedSearch   || "",
      page:     currentPage,
      size:     10,
    })
      .then((res) => {
        setActivities(res.data.content  ?? []);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [roleFilter, fromDate, toDate, debouncedSearch, currentPage]);

  const handleClear = () => {
    setSearch("");
    setRoleFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(0); // reset to first page on filter clear
  };

  // Reset to first page when any filter changes to ensure user sees results from the beginning
  const handleRoleChange  = (v) => { setRoleFilter(v);  setCurrentPage(0); };
  const handleFromChange  = (v) => { setFromDate(v);    setCurrentPage(0); };
  const handleToChange    = (v) => { setToDate(v);      setCurrentPage(0); };
  const handleSearchChange = (v) => { setSearch(v);     setCurrentPage(0); };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-[#24698B]">All Activities</h2>

      <SearchFilterBar
        search={search}
        onSearch={handleSearchChange}
        placeholder="Search by action, description, role..."
        onClear={handleClear}
        filters={[
          {
            key:      "role",
            label:    "All Roles",
            value:    roleFilter,
            onChange: handleRoleChange,
            options:  ROLE_OPTS,
          },
          {
            key:      "fromDate",
            label:    "",
            type:     "date",
            value:    fromDate,
            onChange: handleFromChange,
          },
          {
            key:      "toDate",
            label:    "",
            type:     "date",
            value:    toDate,
            onChange: handleToChange,
          },
        ]}
      />

      {/* ACTIVITY TABLE */}
      <div className="bg-white rounded-2xl border border-[#DADEE0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[#DADEE0]">
            <tr>
              {["User Role", "Action", "Description", "Date"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                  Loading activities...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                  No activities found.
                </td>
              </tr>
            ) : (
              activities.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[#DADEE0] hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                    {a.userRole?.toLowerCase().replace("_", " ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLOR[a.action] || "bg-gray-100 text-gray-600"}`}>
                      {a.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {a.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION — only shown when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg bg-[#24698B] text-white text-sm
                       disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-lg bg-[#24698B] text-white text-sm
                       disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}