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
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const token = localStorage.getItem("token"); // Get JWT token

  // Helper to make authenticated requests
  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  useEffect(() => {
    if (!open || !companyId) return;

    // Load company details from your single endpoint
    authFetch(`http://localhost:8080/api/company/${companyId}/details`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setName(data.companyName || "");
        setIndustry(data.industry || "");
        setCompanySize(data.companySize || "");
        setLocation(data.companyLocation || "");
        setEmail(data.companyEmail || "");
        setWebsite(data.website || "");
        setAbout(data.about || "");
        setLogo(data.logoUrl || "");
        setLogoPreview(data.logoUrl || "");
      })
      .catch((err) => console.error("Error loading company details:", err));
  }, [open, companyId]);

  // HANDLE SAVE
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authFetch(
        `http://localhost:8080/api/company/${companyId}/details`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: name,
            industry,
            companySize,
            companyLocation: location,
            companyEmail: email,
            website,
            about,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save");

      alert("Saved successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE LOGO UPLOAD
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (100KB)
    if (file.size > 100 * 1024) {
      alert("Image must be less than 100KB");
      return;
    }

    // Show preview immediately
    setLogoPreview(URL.createObjectURL(file));

    // Upload to backend
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await authFetch(
        `http://localhost:8080/api/company/${companyId}/logo`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type - browser sets it with boundary
        }
      );

      if (!response.ok) throw new Error("Failed to upload logo");

      const data = await response.json();
      setLogo(data.logoUrl);
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo");
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

        {/* LOGO */}
        <div className="cdm-uploadRow">
          <div className="cdm-previewBox">
            {logoPreview ? (
              <img src={logoPreview} alt="logo" width="50" />
            ) : (
              "🖼️"
            )}
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
                  onChange={handleLogoChange}
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
              <option value="">Select Industry</option>
              <option value="Software & IT">Software & IT</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
            </select>
          </Field>

          <Field label="Company Size">
            <select
              className="cdm-input"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option value="">Select Size</option>
              <option value="1-10 employees">1–10 employees</option>
              <option value="10-50 employees">10–50 employees</option>
              <option value="50-100 employees">50–100 employees</option>
              <option value="100-500 employees">100–500 employees</option>
            </select>
          </Field>

          <Field label="Location">
            <select
              className="cdm-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select Location</option>
              <option value="Colombo">Colombo</option>
              <option value="Galle">Galle</option>
              <option value="Kandy">Kandy</option>
            </select>
          </Field>

          <Field label="Company Email">
            <input
              className="cdm-input"
              type="email"
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
            <button type="submit" className="cdm-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
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