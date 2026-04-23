import React, { useEffect, useState } from "react";
import "./CompanyDetailsModal.css";

export default function CompanyDetailsModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");

  const [website, setWebsite] = useState("");
  const [about, setAbout] = useState("");
  const [logo, setLogo] = useState("");

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (!open) return;

    // 🔥 LOAD company_details
    fetch(`http://localhost:8080/company/details/${companyId}`)
      .then(res => res.json())
      .then(data => {
        setWebsite(data.website || "");
        setAbout(data.about || "");
        setLogo(data.logoUrl || "");
      });

    // 🔥 LOAD companies (basic data)
    fetch(`http://localhost:8080/company/${companyId}`)
      .then(res => res.json())
      .then(data => {
        setName(data.companyName || "");
        setIndustry(data.industry || "");
        setCompanySize(data.companySize || "");
        setLocation(data.companyLocation || "");
        setEmail(data.companyEmail || "");
      });

  }, [open, companyId]);

  // 🔥 HANDLE SAVE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // 👉 Update company_details
      await fetch(`http://localhost:8080/company/details/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          website,
          about,
          logoUrl: logo
        })
      });

      alert("Saved successfully!");
      onClose();

    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  if (!open) return null;

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

        {/* 🔥 LOGO */}
        <div className="cdm-uploadRow">
          <div className="cdm-previewBox">
            {logo ? <img src={logo} alt="logo" width="50" /> : "🖼️"}
          </div>

          <div className="cdm-uploadRight">
            <p className="cdm-uploadHint">
              Please upload square image, size less than 100KB
            </p>

            <div className="cdm-fileRow">
              <label className="cdm-fileBtn">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setLogo(URL.createObjectURL(file)); // preview only
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="cdm-divider" />

        <form className="cdm-form" onSubmit={handleSave}>
          <Field label="Name">
            <input
              className="cdm-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Industry">
            <select
              className="cdm-input"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option>Software & IT</option>
              <option>Design</option>
              <option>Finance</option>
            </select>
          </Field>

          <Field label="Company Size">
            <select
              className="cdm-input"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option>50–100 employees</option>
              <option>1–10 employees</option>
              <option>10–50 employees</option>
              <option>100–500 employees</option>
            </select>
          </Field>

          <Field label="Location">
            <select
              className="cdm-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>Colombo</option>
              <option>Galle</option>
              <option>Kandy</option>
            </select>
          </Field>

          <Field label="Company Email">
            <input
              className="cdm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Company Website">
            <input
              className="cdm-input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>

          <Field label="About the Company">
            <textarea
              className="cdm-textarea"
              rows={5}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
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