import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

import logo from "../../assets/footer/logo.png";
import defaultAvatar from "../../assets/images/default-avatar.png";

// ICONS
import dashboardIcon from "../../assets/icons/dashboard.png";
import fileIcon from "../../assets/icons/file.png";
import settingsIcon from "../../assets/icons/settings.png";

export default function Sidebar() {
  const [openManage, setOpenManage] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleManageClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => setOpenManage(true), 200);
    } else {
      setOpenManage((s) => !s);
    }
  };

  return (
    <div className={collapsed ? "sb collapsed" : "sb"}>

      <div className="sb-toggle">
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <div className="sb-top">
        <img
          className={collapsed ? "sb-logo small" : "sb-logo"}
          src={logo}
          alt="Interlink"
        />
      </div>

      <nav className="sb-nav">

        <NavLink to="/" className="sb-link">
          <img src={dashboardIcon} className="sb-iconImg" />
          {!collapsed && "Dashboard"}
        </NavLink>

        <button className="sb-dropBtn" onClick={handleManageClick}>
          <img src={fileIcon} className="sb-iconImg" />
          {!collapsed && "Management"}

          {!collapsed && (
            <span className={openManage ? "sb-arrow sb-arrowOpen" : "sb-arrow"}>
              ›
            </span>
          )}
        </button>

        {openManage && !collapsed && (
          <div className="sb-sub">
            <NavLink to="/application-management" className="sb-sublink">
              Application Management
            </NavLink>

            <NavLink to="/job-management" className="sb-sublink">
              Job Management
            </NavLink>

            <NavLink to="/create-job" className="sb-sublink">
              Create Job
            </NavLink>

            <NavLink to="/shortlisted-candidates" className="sb-sublink">
              Shortlisted
            </NavLink>
          </div>
        )}

        <NavLink to="/company-admin-settings" className="sb-link">
          <img src={settingsIcon} className="sb-iconImg" />
          {!collapsed && "Settings"}
        </NavLink>
      </nav>

      <div className="sb-logout">
        <button
          onClick={() => {
            alert("Logged out");
            navigate("/");
          }}
        >
          <span>⎋</span>
          {!collapsed && "Logout"}
        </button>
      </div>

      {!collapsed && (
        <div className="sb-bottom">
          <img className="sb-bottomAvatar" src={defaultAvatar} />
          <div className="sb-bottomText">
            <div className="sb-bottomName">Horizon Global</div>
            <div className="sb-bottomMail">horizonglobal.com</div>
          </div>
        </div>
      )}
    </div>
  );
}