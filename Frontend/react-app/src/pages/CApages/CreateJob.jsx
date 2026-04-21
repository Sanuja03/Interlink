import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CreateJob.css";
import axios from "axios";

export default function CreateJob() {

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

  const [reqs, setReqs] = useState([""]);
  const [errors, setErrors] = useState({});

  // 🔥 NEW STATE
  const [roundDetails, setRoundDetails] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 🔥 generate stage inputs
    if (name === "interview_rounds") {
      const count = Math.min(Number(value), 5);
      setRoundDetails(Array(count).fill(""));
    }
  };

  const handleReqChange = (index, value) => {
    const updated = [...reqs];
    updated[index] = value;
    setReqs(updated);
  };

  const handleRoundChange = (index, value) => {
    const updated = [...roundDetails];
    updated[index] = value;
    setRoundDetails(updated);
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

    console.log("Round Details:", roundDetails); // 🔥 DEBUG

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = localStorage.getItem("token");

    const jobData = {
      jobTitle: form.title,
      department: form.department,
      employmentType: form.type,
      category: form.category,
      jobLocation: form.location,
      experienceLevel: form.experience,
      vacancies: Number(form.vacancies || 0),
      interviewRounds: Number(form.interview_rounds || 0),
      keyRequirements: reqs.join(", "),
      companyId: 1,

      // 🔥 FIXED LINE
      interviewStages: roundDetails.filter(r => r !== "").join(", ")
    };

    console.log("Job Data:", jobData); // 🔥 DEBUG

    try {
      const res = await axios.post(
        "http://localhost:8080/company/jobs/create",
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

      setReqs([""]);
      setRoundDetails([]);
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
              <input className="cj-input" name="title" value={form.title} onChange={handleChange}/>
              {errors.title && <p className="cj-error">{errors.title}</p>}
            </div>

            <div className="cj-field">
              <label className="cj-label">Department</label>
              <select className="cj-select" name="department" value={form.department} onChange={handleChange}>
                <option value="">Select</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>QA</option>
                <option>HR</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Employment Type</label>
              <select className="cj-select" name="type" value={form.type} onChange={handleChange}>
                <option value="">Select</option>
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Intern</option>
                <option>Contract</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Category</label>
              <select className="cj-select" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select</option>
                <option>IT</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Interview Rounds</label>
              <select className="cj-select" name="interview_rounds" value={form.interview_rounds} onChange={handleChange}>
                <option value="">Select</option>
                {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>

            {/* 🔥 Interview Stages */}
            {roundDetails.length > 0 && (
              <div className="cj-field">
                <label className="cj-label">Interview Stages</label>

                {roundDetails.map((round, index) => (
                  <select
                    key={index}
                    className="cj-select"
                    value={roundDetails[index] || ""}
                    onChange={(e) => handleRoundChange(index, e.target.value)}
                    style={{ marginBottom: "10px" }}
                  >
                    <option value="">Select Stage</option>
                    <option value="HR">HR</option>
                    <option value="Technical">Technical</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Final">Final</option>
                  </select>
                ))}
              </div>
            )}

            <div className="cj-field">
              <label className="cj-label">Job Location</label>
              <input className="cj-input" name="location" value={form.location} onChange={handleChange}/>
            </div>

            <div className="cj-field">
              <label className="cj-label">Experience Level</label>
              <select className="cj-select" name="experience" value={form.experience} onChange={handleChange}>
                <option value="">Select</option>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Vacancies</label>
              <select className="cj-select" name="vacancies" value={form.vacancies} onChange={handleChange}>
                <option value="">Select</option>
                {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="cj-field">
              <label className="cj-label">Key Requirements</label>

              {reqs.map((req, index) => (
                <div key={index} className="cj-reqRow">
                  <button className="cj-reqBtn" type="button" onClick={() => removeRequirement(index)}>-</button>

                  <input
                    className="cj-reqInput"
                    value={req}
                    onChange={(e) => handleReqChange(index, e.target.value)}
                  />

                  <button className="cj-reqBtn" type="button" onClick={addRequirement}>+</button>
                </div>
              ))}
            </div>

          </div>

          <div className="cj-actions">
            <button className="cj-post" onClick={handleSubmit}>Post</button>
            <button className="cj-cancel" onClick={() => window.history.back()}>Cancel</button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}