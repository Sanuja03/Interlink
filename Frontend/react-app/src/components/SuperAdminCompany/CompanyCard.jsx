export default function CompanyCard({ type }) {
  return (
    <div className="flex items-center justify-between bg-[#24698B]/20
                    rounded-xl p-4 border-l-4 border-[#24698B]">

      {/* Company Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg shadow" />

        <div>
          <p className="font-semibold">TechVision Solutions</p>
          <p className="text-sm text-gray-600">
            contact@techvision.com · Colombo, Sri Lanka
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {type === "pending" && (
          <>
            <button className="px-3 py-1 bg-[#1F6434] text-white rounded-md text-sm">
              Approve
            </button>
            <button className="px-3 py-1 bg-[#D11405] text-white rounded-md text-sm">
              Reject
            </button>
          </>
        )}

        <button className="px-3 py-1 bg-[#004668] text-white rounded-md text-sm">
          View Profile
        </button>
      </div>

    </div>
  );
}