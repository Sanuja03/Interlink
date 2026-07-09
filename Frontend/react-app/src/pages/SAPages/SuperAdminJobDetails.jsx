import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";
import { getJobById, flagJob, unflagJob, suspendJob, restoreJob } from "../../api/SAdminJobApi";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_BADGE = {
  OPEN:      "bg-green-100 text-green-700",
  FLAGGED:   "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-600",
};

// Toast messages per action
const ACTION_TOAST = {
  FLAG:    () => toast("Job flagged",    { style: { background: "#facc15", color: "#000" } }),
  UNFLAG:  () => toast.success("Job unflagged."),
  SUSPEND: () => toast("Job suspended", { style: { background: "#ef4444", color: "#fff" } }),
  RESTORE: () => toast.success("Job restored successfully."),
};

export default function JobDetails() {
  const { id } = useParams();
  const { appUser } = useAuth(); // appUser.role reads from /auth/me — correct role, not JWT "authenticated"

  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /**
   * Executes a job action, logs it, shows a toast, and updates local state.
   * confirmMsg is shown before proceeding — returning false cancels the action.
   */
  const perform = async (action, newStatus, confirmMsg, logAction) => {
    if (!window.confirm(confirmMsg)) return;
    setActing(true);
    try {
      await action(id);
      await createActivityLog({
        userId:      appUser?.userId ?? null,
        userRole:    appUser?.role   ?? "UNKNOWN",
        action:      logAction,
        entityType:  "JOB",
        description: `${logAction} job: ${job?.title ?? id}`,
      });
      setJob(prev => ({ ...prev, status: newStatus }));
      ACTION_TOAST[logAction]?.();
    } catch (err) {
      // Surface backend hierarchy error message if present
      const msg = err.response?.data ?? "Action failed. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Action failed. Please try again.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 font-outfit">
        <span className="text-gray-400 animate-pulse">Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="font-outfit">
        <BackButton label="Back to Jobs" to="/admin/Jobs" />
        <p className="text-red-500 mt-4">Job not found.</p>
      </div>
    );
  }

  const statusKey  = (job.status || "").toUpperCase();
  const badgeClass = STATUS_BADGE[statusKey] || "bg-gray-100 text-gray-600";
  const isFlagged   = statusKey === "FLAGGED";
  const isSuspended = statusKey === "SUSPENDED";

  return (
    <div className="space-y-6 font-outfit">
      <BackButton label="Back to Jobs" to="/admin/Jobs" />

      {/* HEADER CARD — info only*/}
      <div className="bg-[#24698B]/15 p-6 rounded-xl border border-[#DADEE0]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#24698B]">{job.title}</h2>
          <p className="text-sm text-gray-600">{job.companyName || "—"}</p>
          <p className="text-xs text-gray-500">
            {job.location} · {job.employmentType}
            {job.category && <span> · {job.category}</span>}
          </p>
          <span className={`text-xs px-2 py-1 rounded mt-1 inline-block font-medium ${badgeClass}`}>
            {job.status}
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white border border-[#DADEE0] rounded-xl p-6">
        <h3 className="text-[#24698B] font-semibold mb-2">Description</h3>
        <p className="text-sm text-gray-600">
          {job.description || "No description provided."}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Applications", value: job.totalApplications ?? 0 },
          { label: "Under Review", value: "—" },
          { label: "Interviews",   value: "—" },
          { label: "Engagements",  value: "—" },
        ].map((item, i) => (
          <div key={i} className="bg-[#24698B]/10 p-4 rounded-xl text-center">
            <p className="text-lg font-semibold text-[#24698B]">{item.value}</p>
            <p className="text-xs text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-4 pt-2">

        {/* Suspend / Restore — outlined green when restoring */}
        {!isSuspended ? (
          <button
            onClick={() => perform(suspendJob, "SUSPENDED", "Suspend this job?", "SUSPEND")}
            disabled={acting}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-40
                       text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Suspend Job
          </button>
        ) : (
          <button
            onClick={() => perform(restoreJob, "OPEN", "Restore this job?", "RESTORE")}
            disabled={acting}
            className="bg-white border border-green-500 text-green-600 hover:bg-green-50
                       disabled:opacity-40 px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Restore Job
          </button>
        )}

        {/* Flag / Unflag — outlined yellow when unflagging */}
        {!isFlagged ? (
          <button
            onClick={() => perform(flagJob, "FLAGGED", "Flag this job?", "FLAG")}
            disabled={acting || isSuspended}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40
                       text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Flag Job
          </button>
        ) : (
          <button
            onClick={() => perform(unflagJob, "OPEN", "Unflag this job?", "UNFLAG")}
            disabled={acting}
            className="bg-white border border-yellow-400 text-yellow-600 hover:bg-yellow-50
                       disabled:opacity-40 px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Unflag Job
          </button>
        )}

      </div>
    </div>
  );
}