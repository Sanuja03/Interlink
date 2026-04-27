import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./CandidateHistory.css";

import companyLogo from "../../assets/images/default-avatar.png";

export default function CandidateHistory() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    loadHistory();
  }, [applicationId]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // Get history stages
      const historyRes = await api.get(`/company/history/application/${applicationId}`);
      setHistoryData(historyRes.data);

      // Get candidate profile for the profile card
      if (historyRes.data.candidateId) {
        const profileRes = await api.get(
          `/company/candidate-profile/${historyRes.data.candidateId}?applicationId=${applicationId}`
        );
        setCandidate(profileRes.data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="ch-page">
          <p>Loading history...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!historyData) {
    return (
      <DashboardLayout>
        <div className="ch-page">
          <p>No history found</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="ch-page">
        <h1 className="ch-pageTitle">History</h1>

        {/* Profile Card */}
        <section className="ch-profileCard">
          <div className="ch-profileLeft">
            <img
              src={candidate?.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Candidate"
              className="ch-profilePhoto"
            />
            <div className="ch-profileText">
              <h2 className="ch-name">{historyData.candidateName || "Unknown"}</h2>
              <p className="ch-roleCompany">{candidate?.currentCompany || "—"}</p>
              <p className="ch-role">{candidate?.currentRole || candidate?.headline || "—"}</p>
            </div>
          </div>

          <div className="ch-stats">
            <div className="ch-statCard">
              <div className="ch-statValue">
                {candidate?.yearsOfExperience ? `${candidate.yearsOfExperience}+` : "—"}
              </div>
              <div className="ch-statLabel">Years Exp</div>
            </div>
            <div className="ch-statCard">
              <div className="ch-statValue">{candidate?.skills?.length || 0}</div>
              <div className="ch-statLabel">Skills</div>
            </div>
            <div className="ch-statCard">
              <div className="ch-statValue">
                {historyData.aiScore != null ? `${historyData.aiScore}%` : "—"}
              </div>
              <div className="ch-statLabel">AI Score</div>
            </div>
            <div className="ch-statCard">
              <div className="ch-statValue">{candidate?.education?.length || 0}</div>
              <div className="ch-statLabel">Degrees</div>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section className="ch-historyBox">
          <div className="ch-companyBox">
            <img src={companyLogo} alt="Company logo" className="ch-companyLogo" />
          </div>

          <h2 className="ch-historyTitle">Candidate History Tracker Screen</h2>

          <div className="ch-tableWrap">
            <table className="ch-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>AI Score</th>
                </tr>
              </thead>
              <tbody>
                {historyData.stages?.map((row, index) => (
                  <tr key={index}>
                    <td>{row.stage}</td>
                    <td>
                      <div className="ch-statusCell">
                        <span
                          className={`ch-statusDot ${
                            row.status === "Completed" ? "green" : "red"
                          }`}
                        ></span>
                        <span>{row.status}</span>
                      </div>
                    </td>
                    <td>{row.date || "—"}</td>
                    <td>
                      <div className="ch-notePill">
                        {row.aiScore != null ? `${row.aiScore}%` : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Job Info */}
          <div className="ch-jobInfo">
            <p><strong>Job Title:</strong> {historyData.jobTitle || "—"}</p>
            <p><strong>Application ID:</strong> #{applicationId}</p>
          </div>
        </section>

        {/* Back Button */}
        <div className="ch-backWrap">
          <button className="ch-backBtn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}