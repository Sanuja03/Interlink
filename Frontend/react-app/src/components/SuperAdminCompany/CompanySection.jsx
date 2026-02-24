import CompanyCard from "./CompanyCard";

export default function CompanySection({ title, badge, type }) {
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
        {[1].map(i => (
          <CompanyCard key={i} type={type} />
        ))}
      </div>
    </div>
  );
}