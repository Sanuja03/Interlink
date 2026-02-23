import DashboardLayout from "../DashboardCom/DashboardLayout";
import "./InterviewerSettings.css";

const InterviewerSettings = () => {
  return (
    <DashboardLayout>
      <div className="settings-page">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-card">
          <p className="settings-text">content will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewerSettings;