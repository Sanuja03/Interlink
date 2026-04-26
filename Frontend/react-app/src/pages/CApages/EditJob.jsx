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
    vacancies: "",
    interviewRounds: "",
  });

  const [interviewStages, setInterviewStages] = useState([]);
  const [reqs, setReqs] = useState([""]);

  useEffect(() => {
    axios.get(`http://localhost:8080/jobs/${id}`)
      .then(res => {
        const job = res.data;

        setForm({
          title: job.title || "",
          department: job.department || "",
          type: job.type || "",
          category: job.category || "",
          location: job.location || "",
          experience: job.experience || "",
          vacancies: job.vacancies || "",
          interviewRounds: job.interviewRounds || "",
        });

        setInterviewStages(
          job.interviewStages ? job.interviewStages.split(", ") : []
        );

        setReqs(
          job.requirements ? job.requirements.split(", ") : [""]
        );
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "interviewRounds") {
      setInterviewStages(Array(Number(value)).fill(""));
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

  const handleUpdate = async () => {
    const data = {
      ...form,
      vacancies: Number(form.vacancies),
      interviewRounds: Number(form.interviewRounds),
      interviewStages: interviewStages.join(", "),
      requirements: reqs.join(", "),
    };

    await axios.put(`http://localhost:8080/jobs/${id}`, data);
    alert("Job Updated!");
    navigate("/job-management");
  };

  const handleDelete = async () => {
    await axios.delete(`http://localhost:8080/jobs/${id}`);
    alert("Job Deleted!");
    navigate("/job-management");
  };

  return (
    <DashboardLayout>
      <div className="ej-page">
        <div className="ej-container">

          <h2 className="ej-title">Update Job</h2>

          <div className="ej-card">

            <input name="title" value={form.title} onChange={handleChange} className="ej-input" />

            <select name="department" value={form.department} onChange={handleChange} className="ej-input">
              <option>Engineering</option>
              <option>Design</option>
              <option>QA</option>
              <option>HR</option>
            </select>

            <select name="type" value={form.type} onChange={handleChange} className="ej-input">
              <option>Full-Time</option>
              <option>Part-Time</option>
            </select>

            <select name="category" value={form.category} onChange={handleChange} className="ej-input">
              <option>Finance</option>
              <option>IT</option>
            </select>

            <select name="interviewRounds" value={form.interviewRounds} onChange={handleChange} className="ej-input">
              {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
            </select>

            {interviewStages.map((stage, i) => (
              <select
                key={i}
                value={stage}
                onChange={(e) => handleStageChange(i, e.target.value)}
                className="ej-input"
              >
                <option>Technical</option>
                <option>HR</option>
                <option>Managerial</option>
              </select>
            ))}

            <input name="location" value={form.location} onChange={handleChange} className="ej-input" />

            <select name="experience" value={form.experience} onChange={handleChange} className="ej-input">
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>

            <select name="vacancies" value={form.vacancies} onChange={handleChange} className="ej-input">
              {[...Array(100)].map((_, i) => (
                <option key={i+1}>{i+1}</option>
              ))}
            </select>

            {reqs.map((r, i) => (
              <div key={i} className="ej-req-row">
                <button className="ej-req-btn" onClick={() => removeReq(i)}>-</button>

                <input
                  className="ej-input ej-req-input"
                  value={r}
                  onChange={(e) => handleReqChange(i, e.target.value)}
                />

                <button className="ej-req-btn" onClick={addReq}>+</button>
              </div>
            ))}

          </div>

          <div className="ej-actions">
            <button className="ej-save" onClick={handleUpdate}>Save</button>

            <button
              className="ej-cancel"
              onClick={() => navigate("/job-management")}
            >
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