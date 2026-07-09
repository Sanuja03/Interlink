import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import PendingRequestsList from "../../components/InterviewerPages/PendingRequestsLayout/PendingRequestsList";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./PendingRequests.css";

const PendingRequests = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

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

    fetchPending();
    return () => {
      cancelled = true;
    };
  }, []);

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