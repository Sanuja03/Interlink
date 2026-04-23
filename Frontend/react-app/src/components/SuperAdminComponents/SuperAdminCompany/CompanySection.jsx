import CompanyCard from "./CompanyCard";

export default function CompanySection({
  title,
  badge,
  type,
  companies = [],
  refresh,
}) {
  const safeCompanies = Array.isArray(companies) ? companies : [];

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-[#24698B]">
          ■ {title}
        </h3>
        <span className="text-xs bg-[#24698B]/20 px-2 py-1 rounded-full">
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {safeCompanies.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            No companies found
          </p>
        ) : (
          safeCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              type={type}
              company={company}
              refresh={refresh}
            />
          ))
        )}
      </div>
    </div>
  );
}