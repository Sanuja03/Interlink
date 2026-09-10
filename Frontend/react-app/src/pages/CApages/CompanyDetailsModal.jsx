import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import CustomSelect from "./CustomSelect";
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (!open || !companyId) return;

    // Reset validation state each time the modal opens.
    setErrors({}); setTouched({}); setSubmitAttempted(false);
    setSuccessMsg(null); setFormError(null);

    api
      .get(`/company/${companyId}/details`)
      .then((res) => {
        const data = res.data;
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

  // ── Validation rules ─────────────────────────────────────────────
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRe = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  const rules = {
    name:        (v) => (!v.trim() ? "Company name is required" : ""),
    industry:    (v) => (!v ? "Please select an industry" : ""),
    companySize: (v) => (!v ? "Please select a company size" : ""),
    location:    (v) => (!v.trim() ? "Location is required" : ""),
    email: (v) =>
      !v.trim() ? "Company email is required"
      : !emailRe.test(v.trim()) ? "Enter a valid email address"
      : "",
    website: (v) =>
      v.trim() && !urlRe.test(v.trim()) ? "Enter a valid website URL" : "",
  };

  const values = { name, industry, companySize, location, email, website };

  const buildErrors = () => {
    const e = {};
    Object.keys(rules).forEach((k) => {
      const msg = rules[k](values[k] ?? "");
      if (msg) e[k] = msg;
    });
    return e;
  };

  const showError = (name) => errors[name] && (touched[name] || submitAttempted);
  const fieldClass = (name) => `cdm-input${showError(name) ? " cdm-input--error" : ""}`;

  const runFieldValidation = (name, value) => {
    if (!rules[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      const msg = rules[name](value ?? "");
      if (msg) next[name] = msg; else delete next[name];
      return next;
    });
  };

  // Live re-validation once a save was attempted.
  useEffect(() => {
    if (submitAttempted) setErrors(buildErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, industry, companySize, location, email, website, submitAttempted]);

  const handleBlur = (fieldName, value) => {
    setTouched((t) => ({ ...t, [fieldName]: true }));
    runFieldValidation(fieldName, value);
  };

  const focusFirstError = (e) => {
    const order = ["name", "industry", "companySize", "location", "email", "website"];
    const first = order.find((k) => e[k]);
    if (!first) return;
    const el = document.querySelector(`[name="${first}"]`) || document.querySelector(`[data-field="${first}"]`);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.focus?.(), 200); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSuccessMsg(null);
    setFormError(null);

    const validationErrors = buildErrors();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    setLoading(true);

    const payload = {
      companyName: name.trim(),
      industry,
      companySize,
      companyLocation: location.trim(),
      companyEmail: email.trim(),
      website: website.trim(),
      about,
    };

    try {
      await api.put(`/company/${companyId}/details`, payload);
      setSuccessMsg("Company details saved successfully.");
      setTimeout(() => onClose(), 900);
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setFormError("Logo image must be less than 100KB.");
      return;
    }
    setFormError(null);
    setLogoPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post(
        `/company/${companyId}/logo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setLogo(response.data.logoUrl);
    } catch (err) {
      console.error("Logo upload failed:", err);
      setFormError("Failed to upload logo. Please try again.");
    }
  };

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="cdm-overlay">
      <div className="cdm-modal" onClick={stop}>
        <div className="cdm-head">
          <div className="cdm-titleRow">
            <span className="cdm-square" />
            <h2 className="cdm-title">Company Details</h2>
          </div>
          <button
            type="button"
            className="cdm-closeX"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

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

        {successMsg && (
          <div className="cdm-success" role="status">
            <span style={{ marginRight: 8 }}>✅</span>{successMsg}
          </div>
        )}

        {formError && (
          <div className="cdm-formError" role="alert">
            <span style={{ marginRight: 8 }}>⚠️</span>{formError}
          </div>
        )}

        {submitAttempted && Object.keys(errors).length > 0 && (
          <div className="cdm-formError" role="alert">
            <span style={{ marginRight: 8 }}>⚠️</span>
            Please fix the highlighted fields before saving.
          </div>
        )}

        <form className="cdm-form" onSubmit={handleSave} noValidate>
          <Field label="Name" required error={showError("name") ? errors.name : ""}>
            <input
              name="name"
              className={fieldClass("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name", name)}
            />
          </Field>

          <Field label="Industry" required error={showError("industry") ? errors.industry : ""}>
            <CustomSelect
              name="industry"
              value={industry}
              error={showError("industry")}
              placeholder="Select Industry"
              onChange={(e) => setIndustry(e.target.value)}
              onBlur={() => handleBlur("industry", industry)}
              options={["Software & IT", "Design", "Finance"]}
            />
          </Field>

          <Field label="Company Size" required error={showError("companySize") ? errors.companySize : ""}>
            <CustomSelect
              name="companySize"
              value={companySize}
              error={showError("companySize")}
              placeholder="Select Size"
              onChange={(e) => setCompanySize(e.target.value)}
              onBlur={() => handleBlur("companySize", companySize)}
              options={[
                { value: "1-10 employees", label: "1–10 employees" },
                { value: "10-50 employees", label: "10–50 employees" },
                { value: "50-100 employees", label: "50–100 employees" },
                { value: "100-500 employees", label: "100–500 employees" },
              ]}
            />
          </Field>

          <Field label="Location" required error={showError("location") ? errors.location : ""}>
            <input
              name="location"
              className={fieldClass("location")}
              type="text"
              placeholder="e.g. Colombo, Sri Lanka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => handleBlur("location", location)}
            />
          </Field>

          <Field label="Company Email" required error={showError("email") ? errors.email : ""}>
            <input
              name="email"
              className={fieldClass("email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email", email)}
            />
          </Field>

          <Field label="Company Website" error={showError("website") ? errors.website : ""}>
            <input
              name="website"
              className={fieldClass("website")}
              placeholder="e.g. https://company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              onBlur={() => handleBlur("website", website)}
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

function Field({ label, required, error, children }) {
  return (
    <div className="cdm-field">
      <label className="cdm-label">
        {label}{required && <span className="cdm-req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p className="cdm-error">{error}</p>}
    </div>
  );
}
