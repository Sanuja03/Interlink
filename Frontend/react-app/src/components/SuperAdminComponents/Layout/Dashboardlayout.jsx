import React from "react";
import Sidebar from "./Sidebar";
import defaultAvatar from "../../../assets/default-avatar.png"
import notificationicon from "../../../assets/notification.png";
import Footer from "./Footer";

const SIDEBAR_WIDTH = 240; // w-60

const DashboardLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gray-50">

      {/* SIDEBAR (fixed) */}
      <aside
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ marginLeft: SIDEBAR_WIDTH }}>
        
        {/* TOP BAR (Notification + Profile) */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 sticky top-0 z-40">
  
            {/* Notification */}
            <img
                src={notificationicon}
                alt="Notifications"
                className="w-9 h-9 cursor-pointer opacity-80 hover:opacity-100"
            />

            {/* Profile block */}
            <div className="flex items-center gap-3 cursor-pointer">
                <img
                src={defaultAvatar}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border border-gray-300"
                />
                <span className="text-sm font-semibold text-gray-800">
                K. Perera
                </span>
            </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="p-6 min-h-screen">
          {children}
        </div>

         {/* FOOTER (global, reused) */}
         <div>
            <Footer />
         </div>
        
      </div>
    </div>
  );
};

export default DashboardLayout;