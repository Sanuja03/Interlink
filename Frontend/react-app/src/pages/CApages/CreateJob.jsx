import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CreateJob.css";
import axios from "axios";

export default function CreateJob() {

  // 🔐 AUTH CHECK (✅ FIXED - NO REDIRECT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first!");
    }
  }, []);

  const [form, setForm] = useState({
    title: "",
    department: "",
    type: "",
    category: "",
    location: "",
    experience: "",
    vacancies: "",
    interview_rounds: "",
  });

  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "interview_rounds") {
      const rounds = Number(value);
      setInterviewStages(Array(rounds).fill(""));
    }
  };

  const handleStageChange = (index, value) => {
    const updated = [...interviewStages];
    updated[index] = value;
    setInterviewStages(updated);
  };

  const handleReqChange = (index, value) => {
    const updated = [...reqs];
    updated[index] = value;
    setReqs(updated);
  };

  const addRequirement = () => setReqs([...reqs, ""]);
  const removeRequirement = (index) => {
    const updated = reqs.filter((_, i) => i !== index);
    setReqs(updated);
  };

  const validate = () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Required";
    if (!form.department) newErrors.department = "Required";
    if (!form.type) newErrors.type = "Required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("token");

    const jobData = {
      title: form.title,
      department: form.department,
      type: form.type,
      category: form.category,
      location: form.location,
      experience: form.experience,
      vacancies: Number(form.vacancies || 0),
      interviewRounds: Number(form.interview_rounds || 0),
      interviewStages: interviewStages.join(", "),
      requirements: reqs.join(", "),
    };

    try {
      const res = await axios.post(
        "http://localhost:8080/jobs",
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Saved:", res.data);
      alert("Job Posted Successfully!");

      setForm({
        title: "",
        department: "",
        type: "",
        category: "",
        location: "",
        experience: "",
        vacancies: "",
        interview_rounds: "",
      });

      setInterviewStages([]);
      setReqs([""]);
      setErrors({});

    } catch (error) {
      console.error(error);
      alert("Error saving job");
    }
  };

  return (
    <DashboardLayout>
      <div className="cj-page">
        <div className="cj-container">

          <h2 className="cj-title">Create new job</h2>

          <div className="cj-card">

            <div className="cj-field">
              <label className="cj-label">Job Title</label>
              <input name="title" value={form.title} className="cj-input" onChange={handleChange}/>
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
            </div>

            <div className="cj-field">
              <label className="cj-label">Employment Type</label>
              <select name="type" value={form.type} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Intern</option>
                <option>Contract</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Category</label>
              <select name="category" value={form.category} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option>IT</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Number of Interview Rounds</label>
              <select name="interview_rounds" value={form.interview_rounds} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>

            {interviewStages.map((stage, index) => (
              <div className="cj-field" key={index}>
                <label className="cj-label">Stage {index + 1}</label>
                <select
                  className="cj-select"
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

            <div className="cj-field">
              <label className="cj-label">Job Location</label>
              <input name="location" value={form.location} className="cj-input" onChange={handleChange}/>
            </div>

            <div className="cj-field">
              <label className="cj-label">Experience Level</label>
              <select name="experience" value={form.experience} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Vacancies</label>
              <select name="vacancies" value={form.vacancies} className="cj-select" onChange={handleChange}>
                <option value="">Select</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Key Requirements</label>

              {reqs.map((req, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>

                  <button type="button" onClick={() => removeRequirement(index)} className="cj-icon-btn">
                    -
                  </button>

                  <input
                    className="cj-input"
                    value={req}
                    onChange={(e) => handleReqChange(index, e.target.value)}
                  />

                  <button type="button" onClick={addRequirement} className="cj-icon-btn">
                    +
                  </button>

                </div>
              ))}
            </div>

          </div>

          <div className="cj-actions">
            <button className="cj-post" onClick={handleSubmit}>
              Post
            </button>

            <button className="cj-cancel" onClick={() => window.history.back()}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}