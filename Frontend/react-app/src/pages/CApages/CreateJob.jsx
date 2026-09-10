import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CreateJob.css";
import api from "../../lib/api";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { supabase } from "../../lib/supabase";

export default function CreateJob() {

  const [companyId, setCompanyId] = useState(null);
  const [userId,    setUserId]    = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [limitError, setLimitError] = useState(null);

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
  const [loading, setLoading] = useState(false);
  // Replaces the native browser alert() popups with an in-app styled modal.
  // { type: "success" | "error", title, message } | null
  const [statusModal, setStatusModal] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "interview_rounds") setInterviewStages(Array(Number(value)).fill(""));
    setLimitError(null);
  };

  const handleStageChange = (index, value) => {
    const updated = [...interviewStages]; updated[index] = value; setInterviewStages(updated);
  };
  const handleReqChange = (index, value) => {
    const updated = [...reqs]; updated[index] = value; setReqs(updated);
  };
  const addRequirement = () => setReqs([...reqs, ""]);
  const removeRequirement = (index) => { if (reqs.length === 1) return; setReqs(reqs.filter((_, i) => i !== index)); };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.department)   newErrors.department = "Required";
    if (!form.type)         newErrors.type = "Required";
    if (reqs.filter((r) => r.trim()).length === 0) newErrors.reqs = "At least one requirement is needed";
    return newErrors;
  };

  const handleSubmit = async () => {
    if (sessionError) { setStatusModal({ type: "error", title: "Can't Post Job", message: sessionError }); return; }
    if (!companyId)   { setStatusModal({ type: "error", title: "Please Wait", message: "Loading company info, please wait..." }); return; }
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setErrors({});
    setLimitError(null);

    const jobData = {
      title:           form.title.trim(),
      department:      form.department,
      type:            form.type,
      category:        form.category,
      location:        form.location,
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
      // Log job creation — non-fatal, never blocks the post flow
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

      const skillCount = res.data.requirements?.length || 0;
      setStatusModal({
        type: "success",
        title: "Job Posted!",
        message: `AI extracted ${skillCount} skill requirement${skillCount === 1 ? "" : "s"} from your listing.`,
      });
      setForm({ title: "", department: "", type: "", category: "", location: "", experience: "", vacancies: "", interview_rounds: "", education: "", benefits: "", deadline: "" });
      setInterviewStages([]); setReqs([""]);
    } catch (error) {
      const msg = error.response?.data;
      if (typeof msg === "string" && msg.includes("limit reached")) {
        setLimitError(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setStatusModal({ type: "error", title: "Couldn't Post Job", message: msg || "Error saving job." });
      }
    } finally {
      setLoading(false);
    }
  };

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
              <label className="cj-label">Job Title</label>
              <input name="title" value={form.title} className="cj-input" onChange={handleChange} placeholder="e.g. Frontend Developer" />
              {errors.title && <p className="cj-error">{errors.title}</p>}
            </div>

            <div className="cj-field">
              <label className="cj-label">Department</label>
              <select name="department" value={form.department} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>QA</option>
                <option>HR</option>
              </select>
              {errors.department && <p className="cj-error">{errors.department}</p>}
            </div>

            <div className="cj-field">
              <label className="cj-label">Employment Type</label>
              <select name="type" value={form.type} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
              {errors.type && <p className="cj-error">{errors.type}</p>}
            </div>

            <div className="cj-field">
              <label className="cj-label">Category</label>
              <select name="category" value={form.category} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="IT">IT</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Number of Interview Rounds</label>
              <select name="interview_rounds" value={form.interview_rounds} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                {[1,2,3,4,5].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>

            {interviewStages.map((stage, index) => (
              <div className="cj-field" key={index}>
                <label className="cj-label">Stage {index + 1}</label>
                <select className="cj-select" value={stage} onChange={(e) => handleStageChange(index, e.target.value)}>
                  <option value="">Select Stage</option>
                  <option>HR</option><option>Technical</option>
                  <option>Managerial</option><option>Final</option>
                </select>
              </div>
            ))}

            <div className="cj-field">
              <label className="cj-label">Job Location</label>
              <input name="location" value={form.location} className="cj-input" onChange={handleChange} placeholder="e.g. Colombo, Remote" />
            </div>

            <div className="cj-field">
              <label className="cj-label">Experience Level</label>
              <select name="experience" value={form.experience} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option value="ENTRY_LEVEL">Entry Level</option>
                <option value="MID_LEVEL">Mid Level</option>
                <option value="SENIOR_LEVEL">Senior Level</option>
                <option value="DIRECTOR">Director</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Vacancies</label>
              <select name="vacancies" value={form.vacancies} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Education Requirements</label>
              <input
                name="education"
                value={form.education}
                className="cj-input"
                onChange={handleChange}
                placeholder="e.g. Bachelor's Degree in Computer Science"
              />
            </div>

            <div className="cj-field">
              <label className="cj-label">Job Benefits</label>
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
              <label className="cj-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                className="cj-input"
                onChange={handleChange}
              />
            </div>

            <div className="cj-field">
              <label className="cj-label">Key Requirements</label>
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
              {errors.reqs && <p className="cj-error">{errors.reqs}</p>}
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

      {statusModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4"
          onClick={() => setStatusModal(null)}
        >
          <div
            className="cj-statusModal bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
                statusModal.type === "success" ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              {statusModal.type === "success" ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>

            <h3 className="text-lg font-semibold text-[#0C3E56] mb-1.5">
              {statusModal.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {statusModal.message}
            </p>

            <button
              onClick={() => setStatusModal(null)}
              className="w-full h-11 rounded-xl font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--heading)", boxShadow: "0 8px 18px rgba(36, 105, 139, 0.28)" }}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}