
import CompanySection from "../components/SuperAdminCompany/CompanySection";

export default function SuperAdminCompanies() {
  return (
    <div className="space-y-8">

      {/* Search + Filter */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search company name, email or location"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />

        <button className="px-4 py-3 rounded-xl bg-[#24698B] text-white shadow">
          Filter by Industry
        </button>
      </div>

      {/* Pending Companies */}
      <CompanySection
        title="Pending List of Companies"
        badge="102"
        type="pending"
      />

      {/* Approved Companies */}
      <CompanySection
        title="Approved List of Companies"
        badge="248"
        type="approved"
      />

      {/* Create Company Admin */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <h3 className="font-semibold text-[#24698B] mb-2">
          Create Company Admin
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create a new admin account for an approved company.
        </p>

        <button className="px-6 py-3 bg-[#0C3E56] text-white rounded-full shadow">
          + Create Admin
        </button>
      </div>

    </div>
  );
}