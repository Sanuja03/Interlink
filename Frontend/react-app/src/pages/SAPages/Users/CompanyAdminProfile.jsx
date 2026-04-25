import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import UserActivityLog from "../../../components/SuperAdminComponents/Users/UserActivityLogs";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";
import { getUserProfile, suspendUser, restoreUser, flagUser } from "../../../api/SAdminUsersApi";

export default function CompanyAdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(id);

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
    fetch();
  }, [id, navigate]);

  const handleSuspend = async () => {
    try {
      setActionLoading(true);
      await suspendUser(id);
      setData((prev) => ({ ...prev, accountStatus: "suspended" }));
    } catch {
      alert("Failed to suspend user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setActionLoading(true);
      await restoreUser(id);
      setData((prev) => ({ ...prev, accountStatus: "active" }));
    } catch {
      alert("Failed to restore user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    try {
      setActionLoading(true);
      await flagUser(id);
      setData((prev) => ({ ...prev, accountStatus: "flagged" }));
    } catch {
      alert("Failed to flag user.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading...</div>;
  if (error)   return <div className="p-6 text-red-500 text-sm">{error}</div>;
  if (!data)   return null;

  const isSuspended = data.accountStatus === "suspended";
  const isFlagged   = data.accountStatus === "flagged";

  // API returns: userId, email, accountStatus, activityLogs
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6 font-outfit">

      <BackButton label="Back to Users" to="/admin/Users" />

      <ProfileHeader user={{ ...data, role: "company_admin" }} />

      {isSuspended && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm text-center">
          ⚠️ This company admin is currently suspended
        </div>
      )}

      {/* ACCOUNT INFO */}
      <InfoCard title="Account Information">
        <div className="space-y-1">
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Role:</strong> Company Admin</p>
          <p><strong>Status:</strong> <span className="capitalize">{data.accountStatus || "active"}</span></p>
        </div>
      </InfoCard>

      {/* ACTIVITY LOGS */}
      <UserActivityLog logs={data.activityLogs || []} />

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-6 pt-6">
        {isSuspended ? (
          <button
            onClick={handleRestore}
            disabled={actionLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Restore Company Admin"}
          </button>
        ) : (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Suspend Company Admin"}
          </button>
        )}

        <button
          onClick={handleFlag}
          disabled={actionLoading || isSuspended}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
        >
          {actionLoading ? "Processing..." : isFlagged ? "Unflag" : "Flag Company Admin"}
        </button>
      </div>

    </div>
  );
}