import CompanyCard from "./CompanyCard";

export default function CompanySection({ title, badge, type }) {

  const companies = [
    {
      id: 1,
      name: "TechVision Solutions",
      email: "contact@techvision.com",
      location: "Colombo, Sri Lanka",
    },
    {
      id: 2,
      name: "Inova IT Systems",
      email: "info@inova.com",
      location: "Colombo",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">

      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-[#24698B]">
          ■ {title}
        </h3>
        <span className="text-xs bg-[#24698B]/20 px-2 py-1 rounded-full">
          {badge}
        </span>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            type={type}
            company={company}   // ✅ THIS IS THE FIX
          />
        ))}
      </div>
    </div>
  );
}