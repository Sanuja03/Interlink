import React, { useState } from "react";
import "./InterviewerManagementModal.css";

export default function InterviewerManagementModal({ open, onClose }) {
  const [rows, setRows] = useState([
    { id: 1, name: "S. Jayasinghe", role: "Tech Lead", active: true },
    { id: 2, name: "K. Perera", role: "HR Manager", active: true },
    { id: 3, name: "D. Dissanayaka", role: "Tech Lead", active: true },
    { id: 4, name: "Manjula Kamal", role: "Tech Lead", active: true },
  ]);

  if (!open) return null;

  const toggleActive = (id) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), name: "", role: "Tech Lead", active: false },
    ]);
  };

  return (
    <div className="im-overlay" onClick={onClose}>
      <div className="im-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="im-title">■ Interviewer Management</h2>

        <div className="im-headerRow">
          <div className="im-h">Name</div>
          <div className="im-h">Industry</div>
          <div className="im-h">Status</div>
        </div>

        <div className="im-rows">
          {rows.map((r) => (
            <div className="im-row" key={r.id}>
              {/* Name */}
              <div className="im-cell">
                <input
                  className="im-input"
                  value={r.name}
                  placeholder="Interviewer name"
                  onChange={(e) => updateRow(r.id, { name: e.target.value })}
                />
              </div>

              {/* Industry */}
              <div className="im-cell">
                <select
                  className="im-input"
                  value={r.role}
                  onChange={(e) => updateRow(r.id, { role: e.target.value })}
                >
                  <option>Tech Lead</option>
                  <option>HR Manager</option>
                  <option>QA Lead</option>
                </select>
              </div>

              {/* Status */}
              <div className="im-statusCell">
                <label className="im-switch">
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={() => toggleActive(r.id)}
                  />
                  <span className="im-slider" />
                </label>
                <span className="im-statusText">
                  {r.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="im-add" onClick={addRow}>
          +
        </button>

        <div className="im-actions">
          <button className="im-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="im-save" type="button">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}