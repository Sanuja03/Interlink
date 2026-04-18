import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./InterviewConfirmation.css";

import companyLogo from "../../assets/images/default-avatar.png";

export default function InterviewConfirmation() {
  const navigate = useNavigate();

  const [meetingLink, setMeetingLink] = useState("");
  const [note, setNote] = useState("");

  const [errors, setErrors] = useState({
    meetingLink: "",
  });

  const handleConfirm = () => {
    const newErrors = {
      meetingLink: "",
    };

    if (!meetingLink.trim()) {
      newErrors.meetingLink = "Meeting link is required";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((value) => value !== "");
    if (!hasErrors) {
      alert("Interview confirmed successfully!");
    }
  };

  const handleCancel = () => {
    setMeetingLink("");
    setNote("");
    setErrors({ meetingLink: "" });
  };

  return (
    <DashboardLayout>
      <div className="ic-page">
        <h1 className="ic-title">Interview Confirmation</h1>

        {/* Summary */}
        <div className="ic-summaryCard">
          <div className="ic-summaryGrid">
            <div className="ic-row">
              <span className="ic-label">Candidate Name</span>
              <span className="ic-value">Kavisha Silva</span>
            </div>

            <div className="ic-row">
              <span className="ic-label">Job Role</span>
              <span className="ic-value">UI/UX Designer</span>
            </div>

            <div className="ic-row">
              <span className="ic-label">Interviewer</span>
              <span className="ic-value">R. Fernando</span>
            </div>

            <div className="ic-row">
              <span className="ic-label">Interview Date</span>
              <span className="ic-value">18 Jan 2026</span>
            </div>

            <div className="ic-row">
              <span className="ic-label">Interview Time</span>
              <span className="ic-value">10:30 AM</span>
            </div>

            <div className="ic-row">
              <span className="ic-label">Mode</span>
              <span className="ic-value">Online</span>
            </div>

            <div className="ic-row ic-rowFull">
              <span className="ic-label">Note</span>
              <span className="ic-value"></span>
            </div>
          </div>
        </div>

        {/* Edit */}
        <div className="ic-editRow">
          <button
            className="ic-editIconBtn"
            onClick={() => navigate("/schedule-interview")}
          >
            ✏️
          </button>

          <span className="ic-editText">Edit and send request</span>
        </div>

        {/* Form */}
        <div className="ic-formSection">
          <div className="ic-field">
            <label className="ic-fieldLabel">Meeting Link</label>
            <input
              type="text"
              className="ic-input"
              placeholder="meeting.com"
              value={meetingLink}
              onChange={(e) => {
                setMeetingLink(e.target.value);
                setErrors((prev) => ({ ...prev, meetingLink: "" }));
              }}
            />
            {errors.meetingLink && (
              <p className="ic-error">{errors.meetingLink}</p>
            )}
          </div>

          <div className="ic-field">
            <label className="ic-fieldLabel">Note</label>
            <textarea
              className="ic-textarea"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ic-actions">
          <button className="ic-btn ic-btnConfirm" onClick={handleConfirm}>
            Confirm
          </button>

          <button className="ic-btn ic-btnCancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}