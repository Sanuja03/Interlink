import { useState, useEffect } from "react";
import CompanySection from "../../components/SuperAdminComponents/SuperAdminCompany/CompanySection";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import {
  getPendingCompanies,
  getApprovedCompanies,
  searchCompanies,
} from "../../api/SAdminCompanyApi";

// Industry filter options
const INDUSTRY_OPTS = [
  { label: "IT", value: "it" },
  { label: "Finance", value: "finance" },
  { label: "Health", value: "health" },
  { label: "Other", value: "other" },
];

export default function SuperAdminCompanies() {
  // State for company data
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);

  // State for UI handling
  const [loading, setLoading] = useState(true);

  // State for search and filtering
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");

  // Fetch companies with debounce when search changes
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        let pending = [];
        let approved = [];

        // Fetch all or search based on input
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

        // Ensure arrays before setting state
        setPendingCompanies(Array.isArray(pending) ? pending : []);
        setApprovedCompanies(Array.isArray(approved) ? approved : []);

      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce delay

    return () => clearTimeout(delay);
  }, [search]);

  // Filter companies by selected industry
  const filterByIndustry = (list) =>
    !industry
      ? list
      : list.filter(
          (c) => (c.industry || "").toLowerCase() === industry
        );

  // Clear search and filters
  const handleClear = () => {
    setSearch("");
    setIndustry("");
  };

  return (
    <div className="space-y-6">

      {/* Page title */}
      <h1 className="text-xl font-semibold text-[#24698B]">
        Companies
      </h1>

      {/* Search and filter bar */}
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

      {/* Loading state */}
      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">
          Loading companies...
        </div>
      ) : (
        <>
          {/* Pending companies section */}
          <CompanySection
            title="Pending Companies"
            badge={filterByIndustry(pendingCompanies).length}
            type="pending"
            companies={filterByIndustry(pendingCompanies)}
          />

          {/* Approved companies section */}
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