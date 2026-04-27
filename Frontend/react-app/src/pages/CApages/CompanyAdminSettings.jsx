import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CompanyDetailsModal from "./CompanyDetailsModal";
import RolePermissionModal from "./RolePermissionModal";
import InterviewerManagementModal from "./InterviewerManagementModal";
import api from "../../lib/api";
import "./CompanyAdminSettings.css";

import defaultAvatar from "../../assets/images/default-avatar.png";

export default function CompanyAdminSettings() {
  const [openCompanyDetails, setOpenCompanyDetails] = useState(false);
  const [openRolePerm, setOpenRolePerm] = useState(false);
  const [openInterviewerManagement, setOpenInterviewerManagement] = useState(false);
  const [companyName, setCompanyName] = useState("Company Admin Settings");
  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId) return;

    api
      .get(`/company/${companyId}/details`)
      .then((res) => {
        const data = res.data;
        setCompanyName(data.companyName || "Company Admin Settings");
        setCompanyLogo(data.logoUrl || null);
      })
      .catch((err) => console.error("Failed to load company info:", err));
  }, []);

  const items = [
    {
      title: "Edit Company Details",
      desc: "Manage Name, Location, Industry",
      icon: "🏢",
      action: () => setOpenCompanyDetails(true),
    },
    {
      title: "Interviewer Management",
      desc: "Manage interviewers available for scheduling interviews.",
      icon: "🧑‍💼",
      action: () => setOpenInterviewerManagement(true),
    },
  ];

  return (
    <>
      <DashboardLayout>
        <div className="cas-page">
          <div className="cas-container">

            {/* Company Logo + Name Header */}
            <div className="cas-header">
              <img
                className="cas-company-logo"
                src={companyLogo || defaultAvatar}
                alt="Company"
              />
              <h1 className="cas-title">{companyName}</h1>
            </div>

            <div className="cas-list">
              {items.map((it) => (
                <button
                  key={it.title}
                  className="cas-card"
                  type="button"
                  onClick={it.action}
                >
                  <span className="cas-bar" />
                  <span className="cas-icon">{it.icon}</span>
                  <span className="cas-content">
                    <span className="cas-cardTitle">{it.title}</span>
                    <span className="cas-cardDesc">{it.desc}</span>
                  </span>
                  <span className="cas-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>

      <CompanyDetailsModal
        open={openCompanyDetails}
        onClose={() => {
          setOpenCompanyDetails(false);
          // Refresh company name/logo after save
          const companyId = localStorage.getItem("companyId");
          if (companyId) {
            api.get(`/company/${companyId}/details`).then((res) => {
              setCompanyName(res.data.companyName || "Company");
              setCompanyLogo(res.data.logoUrl || null);
            });
          }
        }}
      />

      <InterviewerManagementModal
        open={openInterviewerManagement}
        onClose={() => setOpenInterviewerManagement(false)}
      />

      <RolePermissionModal
        open={openRolePerm}
        onClose={() => setOpenRolePerm(false)}
      />
    </>
  );
}