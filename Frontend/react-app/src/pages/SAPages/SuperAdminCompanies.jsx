import { useState, useEffect } from "react";
import CompanySection from "../../components/SuperAdminComponents/SuperAdminCompany/CompanySection";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { getPendingCompanies, getApprovedCompanies, searchCompanies } from "../../api/SAdminCompanyApi";

const INDUSTRY_OPTS = [
  { label: "IT",      value: "it" },
  { label: "Finance", value: "finance" },
  { label: "Health",  value: "health" },
  { label: "Other",   value: "other" },
];

export default function SuperAdminCompanies() {
  const [pendingCompanies,  setPendingCompanies]  = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [search,            setSearch]            = useState("");
  const [industry,          setIndustry]          = useState("");

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        let pending = [];
        let approved = [];

        if (search.trim() === "") {
          [pending, approved] = await Promise.all([
            getPendingCompanies(),
            getApprovedCompanies(),
          ]);
        } else {
          [pending, approved] = await Promise.all([
            searchCompanies(search, "pending"),
            searchCompanies(search, "approved"),
          ]);
        }

        setPendingCompanies(Array.isArray(pending)  ? pending  : []);
        setApprovedCompanies(Array.isArray(approved) ? approved : []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const filterByIndustry = (list) =>
    !industry
      ? list
      : list.filter((c) => (c.industry || "").toLowerCase() === industry);

  const handleClear = () => { setSearch(""); setIndustry(""); };

  return (
    <div className="space-y-6">

      <h1 className="text-xl font-semibold text-[#24698B]">Companies</h1>

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by company name, email or location..."
        onClear={handleClear}
        filters={[
          {
            key: "industry",
            label: "All Industries",
            value: industry,
            onChange: setIndustry,
            options: INDUSTRY_OPTS,
          },
        ]}
      />

      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">Loading companies...</div>
      ) : (
        <>
          <CompanySection
            title="Pending Companies"
            badge={filterByIndustry(pendingCompanies).length}
            type="pending"
            companies={filterByIndustry(pendingCompanies)}
          />
          <CompanySection
            title="Approved Companies"
            badge={filterByIndustry(approvedCompanies).length}
            type="approved"
            companies={filterByIndustry(approvedCompanies)}
          />
        </>
      )}
    </div>
  );
}