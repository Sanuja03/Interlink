import { useState } from "react";
import EditProfileModal from "../components/Profile/EditProfileModal";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke="#24698B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="#24698B" strokeWidth="1.2" />
    <path d="M7 4v3.5l2 1.5" stroke="#24698B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default function SuperAdminProfile() {
  const [showModal, setShowModal] = useState(false);

  const user = {
    name: "John Doe",
    role: "Administrator",
    email: "johndoe@gmail.com",
    phone: "+94 112 345 678",
    location: "Colombo, Sri Lanka",
    joined: "Dec 23, 2025",
  };

  const permissions = [
    "Manage Users",
    "Manage Companies",
    "Manage Job Posts",
    "System Settings",
    "Billing and Subscription",
  ];

  const activities = [
    { label: "Approved TechCorp Inc. company registration", time: "Dec 25, 2025", module: "Companies Module" },
    { label: "Updated system notification settings", time: "Dec 24, 2025", module: "System Settings" },
    { label: "Added new user account: S. Perera", time: "Dec 24, 2025", module: "Users Module" },
    { label: "Reviewed billing subscription plan", time: "Dec 23, 2025", module: "Billing Module" },
  ];

  return (
    <>
    <div className="space-y-4 sm:space-y-5 font-outfit">

      {/* PROFILE HEADER */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="h-20 sm:h-24 bg-gradient-to-r from-[#0C3E56] to-[#24698B]" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-9">

          {/* Avatar row: avatar left, edit button right */}
          <div className="flex items-end justify-between">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0C3E56] text-white flex items-center justify-center text-xl sm:text-2xl font-bold rounded-xl border-4 border-white shadow-md shrink-0">
              JD
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="border border-[#24698B] text-[#24698B] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#24698B] hover:text-white transition-all duration-200"
            >
              Edit Profile
            </button>
          </div>

          {/* Name + meta */}
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-[#0C3E56]">{user.name}</h2>
              <span className="text-[10px] font-semibold bg-[#24698B]/10 text-[#24698B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            {/* Contact details: column on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 sm:gap-y-1 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="text-[#24698B] text-[10px] shrink-0">●</span>
                <span className="truncate">{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#24698B] text-[10px] shrink-0">●</span>
                {user.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#24698B] text-[10px] shrink-0">●</span>
                {user.location}
              </span>
              <span className="text-gray-400">Joined {user.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PERMISSIONS */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="w-1 h-4 bg-[#24698B] rounded-full" />
          <h3 className="text-[#0C3E56] font-semibold text-xs sm:text-sm tracking-wide uppercase">Permissions</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {permissions.map((perm, index) => (
            <div key={index} className="py-2.5 sm:py-3 flex justify-between items-center group">
              <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#24698B] transition-colors pr-3">
                {perm}
              </span>
              <div className="w-6 h-6 bg-[#24698B]/10 rounded-full flex items-center justify-center shrink-0">
                <CheckIcon />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="w-1 h-4 bg-[#24698B] rounded-full" />
          <h3 className="text-[#0C3E56] font-semibold text-xs sm:text-sm tracking-wide uppercase">Recent Activity</h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {activities.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 hover:bg-[#24698B]/5 transition-colors">
              <div className="mt-0.5 shrink-0">
                <ActivityIcon />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-800 font-medium leading-snug">{item.label}</p>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{item.time} · {item.module}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
    {showModal && <EditProfileModal onClose={() => setShowModal(false)} />}
    </>
  );
}