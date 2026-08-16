import "./Sidebar.css";

import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import api from "../../../lib/api";
import { supabase } from "../../../lib/supabase";

import logo from "../../../assets/footer/logo.png";
import defaultAvatar from "../../../assets/images/default-avatar.png";
import dashboardIcon from "../../../assets/icons/dashboard.png";
import fileIcon from "../../../assets/icons/file.png";
import ChatBot from "../../../assets/ChatBot.png";

const Sidebar = () => {
  const navigate = useNavigate();

  const [openManage, setOpenManage] = useState(true);

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

  // Management dropdown sub-items (company-specific data).
  // "Interviewer Management" is now its own page (/company/interviewer-management),
  // so it's a plain route like everything else here.
  const managementSubItems = [
    { label: "Application Management", href: "/company/application-management" },
    { label: "Job Management", href: "/company/job-management" },
    { label: "Create Job", href: "/company/create-job" },
    { label: "Shortlisted", href: "/company/shortlisted" },
    { label: "Interview Summary", href: "/company/interview-summary" },
    { label: "Interviewer Management", href: "/company/interviewer-management" },
    { label: "Company Settings", href: "/company/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="Interlink logo"
          onClick={() => navigate("/company/dashboard")}
          style={{ cursor: "pointer" }}
        />
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/company/dashboard"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <img src={dashboardIcon} alt="Dashboard icon" />
          <span>Dashboard</span>
        </NavLink>

        <div>
          <div
            onClick={() => setOpenManage((prev) => !prev)}
            className="sidebar-item"
          >
            <img src={fileIcon} alt="Management icon" />
            <span style={{ flex: 1 }}>Management</span>
            <span
              style={{
                fontSize: 12,
                transform: openManage ? "rotate(90deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              ›
            </span>
          </div>

          {openManage && (
            <div className="sidebar-submenu">
              {managementSubItems.map((sub) => (
                <NavLink
                  key={sub.href}
                  to={sub.href}
                  className={({ isActive }) =>
                    `sidebar-subitem ${isActive ? "active" : ""}`
                  }
                >
                  {sub.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <NavLink
          to="/company/chatbot"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <img src={ChatBot} alt="Chatbot icon" />
          <span>Chatbot</span>
        </NavLink>
      </nav>

      <div className="sidebar-profile">
        <Link to="/company/settings">
          <img
            src={companyLogo || defaultAvatar}
            alt={companyName}
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
          <div className="sidebar-profile-text">
            <p className="sidebar-profile-name">{companyName}</p>
            <p className="sidebar-profile-email">{companyWebsite}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;