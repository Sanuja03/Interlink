import React from "react";
import "./CandidateProfile.css";
import fileIcon from "../../assets/icons/file.png";



export default function CandidateProfileView({
  profile,
  loading,
  readOnly = false,
  onBack,
  onShortlist,
  onReject,
  onHistory,
}) {
  if (loading) {
    return (
      <div className="cp-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="cp-page">
        <p>Profile not found</p>
        <button onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const disabledStyle = { opacity: 0.45, cursor: "not-allowed" };

  return (
    <div className="cp-page">
      {/* HERO */}
      <section className="cp-hero">
        <div className="cp-profileCard">
          <div className="cp-profileLeft">
            <img
              src={
                profile.profilePictureUrl ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt="Candidate"
              className="cp-profilePhoto"
            />
          </div>

          <div className="cp-profileRight">
            <h1 className="cp-name">{profile.fullName}</h1>
            <p className="cp-headline">
              {profile.headline || profile.currentRole || ""}
            </p>

            <div className="cp-statusRow">
              <span className="cp-statusBadge">Active</span>
            </div>

            <div className="cp-contactGrid">
              <div className="cp-contactItem"> Email: {profile.email}</div>
              <div className="cp-contactItem">Phone: {profile.phone || "—"}</div>
              <div className="cp-contactItem">Home: {profile.location || "—"}</div>
            </div>

            {profile.joinedDate && (
              <div className="cp-contactItem"> Joined: {profile.joinedDate}</div>
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
            <p>
              {profile.yearsOfExperience
                ? `${profile.yearsOfExperience}+ Years`
                : "—"}
            </p>
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

      {/* CV — always viewable */}
      {profile.resumeUrl && (
        <div className="cp-cvWrap">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="cp-cvBtn"
          >
            <img src={fileIcon} alt="File icon" className="cp-cvIcon" />
            <span>CV Download</span>
          </a>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="cp-actions">
        <button
          className="cp-actionBtn cp-btnBlue"
          onClick={readOnly ? undefined : onShortlist}
          disabled={readOnly || !onShortlist}
          style={readOnly ? disabledStyle : undefined}
          title={readOnly ? "Not available for interviewers" : undefined}
        >
          Shortlist
        </button>

        <button
          className="cp-actionBtn cp-btnBlue"
          onClick={onHistory}
          disabled={!onHistory}
        >
          Candidate History Tracker
        </button>

        <button
          className="cp-actionBtn cp-btnRed"
          onClick={readOnly ? undefined : onReject}
          disabled={readOnly || !onReject}
          style={readOnly ? disabledStyle : undefined}
          title={readOnly ? "Not available for interviewers" : undefined}
        >
          Reject
        </button>
      </div>
    </div>
  );
}