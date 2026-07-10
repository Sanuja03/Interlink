import { useState, useEffect } from "react";
import "./AvailabilityPopup.css";
import api from "../../lib/api";

import {
  getCurrentWeekDates,
  getWeekKey,
  submitAvailability,
} from "../../utils/weekUtils";


const AvailabilityPopup = ({ onClose, onSubmitSuccess }) => {
  const weekDates = getCurrentWeekDates();
  const weekKey = getWeekKey();

  const [selectedDays, setSelectedDays] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSavedAvailability = async () => {
      try {
        // get saved availability for the week and teh status- if any if not it returns empty array
        const res = await api.get("/interviewer/availability/my-week", {
          params: { weekKey },
        });
        if (cancelled) return;        

        const data = res.data || {};
        const isSubmitted = data.status === "submitted";

        setAlreadySubmitted(isSubmitted);
        setSelectedDays(data.availableDays || []);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load saved availability:", error);
        setSelectedDays([]);
        setAlreadySubmitted(false);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadSavedAvailability();

    return () => {
      cancelled = true;                 
    };
  }, [weekKey]);

  //can add or remove the day as selcted or not
  const toggleDay = (fullDate) => {
    if (alreadySubmitted) return;
    setSelectedDays((prev) =>
      prev.includes(fullDate)
        ? prev.filter((d) => d !== fullDate)
        : [...prev, fullDate]
    );
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0 || alreadySubmitted) return;

    setSubmitting(true);

    try {
      await submitAvailability(selectedDays);
      setAlreadySubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Failed to submit availability:", error);
      alert(
        error?.response?.data?.message ||
        "Failed to submit availability. Please refresh the page and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  //converts the first and last dates of the week into readable text like "May 5 - May 11"
  const startLabel = weekDates[0].date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endLabel = weekDates[6].date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="availability-overlay" onClick={onClose}>
      <div
        className="availability-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="availability-header">
          <div>
            <h2 className="availability-title">Set Weekly Availability</h2>
            <p className="availability-week-range">
              {startLabel} – {endLabel}
            </p>
          </div>

          <button className="availability-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="availability-body">

          <label className="availability-label">
            {alreadySubmitted
              ? "Your availability for this week"
              : "Select your available days"}
          </label>

          <div className="availability-days">
            {/* it creates buttons for eahc date and check 2 things - selectedday or past day   */}

            {weekDates.map((day) => {
              const isSelected = selectedDays.includes(day.fullDate);
              const isPast =
                day.date < new Date(new Date().setHours(0, 0, 0, 0));

              return (

                <button
                  key={day.fullDate}
                  type="button"
                  className={`availability-day ${
                    isSelected ? "selected" : ""
                  } ${isPast || alreadySubmitted ? "past" : ""}`}
                  onClick={() => toggleDay(day.fullDate)}
                  disabled={isPast || submitting || alreadySubmitted || loadingData}
                >
                  <span className="availability-day-name">
                    {day.shortDay}
                  </span>
                  <span className="availability-day-date">
                    {day.dateNum}
                  </span>
                </button>
              );
            })}
          </div>

          {loadingData ? (
            <p className="availability-summary">Loading...</p>
          ) : alreadySubmitted ? (
            <div className="availability-submitted-msg">
              You have already submitted your availability for this week.
            </div>
          ) : (
            <>
              {selectedDays.length > 0 && (
                <p className="availability-summary">
                  {selectedDays.length} day
                  {selectedDays.length !== 1 ? "s" : ""} selected
                </p>
              )}

              <button
                className="availability-submit"
                onClick={handleSubmit}
                disabled={selectedDays.length === 0 || submitting}
              >
                {submitting ? "Submitting..." : "Submit Availability"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPopup;