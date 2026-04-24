import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CompanyDetailsModal from "./CompanyDetailsModal";
import RolePermissionModal from "./RolePermissionModal";
import InterviewerManagementModal from "./InterviewerManagementModal";
import { supabase } from "../../lib/supabase";
import "./CompanyAdminSettings.css";

export default function CompanyAdminSettings() {
  const [openCompanyDetails, setOpenCompanyDetails] = useState(false);
  const [openRolePerm, setOpenRolePerm] = useState(false);
  const [openInterviewerManagement, setOpenInterviewerManagement] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) setCompanyId(data.company_id);
    };
    fetchCompanyId();
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
        <div className="cas-page">
          <div className="cas-container">
            <h1 className="cas-title">Company Admin Settings</h1>
            <div className="cas-list">
              {items.map((it) => (
                <button key={it.title} className="cas-card" type="button" onClick={it.action}>
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

      <InterviewerManagementModal
        open={openInterviewerManagement}
        onClose={() => setOpenInterviewerManagement(false)}
        companyId={companyId}
      />

      <RolePermissionModal
        open={openRolePerm}
        onClose={() => setOpenRolePerm(false)}
      />
    </>
  );
}