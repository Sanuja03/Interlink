import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllActivitiesPage from "./pages/AllActivities";
import DashboardLayout from "./components/Layout/Dashboardlayout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminCompanies from "./pages/SuperAdminCompanies";
import SuperAdminInterviews from "./pages/SuperAdminInterviews";
import SuperAdminProfile from "./pages/SuperAdminProfile";
import SystemSettings from "./pages/SystemSettings";
import SuperAdminJobs from "./pages/SuperAdminJobs";
import SuperAdminJobDetails from "./pages/SuperAdminJobDetails";
import SuperAdminUsers from "./pages/SuperAdminUsers";
import ChatBot from "./components/RagChatbot/ChatBot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/SuperAdmin/dashboard" element={<DashboardLayout><SuperAdminDashboard /></DashboardLayout>} />
        <Route path="/SuperAdmin/AllActivities" element={<DashboardLayout><AllActivitiesPage /></DashboardLayout>} />
        <Route path="/SuperAdmin/Companies" element={<DashboardLayout><SuperAdminCompanies /></DashboardLayout>} />
        <Route path="/SuperAdmin/Interviews" element={<DashboardLayout><SuperAdminInterviews /></DashboardLayout>} />
        <Route path="/SuperAdmin/Profile" element={<DashboardLayout><SuperAdminProfile /></DashboardLayout>} />
        <Route path="/SuperAdmin/SystemSettings" element={<DashboardLayout><SystemSettings /></DashboardLayout>} />
        <Route path="/SuperAdmin/Jobs" element={<DashboardLayout><SuperAdminJobs /></DashboardLayout>} />
        <Route path="/SuperAdmin/Jobs/:id" element={<DashboardLayout><SuperAdminJobDetails /></DashboardLayout>} />
        <Route path="/SuperAdmin/Users" element={<DashboardLayout><SuperAdminUsers /></DashboardLayout>} />
        <Route path="/SuperAdmin/ChatBot" element={<DashboardLayout><ChatBot /></DashboardLayout>} />//test for now
      </Routes>
    </BrowserRouter>
  );
}

export default App;
