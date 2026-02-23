import { useRef, useState } from "react";
import DashboardLayout from "../DashboardCom/DashboardLayout";
import defaultAvatar from "../../assets/default-avatar.png";
import "./InterviewerProfile.css";

const InterviewerProfile = () => {
  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-card">
          <p className="profile-text">content will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerProfile;
