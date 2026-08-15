//Interviewer dahboard layout

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import { useEffect } from "react";               // ✅ add
import api from "../../../lib/api";              // ✅ add

import Sidebar from "./Sidebar";
import Footer from "./Footer";
import FloatingAvailabilityBtn from "./FloatingAvailabilityBtn";
import notificationicon from "../../../assets/notificationicon.png";
import NotificationBell from "../../shared/NotificationBell";

const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout} = useAuth();

  // ✅ NEW: load correct companyId
  useEffect(() => {
    const loadCompanyId = async () => {
      try {
        const res = await api.get("/auth/me");

        if (res.data?.companyId) {
          localStorage.setItem("companyId", res.data.companyId);
        } else {
          localStorage.removeItem("companyId");
        }

      } catch (err) {
        console.error("Failed to fetch companyId:", err);
      }
    };

    loadCompanyId();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();

      // ✅ clear companyId on logout
      localStorage.removeItem("companyId");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">

      {/* sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </aside>

      {/* main content */}
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >

        {/* top bar */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 sticky top-0 z-40">

          {/* notification */}
            <NotificationBell />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                        bg-red-50 text-red-600 text-xs font-semibold
                        hover:bg-red-100 transition duration-200
                        cursor-pointer
                        focus:outline-none focus:ring-0 active:outline-none
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

        {/* page specific content */}
        <main className="flex-1">
          {children}
        </main>

        {/* footer */}
        <Footer />

      </div>

      {/* availability button */}
     {/* only show for interviewers */}
    <FloatingAvailabilityBtn />

    </div>
  );
};

export default DashboardLayout;