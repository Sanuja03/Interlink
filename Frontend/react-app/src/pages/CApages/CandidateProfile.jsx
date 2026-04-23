import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import "./CandidateProfile.css";

import fileIcon from "../../assets/icons/file.png";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";

export default function CandidateProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ STATES
  const [openInterviewPopup, setOpenInterviewPopup] = useState(false);
  const [profile, setProfile] = useState(null);

  // ✅ FETCH DATA
  useEffect(() => {
    fetch(`http://localhost:8080/api/profile/candidate/${id}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, [id]);

  // ✅ LOADING
  if (!profile) {
    return <div>Loading...</div>;
  }

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
              <h1 className="cp-name">{profile.fullName}</h1>

              <div className="cp-statusRow">
                <span className="cp-statusBadge">Active</span>
              </div>

              <div className="cp-contactGrid">
                <div className="cp-contactItem">✉ {profile.email}</div>
                <div className="cp-contactItem">☏ {profile.phone}</div>
                <div className="cp-contactItem">⌖ {profile.location}</div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="cp-section">
          <h2 className="cp-sectionTitle">Experience</h2>

          <div className="cp-timeline">
            {profile.experiences?.map((item, index) => (
              <div key={index} className="cp-expRow">
                <div className="cp-timelineLine">
                  <span className="cp-timelineDot"></span>
                </div>

                <div className="cp-expCard">
                  <div className="cp-expText">
                    <h3 className="cp-expTitle">{item.jobTitle}</h3>
                    <p className="cp-expCompany">{item.company}</p>
                    <p className="cp-expPeriod">
                      {item.startDate} - {item.endDate}
                    </p>
                  </div>
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

          {/* ✅ FIXED BUTTON */}
          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => setOpenInterviewPopup(true)}
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

        {/* ✅ POPUP */}
        {openInterviewPopup && (
          <InterviewRequestPopup
            onClose={() => setOpenInterviewPopup(false)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}