import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import UserActivityLog from "../../../components/SuperAdminComponents/Users/UserActivityLogs";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";
import { getUserProfile, suspendUser, restoreUser, flagUser, unflagUser } from "../../../api/SAdminUsersApi";
import { createActivityLog } from "../../../api/ActivityLogsApi";
import { useAuth } from "../../../context/Authcontext";

export default function CompanyAdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appUser } = useAuth(); // appUser.role reads from /auth/me (super_admin), not the JWT claim (authenticated)

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(id);
        // Redirect if this user belongs to a different role
        if (profile.role && profile.role !== "company_admin") {
          navigate(`/admin/User/${id}`);
          return;
        }
        setData(profile);
      } catch {
        setError("Failed to load company admin profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Log helper to avoid repeating the common fields
  const log = (action, description) =>
    createActivityLog({
      userId:      appUser?.userId ?? null,
      userRole:    appUser?.role   ?? "UNKNOWN",
      action,
      entityType:  "USER",
      description,
    });

  const handleSuspend = async () => {
    try {
      setActionLoading(true);
      await suspendUser(id);
      await log("SUSPEND", `Suspended company admin: ${data?.email ?? id}`);
      setData((prev) => ({ ...prev, accountStatus: "suspended" }));
      toast("Company admin suspended", { style: { background: "#ef4444", color: "#fff" } });
    } catch {
      toast.error("Failed to suspend company admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await restoreUser(id);
      await log("RESTORE", `Restored company admin: ${data?.email ?? id}`);
      setData((prev) => ({ ...prev, accountStatus: "active" }));
      toast.success("Company admin restored successfully.");
    } catch (err) {
      // Show backend error message if present, otherwise fall back to generic
      const msg = err.response?.data ?? "Failed to restore company admin.";
      toast.error(typeof msg === "string" ? msg : "Failed to restore company admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    try {
      setActionLoading(true);
      if (isFlagged) {
        // Unflag — restore to active and log
        await unflagUser(id);
        await log("UNFLAG", `Unflagged company admin: ${data?.email ?? id}`);
        setData((prev) => ({ ...prev, accountStatus: "active" }));
        toast.success("Company admin unflagged.");
      } else {
        // Flag — update status and log
        await flagUser(id);
        await log("FLAG", `Flagged company admin: ${data?.email ?? id}`);
        setData((prev) => ({ ...prev, accountStatus: "flagged" }));
        toast("Company admin flagged", { style: { background: "#facc15", color: "#000" } });
      }
    } catch {
      toast.error("Failed to update flag status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading...</div>;
  if (error)   return <div className="p-6 text-red-500 text-sm">{error}</div>;
  if (!data)   return null;

  const isSuspended = data.accountStatus === "suspended";
  const isFlagged   = data.accountStatus === "flagged";

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6 font-outfit">
      <BackButton label="Back to Users" to="/admin/Users" />
      <ProfileHeader user={{ ...data, role: "company_admin" }} />

      {isSuspended && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm text-center">
          This company admin is currently suspended
        </div>
      )}

      <InfoCard title="Account Information">
        <div className="space-y-1">
          <p><strong>Email:</strong>  {data.email}</p>
          <p><strong>Role:</strong>   Company Admin</p>
          <p><strong>Status:</strong> <span className="capitalize">{data.accountStatus || "active"}</span></p>
        </div>
      </InfoCard>

      <UserActivityLog logs={data.activityLogs || []} />

      <div className="flex justify-center gap-6 pt-6">
        {isSuspended ? (
          // Restore — outlined green to visually differ from the suspend action
          <button
            onClick={handleRestore}
            disabled={actionLoading}
            className="bg-white border border-green-500 text-green-600 hover:bg-green-50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Restore Company Admin"}
          </button>
        ) : (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400
                       text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Suspend Company Admin"}
          </button>
        )}

        {/* Flag/Unflag — outlined yellow when active so the toggled state is visually distinct */}
        <button
          onClick={handleFlag}
          disabled={actionLoading || isSuspended}
          className={`px-8 py-3 rounded-full text-sm font-medium transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isFlagged
                        ? "bg-white border border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                        : "bg-yellow-400 hover:bg-yellow-500 text-white"
                      }`}
        >
          {actionLoading ? "Processing..." : isFlagged ? "Unflag Company Admin" : "Flag Company Admin"}
        </button>
      </div>
    </div>
  );
}