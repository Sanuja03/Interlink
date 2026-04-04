import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Candidate pages
import LandingPage from './pages/LandingPage/LandingPage';
import Home from './pages/CPages/Home';
import Profile from './pages/CPages/Profile';
import JobPosts from './pages/CPages/JobPosts';
import JobPostDetails from './pages/CPages/JobPostDetails';
import CandidateDashboard from './pages/CPages/Dashboard';
import AIQuestions from './pages/CPages/AIQuestions';
import CandidateCalendar from './pages/CPages/Calendar';
import JobApply from './pages/CPages/JobApply';

// Auth
import Signup from './components/LoginSignup/Signup';
import SignUpCompany from './components/LoginSignup/SignUpCompany';
import Login from './components/LoginSignup/Login';

// Interviewer pages
import Dashboard from './components/InterviewPages/Dashboard';
import Calendar from './components/InterviewPages/Calendar';
import InterviewerProfile from './components/InterviewPages/InterviewerProfile';
import InterviewerSettings from './components/InterviewPages/InterviewerSettings';
import PendingRequests from './components/InterviewPages/PendingRequests';
import CompletedInterviews from './components/InterviewPages/CompletedInterviews';
import ScheduledInterviews from './components/InterviewPages/ScheduledInterviews';
import SingleView from './components/InterviewPages/SingleView';

// Company pages
import ShortlistedCandidates from './components/CompanyPages/ShortlistedCandidates';

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-company" element={<SignUpCompany />} />

      {/* Candidate */}
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<CandidateDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/job-posts" element={<JobPosts />} />
      <Route path="/job-posts/:id" element={<JobPostDetails />} />
      <Route path="/ai-questions" element={<AIQuestions />} />
      <Route path="/calender" element={<CandidateCalendar />} />
      <Route path="/calendar" element={<CandidateCalendar />} />
      <Route path="/job-apply/:id" element={<JobApply />} />

      {/* Interviewer */}
      <Route path="/interviewer/dashboard" element={<Dashboard />} />
      <Route path="/interviewer/calendar" element={<Calendar />} />
      <Route path="/interviewer/profile" element={<InterviewerProfile />} />
      <Route path="/interviewer/settings" element={<InterviewerSettings />} />
      <Route path="/interviewer/pending-requests" element={<PendingRequests />} />
      <Route path="/interviewer/completed-interviews" element={<CompletedInterviews />} />
      <Route path="/interviewer/scheduled-interviews" element={<ScheduledInterviews />} />
      <Route path="/interviewer/single-view/:interviewId" element={<SingleView />} />

      {/* Company */}
      <Route path="/company/shortlisted-candidates" element={<ShortlistedCandidates />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
