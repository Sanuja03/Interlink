import { useEffect, useState } from "react";
import { fetchActivityLogs } from "../../../api/ActivityLogsApi";

export default function RecentActivities({ onViewAll }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs({ page: 0, size: 5,userRole: "", fromDate: "", toDate: "" })
      .then(res => {
        setActivities(res.data.content);
      })
      .catch(err => {
        console.error("Failed to load activities", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading activities...</p>;


return (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl text-blue-900">
        Recent Activities
      </h1>

      <button
        onClick={onViewAll}
        className="text-sm text-white font-medium bg-[#24698B] hover:bg-[#24698B]/90 border border-blue-600 rounded-md px-3 py-1 transition duration-200"
      >
        View All
      </button>
    </div>

    {/* Activity List */}
    <ul className="space-y-3">
      {activities.map(a => (
        <li
          key={a.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-100 transition"
        >
          {/* Left indicator (optional) */}
          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />

          <div>
            <p className="text-sm text-gray-800 font-medium leading-snug">
              {a.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
}