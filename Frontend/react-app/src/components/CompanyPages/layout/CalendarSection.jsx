import React from "react";
import { useNavigate } from "react-router-dom";

// ✅ FIXED IMPORT (same folder)
import CalendarWidget from "./CalendarWidget";

import "./CalendarSection.css";

// 🔹 Dummy interview data
const INTERVIEWS = {
  "2026-03-19": {
    title: "Project Manager – Inova",
    time: "09:00 AM – 09:30 AM",
    mode: "Online Interview",
    job: {
      title: "Project Manager",
      company: "Inova",
      techStack: "Agile",
    },
  },
  "2026-03-23": {
    title: "Software Engineer – Alpha Tech",
    time: "11:00 AM – 12:00 PM",
    mode: "Online Interview",
    job: {
      title: "Software Engineer",
      company: "Alpha Tech",
      techStack: "Node.js",
    },
  },
};

export default function CalendarSection() {
  const navigate = useNavigate();

  return (
    <div className="cal-section">
      <h2 className="cal-title">Interview Calendar</h2>

      <div className="cal-card">
        <CalendarWidget
          interviews={INTERVIEWS}
          showJoinButton={true}
          showGenerateButton={true}
          defaultView="Month"
          onJoinInterview={(iv) => {
            console.log("Join:", iv.title);
          }}
          onGenerateQuestions={(iv) => {
            navigate("/ai-questions", { state: { job: iv.job } });
          }}
        />
      </div>
    </div>
  );
}