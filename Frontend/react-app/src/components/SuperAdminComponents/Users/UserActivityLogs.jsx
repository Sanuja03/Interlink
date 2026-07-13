export default function UserActivityLog({ logs = [] }) {
  const actionColor = (action) => {
    switch (action?.toUpperCase()) {
      case "LOGIN":    return "bg-blue-100 text-blue-700";
      case "UPDATE":   return "bg-yellow-100 text-yellow-700";
      case "SUSPEND":  return "bg-red-100 text-red-700";
      case "RESTORE":  return "bg-green-100 text-green-700";
      case "FLAG":     return "bg-orange-100 text-orange-700";
      default:         return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white border border-[#DADEE0] rounded-xl p-6">
      <h3 className="text-[#24698B] font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${actionColor(log.action)}`}>
                  {log.action}
                </span>
                <p className="text-sm text-gray-700">{log.description}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {log.createdAt
                  ? new Date(log.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}