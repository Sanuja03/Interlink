import { useState, useEffect, useCallback } from "react";
import UserCard from "../../../components/SuperAdminComponents/Users/UserCard";
import SearchFilterBar from "../../../components/SuperAdminComponents/Layout/SearchFilterBar";
import { getUsers } from "../../../api/SAdminUsersApi";

const ROLE_TABS = [
  { label: "All",            value: "" },
  { label: "Candidates",     value: "candidate" },
  { label: "Interviewers",   value: "interviewer" },
  { label: "Company Admins", value: "company_admin" },
];

export default function SuperAdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers({ search, role });
      setUsers(data);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleClear = () => { setSearch(""); setRole(""); };

  return (
    <div className="space-y-5 font-outfit">

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-[#24698B]">All Users</h1>
        <span className="text-sm bg-[#24698B] text-white px-3 py-1 rounded-full">
          {users.length} Total
        </span>
      </div>

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name or email..."
        onClear={handleClear}
        filters={[
          {
            key: "role",
            type: "tabs",
            value: role,
            onChange: setRole,
            options: ROLE_TABS,
          },
        ]}
      />

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">Loading users...</div>
      )}
      {!loading && error && (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      )}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
      )}
      {!loading && !error && (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      )}

    </div>
  );
}