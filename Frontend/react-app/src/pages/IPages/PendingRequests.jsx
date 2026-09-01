import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import PendingRequestsList from "../../components/InterviewerPages/PendingRequestsLayout/PendingRequestsList";
import WithdrawnRequestsPanel from "../../components/InterviewerPages/PendingRequestsLayout/WithdrawnRequestsPanel";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./PendingRequests.css";

/* ── Local record of what this interviewer answered ──────────────────────────
   The server stores an admin removal and a self-decline as the same "rejected"
   row, so it can't tell the withdrawn panel which requests were actually
   accepted. Remembering the answer at the moment it's sent fills that gap —
   the same localStorage approach the company-admin status popup uses for its
   "Removed" badges. Decisions made in another browser are simply unknown, and
   the panel words those items neutrally rather than claiming an acceptance. */
const DECISIONS_KEY = "interviewer_request_decisions";
const DISMISSED_KEY = "interviewer_dismissed_withdrawn";

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the panel just falls back to neutral wording */
  }
};

const PendingRequests = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [withdrawn, setWithdrawn] = useState([]);
  const [decisions, setDecisions] = useState(() => readStored(DECISIONS_KEY, {}));
  const [dismissed, setDismissed] = useState(() => readStored(DISMISSED_KEY, []));

  useEffect(() => {
    let cancelled = false;

    const fetchPending = async () => {
      try {
        const res = await api.get("/interviewer/interview-requests/pending");
        if (cancelled) return;

        const mapped = (res.data || []).map((r) => ({
          interviewId: r.interviewId,
          requestId: r.requestId,
          candidate: r.candidateName,
          jobTitle: r.jobTitle,
          date: r.interviewDate,
          time: r.interviewTime,
          mode: r.mode,
          notes: r.adminNotes || "—",
          interviewLocation: r.interviewLocation || "",
          accepted: false,
        }));
        setRows(mapped);
        setFilteredRows(mapped);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Requests that were taken away — removed from the panel, cancelled, or
    // cancelled and rescheduled. A failure here must not break the page.
    const fetchWithdrawn = async () => {
      try {
        const res = await api.get("/interviewer/interview-requests/withdrawn");
        if (!cancelled) setWithdrawn(res.data || []);
      } catch (err) {
        console.error("Failed to fetch withdrawn requests:", err);
      }
    };

    fetchPending();
    fetchWithdrawn();
    return () => {
      cancelled = true;
    };
  }, []);

  const rememberDecision = (requestId, decision) => {
    setDecisions((prev) => {
      const next = { ...prev, [requestId]: decision };
      writeStored(DECISIONS_KEY, next);
      return next;
    });
  };

  const handleDismissWithdrawn = (requestId) => {
    setDismissed((prev) => {
      const next = prev.includes(requestId) ? prev : [...prev, requestId];
      writeStored(DISMISSED_KEY, next);
      return next;
    });
  };

  const visibleWithdrawn = withdrawn.filter(
    (w) => !dismissed.includes(w.requestId)
  );

  const handleSearch = (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setFilteredRows(rows);
      return;
    }
    const lower = value.toLowerCase();
    setFilteredRows(
      rows.filter(
        (r) =>
          r.interviewId?.toLowerCase().includes(lower) ||
          r.jobTitle?.toLowerCase().includes(lower) ||
          r.mode?.toLowerCase().includes(lower) ||
          r.date?.toLowerCase().includes(lower) ||
          r.time?.toLowerCase().includes(lower)
      )
    );
  };

  const handleToggle = (index) => {
    const targetRequestId = filteredRows[index]?.requestId;
    setRows((prev) =>
      prev.map((r) =>
        r.requestId === targetRequestId ? { ...r, accepted: !r.accepted } : r
      )
    );
    setFilteredRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, accepted: !r.accepted } : r))
    );
  };

  const handleSend = async (row) => {
    const response = row.accepted ? "accepted" : "rejected";
    try {
      await api.put(
        `/interviewer/interview-requests/${row.requestId}/respond`,
        null,
        { params: { response } }
      );
      rememberDecision(row.requestId, response);
      setRows((prev) => prev.filter((r) => r.requestId !== row.requestId));
      setFilteredRows((prev) => prev.filter((r) => r.requestId !== row.requestId));
    } catch (err) {
      console.error("Failed to respond:", err);
      alert("Failed to send decision. Please try again.");
    }
  };

  // View → full read-only Candidate Profile page (shared with company admin).
  // From there the interviewer can open Candidate History Tracker + CV.
  // Shortlist/Reject are disabled for interviewers. Gated by requestId.
  const handleViewHistory = (row) => {
    navigate(`/interviewer/candidate-profile/${row.requestId}`);
  };

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  return (
    <DashboardLayout>
      <div className="settings-page">
        <h1 className="settings-title">Pending Requests</h1>

        <SearchBar
          onChange={handleSearch}
          onSearch={() => handleSearch(searchValue)}
        />

        <WithdrawnRequestsPanel
          items={visibleWithdrawn}
          decisions={decisions}
          onDismiss={handleDismissWithdrawn}
        />

        {loading ? (
          <p>Loading…</p>
        ) : filteredRows.length === 0 ? (
          <div className="scheduled-empty">
            <p className="scheduled-empty-title">No Pending Requests</p>
            <p className="scheduled-empty-sub">
              {searchValue
                ? "No results match your search."
                : "You have no pending interview requests."}
            </p>
          </div>
        ) : (
          <PendingRequestsList
            rows={filteredRows}
            onToggle={handleToggle}
            onSend={handleSend}
            onViewHistory={handleViewHistory}
            modeDotClass={modeDotClass}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingRequests;