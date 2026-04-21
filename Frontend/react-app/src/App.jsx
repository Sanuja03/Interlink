import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";


<Toaster
  position="top-right"
  toastOptions={{
    duration: 5000,
    style: {
      borderRadius: "12px",
      background: "#ffffff",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      fontSize: "15px",          // 🔼 bigger text
      padding: "16px 20px",      // 🔼 bigger box
      minWidth: "260px",         // 🔼 wider
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

// Super Admin pages
import AdminTicketDetails from "./pages/Apages/AdminTicketDetails";
import AdminTickets from "./pages/Apages/AdminTickets";
import SubscriptionPlans from "./pages/Apages/SubscriptionPlans";
import ActivePlans from "./pages/Apages/ActivePlans";

// All User Pages
import MyTickets from "./pages/AllUserPages/MyTickets";
import TicketDetails from "./pages/AllUserPages/TicketDetails";

function App() {
  return (
    <>
      <Toaster position="top-right" />
    <Routes>
      {/* Landing */}
      <Route path="/" element={<CreateEvaluationTemplate />} />

      {/* Auth */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/SignUpCompany" element={<SignUpCompany />} />

      {/* Candidate */}
      <Route path="/candidate/home" element={<CandidateHome />} />
      <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate/profile" element={<CandidateProfile />} />
      <Route path="/candidate/job-posts" element={<CandidateJobPosts />} />
      <Route
        path="/candidate/job-posts/:id"
        element={<CandidateJobPostDetails />}
      />
      <Route
        path="/candidate/ai-questions"
        element={<CandidateAIQuestions />}
      />
      <Route path="/candidate/calendar" element={<CandidateCalendar />} />
      <Route path="/candidate/job-apply/:id" element={<CandidateJobApply />} />

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
    </Routes>
    </>
  );
}

export default App;
