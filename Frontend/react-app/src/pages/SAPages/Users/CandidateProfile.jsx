import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";
import UserActivityLog from "../../../components/SuperAdminComponents/Users/UserActivityLogs";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";
import { getUserProfile, suspendUser, restoreUser, flagUser, unflagUser } from "../../../api/SAdminUsersApi";
import { createActivityLog } from "../../../api/ActivityLogsApi";
import { useAuth } from "../../../context/AuthContext";

export default function CandidateProfile() {
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
        if (profile.role && profile.role !== "candidate") {
          navigate(`/admin/User/${id}`);
          return;
        }
        setData(profile);
      } catch {
        setError("Failed to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Log helper to avoid repeating the common fields in every handler
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
      await log("SUSPEND", `Suspended candidate: ${data?.name ?? data?.email ?? id}`);
      setData((prev) => ({ ...prev, accountStatus: "suspended" }));
      toast("Candidate suspended", { style: { background: "#ef4444", color: "#fff" } });
    } catch {
      toast.error("Failed to suspend candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try { 
      setActionLoading(true);
      await restoreUser(id);
      await log("RESTORE", `Restored candidate: ${data?.name ?? data?.email ?? id}`);
      setData((prev) => ({ ...prev, accountStatus: "active" }));
      toast.success("Candidate restored successfully.");
    } catch (err) {
      // Show backend error message if present, otherwise fall back to generic
      const msg = err.response?.data ?? "Failed to restore candidate.";
      toast.error(typeof msg === "string" ? msg : "Failed to restore candidate.");
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
        await log("UNFLAG", `Unflagged candidate: ${data?.name ?? data?.email ?? id}`);
        setData((prev) => ({ ...prev, accountStatus: "active" }));
        toast.success("Candidate unflagged.");
      } else {
        // Flag — update status and log
        await flagUser(id);
        await log("FLAG", `Flagged candidate: ${data?.name ?? data?.email ?? id}`);
        setData((prev) => ({ ...prev, accountStatus: "flagged" }));
        toast("Candidate flagged", { style: { background: "#facc15", color: "#000" } });
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
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen font-outfit">
      <BackButton label="Back to Users" to="/admin/Users" />
      <ProfileHeader user={{ ...data, role: "candidate" }} />

      {isSuspended && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm text-center">
          This candidate is currently suspended
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatsCard value={data.stats?.applications ?? 0} label="Applications" />
        <StatsCard value={data.stats?.interviews    ?? 0} label="Interviews"   />
        <StatsCard value={data.stats?.offers        ?? 0} label="Offers"       />
      </div>

      <InfoCard title="Profile Info">
        <div className="space-y-1">
          <p><strong>Location:</strong>     {data.location || "Not provided"}</p>
          <p><strong>Work Mode:</strong>    {data.workMode || "Not specified"}</p>
          <p><strong>Date of Birth:</strong>{data.dob      || "Not available"}</p>
        </div>
      </InfoCard>

      <InfoCard title="Skills">
        <div className="flex flex-wrap gap-2">
          {data.skills && data.skills.length > 0 ? (
            data.skills.map((skill) => (
              <span key={skill} className="bg-[#0F4C5C] text-white px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-500">No skills added</p>
          )}
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
            {actionLoading ? "Processing..." : "Restore Candidate"}
          </button>
        ) : (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400
                       text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Suspend Candidate"}
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
          {actionLoading ? "Processing..." : isFlagged ? "Unflag Candidate" : "Flag Candidate"}
        </button>
      </div>
    </div>
  );
}