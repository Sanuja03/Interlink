import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";
import UserActivityLog from "../../../components/SuperAdminComponents/Users/UserActivityLogs";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";
import { getUserProfile, suspendUser, restoreUser, flagUser } from "../../../api/SAdminUsersApi";

// isAvailable: true = green, false = red, null = grey
const availabilityStyle = (isAvailable) => {
  if (isAvailable === true)  return "bg-green-100 text-green-700 border border-green-300";
  if (isAvailable === false) return "bg-red-100 text-red-600 border border-red-300";
  return "bg-gray-100 text-gray-400 border border-gray-200";
};

const availabilityLabel = (isAvailable) => {
  if (isAvailable === true)  return "Available";
  if (isAvailable === false) return "Unavailable";
  return "Not Set";
};

export default function InterviewerProfile() {
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

        if (profile.role && profile.role !== "interviewer") {
          navigate(`/admin/User/${id}`);
          return;
        }
        setData(profile);
      } catch {
        setError("Failed to load interviewer profile.");
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

  // API returns: userId, interviewerId, email, accountStatus, about, photoUrl,
  //              stats { totalInterviews, pendingRequests, responseRate },
  //              weeklyAvailability [{ dayName, isAvailable }],
  //              activityLogs
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6 font-outfit">

      <BackButton label="Back to Users" to="/admin/Users" />

      <ProfileHeader user={{ ...data, role: "interviewer" }} />

      {isSuspended && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-md text-sm text-center">
          ⚠️ This interviewer is currently suspended
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard value={data.stats?.totalInterviews  ?? 0}    label="Total Interviews"  />
        <StatsCard value={data.stats?.pendingRequests  ?? 0}    label="Pending Requests"  />
        <StatsCard value={`${data.stats?.responseRate ?? 0}%`}  label="Response Rate"     />
      </div>

      {/* ABOUT */}
      {data.about && (
        <InfoCard title="About">
          <p>{data.about}</p>
        </InfoCard>
      )}

      {/* PROFESSIONAL INFO */}
      <InfoCard title="Professional Info">
        <div className="space-y-1">
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Status:</strong> <span className="capitalize">{data.accountStatus}</span></p>
        </div>
      </InfoCard>

      {/* WEEKLY AVAILABILITY — 7 boxes Mon–Sun */}
      <InfoCard title="Weekly Availability">
        <div className="grid grid-cols-7 gap-2 text-xs">
          {(data.weeklyAvailability || []).map((day) => (
            <div
              key={day.dayName}
              className={`p-2 rounded text-center font-medium ${availabilityStyle(day.isAvailable)}`}
            >
              <p className="font-bold">{day.dayName?.slice(0, 3)}</p>
              <p className="text-[10px] mt-0.5 opacity-80">{availabilityLabel(day.isAvailable)}</p>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-200 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-200 inline-block" /> Unavailable
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Not Set
          </span>
        </div>
      </InfoCard>

      {/* ACTIVITY LOG */}
      <UserActivityLog logs={data.activityLogs || []} />

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-6 pt-6">
        {isSuspended ? (
          <button
            onClick={handleRestore}
            disabled={actionLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Restore Interviewer"}
          </button>
        ) : (
          <button
            onClick={handleSuspend}
            disabled={actionLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Suspend Interviewer"}
          </button>
        )}

        <button
          onClick={handleFlag}
          disabled={actionLoading || isSuspended}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
        >
          {actionLoading ? "Processing..." : "Flag Interviewer"}
        </button>
      </div>

    </div>
  );
}