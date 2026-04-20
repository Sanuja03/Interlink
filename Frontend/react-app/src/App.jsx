import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

//Landing
import LandingPage from "./pages/LandingPage/LandingPage";

// Auth
import Signup from "./pages/LoginSignup/Signup";
import SignUpCompany from "./pages/LoginSignup/SignUpCompany";
import Login from "./pages/LoginSignup/Login";

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

// All User Pages
import MyTickets from "./pages/AllUserPages/MyTickets";
import TicketDetails from "./pages/AllUserPages/TicketDetails";



function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<CandidateHome />} />

      {/* Auth */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/SignUpCompany" element={<SignUpCompany />} />

      {/* Candidate */}
      <Route path="/candidate/home" element={<CandidateHome />} />
      <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate/profile" element={<CandidateProfile />} />
      <Route path="/candidate/jobposts" element={<CandidateJobPosts />} />
      <Route
        path="/candidate/jobposts/:id"
        element={<CandidateJobPostDetails />}
      />
      <Route
        path="/candidate/aiquestions"
        element={<CandidateAIQuestions />}
      />
      <Route path="/candidate/calendar" element={<CandidateCalendar />} />
      <Route path="/candidate/jobapply/:id" element={<CandidateJobApply />} />

      {/* Interviewer */}
      <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
      <Route path="/interviewer/calendar" element={<InterviewerCalendar />} />
      <Route path="/interviewer/profile" element={<InterviewerProfile />} />
      <Route path="/interviewer/settings" element={<InterviewerSettings />} />
      <Route
        path="/interviewer/pending-requests"
        element={<InterviewerPendingRequests />}
      />
      <Route
        path="/interviewer/completed-interviews"
        element={<InterviewerCompletedInterviews />}
      />
      <Route
        path="/interviewer/scheduled-interviews"
        element={<InterviewerScheduledInterviews />}
      />
      <Route
        path="/interviewer/single-view/:interviewId"
        element={<InterviewerCandidateSingleView />}
      />

      {/* Company */}
      <Route
        path="/company/shortlisted-candidates"
        element={<CompanyShortlistedCandidates />}
      />
      <Route
        path="/company/create-evaluation-template"
        element={<CreateEvaluationTemplate />}
      />

      {/* Super Admin routes */}
      <Route path="/admin/tickets" element={<AdminTickets />} />
      <Route path="/admin/tickets/:id" element={<AdminTicketDetails />} />
      <Route path="/admin/subscription-plans" element={<SubscriptionPlans />} />
      <Route path="/admin/active-plans" element={<ActivePlans />} />

      {/* All User Routes */}
      <Route path="/tickets" element={<MyTickets />} />
      <Route path="/tickets/:id" element={<TicketDetails />} />

      {/* Fallback */}

      {/* company Admin routes */}
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/application-management" element={<ApplicationManagement />} />
      <Route path="/company-admin-settings" element={<CompanyAdminSettings />} />
      <Route path="/job-management" element={<JobManagement />} />
      <Route path="/create-job" element={<CreateJob />} />
      <Route path="/edit-job/:id" element={<EditJob />} />
      <Route path="/interview-scheduling" element={<InterviewScheduling />} />
      <Route path="/interview-confirmation" element={<InterviewConfirmation />} />
      <Route path="/candidate-history" element={<CandidateHistory />} />
      <Route path="/shortlist" element={<Shortlist />} />
      <Route path="/candidate-profile" element={<CompanyCandidateProfile />} />

      {/* Super Admin routes with Dashboard Layout */}
        <Route path="/admin/dashboard" element={<DashboardLayout><SuperAdminDashboard /></DashboardLayout>} />
        <Route path="/admin/AllActivities" element={<DashboardLayout><AllActivitiesPage /></DashboardLayout>} />
        <Route path="/admin/Companies" element={<DashboardLayout><SuperAdminCompanies /></DashboardLayout>} />
        <Route path="/admin/Interviews" element={<DashboardLayout><SuperAdminInterviews /></DashboardLayout>} />
        <Route path="/admin/Profile" element={<DashboardLayout><SuperAdminProfile /></DashboardLayout>} />
        <Route path="/admin/SystemSettings" element={<DashboardLayout><SystemSettings /></DashboardLayout>} />
        <Route path="/admin/Jobs" element={<DashboardLayout><SuperAdminJobs /></DashboardLayout>} />
        <Route path="/admin/Jobs/:id" element={<DashboardLayout><SuperAdminJobDetails /></DashboardLayout>} />
        <Route path="/admin/Users" element={<DashboardLayout><SuperAdminUsers /></DashboardLayout>} />
        <Route path="/admin/ChatBot" element={<DashboardLayout><ChatBot /></DashboardLayout>} />//test for now
        <Route path="/admin/User/:id"element={<DashboardLayout><UserProfileWrapper /></DashboardLayout>}/>
        <Route path="/admin/Company/:id" element={<DashboardLayout><SuperAdminViewCompany /></DashboardLayout>} />
        <Route path="*" element={<h1>NO ROUTE FOUND</h1>} />
      </Routes>
  );
}

export default App;
