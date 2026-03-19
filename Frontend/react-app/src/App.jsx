import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import CompanyDashboard from "./components/CompanyPages/CompanyDashboard";
import JobManagement from "./components/CompanyPages/JobManagement";
import CreateJob from "./components/CompanyPages/CreateJob";
import ApplicationManagement from "./components/CompanyPages/ApplicationManagement";
import CompanyAdminSettings from "./components/CompanyPages/CompanyAdminSettings";
import CandidateProfile from "./components/CompanyPages/CandidateProfile";
import Shortlist from "./components/CompanyPages/Shortlist";
import InterviewScheduling from "./components/CompanyPages/InterviewScheduling";
import CandidateHistory from "./components/CompanyPages/CandidateHistory";
import InterviewConfirmation from "./components/CompanyPages/InterviewConfirmation";

import InterviewerManagementModal from "./components/CompanyPages/InterviewerManagementModal"; // ✅ ADD THIS
import Footer from "./components/layout/Footer";

function App() {

  // 🔥 GLOBAL MODAL STATE
  const [showInterviewerModal, setShowInterviewerModal] = useState(false);

  return (
    <>
      <Routes>

        <Route path="/shortlist" element={<Shortlist />} />
        <Route path="/" element={<CompanyDashboard />} />
        <Route path="/job-management" element={<JobManagement />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/application-management" element={<ApplicationManagement />} />
        <Route path="/company-admin-settings" element={<CompanyAdminSettings />} />
        <Route path="/candidate-profile" element={<CandidateProfile />} />
        <Route path="/schedule-interview" element={<InterviewScheduling />} />
        <Route path="/candidate-history" element={<CandidateHistory />} />
        <Route path="/interview-confirmation" element={<InterviewConfirmation />} />

        {/* 🔥 OPTIONAL ROUTE TO TRIGGER MODAL */}
        <Route
          path="/add-interviewer"
          element={
            <CompanyDashboard
              openModal={() => setShowInterviewerModal(true)}
            />
          }
        />

      </Routes>

      {/* 🔥 GLOBAL MODAL */}
      <InterviewerManagementModal
        isOpen={showInterviewerModal}
        onClose={() => setShowInterviewerModal(false)}
      />

      <Footer />
    </>
  );
}

export default App;