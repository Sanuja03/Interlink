import { useEffect, useState } from "react";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { fetchActivityLogs } from "../../api/ActivityLogsApi";

const ROLE_OPTS = [
  { label: "Super Admin",    value: "ADMIN" },
  { label: "Company Admin",  value: "COMPANY_ADMIN" },
  { label: "Candidate",      value: "Candidate" },
  { label: "Interviewer",    value: "Interviewer" },
];

const ACTION_COLOR = {
  LOGIN:   "bg-blue-100 text-blue-700",
  UPDATE:  "bg-yellow-100 text-yellow-700",
  SUSPEND: "bg-red-100 text-red-700",
  RESTORE: "bg-green-100 text-green-700",
  FLAG:    "bg-orange-100 text-orange-700",
};

export default function AllActivitiesPage() {
  const [activities,      setActivities]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState("");
  const [fromDate,        setFromDate]        = useState("");
  const [toDate,          setToDate]          = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchActivityLogs({
      userRole: roleFilter || "",
      fromDate: fromDate   || "",
      toDate:   toDate     || "",
      search:   debouncedSearch || "",
    })
      .then((res) => setActivities(res.data.content ?? []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [roleFilter, fromDate, toDate, debouncedSearch]);

  const handleClear = () => {
    setSearch(""); setRoleFilter(""); setFromDate(""); setToDate("");
  };

  return (
    <div className="space-y-5">

      <h2 className="text-xl font-semibold text-[#24698B]">All Activities</h2>

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by action, description, role..."
        onClear={handleClear}
        filters={[
          {
            key: "role",
            label: "All Roles",
            value: roleFilter,
            onChange: setRoleFilter,
            options: ROLE_OPTS,
          },
          {
            key: "fromDate",
            label: "From Date",
            type: "date",
            value: fromDate,
            onChange: setFromDate,
          },
          {
            key: "toDate",
            label: "To Date",
            type: "date",
            value: toDate,
            onChange: setToDate,
          },
        ]}
      />

      {/* TABLE */}
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
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ACTION_COLOR[a.action] || "bg-gray-100 text-gray-600"
                      }`}
                    >
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
    </div>
  );
}