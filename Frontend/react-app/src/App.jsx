import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

//Landing
import LandingPage from './pages/LandingPage/LandingPage';

// Auth
import Signup from './pages/LoginSignup/Signup';
import SignUpCompany from './pages/LoginSignup/SignUpCompany';
import Login from './pages/LoginSignup/Login';

// Candidate pages
import CandidateHome from './pages/CPages/Home';
import CandidateProfile from './pages/CPages/Profile';
import CandidateJobPosts from './pages/CPages/JobPosts';
import CandidateJobPostDetails from './pages/CPages/JobPostDetails';
import CandidateDashboard from './pages/CPages/Dashboard';
import CandidateAIQuestions from './pages/CPages/AIQuestions';
import CandidateCalendar from './pages/CPages/Calendar';
import CandidateJobApply from './pages/CPages/JobApply';


// Interviewer pages
import InterviewerDashboard from './pages/IPages/Dashboard';
import InterviewerCalendar from './pages/IPages/Calendar';
import InterviewerProfile from './pages/IPages/InterviewerProfile';
import InterviewerSettings from './pages/IPages/InterviewerSettings';
import InterviewerPendingRequests from './pages/IPages/PendingRequests';
import InterviewerCompletedInterviews from './pages/IPages/CompletedInterviews';
import InterviewerScheduledInterviews from './pages/IPages/ScheduledInterviews';
import InterviewerCandidateSingleView from './pages/IPages/SingleView';

// CompanyAdmin pages
import CompanyShortlistedCandidates from './components/CompanyPages/ShortlistedCandidates';
import CreateEvaluationTemplate from './components/CompanyPages/CreateEvaluationTemplate';

function App() {
  return (
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
      <Route path="/candidate/job-posts/:id" element={<CandidateJobPostDetails />} />
      <Route path="/candidate/ai-questions" element={<CandidateAIQuestions />} />
      <Route path="/candidate/calendar" element={<CandidateCalendar />} />
      <Route path="/candidate/job-apply/:id" element={<CandidateJobApply />} />


      {/* Interviewer */}
      <Route path="/interviewer/dashboard" element={<InterviewerDashboard />} />
      <Route path="/interviewer/calendar" element={<InterviewerCalendar />} />
      <Route path="/interviewer/profile" element={<InterviewerProfile />} />
      <Route path="/interviewer/settings" element={<InterviewerSettings />} />
      <Route path="/interviewer/pending-requests" element={<InterviewerPendingRequests />} />
      <Route path="/interviewer/completed-interviews" element={<InterviewerCompletedInterviews />} />
      <Route path="/interviewer/scheduled-interviews" element={<InterviewerScheduledInterviews />} />
      <Route path="/interviewer/single-view/:interviewId" element={<InterviewerCandidateSingleView />} />

      {/* Company */}
      <Route path="/company/shortlisted-candidates" element={<CompanyShortlistedCandidates />} />
      <Route path="/company/create-evaluation-template" element={<CreateEvaluationTemplate />} />

      {/* Fallback */}

    </Routes>
  );
}

export default App;
