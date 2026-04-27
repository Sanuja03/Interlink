import { useState, useEffect } from "react";

import "./FloatingAvailabilityBtn.css";
import { checkWeekStatus } from "../../../utils/weekUtils";
import AvailabilityPopup from "../../../pages/IPages/AvailabilityPopup";

const FloatingAvailabilityBtn = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const result = await checkWeekStatus();
      setSubmitted(result.submitted);
    } catch (err) {
      console.error("Failed to check availability status:", err);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmitSuccess = () => {
    setSubmitted(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    fetchStatus();
  };

  if (loading) return null;

  return (
    <>
      <button
        className={`floating-availability-btn ${submitted ? "done" : "pending"}`}
        onClick={() => setShowPopup(true)}
        title={submitted ? "Availability set for this week" : "Set your weekly availability"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          {submitted && (
            <polyline points="9 16 11 18 15 14" strokeWidth="2.5" />
          )}
        </svg>

        <span className={`floating-btn-dot ${submitted ? "done" : "pending"}`} />
      </button>

      {showPopup && (
        <AvailabilityPopup
          onClose={handleClosePopup}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </>
  );
};

export default FloatingAvailabilityBtn;