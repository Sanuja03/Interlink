import { useState } from "react";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import "../../components/InterviewerPages/Layout/TodaySchedule.css";
import CompletedInterviewsList from "../../components/InterviewerPages/CompletedInterviewsLayout/CompletedInterviewsList";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./CompletedInterviews.css";

const CompletedInterviews = () => {
  const [rows] = useState([
    {
      interviewId: "IN5690",
      candidate: "Amal Dissanayaka",
      jobTitle: "UI/UX Designer",
      date: "2026-02-20",
      time: "10.30 AM",
      mode: "Online",
      notes: "Focus on portfolio discussion",
      history: [
        { date: "2026-02-10", event: "Applied" },
        { date: "2026-02-12", event: "Shortlisted" },
        { date: "2026-02-15", event: "Round 1 (HR) - Completed (PASS)" },
        { date: "2026-02-18", event: "Interview Request Sent to Panel" },
        { date: "2026-02-19", event: "Panel Request Accepted" },
        { date: "2026-02-20", event: "Interview Completed" },
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
      history: [
        { date: "2026-02-09", event: "Applied" },
        { date: "2026-02-11", event: "Shortlisted" },
        { date: "2026-02-13", event: "CV Screening Completed" },
        { date: "2026-02-15", event: "Interview Request Sent to Panel" },
        { date: "2026-02-16", event: "Panel Request Accepted" },
        { date: "2026-02-20", event: "Interview Completed" },
      ],
      round: "Round 1 (HR)",
    },
  ]);

  const [openHistory, setOpenHistory] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const modeDotClass = (mode) =>
    mode === "Online" ? "mode-online" : "mode-physical";

  const handleViewHistory = (row) => {
    setSelectedRow(row);
    setOpenHistory(true);
  };

  const handleSingleView = (row) => {
    alert(`Single view page for ${row.interviewId} will be added later`);
  };

  const closeModal = () => {
    setOpenHistory(false);
    setSelectedRow(null);
  };

  return (
    <DashboardLayout>
      <div className="completed-page">
        <h1 className="completed-title">Completed Interviews</h1>

        <SearchBar
          onChange={(value) => console.log(value)}
          onSearch={() => console.log("Search clicked")}
        />

        <CompletedInterviewsList
          rows={rows}
          modeDotClass={modeDotClass}
          onViewHistory={handleViewHistory}
          onSingleView={handleSingleView}
        />

        {openHistory && selectedRow && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2 className="modal-title">Completed Interview History</h2>
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
                <ul className="history-list">
                  {selectedRow.history.map((h, i) => (
                    <li key={i} className="history-item">
                      <span className="history-date">{h.date}</span>
                      <span className="history-event">{h.event}</span>
                    </li>
                  ))}
                </ul>
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

export default CompletedInterviews;