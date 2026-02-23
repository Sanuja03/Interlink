import React, { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import "./CreateJob.css";

export default function CreateJob() {
  const [reqs, setReqs] = useState([
    "Experience with React or Vue",
    "Basic understanding of UI/UX principles",
  ]);

  const updateReq = (i, value) => {
    setReqs((prev) => prev.map((r, idx) => (idx === i ? value : r)));
  };

  const removeReq = (i) => {
    setReqs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addReq = () => {
    setReqs((prev) => [...prev, ""]);
  };

  return (
    <DashboardLayout>
      <div className="cj-page">
        <div className="cj-container">
          {/* ❌ Removed Back button + Horizon Global */}

          <h2 className="cj-title">Create new job</h2>

          <div className="cj-card">
            <div className="cj-field">
              <label className="cj-label">Job Title</label>
              <input className="cj-input" placeholder="Software Engineer" />
            </div>

            <div className="cj-field">
              <label className="cj-label">Department</label>
              <select className="cj-select">
                <option>Engineering</option>
                <option>Design</option>
                <option>QA</option>
                <option>HR</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Employment Type</label>
              <select className="cj-select">
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Intern</option>
                <option>Contract</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Job Location</label>
              <input className="cj-input" placeholder="Colombo" />
            </div>

            <div className="cj-field">
              <label className="cj-label">Experience Level</label>
              <input className="cj-input" placeholder="2–4 Years" />
            </div>

            <div className="cj-field">
              <label className="cj-label">Vacancies</label>
              <select className="cj-select">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Key Requirements</label>

              {reqs.map((val, i) => (
                <div className="cj-reqRow" key={i}>
                  <button
                    type="button"
                    className="cj-reqBtn"
                    onClick={() => removeReq(i)}
                    aria-label="Remove requirement"
                  >
                    −
                  </button>

                  <input
                    className="cj-reqInput"
                    value={val}
                    onChange={(e) => updateReq(i, e.target.value)}
                    placeholder="Add requirement"
                  />
                </div>
              ))}

              <div className="cj-reqRow">
                <button type="button" className="cj-reqBtn" onClick={addReq}>
                  +
                </button>
                <input className="cj-reqInput" placeholder="" disabled />
              </div>
            </div>
          </div>

          <div className="cj-actions">
            <button
              className="cj-post"
              onClick={() => alert("Post clicked (connect API later)")}
            >
              Post
            </button>

            <button className="cj-cancel" onClick={() => window.history.back()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}