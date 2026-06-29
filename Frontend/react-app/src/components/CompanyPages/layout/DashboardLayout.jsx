import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

import notificationicon from "../../../assets/icons/notificationicon.png";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import NotificationPopup from "./NotificationPopup";

const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      <aside className="dl-sidebar" style={{ width: SIDEBAR_WIDTH }}>
        <Sidebar />
      </aside>

      <main className="dl-main" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div className="dl-top">
          <img
            className="dl-noti"
            src={notificationicon}
            alt="Notifications"
            onClick={() => setShowPopup(true)}
            style={{ cursor: "pointer" }}
          />

          <button className="dl-logout" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="dl-logout-icon"
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

        <div className="dl-content">
          <div className="dl-page">
            {children}
          </div>
        </div>

        <NotificationPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onView={() => {
            setShowPopup(false);
            navigate("/company/candidate-history");
          }}
        />
      </main>
    </div>
  );
}
