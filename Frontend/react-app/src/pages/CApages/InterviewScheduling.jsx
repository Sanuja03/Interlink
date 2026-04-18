import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./InterviewScheduling.css";

export default function InterviewScheduling() {
  const [formData, setFormData] = useState({
    candidateName: "",
    jobRole: "",
    interviewer: "",
    interviewDate: "",
    interviewTime: "",
    mode: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.candidateName.trim()) {
      newErrors.candidateName = "Candidate name is required";
    }

    if (!formData.jobRole) {
      newErrors.jobRole = "Job role is required";
    }

    if (!formData.interviewer) {
      newErrors.interviewer = "Interviewer is required";
    }

    if (!formData.interviewDate) {
      newErrors.interviewDate = "Interview date is required";
    }

    if (!formData.interviewTime) {
      newErrors.interviewTime = "Interview time is required";
    }

    if (!formData.mode) {
      newErrors.mode = "Mode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", formData);
      alert("Interview request sent successfully!");
    }
  };

  const handleCancel = () => {
    setFormData({
      candidateName: "",
      jobRole: "",
      interviewer: "",
      interviewDate: "",
      interviewTime: "",
      mode: "",
      note: "",
    });
    setErrors({});
  };

  return (
    <DashboardLayout>
      <div className="is-page">
        <h1 className="is-title">Interview Scheduling Request Screen</h1>

        <form className="is-formCard" onSubmit={handleSubmit}>
          <div className="is-field">
            <label className="is-label">Candidate Name</label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              className="is-input"
              placeholder="Kavisha Silva"
            />
            {errors.candidateName && (
              <p className="is-error">{errors.candidateName}</p>
            )}
          </div>

          <div className="is-field">
            <label className="is-label">Job Role</label>
            <select
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              className="is-input"
            >
              <option value="">Select Job Role</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="QA Engineer">QA Engineer</option>
            </select>
            {errors.jobRole && <p className="is-error">{errors.jobRole}</p>}
          </div>

          <div className="is-field">
            <label className="is-label">Interviewer</label>
            <select
              name="interviewer"
              value={formData.interviewer}
              onChange={handleChange}
              className="is-input"
            >
              <option value="">Select Interviewer</option>
              <option value="R. Fernando">R. Fernando</option>
              <option value="K. Perera">K. Perera</option>
              <option value="S. Silva">S. Silva</option>
            </select>
            {errors.interviewer && (
              <p className="is-error">{errors.interviewer}</p>
            )}
          </div>

          <div className="is-field">
            <label className="is-label">Interview Date</label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              className="is-input"
            />
            {errors.interviewDate && (
              <p className="is-error">{errors.interviewDate}</p>
            )}
          </div>

          <div className="is-field">
            <label className="is-label">Interview Time</label>
            <input
              type="time"
              name="interviewTime"
              value={formData.interviewTime}
              onChange={handleChange}
              className="is-input"
            />
            {errors.interviewTime && (
              <p className="is-error">{errors.interviewTime}</p>
            )}
          </div>

          <div className="is-field">
            <label className="is-label">Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="is-input"
            >
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Physical">Physical</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {errors.mode && <p className="is-error">{errors.mode}</p>}
          </div>

          <div className="is-field">
            <label className="is-label">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="is-textarea"
              placeholder="Note"
            />
          </div>

          <div className="is-actions">
            <button type="submit" className="is-btn is-btnPrimary">
              Send Request
            </button>
            <button
              type="button"
              className="is-btn is-btnDanger"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}