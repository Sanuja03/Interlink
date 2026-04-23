import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./EditJob.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    employmentType: "",
    category: "",
    jobLocation: "",
    experienceLevel: "",
    vacancies: "",
    interviewRounds: "",
  });

  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);

  // ✅ FETCH JOB
  useEffect(() => {
    axios
      .get(`http://localhost:8080/company/jobs/${id}`)
      .then((res) => {
        const job = res.data;

        setForm({
          jobTitle: job.jobTitle || "",
          department: job.department || "",
          employmentType: job.employmentType || "",
          category: job.category || "",
          jobLocation: job.jobLocation || "",
          experienceLevel: job.experienceLevel || "",
          vacancies: job.vacancies || "",
          interviewRounds: job.interviewRounds || "",
        });

        setInterviewStages(
          job.interviewStages && job.interviewStages !== "NULL"
            ? job.interviewStages.split(", ")
            : []
        );

        setReqs(
          job.keyRequirements
            ? job.keyRequirements.split(", ")
            : [""]
        );
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  }, [id]);

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔥 FIX: keep existing values when changing rounds
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
        keyRequirements: reqs.filter(r => r !== "").join(", "),
        companyId: companyId, // 🔥 IMPORTANT
      };

      console.log("UPDATE DATA:", data);

      await axios.put(
        `http://localhost:8080/company/jobs/${id}`, // ✅ FIXED
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
      await axios.delete(
        `http://localhost:8080/company/jobs/${id}`
      );
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

            <label className="ej-label">Job Title</label>
            <input name="jobTitle" value={form.jobTitle} onChange={handleChange} className="ej-input" />

            <label className="ej-label">Department</label>
            <select name="department" value={form.department} onChange={handleChange} className="ej-input">
              <option>Engineering</option>
              <option>Design</option>
              <option>QA</option>
              <option>HR</option>
            </select>

            <label className="ej-label">Employment Type</label>
            <select name="employmentType" value={form.employmentType} onChange={handleChange} className="ej-input">
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Intern</option>
              <option>Contract</option>
            </select>

            <label className="ej-label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="ej-input">
              <option>Finance</option>
              <option>IT</option>
              <option>Marketing</option>
            </select>

            <label className="ej-label">Interview Rounds</label>
            <select name="interviewRounds" value={form.interviewRounds} onChange={handleChange} className="ej-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            {interviewStages.map((stage, i) => (
              <div key={i}>
                <label className="ej-label">Stage {i + 1}</label>
                <select
                  value={stage}
                  onChange={(e) => handleStageChange(i, e.target.value)}
                  className="ej-input"
                >
                  <option value="">Select Stage</option>
                  <option>HR</option>
                  <option>Technical</option>
                  <option>Managerial</option>
                  <option>Final</option>
                </select>
              </div>
            ))}

            <label className="ej-label">Job Location</label>
            <input name="jobLocation" value={form.jobLocation} onChange={handleChange} className="ej-input" />

            <label className="ej-label">Experience Level</label>
            <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="ej-input">
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>

            <label className="ej-label">Vacancies</label>
            <select name="vacancies" value={form.vacancies} onChange={handleChange} className="ej-input">
              {[...Array(100)].map((_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>

            <label className="ej-label">Key Requirements</label>
            {reqs.map((r, i) => (
              <div key={i} className="ej-req-row">
                <button type="button" onClick={() => removeReq(i)}>-</button>
                <input value={r} onChange={(e) => handleReqChange(i, e.target.value)} />
                <button type="button" onClick={addReq}>+</button>
              </div>
            ))}

          </div>

          <div className="ej-actions">
            <button className="ej-save" onClick={handleUpdate}>Save</button>

            <button className="ej-cancel" onClick={() => navigate("/job-management")}>
              Cancel
            </button>

            <button className="ej-delete" onClick={handleDelete}>
              Delete Job
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}