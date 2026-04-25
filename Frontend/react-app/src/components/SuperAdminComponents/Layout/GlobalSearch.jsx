import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../../api/SAdminUsersApi";
import { getJobs } from "../../../api/SAdminJobApi";
import { searchCompanies } from "../../../api/SAdminCompanyApi";

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState({ users: [], jobs: [], companies: [] });
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], jobs: [], companies: [] });
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [usersRes, jobsRes, companiesRes] = await Promise.allSettled([
          getUsers({ search: query, role: "" }),
          getJobs({ page: 0, size: 5, search: query, status: "", type: "", category: "" }),
          Promise.all([searchCompanies(query, "pending"), searchCompanies(query, "approved")]),
        ]);
        const users     = usersRes.status     === "fulfilled" ? (usersRes.value || []).slice(0, 5) : [];
        const jobs      = jobsRes.status      === "fulfilled" ? (jobsRes.value?.content || []).slice(0, 5) : [];
        const companies = companiesRes.status === "fulfilled"
          ? [...(companiesRes.value[0] || []), ...(companiesRes.value[1] || [])].slice(0, 5) : [];
        setResults({ users, jobs, companies });
        setOpen(true);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.users.length + results.jobs.length + results.companies.length;

  const handleSelect = (type, item) => {
    setOpen(false); setQuery("");
    if (type === "user")    navigate(`/admin/User/${item.userId}`, { state: { role: item.role } });
    if (type === "job")     navigate(`/admin/Jobs/${item.id}`);
    if (type === "company") navigate(`/admin/Companies/${item.companyId}`);
  };

  const handleClear = () => { setQuery(""); setOpen(false); setResults({ users: [], jobs: [], companies: [] }); };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* INPUT */}
      <div className="relative flex items-center">
        {/* Modern search icon — magnifier with thin stroke */}
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => totalResults > 0 && setOpen(true)}
          placeholder="Search users, jobs, companies..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DADEE0] bg-white
                     text-sm text-gray-700 placeholder-gray-400 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]/30 focus:border-[#24698B]
                     transition-all"
        />

        {/* Clear button — appears when query is non-empty */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                       bg-gray-200 hover:bg-gray-300 text-gray-500 flex items-center justify-center
                       transition-colors text-xs font-bold leading-none"
          >
            ✕
          </button>
        )}

        {/* Loading pulse */}
        {loading && !query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 animate-pulse">
            •••
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {open && totalResults > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#DADEE0]
                        shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {results.users.length > 0 && (
            <Section label="Users">
              {results.users.map((u) => (
                <ResultRow key={u.userId} icon={<UserIcon />}
                  primary={u.name || u.email}
                  secondary={`${u.role?.replace("_", " ")} · ${u.email}`}
                  badge={u.accountStatus}
                  badgeColor={u.accountStatus === "suspended" ? "text-red-500" : "text-green-600"}
                  onClick={() => handleSelect("user", u)} />
              ))}
            </Section>
          )}
          {results.jobs.length > 0 && (
            <Section label="Jobs">
              {results.jobs.map((j) => (
                <ResultRow key={j.id} icon={<BriefcaseIcon />}
                  primary={j.jobTitle || j.job_title}
                  secondary={`${j.companyName || j.company_name || ""} · ${j.employmentType || j.employment_type || ""}`}
                  badge={j.status}
                  badgeColor={j.status === "OPEN" ? "text-green-600" : "text-red-500"}
                  onClick={() => handleSelect("job", j)} />
              ))}
            </Section>
          )}
          {results.companies.length > 0 && (
            <Section label="Companies">
              {results.companies.map((c) => (
                <ResultRow key={c.companyId} icon={<BuildingIcon />}
                  primary={c.companyName}
                  secondary={`${c.industry || ""} · ${c.companyLocation || ""}`}
                  badge={c.companyStatus}
                  badgeColor={c.companyStatus === "approved" ? "text-green-600" : "text-yellow-600"}
                  onClick={() => handleSelect("company", c)} />
              ))}
            </Section>
          )}
        </div>
      )}

      {open && !loading && totalResults === 0 && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border
                        border-[#DADEE0] shadow-xl z-50 p-4 text-sm text-gray-400 text-center">
          No results for "{query}"
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest
                      bg-gray-50 border-b border-[#DADEE0]">
        {label}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ icon, primary, secondary, badge, badgeColor, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#24698B]/5
                 text-left transition-colors border-b border-[#DADEE0] last:border-0">
      <span className="text-[#24698B] flex-shrink-0 opacity-70">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{primary}</p>
        <p className="text-xs text-gray-400 truncate">{secondary}</p>
      </div>
      {badge && (
        <span className={`text-xs font-medium capitalize flex-shrink-0 ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// Thin SVG icons — modern, consistent stroke style
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/>
    </svg>
  );
}