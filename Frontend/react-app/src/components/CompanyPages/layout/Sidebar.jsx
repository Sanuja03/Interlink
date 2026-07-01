import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";

import api from "../../../lib/api";
import { supabase } from "../../../lib/supabase";

import logo from "../../../assets/footer/logo.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";

import dashboardIcon from "../../../assets/icons/dashboard.png";
import fileIcon from "../../../assets/icons/file.png";

export default function Sidebar() {
  const [openManage, setOpenManage] = useState(true);

  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("Company");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyWebsite, setCompanyWebsite] = useState("");

  useEffect(() => {
    const loadCompany = async () => {
      let companyId = localStorage.getItem("companyId");

      if (!companyId) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user?.id) {
            const { data } = await supabase
              .from("companies")
              .select("company_id")
              .eq("user_id", session.user.id)
              .single();

            if (data?.company_id) {
              companyId = data.company_id;
              localStorage.setItem("companyId", companyId);
            }
          }
        } catch (err) {
          console.error("Failed to fetch companyId:", err);
          return;
        }
      }

      if (!companyId) return;

      api
        .get(`/company/${companyId}/details`)
        .then((res) => {
          const data = res.data;
          setCompanyName(data.companyName || "Company");
          setCompanyLogo(data.logoUrl || null);
          setCompanyWebsite(data.website || "");
        })
        .catch((err) =>
          console.error("Failed to load company details:", err)
        );
    };

    loadCompany();
  }, []);

  return (
    <div className="sb">
      {/* ================= Logo ================= */}
      <div className="sb-logo-area">
        <img
          src={logo}
          alt="Interlink"
          className="sb-logo"
          onClick={() => navigate("/company/dashboard")}
        />
      </div>

      {/* ================= Navigation ================= */}
      <nav className="sb-nav">
        <NavLink
          to="/company/dashboard"
          className={({ isActive }) =>
            isActive ? "sb-link sb-active" : "sb-link"
          }
        >
          <img src={dashboardIcon} className="sb-icon" alt="" />
          <span>Dashboard</span>
        </NavLink>

        {/* ================= Management ================= */}
        <button
          className="sb-dropdown-btn"
          onClick={() => setOpenManage(!openManage)}
        >
          <div className="sb-dropdown-left">
            <img src={fileIcon} className="sb-icon" alt="" />
            <span>Management</span>
          </div>
          <span className={openManage ? "sb-arrow open" : "sb-arrow"}>
            ▾
          </span>
        </button>

        {openManage && (
          <div className="sb-submenu">
            <NavLink
              to="/company/application-management"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Application Management
            </NavLink>

            <NavLink
              to="/company/job-management"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Job Management
            </NavLink>

            <NavLink
              to="/company/create-job"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Create Job
            </NavLink>

            <NavLink
              to="/company/shortlisted"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Shortlisted
            </NavLink>

            {/* ── NEW ── */}
            <NavLink
              to="/company/interview-summary"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Interview Summary
            </NavLink>

            <NavLink
              to="/company/settings"
              className={({ isActive }) =>
                isActive ? "sb-sublink sb-sub-active" : "sb-sublink"
              }
            >
              Company Settings
            </NavLink>
          </div>
        )}
      </nav>

      {/* ================= Bottom Company Card ================= */}
      <div
        className="sb-company"
        onClick={() => navigate("/company/settings")}
        title="Company Settings"
      >
        <img
          src={companyLogo || defaultAvatar}
          alt="Company"
          className="sb-company-avatar"
        />
        <div className="sb-company-info">
          <div className="sb-company-name">{companyName}</div>
          <div className="sb-company-email">{companyWebsite}</div>
        </div>
      </div>
    </div>
  );
}