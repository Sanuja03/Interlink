import { useState, useEffect, useCallback } from "react";
import {fetchInterviews,fetchInterviewCount,fetchCandidateById,} from "../../api/SAdminInterviewsApi";
import SearchFilterBar from "../../components/SuperAdminComponents/Layout/SearchFilterBar";

export default function SuperAdminInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Search + filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interviews
  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchInterviews({
        page,
        size: 10,
        search,
        status,
      });

      setInterviews(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError("Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => loadInterviews(), 300);
    return () => clearTimeout(timer);
  }, [loadInterviews]);

  // Fetch total count
  useEffect(() => {
    fetchInterviewCount()
      .then((res) => setTotalCount(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 text-black font-outfit">

      {/*SEARCH*/}
      <div className="bg-transparent p-0 border-none shadow-none">
        <SearchFilterBar
          search={search}
          onSearch={(val) => {
            setSearch(val);
            setPage(0);
          }}
          placeholder="Search by interview ID, mode, status..."
          filters={[
            {
              key: "status",
              label: "All Status",
              value: status,
              onChange: (val) => {
                setStatus(val);
                setPage(0);
              },
              options: [
                { label: "Scheduled", value: "scheduled" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Finalized", value: "finalized" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setStatus("");
            setPage(0);
          }}
        />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#24698B]">■ Interviews</h2>
        <div className="bg-[#24698B] text-white text-sm px-4 py-1 rounded-full shadow">
          {totalCount} Total
        </div>
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-center text-gray-400 py-12 text-sm">
          Loading interviews...
        </p>
      )}

      {!loading && error && (
        <p className="text-center text-red-500 py-12 text-sm">{error}</p>
      )}

      {!loading && !error && interviews.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-sm">
          No interviews found
        </p>
      )}

      {/* INTERVIEW CARDS (UNCHANGED UI) */}
      {!loading &&
        !error &&
        interviews.map((interview) => (
          <InterviewCard key={interview.scheduledId} interview={interview} />
        ))}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-[#24698B] text-white disabled:bg-gray-300 text-sm"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg bg-[#24698B] text-white disabled:bg-gray-300 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/*CARD*/

function InterviewCard({ interview }) {
  const {
    interviewId,
    interviewDate,
    interviewTime,
    mode,
    meetingLink,
    adminNotes,
    status,
    panelSize,
    candidateId,
  } = interview;

  const [candidate, setCandidate] = useState(null);
  const [candidateLoading, setCandidateLoading] = useState(!!candidateId);

  useEffect(() => {
    if (!candidateId) return;

    const loadCandidate = async () => {
      try {
        const res = await fetchCandidateById(candidateId);
        setCandidate(res.data);
      } catch (err) {
        console.error("Failed to load candidate:", err);
      } finally {
        setCandidateLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId]);

  const statusColor = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    finalized: "bg-purple-100 text-purple-700",
  }[status?.toLowerCase()] || "bg-gray-100 text-gray-700";

  const modeColor =
    mode?.toLowerCase() === "online" ? "bg-green-500" : "bg-orange-400";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const formatTime = (t) => (t ? t.slice(0, 5) : "N/A");

  const initials = candidate
    ? `${candidate.firstName?.[0] ?? ""}${candidate.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#24698B]/20 px-4 py-2 rounded-full font-medium text-sm">
              {interviewId || "N/A"}
            </div>

            <span className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${modeColor}`} />
              {mode || "N/A"}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {status}
            </span>
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            {formatDate(interviewDate)}
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            {formatTime(interviewTime)}
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            Panel size: {panelSize ?? "N/A"}
          </div>

          {meetingLink && (
            <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
              <a href={meetingLink} target="_blank" rel="noreferrer"
                 className="underline text-[#24698B]">
                {meetingLink}
              </a>
            </div>
          )}

          {adminNotes && adminNotes !== "EMPTY" && (
            <div className="bg-[#24698B]/20 px-4 py-3 rounded-xl text-sm">
              <p className="font-medium mb-1">Notes</p>
              {adminNotes}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-[#24698B]/10 rounded-2xl p-6 flex flex-col justify-center min-h-[200px]">
          <p className="text-[10px] font-semibold text-[#24698B] uppercase tracking-widest mb-4">
            Candidate
          </p>

          {candidateLoading ? (
            <p className="text-sm text-gray-400 text-center">Loading candidate...</p>
          ) : !candidate ? (
            <p className="text-xs text-gray-400 text-center">Candidate not found</p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0C3E56] text-white flex items-center justify-center font-bold">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-[#0C3E56] text-sm">
                  {candidate.firstName} {candidate.lastName}
                </p>
                <p className="text-xs text-gray-500">{candidate.email}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}