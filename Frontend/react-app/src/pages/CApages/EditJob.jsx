import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./EditJob.css";
import axios from "axios";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    department: "",
    type: "",
    category: "",
    location: "",
    experience: "",
    vacancies: 1,
    interviewRounds: 1,
    education: "",
    benefits: "",
    deadline: "",
  });

  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token);
      setUserId(data.session?.user?.id ?? null);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (!jobId || !token) return;

    axios
      .get(`http://localhost:8080/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const job = res.data;
        setForm({
          title: job.jobTitle || "",
          department: job.department || "",
          type: job.employmentType || "",
          category: job.category || "",
          location: job.jobLocation || "",
          experience: job.experienceLevel || "",
          vacancies: job.vacancies || 1,
          interviewRounds: job.interviewRounds || 1,
          education: job.educationRequired || "",
          benefits: job.jobBenefits || "",
          deadline: job.deadline ? job.deadline.slice(0, 10) : "",
        });
        setInterviewStages(
          job.interviewStages ? job.interviewStages.split(", ") : []
        );
        setReqs(
          job.keyRequirements ? job.keyRequirements.split(", ") : [""]
        );
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  }, [jobId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "interviewRounds") {
      const count = Number(value);
      setInterviewStages((prev) => {
        const updated = [...prev];
        while (updated.length < count) updated.push("");
        return updated.slice(0, count);
      });
    }
  };

  const handleStageChange = (i, val) => {
    const updated = [...interviewStages];
    updated[i] = val;
    setInterviewStages(updated);
  };

  const handleReqChange = (i, val) => {
    const updated = [...reqs];
    updated[i] = val;
    setReqs(updated);
  };

  const addReq = () => setReqs([...reqs, ""]);
  const removeReq = (i) => setReqs(reqs.filter((_, idx) => idx !== i));

  const handleUpdate = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) { alert("Company ID missing"); return; }
      if (!token) { alert("Token missing. Reload page."); return; }

      const data = {
        ...form,
        vacancies: Number(form.vacancies),
        interviewRounds: Number(form.interviewRounds),
        interviewStages: interviewStages.filter(Boolean).join(", "),
        requirementText: reqs.filter(Boolean).join(", "),
        companyId,
        educationRequired: form.education,
        jobBenefits: form.benefits,
        deadline: form.deadline || null,
      };

      await axios.put(`http://localhost:8080/api/jobs/${jobId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      try {
        await createActivityLog({
          userId:      userId,
          userRole:    "company_admin",
          action:      "UPDATE",
          entityType:  "JOB",
          description: `Updated job: ${form.title}`,
        });
      } catch (err) {
        console.error("[EditJob] Failed to create activity log:", err);
      }

      alert("Updated!");
      navigate("/company/job-management");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job? This can't be undone.")) {
      return;
    }
    try {
      if (!token) return;
      await axios.delete(`http://localhost:8080/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      try {
        await createActivityLog({
          userId:      userId,
          userRole:    "company_admin",
          action:      "DELETE",
          entityType:  "JOB",
          description: `Deleted job ID: ${jobId}`,
        });
      } catch (err) {
        console.error("[EditJob] Failed to create activity log:", err);
      }
      alert("Deleted!");
      navigate("/company/job-management");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to delete this job. Please try again.";
      alert(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="ej-page">
        <div className="ej-container">
          <h2 className="ej-title">Update Job</h2>

          <div className="ej-card">

            <div className="ej-field">
              <label className="ej-label">Job Title</label>
              <input
                name="title"
                value={form.title}
                className="ej-input"
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="ej-field">
              <label className="ej-label">Department</label>
              <select
                name="department"
                value={form.department}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>QA</option>
                <option>HR</option>
              </select>
            </div>

            <div className="ej-field">
              <label className="ej-label">Employment Type</label>
              <select
                name="type"
                value={form.type}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div className="ej-field">
              <label className="ej-label">Category</label>
              <select
                name="category"
                value={form.category}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </div>

            <div className="ej-field">
              <label className="ej-label">Number of Interview Rounds</label>
              <select
                name="interviewRounds"
                value={form.interviewRounds}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            {interviewStages.map((stage, index) => (
              <div className="ej-field" key={index}>
                <label className="ej-label">Stage {index + 1}</label>
                <select
                  className="ej-select"
                  value={stage}
                  onChange={(e) => handleStageChange(index, e.target.value)}
                >
                  <option value="">Select Stage</option>
                  <option>HR</option>
                  <option>Technical</option>
                  <option>Managerial</option>
                  <option>Final</option>
                </select>
              </div>
            ))}

            <div className="ej-field">
              <label className="ej-label">Job Location</label>
              <input
                name="location"
                value={form.location}
                className="ej-input"
                onChange={handleChange}
                placeholder="e.g. Colombo, Remote"
              />
            </div>

            <div className="ej-field">
              <label className="ej-label">Experience Level</label>
              <select
                name="experience"
                value={form.experience}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="ENTRY_LEVEL">Entry Level</option>
                <option value="MID_LEVEL">Mid Level</option>
                <option value="SENIOR_LEVEL">Senior Level</option>
                <option value="DIRECTOR">Director</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div className="ej-field">
              <label className="ej-label">Vacancies</label>
              <select
                name="vacancies"
                value={form.vacancies}
                className="ej-select"
                onChange={handleChange}
              >
                <option value="">Select</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="ej-field">
              <label className="ej-label">Education Requirements</label>
              <input
                name="education"
                value={form.education}
                className="ej-input"
                onChange={handleChange}
                placeholder="e.g. Bachelor's Degree in Computer Science"
              />
            </div>

            <div className="ej-field">
              <label className="ej-label">Job Benefits</label>
              <textarea
                name="benefits"
                value={form.benefits}
                className="ej-input"
                onChange={handleChange}
                placeholder="e.g. Health insurance, remote work allowance, annual bonus"
                rows={3}
              />
            </div>

            <div className="ej-field">
              <label className="ej-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                className="ej-input"
                onChange={handleChange}
              />
            </div>

            <div className="ej-field">
              <label className="ej-label">Key Requirements</label>
              <p className="ej-hint">
                Add each requirement separately. AI will extract skills from these.
              </p>
              {reqs.map((req, index) => (
                <div key={index} className="ej-req-row">
                  <button
                    type="button"
                    onClick={() => removeReq(index)}
                    className="ej-reqBtn"
                  >
                    −
                  </button>
                  <input
                    className="ej-reqInput"
                    value={req}
                    placeholder="e.g. React, 3+ years experience"
                    onChange={(e) => handleReqChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addReq}
                    className="ej-reqBtn"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>

          </div>

          <div className="ej-actions">
            <button className="ej-btn-save" onClick={handleUpdate}>
              Save
            </button>
            <button className="ej-btn-cancel" onClick={() => window.history.back()}>
              Cancel
            </button>
            <button className="ej-btn-delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
