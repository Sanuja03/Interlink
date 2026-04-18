import React from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CandidateHistory.css";

import companyLogo from "../../assets/images/default-avatar.png";

export default function CandidateHistory() {
  const stats = [
    { value: "247", label: "Total Interviews" },
    { value: "53", label: "Candidates Hired" },
    { value: "4.8/5", label: "Average Rating" },
    { value: "91", label: "Points Earned" },
  ];

  const historyRows = [
    {
      stage: "Applied",
      status: "Completed",
      statusColor: "green",
      date: "17.07.2025",
      notes: "Applied for Software Engineer",
    },
    {
      stage: "Shortlisted",
      status: "Completed",
      statusColor: "green",
      date: "11.09.2025",
      notes: "AI 80% Match",
    },
    {
      stage: "Interview Scheduled",
      status: "Completed",
      statusColor: "green",
      date: "12.01.2026",
      notes: "Online Mode",
    },
    {
      stage: "Interview",
      status: "Not Completed",
      statusColor: "red",
      date: "",
      notes: "",
    },
    {
      stage: "Feedback Received",
      status: "Not Completed",
      statusColor: "red",
      date: "",
      notes: "",
    },
  ];

  return (
    <DashboardLayout>
      <div className="ch-page">
        <h1 className="ch-pageTitle">History</h1>

        <section className="ch-profileCard">
          <div className="ch-profileLeft">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Candidate"
              className="ch-profilePhoto"
            />

            <div className="ch-profileText">
              <h2 className="ch-name">Michael Johnson</h2>
              <p className="ch-roleCompany">Horizon Global</p>
              <p className="ch-role">Senior Technical Interviewer</p>
            </div>
          </div>

          <div className="ch-stats">
            {stats.map((item, index) => (
              <div key={index} className="ch-statCard">
                <div className="ch-statValue">{item.value}</div>
                <div className="ch-statLabel">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ch-historyBox">
          <div className="ch-companyBox">
            <img
              src={companyLogo}
              alt="Company logo"
              className="ch-companyLogo"
            />
            <span className="ch-companyName">Horizon Global</span>
          </div>

          <h2 className="ch-historyTitle">Candidate History Tracker Screen</h2>

          <div className="ch-tableWrap">
            <table className="ch-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {historyRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.stage}</td>

                    <td>
                      <div className="ch-statusCell">
                        <span
                          className={`ch-statusDot ${row.statusColor}`}
                        ></span>
                        <span>{row.status}</span>
                      </div>
                    </td>

                    <td>{row.date || "-"}</td>

                    <td>
                      <div className="ch-notePill">{row.notes || ""}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}