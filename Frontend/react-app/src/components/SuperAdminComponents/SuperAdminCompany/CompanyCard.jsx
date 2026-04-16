import { useNavigate } from "react-router-dom";

export default function CompanyCard({ type, company }) {
  const navigate = useNavigate();

  // Safety check (prevents crashes)
  if (!company) return null;

  return (
    <div
      className="flex items-center justify-between bg-[#24698B]/20
                 rounded-xl p-4 border-l-4 border-[#24698B]
                 hover:shadow-md transition"
    >

      {/* 🔷 Company Info */}
      <div className="flex items-center gap-4">
        {/* Logo / Placeholder */}
        <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#24698B]">
          {company.name?.charAt(0) || "C"}
        </div>

        {/* Details */}
        <div>
          <p className="font-semibold">
            {company.name || "Company Name"}
          </p>
          <p className="text-sm text-gray-600">
            {company.email || "email@company.com"} ·{" "}
            {company.location || "Location"}
          </p>
        </div>
      </div>

      {/* 🔷 Actions */}
      <div className="flex items-center gap-2">

        {/* Pending Actions */}
        {type === "pending" && (
          <>
            <button
              className="px-3 py-1 bg-[#1F6434] text-white rounded-md text-sm hover:bg-[#174d29]"
            >
              Approve
            </button>

            <button
              className="px-3 py-1 bg-[#D11405] text-white rounded-md text-sm hover:bg-[#a10f03]"
            >
              Reject
            </button>
          </>
        )}

        {/* View Profile */}
        <button
          onClick={() =>
            navigate(`/SuperAdmin/Company/${company.id}`, {
              state: company,
            })
          }
          className="px-3 py-1 bg-[#004668] text-white rounded-md text-sm hover:bg-[#00334d]"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}