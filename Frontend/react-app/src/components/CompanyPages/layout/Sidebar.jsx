import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";

import { useAuth } from "../../../context/Authcontext";
import api from "../../../lib/api";

import logo from "../../../assets/footer/logo.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";

import dashboardIcon from "../../../assets/icons/dashboard.png";
import fileIcon from "../../../assets/icons/file.png";

export default function Sidebar() {
  const [openManage, setOpenManage] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState("Company");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    api
      .get(`/company/${companyId}/details`)
      .then((res) => {
        const data = res.data;
        setCompanyName(data.companyName || "Company");
        setCompanyLogo(data.logoUrl || null);
        setCompanyWebsite(data.website || "");
      })
      .catch((err) => console.error("Failed to load company info:", err));
  }, []);

  const handleManageClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setTimeout(() => setOpenManage(true), 200);
    } else {
      setOpenManage((s) => !s);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
        <NavLink to="/company/dashboard" className="sb-link">
          <img src={dashboardIcon} className="sb-iconImg" alt="" />
          {!collapsed && "Dashboard"}
        </NavLink>

        <button className="sb-dropBtn" onClick={handleManageClick}>
          <img src={fileIcon} className="sb-iconImg" alt="" />
          {!collapsed && "Management"}
          {!collapsed && (
            <span className={openManage ? "sb-arrow sb-arrowOpen" : "sb-arrow"}>
              ›
            </span>
          )}
        </button>

        {openManage && !collapsed && (
          <div className="sb-sub">
            <NavLink to="/company/application-management" className="sb-sublink">
              Application Management
            </NavLink>
            <NavLink to="/company/job-management" className="sb-sublink">
              Job Management
            </NavLink>
            <NavLink to="/company/create-job" className="sb-sublink">
              Create Job
            </NavLink>
            <NavLink to="/company/shortlisted" className="sb-sublink">
                         Shortlisted
                       </NavLink>
          </div>
        )}
      </nav>

      <div className="sb-logout">
        <button onClick={handleLogout}>
          <span>⎋</span>
          {!collapsed && "Logout"}
        </button>
      </div>

      {!collapsed && (
        <div
          className="sb-bottom"
          onClick={() => navigate("/company/settings")}
          style={{ cursor: "pointer" }}
          title="Go to Company Settings"
        >
          <img
            className="sb-bottomAvatar"
            src={companyLogo || defaultAvatar}
            alt="Company"
          />
          <div className="sb-bottomText">
            <div className="sb-bottomName">{companyName}</div>
            <div className="sb-bottomMail">{companyWebsite}</div>
          </div>
        </div>
      )}
    </div>
  );
}