import React from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/default-avatar.png";
import notificationicon from "../../../assets/notification.png";
import Footer from "./Footer";
import { useAuth } from "../../../context/Authcontext";

const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

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

        {/* TOP BAR */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 sticky top-0 z-40">

          {/* Notification */}
          <img
            src={notificationicon}
            alt="Notifications"
            className="w-9 h-9 cursor-pointer opacity-80 hover:opacity-100"
          />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
              bg-red-50 text-red-600 text-xs font-semibold
              hover:bg-red-100 transition duration-200
              cursor-pointer focus:outline-none active:outline-none
              outline-none border-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
            </svg>
            Logout
          </button>

        </div>

        {/* PAGE CONTENT */}
        <div className="p-6 min-h-screen">
          {children}
        </div>

        {/* FOOTER */}
        <div>
          <Footer />
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;