import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

import logo from "../../assets/footer/logo.png";
import defaultAvatar from "../../assets/images/default-avatar.png";

// ✅ ICONS
import dashboardIcon from "../../assets/icons/dashboard.png";
import fileIcon from "../../assets/icons/file.png";
import settingsIcon from "../../assets/icons/settings.png";

export default function Sidebar() {
  const [openManage, setOpenManage] = useState(true);

  return (
    <div className="sb">
      {/* Top logo */}
      <div className="sb-top">
        <img className="sb-logo" src={logo} alt="Interlink" />
      </div>

      {/* Menu */}
      <nav className="sb-nav">
        
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "sb-link sb-active" : "sb-link"
          }
        >
          <img src={dashboardIcon} alt="Dashboard" className="sb-iconImg" />
          Dashboard
        </NavLink>

        {/* Dropdown */}
        <button
          className="sb-dropBtn"
          onClick={() => setOpenManage((s) => !s)}
          type="button"
        >
          <img src={fileIcon} alt="Management" className="sb-iconImg" />
          Management
          <span className={openManage ? "sb-arrow sb-arrowOpen" : "sb-arrow"}>
            ›
          </span>
        </button>

        {openManage && (
          <div className="sb-sub">
            <NavLink
              to="/application-management"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-subActive" : "sb-sublink"
              }
            >
              Application Management
            </NavLink>

            <NavLink
              to="/job-management"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-subActive" : "sb-sublink"
              }
            >
              Job Management
            </NavLink>

            <NavLink
              to="/create-job"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-subActive" : "sb-sublink"
              }
            >
              Create Job
            </NavLink>
          </div>
        )}

        {/* Settings */}
        <NavLink
          to="/company-admin-settings"
          className={({ isActive }) =>
            isActive ? "sb-link sb-active" : "sb-link"
          }
        >
          <img src={settingsIcon} alt="Settings" className="sb-iconImg" />
          Settings
        </NavLink>
      </nav>

      {/* Bottom company info */}
      <div className="sb-bottom">
        <img
          className="sb-bottomAvatar"
          src={defaultAvatar}
          alt="Company"
        />
        <div className="sb-bottomText">
          <div className="sb-bottomName">Horizon Global</div>
          <div className="sb-bottomMail">horizonglobal.com</div>
        </div>
      </div>
    </div>
  );
}