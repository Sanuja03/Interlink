import React from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import notificationicon from "../../../assets/notification.png";
import Footer from "./Footer";
import { useAuth } from "../../../context/Authcontext";



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

          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout}>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                        bg-red-50 text-red-600 text-xs font-semibold
                        hover:bg-red-100 transition duration-200
                        cursor-pointer
                        focus:outline-none focus:ring-0 active:outline-none
                        outline-none border-none">

            <svg xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>

            Logout
          </button>
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
