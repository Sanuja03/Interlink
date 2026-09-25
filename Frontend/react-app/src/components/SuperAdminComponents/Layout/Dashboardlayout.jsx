import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { useAuth } from "../../../context/Authcontext";
import NotificationBell from "../../shared/NotificationBell";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes, instead of wiring a
  // close callback into every nav link inside Sidebar. Done during render
  // (React's recommended way to adjust state when something changes) rather
  // than in a useEffect, so it doesn't cost an extra render pass.
  const [lastPathname, setLastPathname] = useState(location.pathname);
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setMobileNavOpen(false);
  }

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
    <div className="tw-preflight h-screen flex bg-gray-50 overflow-hidden">

      {/* SIDEBAR — static in the flow on lg+ screens (unchanged desktop
          behaviour); an off-canvas drawer below that, hidden by default and
          slid in via mobileNavOpen */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-full overflow-y-auto bg-white
          border-r border-gray-200 transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </aside>

      {/* Backdrop — narrow screens only, shown while the drawer is open */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* TOP BAR */}
        <div className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-b shrink-0">

          {/* Hamburger — narrow screens only */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition shrink-0"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">

            <NotificationBell />

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

        </div>

        {/* CONTENT + FOOTER WRAPPER */}
        <div className="flex flex-col flex-1 overflow-y-auto">

          {/* PAGE CONTENT */}
          <div className="flex-1 p-6">
            {children}
          </div>

          {/* FOOTER */}
          <Footer />

        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
