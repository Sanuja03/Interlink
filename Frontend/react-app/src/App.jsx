import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

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

// CompanyAdmin pages
import CompanyShortlistedCandidates from "./components/CompanyPages/ShortlistedCandidates";
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

// Helper wrappers
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
<Toaster
  position="top-right"
  toastOptions={{
    duration: 5000,
    style: {
      borderRadius: "12px",
      background: "#ffffff",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      fontSize: "15px",
      padding: "16px 20px",
      minWidth: "260px",
      fontWeight: "500",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    success: {
      style: {
        borderLeft: "5px solid #24698B",
      },
    },
    error: {
      style: {
        borderLeft: "5px solid #dc2626",
      },
    },
  }}
/>
  
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
  
        {/* Auth */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/SignUpCompany" element={<SignUpCompany />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
  
        


        {/* Candidate */}
        <Route path="/candidate/home" element={<Candidate><CandidateHome /></Candidate>} />
        <Route path="/candidate/dashboard" element={<Candidate><CandidateDashboard /></Candidate>} />
        <Route path="/candidate/profile" element={<Candidate><CandidateProfile /></Candidate>} />
        <Route path="/candidate/jobposts" element={<Candidate><CandidateJobPosts /></Candidate>} />
        <Route path="/candidate/jobposts/:id" element={<Candidate><CandidateJobPostDetails /></Candidate>} />
        <Route path="/candidate/aiquestions" element={<Candidate><CandidateAIQuestions /></Candidate>} />
        <Route path="/candidate/calendar" element={<Candidate><CandidateCalendar /></Candidate>} />
        <Route path="/candidate/jobapply/:id" element={<Candidate><CandidateJobApply /></Candidate>} />

        {/* Interviewer */}
        <Route path="/interviewer/dashboard" element={<InterviewerRole><InterviewerDashboard /></InterviewerRole>} />
        <Route path="/interviewer/calendar" element={<InterviewerRole><InterviewerCalendar /></InterviewerRole>} />
        <Route path="/interviewer/profile" element={<InterviewerRole><InterviewerProfile /></InterviewerRole>} />
        <Route path="/interviewer/settings" element={<InterviewerRole><InterviewerSettings /></InterviewerRole>} />
        <Route path="/interviewer/pending-requests" element={<InterviewerRole><InterviewerPendingRequests /></InterviewerRole>} />
        <Route path="/interviewer/completed-interviews" element={<InterviewerRole><InterviewerCompletedInterviews /></InterviewerRole>} />
        <Route path="/interviewer/scheduled-interviews" element={<InterviewerRole><InterviewerScheduledInterviews /></InterviewerRole>} />
        <Route path="/interviewer/single-view/:interviewId" element={<InterviewerRole><InterviewerCandidateSingleView /></InterviewerRole>} />

        {/* Company */}
        <Route path="/company/shortlisted-candidates" element={<CompanyAdmin><CompanyShortlistedCandidates /></CompanyAdmin>} />
        <Route path="/company/create-evaluation-template" element={<CompanyAdmin><CreateEvaluationTemplate /></CompanyAdmin>} />

        {/* Company Admin routes */}
        <Route path="/company/dashboard" element={<CompanyAdmin><CompanyDashboard /></CompanyAdmin>} />
        <Route path="/application-management" element={<CompanyAdmin><ApplicationManagement /></CompanyAdmin>} />
        <Route path="/company-admin-settings" element={<CompanyAdmin><CompanyAdminSettings /></CompanyAdmin>} />
        <Route path="/job-management" element={<CompanyAdmin><JobManagement /></CompanyAdmin>} />
        <Route path="/create-job" element={<CompanyAdmin><CreateJob /></CompanyAdmin>} />
        <Route path="/edit-job/:id" element={<CompanyAdmin><EditJob /></CompanyAdmin>} />
        <Route path="/interview-scheduling" element={<CompanyAdmin><InterviewScheduling /></CompanyAdmin>} />
        <Route path="/interview-confirmation" element={<CompanyAdmin><InterviewConfirmation /></CompanyAdmin>} />
        <Route path="/candidate-history" element={<CompanyAdmin><CandidateHistory /></CompanyAdmin>} />
        <Route path="/shortlist" element={<CompanyAdmin><Shortlist /></CompanyAdmin>} />
        <Route path="/candidate-profile" element={<CompanyAdmin><CompanyCandidateProfile /></CompanyAdmin>} />

        {/* All User Routes */}
        <Route path="/tickets" element={<AnyAuthenticated><MyTickets /></AnyAuthenticated>} />
        <Route path="/tickets/:id" element={<AnyAuthenticated><TicketDetails /></AnyAuthenticated>} />

        {/* Super Admin routes */}
        <Route path="/admin/tickets" element={<SuperAdmin><AdminTickets /></SuperAdmin>} />
        <Route path="/admin/tickets/:id" element={<SuperAdmin><AdminTicketDetails /></SuperAdmin>} />
        <Route path="/admin/subscription-plans" element={<SuperAdmin><SubscriptionPlans /></SuperAdmin>} />
        <Route path="/admin/active-plans" element={<SuperAdmin><ActivePlans /></SuperAdmin>} />

        <Route path="/admin/dashboard" element={<SuperAdmin><DashboardLayout><SuperAdminDashboard /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/AllActivities" element={<SuperAdmin><DashboardLayout><AllActivitiesPage /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Companies" element={<SuperAdmin><DashboardLayout><SuperAdminCompanies /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Interviews" element={<SuperAdmin><DashboardLayout><SuperAdminInterviews /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Profile" element={<SuperAdmin><DashboardLayout><SuperAdminProfile /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/SystemSettings" element={<SuperAdmin><DashboardLayout><SystemSettings /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Jobs" element={<SuperAdmin><DashboardLayout><SuperAdminJobs /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Jobs/:id" element={<SuperAdmin><DashboardLayout><SuperAdminJobDetails /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Users" element={<SuperAdmin><DashboardLayout><SuperAdminUsers /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/ChatBot" element={<SuperAdmin><DashboardLayout><ChatBot /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/User/:id" element={<SuperAdmin><DashboardLayout><UserProfileWrapper /></DashboardLayout></SuperAdmin>} />
        <Route path="/admin/Company/:id" element={<SuperAdmin><DashboardLayout><SuperAdminViewCompany /></DashboardLayout></SuperAdmin>} />

        {/* Fallback */}
        <Route path="*" element={<h1>NO ROUTE FOUND</h1>} />
      </Routes>
    </AuthProvider>
    
  );
}

export default App;