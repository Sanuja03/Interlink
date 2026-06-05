import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

import notificationicon from "../../../assets/icons/notificationicon.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationPopup from "./NotificationPopup";
import api from "../../../lib/api";

const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);
  const [companyName, setCompanyName] = useState("Company");
  const [companyLogo, setCompanyLogo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    api
      .get(`/company/${companyId}/details`)
      .then((res) => {
        const data = res.data;
        setCompanyName(data.companyName || "Company");
        setCompanyLogo(data.logoUrl || null);
      })
      .catch((err) => console.error("Failed to load company info:", err));
  }, []);

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

          <div
            className="dl-company"
            onClick={() => navigate("/company/settings")}
            style={{ cursor: "pointer" }}
            title="Go to Company Settings"
          >
            <img
              className="dl-avatar"
              src={companyLogo || defaultAvatar}
              alt="Company"
            />
            <span className="dl-companyName">{companyName}</span>
          </div>
        </div>

        <div className="dl-content">{children}</div>

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