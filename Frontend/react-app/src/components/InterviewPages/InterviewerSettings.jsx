import React, { useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import CompanyDetailsModal from "./CompanyDetailsModal";
import RolePermissionModal from "./RolePermissionModal";
import "./InterviewerSettings.css";

const InterviewerSettings = () => {
  const [openCompanyDetails, setOpenCompanyDetails] = useState(false);
  const [openRolePerm, setOpenRolePerm] = useState(false);

  const items = [
    {
      title: "Edit Company Details",
      desc: "Manage Name, Location, Industry",
      icon: "🏢",
      action: () => setOpenCompanyDetails(true),
    },

    {
      title: "Role-Based Permission Settings",
      desc: "Manage Roles & Permissions",
      icon: "🔒",
      action: () => setOpenRolePerm(true),
    },
  ];

  return (
    <>
      <DashboardLayout>
        <div className="settings-page">
          <h1 className="settings-title">Settings</h1>

          <div className="settings-card">
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
        onClose={() => setOpenCompanyDetails(false)}
      />

      <RolePermissionModal
        open={openRolePerm}
        onClose={() => setOpenRolePerm(false)}
      />
    </>
  );
};

export default InterviewerSettings;