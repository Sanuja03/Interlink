import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllActivitiesPage from "./pages/SAPages/AllActivities";
import DashboardLayout from "././components/SuperAdminComponents/Layout/Dashboardlayout";
import SuperAdminDashboard from "./pages/SAPages/SuperAdminDashboard";
import SuperAdminCompanies from "./pages/SAPages/SuperAdminCompanies";
import SuperAdminInterviews from "./pages/SAPages/SuperAdminInterviews";
import SuperAdminProfile from "./pages/SAPages/SuperAdminProfile";
import SystemSettings from "./pages/SAPages/SystemSettings";
import SuperAdminJobs from "./pages/SAPages/SuperAdminJobs";
import SuperAdminJobDetails from "./pages/SAPages/SuperAdminJobDetails";
import SuperAdminUsers from "./pages/SAPages/Users/SuperAdminUsers";
import ChatBot from "././components/SuperAdminComponents/RagChatbot/ChatBot";
import UserProfileWrapper from "./pages/SAPages/Users/UserProfileWrapper";
import SuperAdminViewCompany from "./pages/SAPages/SuperAdminViewCompany";

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
        <Route path="/SuperAdmin/User/:id"element={<DashboardLayout><UserProfileWrapper /></DashboardLayout>}/>
        <Route path="/SuperAdmin/Company/:id" element={<DashboardLayout><SuperAdminViewCompany /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
