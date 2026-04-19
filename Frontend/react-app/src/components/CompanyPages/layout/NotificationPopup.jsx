import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationPopup.css";

export default function NotificationPopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleView = () => {
    onClose();
    navigate("/interview-confirmation"); // ✅ go to your page
  };

  return (
    <div className="np-card">
      <button className="np-close" onClick={onClose}>×</button>

      <div className="np-header">
        <div className="np-icon">i</div>
        <h2 className="np-title">Interview Notification</h2>
      </div>

      <p className="np-message">
        R. Fernando Accept Interview request
      </p>

      <button className="np-viewBtn" onClick={handleView}>
        View
      </button>
    </div>
  );
}