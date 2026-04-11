import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import interlink from "../../assets/interlink.png";
import dashboardIcon from "../../assets/dashboard.png";
import billingIcon from "../../assets/billing.png";
import settingsIcon from "../../assets/settings.png";
import defaultAvatar from "../../assets/default-avatar.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openDashboard, setOpenDashboard] = useState(true);

  const profile = {
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    avatar: null,
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="w-60 min-h-screen bg-white flex flex-col border-r border-gray-200">
      
      {/* Logo */}
      <div className="flex items-center px-5 py-6">
        <img src={interlink} alt="logo" className="w-40 h-20 object-contain" />
      </div>

      {/* NAVIGATION */}
      <nav className="px-3 space-y-2">

        {/* DASHBOARD MAIN */}
        <div>
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition
              ${isActive("/SuperAdmin/dashboard") || isActive("/SuperAdmin/Companies") || isActive("/SuperAdmin/Interviews") || isActive("/SuperAdmin/Jobs") || isActive("/SuperAdmin/Users")? "bg-gray-200" : "hover:bg-gray-100"}
            `}
          >
             {/* Left Side */}
            <div className="flex items-center gap-3">
            <img src={dashboardIcon} className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
            </div>

            {/* Arrow (Right Side) */}
            <span
              className={`ml-auto transition-all duration-200
                ${openDashboard ? "rotate-180" : ""}
                opacity-0 group-hover:opacity-100
                ${isActive("/SuperAdmin/") ? "opacity-100" : ""}
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {/* SUB MENU */}
          {openDashboard && (
            <div className="ml-8 mt-2 space-y-1">
              <SubItem label="Overview" path="/SuperAdmin/dashboard" />
              <SubItem label="Companies" path="/SuperAdmin/Companies" />
              <SubItem label="Interviews" path="/SuperAdmin/Interviews" />
              <SubItem label="Jobs" path="/SuperAdmin/Jobs" />
              <SubItem label="Users" path="/SuperAdmin/Users" />
            </div>
          )}
        </div>

        {/* BILLING */}
        <SidebarItem
          label="Billing & Subscription"
          path="/SuperAdmin/billing"
          icon={billingIcon}
        />

        {/* SETTINGS */}
        <SidebarItem
          label="System Settings"
          path="/SuperAdmin/SystemSettings"
          icon={settingsIcon}
        />

        {/* ACTIVITY LOGS (recommended add) */}
        <SidebarItem
          label="Activity Logs"
          path="/SuperAdmin/AllActivities"
          icon={settingsIcon}
        />
        <SidebarItem
          label="Chatbot"
          path="/SuperAdmin/ChatBot"
          icon={settingsIcon}
        />

      </nav>

      {/* PROFILE */}
      <div className="mt-auto px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/SuperAdmin/profile")}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 w-full"
        >
          <img
            src={profile.avatar || defaultAvatar}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

/* 🔹 Sidebar Item */
function SidebarItem({ label, path, icon }) {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname.startsWith(path);

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition
        ${active ? "bg-[#24698B] text-white" : "text-gray-600 hover:bg-gray-100"}
      `}
    >
      <img
        src={icon}
        className={`w-5 h-5 ${active ? "brightness-0 invert" : "opacity-80"}`}
      />
      <span className="font-semibold">{label}</span>
    </button>
  );
}

/* 🔹 Sub Item */
function SubItem({ label, path }) {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition
        ${active ? "text-[#24698B] font-semibold" : "text-gray-500 hover:text-black"}
      `}
    >
      {label}
    </button>
  );
}

export default Sidebar;