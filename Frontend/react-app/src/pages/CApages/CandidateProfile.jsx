import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CandidateProfile.css";

import companyLogo from "../../assets/images/default-avatar.png";
import fileIcon from "../../assets/icons/file.png";

// ✅ IMPORT POPUP
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";

export default function CandidateProfile() {
  const navigate = useNavigate();

  // ✅ POPUP STATE
  const [openInterviewPopup, setOpenInterviewPopup] = useState(false);

  const stats = [
    { value: "247", label: "Total Interviews" },
    { value: "53", label: "Candidates Hired" },
    { value: "4.8/5", label: "Average Rating" },
    { value: "91%", label: "Points Earned" },
  ];

  const experiences = [
    {
      title: "Senior Technical Interviewer",
      company: "Horizon Global",
      period: "Jan 2025 - Present",
      logo: companyLogo,
    },
    {
      title: "Lead Software Engineer",
      company: "Innotech Solutions",
      period: "Jan 2023 - Present",
      logo: companyLogo,
    },
    {
      title: "Lead Software Engineer",
      company: "Innotech Solutions",
      period: "Jan 2023 - Present",
      logo: companyLogo,
    },
  ];

  return (
    <DashboardLayout>
      <div className="cp-page">

        {/* HERO */}
        <section className="cp-hero">
          <div className="cp-profileCard">
            <div className="cp-profileLeft">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Candidate"
                className="cp-profilePhoto"
              />
            </div>

            <div className="cp-profileRight">
              <h1 className="cp-name">Michal Johnson</h1>
              <p className="cp-companyText">Horizon Global</p>
              <p className="cp-role">Senior Technical Interviewer</p>

              <div className="cp-statusRow">
                <span className="cp-statusBadge">Active</span>
              </div>

              <div className="cp-contactGrid">
                <div className="cp-contactItem">✉ sarajjohn@horizonglobal.com</div>
                <div className="cp-contactItem">☏ +94 112 345 678</div>
                <div className="cp-contactItem">⌖ Colombo, Sri Lanka</div>
                <div className="cp-contactItem">🗓 Joined: Dec 22, 2025</div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="cp-section">
          <h2 className="cp-sectionTitle">About</h2>
          <div className="cp-card">
            <p className="cp-aboutText">
              Experienced technical interviewer with over 10 years in the software
              industry. Specialized in conducting comprehensive technical assessments
              for full-stack developers and software engineers.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="cp-section">
          <h2 className="cp-sectionTitle">Statistics</h2>

          <div className="cp-stats">
            {stats.map((item, index) => (
              <div key={index} className="cp-statCard">
                <div className="cp-statValue">{item.value}</div>
                <div className="cp-statLabel">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="cp-section">
          <h2 className="cp-sectionTitle">Experience</h2>

          <div className="cp-timeline">
            {experiences.map((item, index) => (
              <div key={index} className="cp-expRow">
                <div className="cp-timelineLine">
                  <span className="cp-timelineDot"></span>
                </div>

                <div className="cp-expCard">
                  <div className="cp-expText">
                    <h3 className="cp-expTitle">{item.title}</h3>
                    <p className="cp-expCompany">{item.company}</p>
                    <p className="cp-expPeriod">{item.period}</p>
                  </div>

                  <img
                    src={item.logo}
                    alt="Company logo"
                    className="cp-expLogo"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CV */}
        <div className="cp-cvWrap">
          <button className="cp-cvBtn">
            <img src={fileIcon} alt="File icon" className="cp-cvIcon" />
            <span>CV Download</span>
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="cp-actions">

          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => navigate("/shortlist")}
          >
            Shortlist
          </button>

          {/* should FIXE this BUTTON */}
          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => navigate("/InterviewRequestPopup")}
          >
            Schedule Interview
          </button>

          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => navigate("/candidate-history")}
          >
            Candidate History Tracker
          </button>

          <button className="cp-actionBtn cp-btnRed">
            Reject
          </button>
        </div>



      </div>
    </DashboardLayout>
  );
}