export default function JobCard({ job, onClick }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl
                    bg-[#24698B]/15 border border-[#DADEE0]">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* Logo Placeholder */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
          🌐
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold text-[#24698B]">
            {job.title}
          </h3>

          <p className="text-sm text-gray-600">
            {job.company}
          </p>

          <p className="text-xs text-gray-500">
            {job.location}
          </p>
        </div>

      </div>

      {/* BUTTON */}
      <button
        onClick={onClick}
        className="bg-[#24698B] text-white px-4 py-2 rounded-full text-sm hover:bg-[#1e5873]"
      >
        View Details
      </button>
    </div>
  );
}