import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import "./Shortlist.css";

import companyLogo from "../../assets/images/default-avatar.png";

export default function Shortlist() {
  const [decision, setDecision] = useState("Shortlist");
  const [note, setNote] = useState("");

  const skillRows = [
    { name: "React.js", ok: false },
    { name: "UI Design", ok: true },
    { name: "Cloud Deployment", ok: true },
    { name: "REST APIs", ok: false },
    { name: "Unit Testing", ok: true },
  ];

  const topStats = [
    { value: "247", label: "Total Interviews" },
    { value: "53", label: "Candidates Hired" },
    { value: "4.8/5", label: "Average Rating" },
    { value: "91", label: "Points Earned" },
  ];

  return (
    <DashboardLayout>
      <div className="sl-page">
        <h1 className="sl-pageTitle">Shortlist</h1>

        <section className="sl-topCard">
          <div className="sl-candidateInfo">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Candidate"
              className="sl-profilePhoto"
            />

            <div className="sl-candidateText">
              <h2 className="sl-name">Michael Johnson</h2>
              <p className="sl-company">Horizon Global</p>
              <p className="sl-role">Senior Technical Interviewer</p>
            </div>
          </div>

          <div className="sl-miniStats">
            {topStats.map((item, index) => (
              <div key={index} className="sl-miniStatCard">
                <div className="sl-miniStatValue">{item.value}</div>
                <div className="sl-miniStatLabel">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="sl-boxRow">
          <div className="sl-box">
            <h3 className="sl-boxTitle">AI Shortlisting Box</h3>

            <div className="sl-scoreBar">
              <span className="sl-scoreLabel">AI Score</span>
              <span className="sl-scoreValue">81.5%</span>
              <span className="sl-scoreDot"></span>
            </div>

            <div className="sl-skillTable">
              {skillRows.map((item, index) => (
                <div key={index} className="sl-skillRow">
                  <span className="sl-skillName">
                    {index + 1}. {item.name}
                  </span>
                  <span className={item.ok ? "sl-check ok" : "sl-check no"}>
                    {item.ok ? "✔" : "✖"}
                  </span>
                </div>
              ))}
            </div>

            <div className="sl-aiSuggestionWrap">
              <p className="sl-aiSuggestionLabel">AI Suggestion</p>
              <div className="sl-aiSuggestionPill">Recommended</div>
            </div>
          </div>

          <div className="sl-box">
            <h3 className="sl-boxTitle">Manual Shortlisting Box</h3>

            <div className="sl-field">
              <label className="sl-label">Select Decision</label>
              <select
                className="sl-input"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              >
                <option>Shortlist</option>
                <option>Hold</option>
                <option>Reject</option>
              </select>
            </div>

            <div className="sl-field">
              <label className="sl-label">Add Note</label>
              <textarea
                className="sl-textarea"
                placeholder="Notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button className="sl-saveBtn">Save</button>
          </div>
        </section>

        <section className="sl-summaryCard">
          <div className="sl-summaryItem">
            <p className="sl-summaryTitle">AI Suggestion</p>
            <div className="sl-summaryValue">Recommended</div>
            <div className="sl-summaryLine"></div>
          </div>

          <div className="sl-summaryItem">
            <p className="sl-summaryTitle">Manual Suggestion</p>
            <div className="sl-summaryValue">Recommended</div>
            <div className="sl-summaryLine"></div>
          </div>

          <div className="sl-summaryItem">
            <p className="sl-summaryTitle">Final status</p>
            <div className="sl-summaryValue">Recommended</div>
            <div className="sl-summaryLine"></div>
          </div>
        </section>

        <section className="sl-actions">
          <button className="sl-actionBtn sl-confirmBtn">Confirm</button>
          <button className="sl-actionBtn sl-rejectBtn">Reject</button>
        </section>
      </div>
    </DashboardLayout>
  );
}