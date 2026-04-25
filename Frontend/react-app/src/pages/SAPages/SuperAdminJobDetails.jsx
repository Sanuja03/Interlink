import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";
import { getJobById, flagJob, unflagJob, suspendJob, restoreJob } from "../../api/SAdminJobApi";

const STATUS_BADGE = {
  OPEN:      "bg-green-100 text-green-700",
  FLAGGED:   "bg-yellow-100 text-yellow-700",
  SUSPENDED: "bg-red-100 text-red-600",
};

export default function JobDetails() {
  const { id } = useParams();

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

  const perform = async (action, newStatus, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return;
    setActing(true);
    try {
      await action(id);
      setJob(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Action failed", err);
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

      {/* HEADER CARD */}
      <div className="bg-[#24698B]/15 p-6 rounded-xl border border-[#DADEE0]
                      flex justify-between items-start gap-4">

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

        {/* ACTION BUTTONS — toggle based on current status */}
        <div className="flex gap-2 flex-shrink-0">

          {/* Flag / Unflag button */}
          {!isFlagged ? (
            <button
              onClick={() => perform(flagJob, "FLAGGED", "Flag this job?")}
              disabled={acting || isSuspended}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40
                         text-white px-4 py-1.5 rounded-md text-sm transition-colors"
            >
              Flag
            </button>
          ) : (
            <button
              onClick={() => perform(unflagJob, "OPEN", "Unflag this job? It will return to Open.")}
              disabled={acting}
              className="bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40
                         text-yellow-700 border border-yellow-400 px-4 py-1.5 rounded-md text-sm transition-colors"
            >
              Unflag
            </button>
          )}

          {/* Suspend / Restore button */}
          {!isSuspended ? (
            <button
              onClick={() => perform(suspendJob, "SUSPENDED", "Suspend this job?")}
              disabled={acting}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-40
                         text-white px-4 py-1.5 rounded-md text-sm transition-colors"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => perform(restoreJob, "OPEN", "Restore this job? It will return to Open.")}
              disabled={acting}
              className="bg-red-100 hover:bg-red-200 disabled:opacity-40
                         text-red-600 border border-red-400 px-4 py-1.5 rounded-md text-sm transition-colors"
            >
              Restore
            </button>
          )}

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

    </div>
  );
}