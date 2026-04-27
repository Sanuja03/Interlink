import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";
import "./CandidateProfile.css";

import fileIcon from "../../assets/icons/file.png";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";

export default function CandidateProfile() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [openInterviewPopup, setOpenInterviewPopup] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const url = applicationId
      ? `/company/candidate-profile/${candidateId}?applicationId=${applicationId}`
      : `/company/candidate-profile/${candidateId}`;

    api
      .get(url)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, [candidateId, applicationId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="cp-page">
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="cp-page">
          <p>Profile not found</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="cp-page">

        {/* HERO */}
        <section className="cp-hero">
          <div className="cp-profileCard">
            <div className="cp-profileLeft">
              <img
                src={profile.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                alt="Candidate"
                className="cp-profilePhoto"
              />
            </div>

            <div className="cp-profileRight">
              <h1 className="cp-name">{profile.fullName}</h1>
              <p className="cp-headline">{profile.headline || profile.currentRole || ""}</p>

              <div className="cp-statusRow">
                <span className="cp-statusBadge">Active</span>
              </div>

              <div className="cp-contactGrid">
                <div className="cp-contactItem">✉ {profile.email}</div>
                <div className="cp-contactItem">☏ {profile.phone || "—"}</div>
                <div className="cp-contactItem">⌖ {profile.location || "—"}</div>
              </div>

              {profile.joinedDate && (
                <div className="cp-contactItem">📅 Joined: {profile.joinedDate}</div>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        {profile.bio && (
          <section className="cp-section">
            <h2 className="cp-sectionTitle">About</h2>
            <p>{profile.bio}</p>
          </section>
        )}

        {/* PROFESSIONAL DETAILS */}
        <section className="cp-section">
          <h2 className="cp-sectionTitle">Professional Details</h2>
          <div className="cp-detailsGrid">
            <div>
              <strong>Years of Experience</strong>
              <p>{profile.yearsOfExperience ? `${profile.yearsOfExperience}+ Years` : "—"}</p>
            </div>
            <div>
              <strong>Education</strong>
              <p>
                {profile.education?.length > 0
                  ? profile.education[0].degree
                  : "—"}
              </p>
            </div>
            <div>
              <strong>AI Score</strong>
              <p>{profile.aiScore != null ? `${profile.aiScore}%` : "—"}</p>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        {profile.skills?.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-sectionTitle">Skills</h2>
            <div className="cp-skillsList">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="cp-skillTag">{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {profile.experience?.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-sectionTitle">Experience</h2>
            <div className="cp-timeline">
              {profile.experience.map((item, index) => (
                <div key={index} className="cp-expRow">
                  <div className="cp-timelineLine">
                    <span className="cp-timelineDot"></span>
                  </div>
                  <div className="cp-expCard">
                    <div className="cp-expText">
                      <h3 className="cp-expTitle">{item.jobTitle}</h3>
                      <p className="cp-expCompany">{item.companyName}</p>
                      <p className="cp-expPeriod">
                        {item.startDate} - {item.endDate || "Present"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {profile.education?.length > 0 && (
          <section className="cp-section">
            <h2 className="cp-sectionTitle">Education</h2>
            {profile.education.map((edu, idx) => (
              <div key={idx} className="cp-eduItem">
                <strong>{edu.degree}</strong>
                <p>{edu.institution}</p>
                <p>{edu.startDate} - {edu.endDate || "Present"}</p>
              </div>
            ))}
          </section>
        )}

        {/* CV */}
        {profile.resumeUrl && (
          <div className="cp-cvWrap">
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="cp-cvBtn">
              <img src={fileIcon} alt="File icon" className="cp-cvIcon" />
              <span>CV Download</span>
            </a>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="cp-actions">
          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => navigate(`/company/shortlist/${applicationId}`)}
            disabled={!applicationId}
          >
            Shortlist
          </button>

          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => setOpenInterviewPopup(true)}
          >
            Schedule Interview
          </button>

          <button
            className="cp-actionBtn cp-btnBlue"
            onClick={() => navigate(`/company/candidate-history/${applicationId}`)}
            disabled={!applicationId}
          >
            Candidate History Tracker
          </button>

          <button
            className="cp-actionBtn cp-btnRed"
            onClick={async () => {
              if (!window.confirm("Reject this candidate?")) return;
              try {
                const companyId = localStorage.getItem("companyId");
                await api.post("/company/shortlist/reject", {
                  candidateId: candidateId,
                  companyId: companyId,
                  jobId: profile.jobId,
                  jobApplicationId: Number(applicationId),
                  manualDecision: "Reject",
                  manualNotes: "",
                });
                alert("Candidate rejected.");
                navigate(-1);
              } catch (err) {
                console.error("Reject failed:", err);
                alert("Failed to reject candidate");
              }
            }}
            disabled={!applicationId}
          >
            Reject
          </button>
        </div>

        {openInterviewPopup && (
          <InterviewRequestPopup
            onClose={() => setOpenInterviewPopup(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}