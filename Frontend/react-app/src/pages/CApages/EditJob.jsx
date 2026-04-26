import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./EditJob.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EditJob() {
  const { id } = useParams();
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
  });

  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);

  // ✅ FETCH JOB
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/jobs/${id}`)
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
        });

        setInterviewStages(
          job.interviewStages ? job.interviewStages.split(", ") : []
        );

        setReqs(
          job.keyRequirements ? job.keyRequirements.split(", ") : [""]
        );
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  }, [id]);

  // ✅ INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "interviewRounds") {
      const count = Number(value);
      setInterviewStages((prev) => {
        const updated = [...prev];
        while (updated.length < count) updated.push("");
        return updated.slice(0, count);
      });
    }
  };

  const handleStageChange = (index, value) => {
    const updated = [...interviewStages];
    updated[index] = value;
    setInterviewStages(updated);
  };

  const handleReqChange = (i, val) => {
    const updated = [...reqs];
    updated[i] = val;
    setReqs(updated);
  };

  const addReq = () => setReqs([...reqs, ""]);
  const removeReq = (i) => setReqs(reqs.filter((_, index) => index !== i));

  // ✅ UPDATE JOB
  const handleUpdate = async () => {
    try {
      const companyId = localStorage.getItem("companyId");

      const data = {
        ...form,
        vacancies: Number(form.vacancies),
        interviewRounds: Number(form.interviewRounds),
        interviewStages: interviewStages.filter(s => s !== "").join(", "),
        requirementText: reqs.filter(r => r !== "").join(", "),
        companyId,
      };

      await axios.put(
        `http://localhost:8080/api/jobs/${id}`,
        data
      );

      alert("Job Updated Successfully!");
      navigate("/job-management");

    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err.message);
      alert("Update failed!");
    }
  };

  // ✅ DELETE
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/jobs/${id}`);
      alert("Job Deleted!");
      navigate("/job-management");
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="ej-page">
        <div className="ej-container">

          <h2 className="ej-title">Update Job</h2>

          <div className="ej-card">

            {/* Job Title */}
            <label>Job Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            {/* Department */}
            <label>Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="QA">QA</option>
              <option value="HR">HR</option>
            </select>

            {/* Employment Type */}
            <label>Employment Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            {/* Category */}
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>

            {/* Interview Rounds */}
            <label>Interview Rounds</label>
            <select
              name="interviewRounds"
              value={form.interviewRounds}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {[1,2,3,4,5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            {/* Interview Stages */}
            {interviewStages.map((stage, i) => (
              <select
                key={i}
                value={stage}
                onChange={(e) => handleStageChange(i, e.target.value)}
              >
                <option value="">Select Stage</option>
                <option value="HR">HR</option>
                <option value="Technical">Technical</option>
                <option value="Managerial">Managerial</option>
                <option value="Final">Final</option>
              </select>
            ))}

            {/* Location */}
            <label>Job Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
            />

            {/* Experience */}
            <label>Experience</label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="ENTRY_LEVEL">Entry Level</option>
              <option value="MID_LEVEL">Mid Level</option>
              <option value="SENIOR_LEVEL">Senior Level</option>
              <option value="DIRECTOR">Director</option>
              <option value="EXECUTIVE">Executive</option>
            </select>

            {/* Vacancies */}
            <label>Vacancies</label>
            <select
              name="vacancies"
              value={form.vacancies}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            {/* Requirements */}
            <label>Key Requirements</label>
            {reqs.map((r, i) => (
              <div key={i}>
                <input
                  value={r}
                  onChange={(e) => handleReqChange(i, e.target.value)}
                />
                <button type="button" onClick={addReq}>+</button>
                <button type="button" onClick={() => removeReq(i)}>-</button>
              </div>
            ))}

          </div>

          <div className="ej-actions">
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => navigate("/job-management")}>Cancel</button>
            <button onClick={handleDelete}>Delete Job</button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}