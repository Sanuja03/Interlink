import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CompanyDetailsModal from "./CompanyDetailsModal";
import RolePermissionModal from "./RolePermissionModal";
import InterviewerManagementModal from "./InterviewerManagementModal";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
import "./CompanyAdminSettings.css";
import defaultAvatar from "../../assets/images/default-avatar.png";

export default function CompanyAdminSettings() {
  const [openCompanyDetails, setOpenCompanyDetails] = useState(false);
  const [openRolePerm, setOpenRolePerm] = useState(false);
  const [openInterviewerManagement, setOpenInterviewerManagement] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState("Company Admin Settings");
  const [companyLogo, setCompanyLogo] = useState(null);

  const fetchCompanyDetails = async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/company/${id}/details`);
      setCompanyName(res.data.companyName || "Company Admin Settings");
      setCompanyLogo(res.data.logoUrl || null);
    } catch (err) {
      console.error("Failed to load company info:", err);
    }
  };

  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setCompanyId(data.company_id);
        fetchCompanyDetails(data.company_id);
      }
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
          fetchCompanyDetails(companyId);
        }}
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