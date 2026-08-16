import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ADDED
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CompanyDetailsModal from "./CompanyDetailsModal";
import RolePermissionModal from "./RolePermissionModal";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
import "./CompanyAdminSettings.css";
import defaultAvatar from "../../assets/images/default-avatar.png";

export default function CompanyAdminSettings() {
  const [openCompanyDetails, setOpenCompanyDetails] = useState(false);
  const [openRolePerm, setOpenRolePerm] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState("Company Admin Settings");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  // ADDED
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  // END ADDED

  const fetchCompanyDetails = async (id) => {
    if (!id) return;
    setDetailsLoading(true);
    try {
      const res = await api.get(`/company/${id}/details`);
      setCompanyName(res.data.companyName || "Company Admin Settings");
      setCompanyLogo(res.data.logoUrl || null);
      setCompanyDetails(res.data);
    } catch (err) {
      console.error("Failed to load company info:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ADDED
  const fetchSubscription = async (id) => {
    if (!id) return;
    setSubLoading(true);
    try {
      const res = await api.get(`/active-subscriptions/company/${id}`);
      setSubscription(res.data);
    } catch (err) {
      console.error("Failed to load subscription info:", err);
    } finally {
      setSubLoading(false);
    }
  };
  // END ADDED

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
        fetchSubscription(data.company_id); // ADDED
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
  ];

  const summaryFields = [
    { label: "Company Name", value: companyDetails?.companyName },
    { label: "Industry", value: companyDetails?.industry },
    { label: "Company Size", value: companyDetails?.companySize },
    { label: "Location", value: companyDetails?.companyLocation },
    { label: "Company Email", value: companyDetails?.companyEmail },
    { label: "Website", value: companyDetails?.website },
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

            {/* Current Company Details Summary */}
            <div className="cas-summary">
              <h2 className="cas-summaryTitle">Company Details</h2>

              {detailsLoading ? (
                <p className="cas-summaryEmpty">Loading company details...</p>
              ) : (
                <div className="cas-summaryGrid">
                  {summaryFields.map((f) => (
                    <div className="cas-summaryItem" key={f.label}>
                      <span className="cas-summaryLabel">{f.label}</span>
                      <span className="cas-summaryValue">{f.value || "—"}</span>
                    </div>
                  ))}

                  <div className="cas-summaryItem cas-summaryItem--full">
                    <span className="cas-summaryLabel">About the Company</span>
                    <span className="cas-summaryValue">
                      {companyDetails?.about || "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ADDED: Subscription Summary */}
            <div className="cas-summary">
              <h2 className="cas-summaryTitle">Subscription</h2>

              {subLoading ? (
                <p className="cas-summaryEmpty">Loading subscription details...</p>
              ) : subscription ? (
                <div className="cas-summaryGrid">
                  <div className="cas-summaryItem">
                    <span className="cas-summaryLabel">Plan</span>
                    <span className="cas-summaryValue">{subscription.planName}</span>
                  </div>

                  <div className="cas-summaryItem">
                    <span className="cas-summaryLabel">Status</span>
                    <span
                      className={`cas-subStatus ${
                        subscription.status === "Expired"
                          ? "cas-subStatus--expired"
                          : "cas-subStatus--active"
                      }`}
                    >
                      ● {subscription.status}
                    </span>
                  </div>

                  <div className="cas-summaryItem cas-summaryItem--full">
                    <span className="cas-summaryLabel">Expires</span>
                    <span className="cas-summaryValue">
                      {subscription.planName === "Free" || !subscription.endDate
                        ? "—"
                        : subscription.endDate}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="cas-summaryEmpty">No subscription found.</p>
              )}

              <Link to="/company/subscription-plans" className="cas-subLink">
                View plans & pricing →
              </Link>
            </div>
            {/* END ADDED */}

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
      <RolePermissionModal
        open={openRolePerm}
        onClose={() => setOpenRolePerm(false)}
      />
    </>
  );
}