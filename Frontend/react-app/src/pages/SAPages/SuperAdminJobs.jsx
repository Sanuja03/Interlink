import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../../components/SuperAdminComponents/Jobs/JobCard";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { getJobs } from "../../api/SAdminJobApi";

// Filter options for job status
const STATUS_OPTS = [
  { label: "Open", value: "OPEN" },
  { label: "Flagged", value: "FLAGGED" },
  { label: "Suspended", value: "SUSPENDED" },
];

// Filter options for job type
const TYPE_OPTS = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Remote", value: "REMOTE" },
  { label: "Onsite", value: "ONSITE" },
];

// Filter options for job category
const CATEGORY_OPTS = [
  { label: "Engineering", value: "Engineering" },
  { label: "Design", value: "Design" },
  { label: "Marketing", value: "Marketing" },
  { label: "Finance", value: "Finance" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "HR", value: "HR" },
  { label: "Operations", value: "Operations" },
  { label: "QA", value: "QA" },
];

// Number of jobs per page
const PAGE_SIZE = 5;

export default function SuperAdminJobs() {
  const navigate = useNavigate();

  // State for job data and pagination
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // State for filters and search
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Reset pagination and jobs when filters change
  useEffect(() => {
    setPage(0);
    setJobs([]);
  }, [search, status, type, category]);

  // Fetch jobs from backend with filters and pagination
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobs({
        page,
        size: PAGE_SIZE,
        search,
        status,
        type,
        category,
      });

      // Append or replace jobs based on page
      setJobs((prev) =>
        page === 0 ? data.content : [...prev, ...data.content]
      );

      // Check if more pages are available
      setHasMore(!data.last);

    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, category]);

  // Fetch jobs whenever dependencies change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Clear all filters and search
  const handleClear = () => {
    setSearch("");
    setStatus("");
    setType("");
    setCategory("");
  };

  return (
    <div className="space-y-5 font-outfit">

      {/* Page title */}
      <h1 className="text-xl font-semibold text-[#24698B]">
        All Jobs
      </h1>

      {/* Search and filter bar */}
      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search jobs by title..."
        onClear={handleClear}
        filters={[
          {
            key: "status",
            label: "All Statuses",
            value: status,
            onChange: setStatus,
            options: STATUS_OPTS,
          },
          {
            key: "type",
            label: "All Types",
            value: type,
            onChange: setType,
            options: TYPE_OPTS,
          },
          {
            key: "category",
            label: "All Categories",
            value: category,
            onChange: setCategory,
            options: CATEGORY_OPTS,
          },
        ]}
      />

      {/* Job list */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <JobCard
            key={`${job.id}-${index}`}
            job={job}
            onClick={() => navigate(`/admin/Jobs/${job.id}`)}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <p className="text-center text-sm text-gray-400 animate-pulse py-2">
          Loading...
        </p>
      )}

      {/* Load more button */}
      {!loading && hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-[#24698B] text-white px-6 py-2 rounded-full text-sm
                       hover:bg-[#1e5873] transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {/* End of list message */}
      {!loading && !hasMore && jobs.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          All jobs loaded.
        </p>
      )}

    </div>
  );
}