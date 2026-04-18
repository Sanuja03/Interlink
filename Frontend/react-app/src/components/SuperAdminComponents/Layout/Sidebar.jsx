import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import interlink from "../../../assets/interlink.png";
import dashboardIcon from "../../../assets/dashboard.png";
import billingIcon from "../../../assets/billing.png";
import settingsIcon from "../../../assets/settings.png";
import defaultAvatar from "../../../assets/default-avatar.png";
import RecentActivities from "../../../assets/RecentActivities.png";
import ChatBot from "../../../assets/ChatBot.png";
import SupportTickets from "../../../assets/SupportTickets.png";

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
        <a href="/admin/dashboard">
          <img src={interlink} alt="logo" className="w-40 h-20 object-contain" />
        </a>
      </div>

      {/* NAVIGATION */}
      <nav className="px-3 space-y-2">

        {/* DASHBOARD MAIN */}
        <div>
          <button
            onClick={() => setOpenDashboard(!openDashboard)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition
              ${isActive("/admin/dashboard") || isActive("/admin/Companies") || isActive("/admin/Interviews") || isActive("/admin/Jobs") || isActive("/admin/Users")? "bg-gray-100 text-[#24698B] font-semibold" : "text-gray-500 hover:text-black"}
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
                ${isActive("/admin/") ? "opacity-100" : ""}
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
              <SubItem label="Overview" path="/admin/dashboard" />
              <SubItem label="Companies" path="/admin/Companies" />
              <SubItem label="Interviews" path="/admin/Interviews" />
              <SubItem label="Jobs" path="/admin/Jobs" />
              <SubItem label="Users" path="/admin/Users" />
            </div>
          )}
        </div>

        {/* BILLING */}
        <SidebarItem
          label="Billing & Subscription"
          path="/admin/subscription-plans"
          icon={billingIcon}
        />

        {/* SETTINGS */}
        <SidebarItem
          label="System Settings"
          path="/admin/SystemSettings"
          icon={settingsIcon}
        />

        {/* ACTIVITY LOGS (recommended add) */}
        <SidebarItem
          label="Activity Logs"
          path="/admin/AllActivities"
          icon={RecentActivities}
        />
        <SidebarItem
          label="Chatbot"
          path="/admin/ChatBot"
          icon={ChatBot}
        />
        <SidebarItem
          label="Support tickets"
          path="/admin/tickets"
          icon={SupportTickets}
        />
        

      </nav>

      {/* PROFILE */}
      <div className="mt-auto px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/admin/profile")}
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
        ${active ? "bg-gray-100 text-[#24698B] font-semibold" : "text-gray-500 hover:text-black"}
      `}
    >
      <img
        src={icon}
        className={`w-5 h-5 ${active ? "opacity-80" : "opacity-50"}`}
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