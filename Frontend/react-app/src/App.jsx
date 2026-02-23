import { Routes, Route } from "react-router-dom";

import CompanyDashboard from "./components/CompanyPages/CompanyDashboard";
import JobManagement from "./components/CompanyPages/JobManagement";
import CreateJob from "./components/CompanyPages/CreateJob";
import ApplicationManagement from "./components/CompanyPages/ApplicationManagement";
import CompanyAdminSettings from "./components/CompanyPages/CompanyAdminSettings";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CompanyDashboard />} />
        <Route path="/job-management" element={<JobManagement />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/application-management" element={<ApplicationManagement />} />
        <Route path="/company-admin-settings" element={<CompanyAdminSettings />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;