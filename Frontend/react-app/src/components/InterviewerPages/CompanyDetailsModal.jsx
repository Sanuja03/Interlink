import React from "react";
import "./CompanyDetailsModal.css";

export default function CompanyDetailsModal({ open, onClose }) {
  if (!open) return null;

  // stop click inside modal closing it
  const stop = (e) => e.stopPropagation();

  return (
    <div className="cdm-overlay" onClick={onClose}>
      <div className="cdm-modal" onClick={stop}>
        <div className="cdm-head">
          <div className="cdm-titleRow">
            <span className="cdm-square" />
            <h2 className="cdm-title">Company Details</h2>
          </div>
        </div>

        <div className="cdm-uploadRow">
          <div className="cdm-previewBox">🖼️</div>

          <div className="cdm-uploadRight">
            <p className="cdm-uploadHint">Please upload square image, size less than 100KB</p>

            <div className="cdm-fileRow">
              <label className="cdm-fileBtn">
                Choose File
                <input type="file" accept="image/*" hidden />
              </label>
              <span className="cdm-fileName">No File Chosen</span>
            </div>
          </div>
        </div>

        <div className="cdm-divider" />

        <form className="cdm-form">
          <Field label="Name">
            <input className="cdm-input" defaultValue="Horizon Global" />
          </Field>

          <Field label="Industry">
            <select className="cdm-input">
              <option>Software & IT</option>
              <option>Design</option>
              <option>Finance</option>
            </select>
          </Field>

          <Field label="Company Size">
            <select className="cdm-input">
              <option>50–100 employees</option>
              <option>1–10 employees</option>
              <option>10–50 employees</option>
              <option>100–500 employees</option>
            </select>
          </Field>

          <Field label="Location">
            <select className="cdm-input">
              <option>Colombo</option>
              <option>Galle</option>
              <option>Kandy</option>
            </select>
          </Field>

          <Field label="Company Email">
            <input className="cdm-input" defaultValue="horizonglobal@gmail.com" />
          </Field>

          <Field label="Company Website">
            <input className="cdm-input" defaultValue="horizonglobal.com" />
          </Field>

          <Field label="About the Company">
            <textarea
              className="cdm-textarea"
              rows={5}
              defaultValue="CodeWave Solutions is a Sri Lanka–based software development company specializing in web and mobile applications..."
            />
          </Field>

          <div className="cdm-actions">
            <button type="button" className="cdm-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cdm-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="cdm-field">
      <label className="cdm-label">{label}</label>
      {children}
    </div>
  );
}