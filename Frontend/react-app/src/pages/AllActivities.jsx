import { useEffect, useState } from "react";
import { fetchActivityLogs } from "../api/ActivityLogsApi";
//import { useNavigate } from "react-router-dom";

export default function AllActivitiesPage() {
  const [activities, setActivities] = useState([]);
  //const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  useEffect(() => {
    fetchActivityLogs({ page: 0, size: 10, role: roleFilter, fromDate, toDate })
      .then(res => {
        setActivities(res.data.content);
      })
      .catch(err => console.error(err));
  }, [roleFilter, fromDate, toDate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          All Activities
        </h2>

        {/*<button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 font-medium hover:bg-blue-100 border border-blue-600 rounded-md px-3 py-1 transition duration-200"
        >
          Back to Dashboard
        </button>*/}
      </div>

      {/* Filters Card */}
     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
     <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">

      {/* Role Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1 cursor-pointer">
          User Role
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:bg-gray-200 cursor-pointer"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COMPANY_ADMIN">Company Admin</option>
          <option value="JOB_SEEKER">Candidate</option>
          <option value="RECRUITER">Interviewer</option>
        </select>
      </div>

      {/* From Date */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          From Date
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:bg-gray-200 cursor-pointer"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />
      </div>

      {/* To Date */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          To Date
        </label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:bg-gray-200 cursor-pointer"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setRoleFilter("");
          setFromDate("");
          setToDate("");
        }}
        className="h-10 text-sm border border-gray-300 rounded-lg hover:bg-orange-500 transition"
      >
        Clear Filters
      </button>

    </div>
  </div>



      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                User Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Date
              </th>
            </tr>
          </thead>
<tbody className="bg-gray-100 space-y-2">
  {activities.map(a => (
    <tr key={a.id}>
      <td colSpan={4} className="px-4 py-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-blue-100 hover:shadow-md transition p-4 grid grid-cols-4 gap-4">
          
          <div className="text-sm font-medium text-gray-700">
            {a.userRole}
          </div>

          <div className="text-sm font-semibold text-gray-900">
            {a.action}
          </div>

          <div className="text-sm text-gray-700">
            {a.description}
          </div>

          <div className="text-sm text-gray-500 text-right">
            {new Date(a.createdAt).toLocaleString()}
          </div>

        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No activities found.
          </div>
        )}
      </div>
    </div>
  );
}
