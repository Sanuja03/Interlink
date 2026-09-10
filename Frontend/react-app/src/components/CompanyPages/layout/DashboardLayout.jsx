import "./DashboardLayout.css";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import NotificationBell from "../../shared/NotificationBell";

import notificationicon from "../../../assets/icons/notificationicon.png";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import NotificationPopup from "./NotificationPopup";

export default function DashboardLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Off-canvas sidebar state, used below the lg breakpoint only. On lg+
  // the sidebar is permanently docked and this is never read.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the drawer whenever the route changes, rather than wiring a
  // close callback into every nav link inside Sidebar.
  const [lastPathname, setLastPathname] = useState(location.pathname);
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setMobileNavOpen(false);
  }

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("companyId");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/");
    }
  };

  return (
    <div className="dl-root">
      <aside className={`dl-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <Sidebar />
      </aside>

      {/* backdrop — small screens only, while the drawer is open */}
      {mobileNavOpen && (
        <div
          className="dl-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="dl-main">
        {/* top bar — plain CSS, no Tailwind dependency */}
        <div className="dl-topbar">

          {/* hamburger — small screens only */}
          <button
            type="button"
            className="dl-hamburger"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="dl-topbar-actions">
            {/* notification */}
            <NotificationBell />

            <button onClick={handleLogout} className="dl-logout-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="dl-logout-btn-icon"
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
        </div>


        <div className="dl-content">
          {children}
        </div>

        {/* footer — sits inside the already-offset main column */}
        <Footer />


      </main>
    </div>
  );
}
