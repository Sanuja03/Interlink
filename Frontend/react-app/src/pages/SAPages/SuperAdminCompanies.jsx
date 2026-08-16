import { useState, useEffect, useCallback } from "react";
import CompanySection from "../../components/SuperAdminComponents/SuperAdminCompany/CompanySection";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { getPendingCompanies, getApprovedCompanies, searchCompanies } from "../../api/SAdminCompanyApi";

const INDUSTRY_OPTS = [
  { label: "IT",      value: "it"      },
  { label: "Finance", value: "finance" },
  { label: "Health",  value: "health"  },
  { label: "Other",   value: "other"   },
];

export default function SuperAdminCompanies() {
  // State for company data
  const [pendingCompanies,  setPendingCompanies]  = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  // State for UI handling
  const [loading,           setLoading]           = useState(true);
  // State for search and filter
  const [search,            setSearch]            = useState("");
  const [industry,          setIndustry]          = useState("");

  // Extracted as a named function so it can be passed as refresh to child components
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      let pending  = [];
      let approved = [];

      //Fetch all or based on input
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

      // Ensure the results are arrays before setting state
      setPendingCompanies(Array.isArray(pending)  ? pending  : []);
      setApprovedCompanies(Array.isArray(approved) ? approved : []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounced fetch on search change
  useEffect(() => {
    const delay = setTimeout(() => fetchCompanies(), 400);
    return () => clearTimeout(delay);
  }, [fetchCompanies]);

  const filterByIndustry = (list) =>
    !industry
      ? list
      : list.filter((c) => (c.industry || "").toLowerCase() === industry);

  // Clear search and filter    
  const handleClear = () => { setSearch(""); setIndustry(""); };

  return (
    <div className="tw-preflight space-y-6">
      <h1 className="text-xl font-semibold text-[#24698B]">Companies</h1>

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by company name, email or location..."
        onClear={handleClear}
        filters={[
          {
            key:      "industry",
            label:    "All Industries",
            value:    industry,
            onChange: setIndustry,
            options:  INDUSTRY_OPTS,
          },
        ]}
      />

      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">
          Loading companies...
        </div>
      ) : (
        <>
          {/* Pass fetchCompanies as refresh so cards can trigger a reload after actions */}
          <CompanySection
            title="Pending Companies"
            badge={filterByIndustry(pendingCompanies).length}
            type="pending"
            companies={filterByIndustry(pendingCompanies)}
            refresh={fetchCompanies}
          />
          <CompanySection
            title="Approved Companies"
            badge={filterByIndustry(approvedCompanies).length}
            type="approved"
            companies={filterByIndustry(approvedCompanies)}
            refresh={fetchCompanies}
          />
        </>
      )}
    </div>
  );
}