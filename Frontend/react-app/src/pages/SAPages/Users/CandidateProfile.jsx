import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";
import UserActivityLog from "../../../components/SuperAdminComponents/Users/UserActivityLogs";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";
import { getUserProfile, suspendUser, restoreUser, flagUser } from "../../../api/SAdminUsersApi";

export default function CandidateProfile() {
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

        // Redirect if this userId belongs to a different role
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

  // API returns: userId, name, email, accountStatus, location, workMode, dob, stats, skills, activityLogs
  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen font-outfit">

      <BackButton label="Back to Users" to="/admin/Users" />

      {/* HEADER — ProfileHeader reads: name, email, role, accountStatus, photoUrl */}
      <ProfileHeader user={{ ...data, role: "candidate" }} />

      {/* SUSPENDED ALERT */}
      {isSuspended && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm text-center">
          ⚠️ This candidate is currently suspended
        </div>
      )}

      {/* STATS — stats.applications, stats.interviews, stats.offers */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard value={data.stats?.applications ?? 0} label="Applications" />
        <StatsCard value={data.stats?.interviews    ?? 0} label="Interviews"   />
        <StatsCard value={data.stats?.offers        ?? 0} label="Offers"       />
      </div>

      {/* PROFILE INFO */}
      <InfoCard title="Profile Info">
        <div className="space-y-1">
          <p><strong>Location:</strong> {data.location  || "Not provided"}</p>
          <p><strong>Work Mode:</strong> {data.workMode  || "Not specified"}</p>
          <p><strong>Date of Birth:</strong> {data.dob  || "Not available"}</p>
        </div>
      </InfoCard>

      {/* SKILLS — API returns list of skill IDs (Long); show as tags */}
      <InfoCard title="Skills">
        <div className="flex flex-wrap gap-2">
          {data.skills && data.skills.length > 0 ? (
            data.skills.map((skillId) => (
              <span
                key={skillId}
                className="bg-[#0F4C5C] text-white px-2 py-1 rounded text-xs"
              >
                Skill #{skillId}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-500">No skills added</p>
          )}
        </div>
      </InfoCard>

      {/* ACTIVITY LOG — last 5 from API */}
      <UserActivityLog logs={data.activityLogs || []} />

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-6 pt-6">
        {isSuspended ? (
          <button
            onClick={handleRestore}
            disabled={actionLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Restore Candidate"}
          </button>
        ) : (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Suspend Candidate"}
          </button>
        )}

        <button
          onClick={handleFlag}
          disabled={actionLoading || isSuspended}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
        >
          {actionLoading ? "Processing..." : "Flag Candidate"}
        </button>
      </div>

    </div>
  );
}