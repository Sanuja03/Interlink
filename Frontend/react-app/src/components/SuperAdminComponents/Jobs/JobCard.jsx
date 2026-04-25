export default function JobCard({ job, onClick }) {
  const statusColors = {
    OPEN:      "bg-green-100 text-green-700",
    FLAGGED:   "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-red-100 text-red-600",
  };

  const badgeClass =
    statusColors[(job.status || "").toUpperCase()] || "bg-gray-100 text-gray-600";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl
                    bg-[#24698B]/15 border border-[#DADEE0]">
      <div className="flex items-center gap-4">

        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow text-xl">
          🌐
        </div>

        <div>
          <h3 className="font-semibold text-[#24698B]">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.companyName || "—"}</p>
          <p className="text-xs text-gray-500">
            {job.location}
            {job.category && <span> · {job.category}</span>}
          </p>
          {job.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${badgeClass}`}>
              {job.status}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onClick}
        className="bg-[#24698B] text-white px-4 py-2 rounded-full text-sm
                   hover:bg-[#1e5873] transition-colors flex-shrink-0"
      >
        View Details
      </button>
    </div>
  );
}