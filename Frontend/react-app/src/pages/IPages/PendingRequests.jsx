import { useEffect, useState } from "react";
import api from "../../lib/api";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import PendingRequestsList from "../../components/InterviewerPages/PendingRequestsLayout/PendingRequestsList";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./PendingRequests.css";

const PendingRequests = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // History modal
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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

  const handleViewHistory = async (row) => {
    setSelectedRow(row);
    setOpenHistory(true);
    setHistoryData(null);
    setHistoryError("");
    setHistoryLoading(true);
    try {
      const res = await api.get(
        `/interviewer/interview-requests/${row.requestId}/history`
      );
      setHistoryData(res.data || null);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistoryError(
        err?.response?.data?.error || "Couldn't load history. Please try again."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeModal = () => {
    setOpenHistory(false);
    setSelectedRow(null);
    setHistoryData(null);
    setHistoryError("");
  };

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  const isDone = (status) => (status || "").toLowerCase() === "completed";

  const currentStatusClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("REJECT")) return "cs-reject";
    if (s.includes("SHORTLIST")) return "cs-good";
    if (s.includes("INTERVIEW")) return "cs-good";
    if (s.includes("REVIEW") || s.includes("PENDING")) return "cs-pending";
    return "cs-neutral";
  };

  const prettyStatus = (status) =>
    (status || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

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

        {openHistory && selectedRow && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h2 className="modal-title">Application History</h2>
                  <p className="modal-sub">
                    {(historyData?.candidateName || selectedRow.candidate) +
                      " · " +
                      (historyData?.jobTitle || selectedRow.jobTitle)}
                  </p>
                </div>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {historyLoading ? (
                  <p className="history-muted">Loading history…</p>
                ) : historyError ? (
                  <p className="history-error">{historyError}</p>
                ) : !historyData ? (
                  <p className="history-muted">No history available.</p>
                ) : (
                  <>
                    {/* Summary chips */}
                    <div className="history-summary">
                      {historyData.currentStatus && (
                        <span
                          className={`history-current ${currentStatusClass(
                            historyData.currentStatus
                          )}`}
                        >
                          {prettyStatus(historyData.currentStatus)}
                        </span>
                      )}
                      {historyData.aiScore != null && (
                        <span className="history-aiscore">
                          AI Score <b>{historyData.aiScore}</b>
                        </span>
                      )}
                    </div>

                    {/* Timeline */}
                    {(!historyData.stages || historyData.stages.length === 0) ? (
                      <p className="history-muted">
                        No stages recorded for this application yet.
                      </p>
                    ) : (
                      <ol className="history-timeline">
                        {historyData.stages.map((h, i) => (
                          <li
                            key={i}
                            className={`history-item ${
                              isDone(h.status) ? "is-done" : "is-todo"
                            }`}
                          >
                            <span className="history-node" aria-hidden="true" />
                            <div className="history-content">
                              <div className="history-row-top">
                                <span className="history-stage">{h.stage}</span>
                                <span
                                  className={`history-status ${
                                    isDone(h.status) ? "st-done" : "st-todo"
                                  }`}
                                >
                                  {h.status}
                                </span>
                              </div>
                              <div className="history-meta">
                                {h.date && h.date !== "—" ? h.date : "—"}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingRequests;