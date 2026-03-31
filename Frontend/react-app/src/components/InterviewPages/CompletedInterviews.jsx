import { useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import "../DashboardCom/TodaySchedule.css";
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

         {/* 🔍 SEARCH BAR HERE */}
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search candidate, job, ID..."
            className="flex-1 px-4 py-3 rounded-xl border border-[#DADEE0] bg-white shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[#24698B]"
          />

          <button className="w-12 h-12 rounded-full bg-[#24698B] text-white shadow flex items-center justify-center hover:bg-[#1e5873] transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className="completed-card">
          <div className="table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Interview ID</th>
                  <th>Candidate</th>
                  <th>Job Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Mode</th>
                  <th>Admin Notes</th>
                  <th>History</th>
                  <th>Single View</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.interviewId}>
                    <td className="bold">{r.interviewId}</td>
                    <td>{r.candidate}</td>
                    <td>{r.jobTitle}</td>
                    <td>{r.date}</td>
                    <td>{r.time}</td>

                    <td>
                      <div className="mode-cell">
                        <span className={`mode-dot ${modeDotClass(r.mode)}`} />
                        <span>{r.mode}</span>
                      </div>
                    </td>

                    <td className="notes-cell">{r.notes}</td>

                    <td>
                      <button
                        className="history-btn"
                        onClick={() => handleViewHistory(r)}
                      >
                        View
                      </button>
                    </td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleSingleView(r)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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