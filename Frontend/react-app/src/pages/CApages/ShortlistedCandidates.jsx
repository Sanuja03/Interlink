import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./ShortlistedCandidates.css";

export default function ShortlistedCandidates() {
  const navigate = useNavigate();

  const candidates = [
    {
      id: "CAND001",
      name: "Amal Dissanayaka",
      email: "amal@gmail.com",
      contact: "0771234567",
      job: "UI/UX Designer",
      round: "Round 2 (Technical)",
      score: "85%",
      status: "Shortlisted",
      notes: "Strong portfolio and good communication skills.",
    },
    {
      id: "CAND002",
      name: "Nimal Perera",
      email: "nimal@gmail.com",
      contact: "0712345678",
      job: "Frontend Developer",
      round: "Round 1 (HR)",
      score: "78%",
      status: "Shortlisted",
      notes: "Good React knowledge.",
    },
  ];

  const handleRequest = () => {
    navigate("/interview-scheduling");
  };

  const handleStatus = () => {
    navigate("/candidate-history");
  };

  const handleFinalize = () => {
    navigate("/interview-confirmation");
  };

  return (
    <DashboardLayout>
      <div className="sc-container">
        <h1 className="sc-title">Shortlisted Candidates</h1>

        <div className="sc-card">
          <table className="sc-table">
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Job Title</th>
                <th>Round</th>
                <th>CV Score</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.id}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.contact}</td>
                  <td>{candidate.job}</td>
                  <td>{candidate.round}</td>
                  <td>{candidate.score}</td>
                  <td>
                    <span className="status-badge">
                      {candidate.status}
                    </span>
                  </td>
                  <td>{candidate.notes}</td>

                  <td className="actions">
                    <button
                      className="btn request"
                      onClick={handleRequest}
                    >
                      Request
                    </button>

                    <button
                      className="btn status"
                      onClick={handleStatus}
                    >
                      Status
                    </button>

                    <button
                      className="btn finalize"
                      onClick={handleFinalize}
                    >
                      Finalize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}