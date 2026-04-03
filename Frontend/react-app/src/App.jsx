import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Candidate pages
import LandingPage from './pages/LandingPage';
import CandidateHome from './pages/Home';
import CandidateProfile from './pages/Profile';
import CandidateJobPosts from './pages/JobPosts';
import CandidateJobPostDetails from './pages/JobPostDetails';
import CandidateDashboard from './pages/Dashboard';
import CandidateAIQuestions from './pages/AIQuestions';
import CandidateCalendar from './pages/Calendar';
import CandidateJobApply from './pages/JobApply';

// Auth
import Signup from './components/LoginSignup/Signup';
import SignUpCompany from './components/LoginSignup/SignUpCompany';
import Login from './components/LoginSignup/Login';

// Interviewer pages
import InterviewerDashboard from './components/InterviewPages/Dashboard';
import InterviewerCalendar from './components/InterviewPages/Calendar';
import InterviewerProfile from './components/InterviewPages/InterviewerProfile';
import InterviewerSettings from './components/InterviewPages/InterviewerSettings';
import InterviewerPendingRequests from './components/InterviewPages/PendingRequests';
import InterviewerCompletedInterviews from './components/InterviewPages/CompletedInterviews';
import InterviewerScheduledInterviews from './components/InterviewPages/ScheduledInterviews';
import InterviewerCandidateSingleView from './components/InterviewPages/SingleView';

// Company pages
import CompanyShortlistedCandidates from './components/CompanyPages/ShortlistedCandidates';

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<InterviewerDashboard />} />
     

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

      {/* Fallback */}
     
    </Routes>
  );
}

export default App;
