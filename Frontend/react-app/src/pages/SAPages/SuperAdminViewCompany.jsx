import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";
import {getCompanyById,suspendCompany,restoreCompany,flagCompany,unflagCompany,} from "../../api/SAdminCompanyApi";
import { showSuccess } from "../../components/SuperAdminComponents/SAToast";
import toast from "react-hot-toast";
import { useCallback } from "react";

export default function SuperAdminViewCompany() {
  const { id } = useParams();

  const [actionLoading, setActionLoading] = useState(false);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

    const fetchCompany = useCallback(async () => {
      try {
        const data = await getCompanyById(id);
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    }, [id]);

    useEffect(() => {fetchCompany();}, [fetchCompany]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      if (isSuspended){ await restoreCompany(id);
      showSuccess("Company is Restored");}
      else{ await suspendCompany(id);
      toast("Company suspended", {
        style: {
          background: "#ef4444", // red-500
          color: "#fff",
        },
        icon: "⚠️",
      });}
      fetchCompany(); 
    }
    finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
  setActionLoading(true);
  try {
    if (isFlagged){ await unflagCompany(id);
    showSuccess("Company is Unflagged");}
    else {await flagCompany(id);
      toast("Company flagged", {
        style: {
          background: "#facc15", // yellow-400
          color: "#000",
        },
        icon: "🚩",
      });}
    fetchCompany();
  } finally {
    setActionLoading(false);
  }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!company) return <p className="p-6">Company not found</p>;

  const isFlagged = company.companyActivityStatus === "flagged";
  const isSuspended = company.companyActivityStatus === "suspended";

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      <BackButton label="Back to Companies" to="/admin/Companies" />

      {/* HEADER */}
      <div className="bg-[#24698B] p-6 rounded-xl shadow">
        <div className="bg-white rounded-xl p-4 flex justify-between items-center">

          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              LOGO
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                {company.companyName}
              </h2>

              <p className="text-sm text-gray-500">
                {company.industry}
              </p>

              <div className="text-xs text-gray-500 flex gap-4 mt-1">
                <span>{company.companyEmail}</span>
                <span>{company.companyLocation}</span>
              </div>
            </div>
          </div>

          {/* STATUS BADGES */}
          <div className="text-right space-y-1">
            <StatusBadge type="status" value={company.companyStatus} />
            <StatusBadge type="activity" value={company.companyActivityStatus} />
          </div>

        </div>
      </div>

      {/*  PENDING VIEW */}
      {company.companyStatus === "pending" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">

          <h3 className="text-[#24698B] font-semibold">
            Review Company
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem label="Industry" value={company.industry} />
            <InfoItem label="Company Size" value={company.companySize} />
            <InfoItem label="Location" value={company.companyLocation} />
            <InfoItem label="Email" value={company.companyEmail} />
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full">
              Approve
            </button>

            <button className="bg-red-500 text-white px-6 py-2 rounded-full">
              Reject
            </button>
          </div>

        </div>
      )}

      {/* 🟢 APPROVED VIEW */}
      {company.companyStatus === "approved" && (
        <>
          {/* SUMMARY CARD */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-[#24698B] font-semibold mb-4">
              Company Summary
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="Industry" value={company.industry} />
              <InfoItem label="Company Size" value={company.companySize} />
              <InfoItem label="Location" value={company.companyLocation} />
              <InfoItem label="Status" value={company.companyStatus} />
              <InfoItem label="Activity" value={company.companyActivityStatus || "normal"} />
            </div>
          </div>

          {/* JOBS */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-[#24698B] font-semibold mb-4">
              Jobs Posted by the Company
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {company.jobs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No jobs posted yet
                </p>
              ) : (
                company.jobs.map((job, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[#24698B]/10 p-3 rounded-lg"
                  >
                    <div>
                      <h4 className="text-sm font-semibold">
                        {job.title}
                      </h4>

                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(job.createdAt)} • {job.employmentType}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        job.status === "OPEN"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-center gap-4">

            {/* Suspend / Restore */}
            <button
              onClick={handleSuspend}
              disabled={actionLoading}
              className={`px-6 py-2 rounded-full text-white ${
                actionLoading ? "bg-gray-400" : "bg-red-500"
              }`}
            >
              {actionLoading ? "Processing..." : isSuspended ? "Restore Company" : "Suspend Company"}
            </button>

            {/* Flag / Unflag */}
            <button
              onClick={handleFlag}
              disabled={actionLoading || isSuspended}   // disable flagging if company is suspended
              className={`px-6 py-2 rounded-full ${
                actionLoading || isSuspended
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
            >
              {actionLoading
                ? "Processing..."
                : isFlagged
                ? "Unflag Company"
                : "Flag Company"}
            </button>

          </div>
        </>
      )}
    </div>
  );
}

/* 🔹 SMALL COMPONENTS */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ type, value }) {
  if (!value) return null;

  const styles = {
    approved: "bg-green-100 text-green-600",
    pending: "bg-yellow-100 text-yellow-600",
    rejected: "bg-red-100 text-red-600",
    flagged: "bg-yellow-200 text-yellow-800",
    suspended: "bg-red-200 text-red-800",
    normal: "bg-gray-200 text-gray-600",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[value] || styles.normal}`}>
      {type === "status" ? "Status" : "Activity"}: {value}
    </span>
  );
}

/* 🔹 TIME FORMAT */
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + " mins ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";

  return Math.floor(diff / 86400) + " days ago";
}