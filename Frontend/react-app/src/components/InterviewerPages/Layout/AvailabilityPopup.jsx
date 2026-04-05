import { useState } from "react";
import "./AvailabilityPopup.css";

const AvailabilityPopup = ({ onClose }) => {

  const [month, setMonth] = useState("February");
  const [selectedDays, setSelectedDays] = useState([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = () => {
    console.log("Selected month:", month);
    console.log("Available days:", selectedDays);

    // later you can send this to backend API

    onClose();
  };

  return (
    <div className="availability-overlay" onClick={onClose}>

      <div
        className="availability-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="availability-header">
          <h2 className="availability-title">
            Set Monthly Availability
          </h2>

          <button
            className="availability-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>


        {/* Body */}
        <div className="availability-body">

          {/* Month selector */}
          <label className="availability-label">
            Select Month
          </label>

          <select
            className="availability-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>


          {/* Day selection */}
          <label className="availability-label">
            Choose Available Days
          </label>

          <div className="availability-days">

            {days.map((day) => (
              <button
                key={day}
                className={`availability-day ${
                  selectedDays.includes(day) ? "selected" : ""
                }`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}

          </div>


          {/* Submit button */}
          <button
            className="availability-submit"
            onClick={handleSubmit}
          >
            Submit Availability
          </button>

        </div>

      </div>

    </div>
  );
};

export default AvailabilityPopup;