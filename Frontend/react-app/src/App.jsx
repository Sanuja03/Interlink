import { Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./context/Authcontext";
import ProtectedRoute from "./components/ProtectedRoute";

// Landing
import LandingPage from "./pages/LandingPage/LandingPage";

// Auth
import Signup from "./pages/LoginSignup/Signup";
import SignUpCompany from "./pages/LoginSignup/SignUpCompany";
import Login from "./pages/LoginSignup/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

// Candidate pages
import CandidateHome from "./pages/CPages/Home";
import CandidateProfile from "./pages/CPages/Profile";
import CandidateJobPosts from "./pages/CPages/JobPosts";
import CandidateJobPostDetails from "./pages/CPages/JobPostDetails";
import CandidateDashboard from "./pages/CPages/Dashboard";
import CandidateAIQuestions from "./pages/CPages/AIQuestions";
import CandidateCalendar from "./pages/CPages/Calendar";
import CandidateJobApply from "./pages/CPages/JobApply";

// Interviewer pages
import InterviewerDashboard from "./pages/IPages/Dashboard";
import InterviewerCalendar from "./pages/IPages/Calendar";
import InterviewerProfile from "./pages/IPages/InterviewerProfile";
import InterviewerSettings from "./pages/IPages/InterviewerSettings";
import InterviewerPendingRequests from "./pages/IPages/PendingRequests";
import InterviewerCompletedInterviews from "./pages/IPages/CompletedInterviews";
import InterviewerScheduledInterviews from "./pages/IPages/ScheduledInterviews";
import InterviewerCandidateSingleView from "./pages/IPages/SingleView";

// CompanyAdmin pages (FIXED)
import CreateEvaluationTemplate from "./components/CompanyPages/CreateEvaluationTemplate";
import CompanyDashboard from "./pages/CApages/CompanyDashboard";
import ApplicationManagement from "./pages/CApages/ApplicationManagement";
import CompanyAdminSettings from "./pages/CApages/CompanyAdminSettings";
import JobManagement from "./pages/CApages/JobManagement";
import CreateJob from "./pages/CApages/CreateJob";
import EditJob from "./pages/CApages/EditJob";
import InterviewScheduling from "./pages/CApages/InterviewScheduling";
import InterviewConfirmation from "./pages/CApages/InterviewConfirmation";
import CandidateHistory from "./pages/CApages/CandidateHistory";
import Shortlist from "./pages/CApages/Shortlist";
import CompanyCandidateProfile from "./pages/CApages/CandidateProfile";
import ShortlistedCandidates from "./pages/CAPages/ShortlistedCandidates";

// Super Admin pages
import AdminTicketDetails from "./pages/Apages/AdminTicketDetails";
import AdminTickets from "./pages/Apages/AdminTickets";
import SubscriptionPlans from "./pages/Apages/SubscriptionPlans";
import ActivePlans from "./pages/Apages/ActivePlans";

import AllActivitiesPage from "./pages/SAPages/AllActivities";
import DashboardLayout from "./components/SuperAdminComponents/Layout/Dashboardlayout";
import SuperAdminDashboard from "./pages/SAPages/SuperAdminDashboard";
import SuperAdminCompanies from "./pages/SAPages/SuperAdminCompanies";
import SuperAdminInterviews from "./pages/SAPages/SuperAdminInterviews";
import SuperAdminProfile from "./pages/SAPages/SuperAdminProfile";
import SystemSettings from "./pages/SAPages/SystemSettings";
import SuperAdminJobs from "./pages/SAPages/SuperAdminJobs";
import SuperAdminJobDetails from "./pages/SAPages/SuperAdminJobDetails";
import SuperAdminUsers from "./pages/SAPages/Users/SuperAdminUsers";
import ChatBot from "./components/SuperAdminComponents/RagChatbot/ChatBot";
import UserProfileWrapper from "./pages/SAPages/Users/UserProfileWrapper";
import SuperAdminViewCompany from "./pages/SAPages/SuperAdminViewCompany";

// All User Pages
import MyTickets from "./pages/AllUserPages/MyTickets";
import TicketDetails from "./pages/AllUserPages/TicketDetails";

// Role wrappers
const Candidate = ({ children }) => (
  <ProtectedRoute allowedRoles={["candidate"]}>{children}</ProtectedRoute>
);

const CompanyAdmin = ({ children }) => (
  <ProtectedRoute allowedRoles={["company_admin"]}>{children}</ProtectedRoute>
);

const InterviewerRole = ({ children }) => (
  <ProtectedRoute allowedRoles={["interviewer"]}>{children}</ProtectedRoute>
);

const SuperAdmin = ({ children }) => (
  <ProtectedRoute allowedRoles={["super_admin"]}>{children}</ProtectedRoute>
);

const AnyAuthenticated = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/SignUpCompany" element={<SignUpCompany />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Candidate */}
        <Route path="/candidate/home" element={<Candidate><CandidateHome /></Candidate>} />
        <Route path="/candidate/dashboard" element={<Candidate><CandidateDashboard /></Candidate>} />

        {/* Interviewer */}
        <Route path="/interviewer/dashboard" element={<InterviewerRole><InterviewerDashboard /></InterviewerRole>} />

        {/* Company Admin */}
        <Route path="/company/dashboard" element={<CompanyAdmin><CompanyDashboard /></CompanyAdmin>} />
        <Route path="/create-evaluation-template" element={<CompanyAdmin><CreateEvaluationTemplate /></CompanyAdmin>} />
        <Route path="/job-management" element={<CompanyAdmin><JobManagement /></CompanyAdmin>} />
         <Route path="/create-job" element={<CreateJob />} />
         <Route path="/edit-job/:jobId" element={<CompanyAdmin><EditJob /></CompanyAdmin>} />
         <Route path="/company/shortlist/:applicationId" element={<Shortlist />} />
         <Route path="/shortlisted" element={<ShortlistedCandidates />} />
         <Route path="/application-management" element={<ApplicationManagement />} />
         <Route path="/company/settings" element={<CompanyAdminSettings />} />
         <Route path="/company/candidate-profile/:candidateId" element={<CompanyAdmin><CompanyCandidateProfile /></CompanyAdmin>} />
         <Route path="/company/candidate-history/:applicationId" element={<CompanyAdmin><CandidateHistory /></CompanyAdmin>} />

        {/* Super Admin */}
        <Route path="/admin/dashboard" element={<SuperAdmin><DashboardLayout><SuperAdminDashboard /></DashboardLayout></SuperAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<h1>NO ROUTE FOUND</h1>} />

      </Routes>
    </AuthProvider>
  );
}

export default App;