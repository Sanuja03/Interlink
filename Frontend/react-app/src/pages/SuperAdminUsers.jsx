import { useState } from "react";
import UserCard from "../components/users/UserCard";

export default function SuperAdminUsers() {
  const [search, setSearch] = useState("");

  // Dummy data (replace with API later)
  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Interviewer",
      email: "sarah@gmail.com",
      location: "Colombo, Sri Lanka",
      company: "Horizon Global",
    },
    {
      id: 2,
      name: "Mike Cowell",
      role: "Company Admin",
      email: "mike@gmail.com",
      location: "Colombo, Sri Lanka",
      company: "TechCorp",
    },
  ];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-outfit">

      {/* SEARCH */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, company, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-[#DADEE0] bg-white shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-[#24698B]">
          All Users
        </h1>

        <span className="text-sm bg-[#24698B] text-white px-3 py-1 rounded-full">
          {filteredUsers.length} Total
        </span>
      </div>

      {/* USER LIST */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

    </div>
  );
}