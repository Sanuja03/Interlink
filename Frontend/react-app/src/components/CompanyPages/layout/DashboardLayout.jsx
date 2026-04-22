import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

// ✅ FIXED PATHS
import notificationicon from "../../../assets/icons/notificationicon.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";

import { useState } from "react";
import NotificationPopup from "./NotificationPopup";

const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({ children }) {

  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="dl-root">

      {/* Sidebar */}
      <aside className="dl-sidebar" style={{ width: SIDEBAR_WIDTH }}>
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="dl-main" style={{ marginLeft: SIDEBAR_WIDTH }}>

        {/* Top right row */}
        <div className="dl-top">

          {/* 🔔 Notification icon */}
          <img
            className="dl-noti"
            src={notificationicon}
            alt="Notifications"
            onClick={() => setShowPopup(true)}
            style={{ cursor: "pointer" }}
          />

          {/* Profile */}
          <div className="dl-company">
            <img className="dl-avatar" src={defaultAvatar} alt="Avatar" />
            <span className="dl-companyName">Horizon Global</span>
          </div>

        </div>

        {/* Page content */}
        <div className="dl-content">{children}</div>

        {/* 🔥 Notification Popup */}
        <NotificationPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onView={() => {
            setShowPopup(false);
            window.location.href = "/candidate-history";
          }}
        />

      </main>
    </div>
  );
}