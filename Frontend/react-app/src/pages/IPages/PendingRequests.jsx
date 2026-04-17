import { useState } from "react";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import "../../components/InterviewerPages/Layout/TodaySchedule.css";
import "./PendingRequests.css";
import PendingRequestList from "../../components/InterviewerPages/PendingRequestsLayout/PendingRequestsList";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";


const PendingRequests = () => {
  const [rows, setRows] = useState([
    {
      interviewId: "IN5690",
      candidate: "Amal Dissanayaka",
      jobTitle: "UI/UX Designer",
      date: "2026-02-20",
      time: "10.30 AM",
      mode: "Online",
      notes: "Focus on portfolio discussion nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
      accepted: false,
      history: [
        { date: "2026-02-10", event: "Applied" },
        { date: "2026-02-12", event: "Shortlisted" },
        { date: "2026-02-15", event: "Round 1 (HR) - Completed (PASS)" },
      ],
      round: "Round 2 (Technical)",
    },
    {
      interviewId: "IN5691",
      candidate: "Sumudu Perera",
      jobTitle: "Software Engineer",
      date: "2026-02-20",
      time: "11.00 AM",
      mode: "Physical",
      notes: "Panel interview with HR",
      accepted: true,
      history: [
        { date: "2026-02-09", event: "Applied" },
        { date: "2026-02-11", event: "Shortlisted" },
      ],
      round: "Round 1 (HR)",
    },
  ]);

  const [openHistory, setOpenHistory] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleToggle = (index) => {
    const updated = [...rows];
    updated[index].accepted = !updated[index].accepted;
    setRows(updated);
  };

  const handleSend = (row) => {
    console.log("Sending decision:", row);
    alert(`Decision sent for ${row.interviewId}`);
  };

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  const handleViewHistory = (row) => {
    setSelectedRow(row);
    setOpenHistory(true);
  };

  const closeModal = () => {
    setOpenHistory(false);
    setSelectedRow(null);
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <h1 className="settings-title">Pending Requests</h1>

        <SearchBar
          onChange={(value) => console.log(value)}
          onSearch={() => console.log("Search clicked")}
        />

        <PendingRequestList
          rows={rows}
          onToggle={handleToggle}
          onSend={handleSend}
          onViewHistory={handleViewHistory}
          modeDotClass={modeDotClass}
        />

        {openHistory && selectedRow && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2 className="modal-title">Application History</h2>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <div className="modal-sub">
                <p>
                  <span className="modal-label">Candidate:</span>{" "}
                  {selectedRow.candidate}
                </p>
                <p>
                  <span className="modal-label">Interview Round:</span>{" "}
                  {selectedRow.round}
                </p>
                <p>
                  <span className="modal-label">Interview ID:</span>{" "}
                  {selectedRow.interviewId}
                </p>
              </div>

              <div className="modal-body">
                {selectedRow.history?.length ? (
                  <ul className="history-list">
                    {selectedRow.history.map((h, i) => (
                      <li key={i} className="history-item">
                        <span className="history-date">{h.date}</span>
                        <span className="history-event">{h.event}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="history-empty">No history available.</p>
                )}
              </div>

              <div className="modal-actions">
                <button className="view-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingRequests;