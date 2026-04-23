import { useEffect, useState } from "react";
import CompanySection from "../../components/SuperAdminComponents/SuperAdminCompany/CompanySection";
import CreateAdminModal from "../../components/SuperAdminComponents/SuperAdminCompany/CreateAdminModal";
import {getPendingCompanies,getApprovedCompanies,searchCompanies,} from "../../api/SAdminCompanyApi";

export default function SuperAdminCompanies() {
  const [showModal, setShowModal] = useState(false);

  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  //handles both initial + search
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        let pending = [];
        let approved = [];

        if (search.trim() === "") {
          // NORMAL LOAD
          [pending, approved] = await Promise.all([
            getPendingCompanies(),
            getApprovedCompanies(),
          ]);
        } else {
          // SEARCH MODE (BACKEND)
          [pending, approved] = await Promise.all([
            searchCompanies(search, "pending"),
            searchCompanies(search, "approved"),
          ]);
        }

        //  prevents .map crash
        setPendingCompanies(Array.isArray(pending) ? pending : []);
        setApprovedCompanies(Array.isArray(approved) ? approved : []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  //  FRONTEND FILTER
  const filterByIndustry = (list) =>
    industryFilter === "all"
      ? list
      : list.filter(
          (c) =>
            (c.industry || "").toLowerCase() === industryFilter
        );

  return (
    <div className="space-y-8">

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search company name, email or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="
            px-5 py-3 
            rounded-xl 
            bg-white 
            border border-gray-300 
            text-gray-700 
            shadow-sm 
            focus:outline-none 
            focus:ring-2 
            focus:ring-[#24698B] 
            focus:border-[#24698B]
            hover:border-[#24698B]
            transition-all
            cursor-pointer
          "
        >
          <option value="all">All Industries</option>
          <option value="it">IT</option>
          <option value="finance">Finance</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center text-gray-500">
          Loading companies...
        </div>
      ) : (
        <>
          <CompanySection
            title="Pending List of Companies"
            badge={pendingCompanies.length}
            type="pending"
            companies={filterByIndustry(pendingCompanies)}
          />

          <CompanySection
            title="Approved List of Companies"
            badge={approvedCompanies.length}
            type="approved"
            companies={filterByIndustry(approvedCompanies)}
          />
        </>
      )}

      {/* CREATE ADMIN */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <h3 className="font-semibold text-[#24698B] mb-2">
          Create Company Admin
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create a new admin account for an approved company.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#0C3E56] text-white rounded-full shadow hover:bg-[#092c3d]"
        >
          + Create Admin
        </button>
      </div>

      {showModal && (
        <CreateAdminModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}