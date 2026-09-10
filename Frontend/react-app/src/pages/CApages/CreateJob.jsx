import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import CustomSelect from "./CustomSelect";
import "./CreateJob.css";
import api from "../../lib/api";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { supabase } from "../../lib/supabase";

export default function CreateJob() {

  const [companyId, setCompanyId] = useState(null);
  const [userId,    setUserId]    = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [limitError, setLimitError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const loadCompanyId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSessionError("Not logged in"); return; }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("companies")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) { setSessionError("Could not find your company record."); return; }
      setCompanyId(data.company_id);
    };
    loadCompanyId();
  }, []);

  const [form, setForm] = useState({
    title: "", department: "", type: "", category: "",
    location: "", experience: "", vacancies: "", interview_rounds: "",
    education: "", benefits: "", deadline: "",
  });
  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Validation rules ─────────────────────────────────────────────
  // Each rule returns an error message string, or "" when the value is valid.
  const todayStr = new Date().toISOString().slice(0, 10);

  const rules = {
    title: (v) =>
      !v.trim() ? "Job title is required"
      : v.trim().length < 3 ? "Job title must be at least 3 characters"
      : "",
    department:       (v) => (!v.trim() ? "Department is required" : ""),
    type:             (v) => (!v ? "Please select an employment type" : ""),
    category:         (v) => (!v ? "Please select a category" : ""),
    interview_rounds: (v) => (!v ? "Please select the number of interview rounds" : ""),
    location:         (v) => (!v.trim() ? "Job location is required" : ""),
    experience:       (v) => (!v ? "Please select an experience level" : ""),
    vacancies:        (v) => (!v ? "Please select the number of vacancies" : ""),
    deadline:         (v) => (v && v < todayStr ? "Deadline cannot be in the past" : ""),
  };

  // Full-form validation — used on submit and for live re-checks.
  const buildErrors = () => {
    const e = {};
    Object.keys(rules).forEach((k) => {
      const msg = rules[k](form[k] ?? "");
      if (msg) e[k] = msg;
    });
    // Each interview stage must be chosen once the round count is set.
    if (form.interview_rounds) {
      interviewStages.forEach((s, i) => {
        if (!s) e[`stage${i}`] = "Please select a stage";
      });
    }
    // At least one non-empty key requirement.
    if (reqs.filter((r) => r.trim()).length === 0) {
      e.reqs = "Add at least one key requirement";
    }
    return e;
  };

  // Show a field's error only after the user has touched it or tried to submit.
  const showError = (name) => errors[name] && (touched[name] || submitAttempted);
  const inputClass  = (name) => `cj-input${showError(name) ? " cj-input--error" : ""}`;
  const selectClass = (name) => `cj-select${showError(name) ? " cj-select--error" : ""}`;

  // Re-validate a single field (on blur / on change after touch).
  const runFieldValidation = (name, value) => {
    if (!rules[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      const msg = rules[name](value ?? "");
      if (msg) next[name] = msg; else delete next[name];
      return next;
    });
  };

  // Once a submit has been attempted, keep errors live as the user edits.
  useEffect(() => {
    if (submitAttempted) setErrors(buildErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, interviewStages, reqs, submitAttempted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "interview_rounds") setInterviewStages(Array(Number(value)).fill(""));
    setLimitError(null);
    setSuccessMsg(null);
    if (touched[name] || submitAttempted) runFieldValidation(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    runFieldValidation(name, value);
  };

  const handleStageChange = (index, value) => {
    const updated = [...interviewStages]; updated[index] = value; setInterviewStages(updated);
    if (submitAttempted) {
      setErrors((prev) => {
        const next = { ...prev };
        if (value) delete next[`stage${index}`]; else next[`stage${index}`] = "Please select a stage";
        return next;
      });
    }
  };
  const handleReqChange = (index, value) => {
    const updated = [...reqs]; updated[index] = value; setReqs(updated);
  };
  const addRequirement = () => setReqs([...reqs, ""]);
  const removeRequirement = (index) => { if (reqs.length === 1) return; setReqs(reqs.filter((_, i) => i !== index)); };

  const focusFirstError = (e) => {
    const order = [
      "title", "department", "type", "category", "interview_rounds",
      ...interviewStages.map((_, i) => `stage${i}`),
      "location", "experience", "vacancies", "deadline", "reqs",
    ];
    const first = order.find((k) => e[k]);
    if (!first) return;
    const el = document.querySelector(`[name="${first}"]`)
            || document.querySelector(`[data-field="${first}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof el.focus === "function") setTimeout(() => el.focus(), 250);
    }
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setSuccessMsg(null);

    if (sessionError) { return; }
    if (!companyId)   { setLimitError("Loading company info, please wait..."); return; }

    const validationErrors = buildErrors();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    setLoading(true);
    setLimitError(null);

    const jobData = {
      title:           form.title.trim(),
      department:      form.department,
      type:            form.type,
      category:        form.category,
      location:        form.location.trim(),
      experience:      form.experience,
      vacancies:       Number(form.vacancies || 0),
      interviewRounds: Number(form.interview_rounds || 0),
      interviewStages: interviewStages.join(", "),
      requirementText: reqs.filter((r) => r.trim()).join(", "),
      companyId:       companyId,
      educationRequired: form.education.trim(),
      jobBenefits:       form.benefits.trim(),
      deadline:          form.deadline || null,
    };

    try {
      const res = await api.post("/jobs", jobData);
      try {
        await createActivityLog({
          userId:      userId,
          userRole:    "company_admin",
          action:      "CREATE",
          entityType:  "JOB",
          description: `Created job: ${jobData.title}`,
        });
      } catch (err) {
        console.error("[CreateJob] Failed to create activity log:", err);
      }

      setSuccessMsg(
        `Job posted successfully. AI extracted ${res.data.requirements?.length || 0} skill requirement(s).`
      );
      setForm({ title: "", department: "", type: "", category: "", location: "", experience: "", vacancies: "", interview_rounds: "", education: "", benefits: "", deadline: "" });
      setInterviewStages([]); setReqs([""]);
      setErrors({}); setTouched({}); setSubmitAttempted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const msg = error.response?.data;
      if (typeof msg === "string" && msg.includes("limit reached")) {
        setLimitError(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setLimitError(typeof msg === "string" ? msg : "Something went wrong while saving the job. Please try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Small helper: label with a red asterisk for required fields.
  const Label = ({ children, required }) => (
    <label className="cj-label">
      {children}{required && <span className="cj-req" aria-hidden="true"> *</span>}
    </label>
  );

  return (
    <DashboardLayout>
      <div className="cj-page">
        <div className="cj-container">
          <h2 className="cj-title">Create new job</h2>

          {sessionError && (
            <div style={{ background: "#fee", color: "#c00", padding: 12, borderRadius: 8, marginBottom: 16, textAlign: "center" }}>
              ⚠️ {sessionError}
            </div>
          )}

          {successMsg && (
            <div className="cj-success" role="status">
              <span style={{ marginRight: 8 }}>✅</span>{successMsg}
            </div>
          )}

          {submitAttempted && Object.keys(errors).length > 0 && (
            <div className="cj-formError" role="alert">
              <span style={{ marginRight: 8 }}>⚠️</span>
              Please fix the highlighted fields before posting.
            </div>
          )}

          {limitError && (
            <div className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold text-sm">Job Limit Reached</p>
                  <p className="text-sm mt-0.5 text-red-600">{limitError}</p>
                </div>
              </div>
              <button
                onClick={() => setLimitError(null)}
                className="text-red-400 hover:text-red-600 text-lg leading-none mt-0.5"
              >
                ✕
              </button>
            </div>
          )}

          <div className="cj-card">

            <div className="cj-field">
              <Label required>Job Title</Label>
              <input name="title" value={form.title} className={inputClass("title")} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Frontend Developer" />
              {showError("title") && <p className="cj-error">{errors.title}</p>}
            </div>

            <div className="cj-field">
              <Label required>Department</Label>
              <input
                name="department"
                value={form.department}
                className={inputClass("department")}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Engineering, Marketing, Finance"
              />
              {showError("department") && <p className="cj-error">{errors.department}</p>}
            </div>

            <div className="cj-field">
              <Label required>Employment Type</Label>
              <CustomSelect
                name="type"
                value={form.type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("type")}
                options={[
                  { value: "REMOTE", label: "Remote" },
                  { value: "ONSITE", label: "Onsite" },
                  { value: "HYBRID", label: "Hybrid" },
                ]}
              />
              {showError("type") && <p className="cj-error">{errors.type}</p>}
            </div>

            <div className="cj-field">
              <Label required>Category</Label>
              <CustomSelect
                name="category"
                value={form.category}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("category")}
                options={["Engineering", "Design", "Marketing", "Finance", "Healthcare", "IT"]}
              />
              {showError("category") && <p className="cj-error">{errors.category}</p>}
            </div>

            <div className="cj-field">
              <Label required>Number of Interview Rounds</Label>
              <CustomSelect
                name="interview_rounds"
                value={form.interview_rounds}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("interview_rounds")}
                options={[1, 2, 3, 4, 5]}
              />
              {showError("interview_rounds") && <p className="cj-error">{errors.interview_rounds}</p>}
            </div>

            {interviewStages.map((stage, index) => (
              <div className="cj-field" key={index}>
                <Label required>Stage {index + 1}</Label>
                <CustomSelect
                  name={`stage${index}`}
                  value={stage}
                  onChange={(e) => handleStageChange(index, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [`stage${index}`]: true }))}
                  error={errors[`stage${index}`] && (touched[`stage${index}`] || submitAttempted)}
                  placeholder="Select Stage"
                  options={["HR", "Technical", "Managerial", "Final"]}
                />
                {errors[`stage${index}`] && (touched[`stage${index}`] || submitAttempted) && (
                  <p className="cj-error">{errors[`stage${index}`]}</p>
                )}
              </div>
            ))}

            <div className="cj-field">
              <Label required>Job Location</Label>
              <input name="location" value={form.location} className={inputClass("location")} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Colombo, Remote" />
              {showError("location") && <p className="cj-error">{errors.location}</p>}
            </div>

            <div className="cj-field">
              <Label required>Experience Level</Label>
              <CustomSelect
                name="experience"
                value={form.experience}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("experience")}
                options={[
                  { value: "ENTRY_LEVEL", label: "Entry Level" },
                  { value: "MID_LEVEL", label: "Mid Level" },
                  { value: "SENIOR_LEVEL", label: "Senior Level" },
                  { value: "DIRECTOR", label: "Director" },
                  { value: "EXECUTIVE", label: "Executive" },
                ]}
              />
              {showError("experience") && <p className="cj-error">{errors.experience}</p>}
            </div>

            <div className="cj-field">
              <Label required>Vacancies</Label>
              <CustomSelect
                name="vacancies"
                value={form.vacancies}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError("vacancies")}
                options={Array.from({ length: 100 }, (_, i) => i + 1)}
              />
              {showError("vacancies") && <p className="cj-error">{errors.vacancies}</p>}
            </div>

            <div className="cj-field">
              <Label>Education Requirements</Label>
              <input
                name="education"
                value={form.education}
                className="cj-input"
                onChange={handleChange}
                placeholder="e.g. Bachelor's Degree in Computer Science"
              />
            </div>

            <div className="cj-field">
              <Label>Job Benefits</Label>
              <textarea
                name="benefits"
                value={form.benefits}
                className="cj-input"
                onChange={handleChange}
                placeholder="e.g. Health insurance, remote work allowance, annual bonus"
                rows={3}
              />
            </div>

            <div className="cj-field">
              <Label>Application Deadline</Label>
              <input
                type="date"
                name="deadline"
                min={todayStr}
                value={form.deadline}
                className={inputClass("deadline")}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {showError("deadline") && <p className="cj-error">{errors.deadline}</p>}
            </div>

            <div className="cj-field" data-field="reqs">
              <Label required>Key Requirements</Label>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                Add each requirement separately. AI will extract skills from these.
              </p>
              {reqs.map((req, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <button type="button" onClick={() => removeRequirement(index)} className="cj-reqBtn">−</button>
                  <input className="cj-reqInput" style={{ flex: 1 }} value={req}
                    placeholder="e.g. React, 3+ years experience, Bachelor's degree"
                    onChange={(e) => handleReqChange(index, e.target.value)} />
                  <button type="button" onClick={addRequirement} className="cj-reqBtn">+</button>
                </div>
              ))}
              {errors.reqs && submitAttempted && <p className="cj-error">{errors.reqs}</p>}
            </div>

          </div>

          <div className="cj-actions">
            <button className="cj-post" onClick={handleSubmit} disabled={loading || !!sessionError}>
              {loading ? "Posting..." : "Post"}
            </button>
            <button className="cj-cancel" onClick={() => window.history.back()} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
