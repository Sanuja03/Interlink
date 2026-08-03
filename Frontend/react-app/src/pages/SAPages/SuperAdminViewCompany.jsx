import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";
import { getCompanyById, suspendCompany, restoreCompany, flagCompany, unflagCompany } from "../../api/SAdminCompanyApi";
import { showSuccess } from "../../components/SuperAdminComponents/SAToast";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function SuperAdminViewCompany() {
  const { id } = useParams();
  const { appUser } = useAuth();

  const [company,       setCompany]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      if (isSuspended) {
        await restoreCompany(id);
        await createActivityLog({
          userId:      appUser?.id   ?? null,
          userRole:    appUser?.role ?? "UNKNOWN",
          action:      "RESTORE",
          entityType:  "COMPANY",
          description: `Restored company: ${company?.companyName ?? id}`,
        });
        showSuccess("Company is Restored");
      } else {
        await suspendCompany(id);
        await createActivityLog({
          userId:      appUser?.id   ?? null,
          userRole:    appUser?.role ?? "UNKNOWN",
          action:      "SUSPEND",
          entityType:  "COMPANY",
          description: `Suspended company: ${company?.companyName ?? id}`,
        });
        toast("Company suspended", {
          style: { background: "#ef4444", color: "#fff" },
          icon: "⚠️",
        });
      }
      fetchCompany();
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    setActionLoading(true);
    try {
      if (isFlagged) {
        await unflagCompany(id);
        await createActivityLog({
          userId:      appUser?.id   ?? null,
          userRole:    appUser?.role ?? "UNKNOWN",
          action:      "UNFLAG",
          entityType:  "COMPANY",
          description: `Unflagged company: ${company?.companyName ?? id}`,
        });
        showSuccess("Company is Unflagged");
      } else {
        await flagCompany(id);
        await createActivityLog({
          userId:      appUser?.id   ?? null,
          userRole:    appUser?.role ?? "UNKNOWN",
          action:      "FLAG",
          entityType:  "COMPANY",
          description: `Flagged company: ${company?.companyName ?? id}`,
        });
        toast("Company flagged", {
          style: { background: "#facc15", color: "#000" },
          icon: "🚩",
        });
      }
      fetchCompany();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)   return <p className="p-6">Loading...</p>;
  if (!company)  return <p className="p-6">Company not found</p>;

  const isFlagged   = company.companyActivityStatus === "flagged";
  const isSuspended = company.companyActivityStatus === "suspended";

  return (
    <div className="tw-preflight p-6 bg-gray-100 min-h-screen space-y-6">
      <BackButton label="Back to Companies" to="/admin/Companies" />

      {/* HEADER */}
      <div className="bg-[#24698B] p-6 rounded-xl shadow">
        <div className="bg-white rounded-xl p-4 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              LOGO
            </div>
            <div>
              <h2 className="font-semibold text-lg">{company.companyName}</h2>
              <p className="text-sm text-gray-500">{company.industry}</p>
              <div className="text-xs text-gray-500 flex gap-4 mt-1">
                <span>{company.companyEmail}</span>
                <span>{company.companyLocation}</span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <StatusBadge type="status"   value={company.companyStatus} />
            <StatusBadge type="activity" value={company.companyActivityStatus} />
          </div>
        </div>
      </div>

      {/* PENDING VIEW */}
      {company.companyStatus === "pending" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="text-[#24698B] font-semibold">Review Company</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoItem label="Industry"     value={company.industry} />
            <InfoItem label="Company Size" value={company.companySize} />
            <InfoItem label="Location"     value={company.companyLocation} />
            <InfoItem label="Email"        value={company.companyEmail} />
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded-full">Approve</button>
            <button className="bg-red-500 text-white px-6 py-2 rounded-full">Reject</button>
          </div>
        </div>
      )}

      {/* APPROVED VIEW */}
      {company.companyStatus === "approved" && (
        <>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-[#24698B] font-semibold mb-4">Company Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoItem label="Industry"     value={company.industry} />
              <InfoItem label="Company Size" value={company.companySize} />
              <InfoItem label="Location"     value={company.companyLocation} />
              <InfoItem label="Status"       value={company.companyStatus} />
              <InfoItem label="Activity"     value={company.companyActivityStatus || "normal"} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-[#24698B] font-semibold mb-4">Jobs Posted by the Company</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {company.jobs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No jobs posted yet</p>
              ) : (
                company.jobs.map((job, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#24698B]/10 p-3 rounded-lg">
                    <div>
                      <h4 className="text-sm font-semibold">{job.title}</h4>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(job.createdAt)} · {job.employmentType}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      job.status === "OPEN" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">

            {/* Suspend / Restore — outlined green when restoring */}
            {isSuspended ? (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="bg-white border border-green-500 text-green-600 hover:bg-green-50
                          disabled:opacity-50 disabled:cursor-not-allowed
                          px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {actionLoading ? "Processing..." : "Restore Company"}
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400
                          text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {actionLoading ? "Processing..." : "Suspend Company"}
              </button>
            )}

            {/* Flag / Unflag — outlined yellow when unflagging */}
            <button
              onClick={handleFlag}
              disabled={actionLoading || isSuspended}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isFlagged
                            ? "bg-white border border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                            : "bg-yellow-400 hover:bg-yellow-500 text-white"
                          }`}
            >
              {actionLoading ? "Processing..." : isFlagged ? "Unflag Company" : "Flag Company"}
            </button>

          </div>
        </>
      )}
    </div>
  );
}

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
    approved:  "bg-green-100 text-green-600",
    pending:   "bg-yellow-100 text-yellow-600",
    rejected:  "bg-red-100 text-red-600",
    flagged:   "bg-yellow-200 text-yellow-800",
    suspended: "bg-red-200 text-red-800",
    normal:    "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[value] || styles.normal}`}>
      {type === "status" ? "Status" : "Activity"}: {value}
    </span>
  );
}

function formatTimeAgo(dateString) {
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return Math.floor(diff / 60)   + " mins ago";
  if (diff < 86400) return Math.floor(diff / 3600)  + " hrs ago";
  return Math.floor(diff / 86400) + " days ago";
}