import React from "react";
import Sidebar from "./Sidebar";
import defaultAvatar from "../../../assets/default-avatar.png";
import notificationicon from "../../../assets/notification.png";
import Footer from "./Footer";



const DashboardLayout = ({ children }) => {
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className="bg-white border-r border-gray-200 h-full overflow-y-auto"
      >
        <Sidebar />
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* TOP BAR */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 border-b shrink-0">
          
          <img
            src={notificationicon}
            alt="Notifications"
            className="w-9 h-9 cursor-pointer opacity-80 hover:opacity-100"
          />

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

        {/* CONTENT + FOOTER WRAPPER */}
        <div className="flex flex-col flex-1 overflow-y-auto">

          {/* PAGE CONTENT */}
          <div className="flex-1 p-6">
            {children}
          </div>

          {/* FOOTER (sticks to bottom when content is short) */}
          <Footer />

        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
