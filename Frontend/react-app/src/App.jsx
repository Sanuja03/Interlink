import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

//Landing
import LandingPage from './pages/LandingPage/LandingPage';

// Auth
import Signup from './components/LoginSignup/Signup';
import SignUpCompany from './components/LoginSignup/SignUpCompany';
import Login from './components/LoginSignup/Login';

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
import InterviewerDashboard from './components/InterviewerPages/Dashboard';
import InterviewerCalendar from './components/InterviewerPages/Calendar';
import InterviewerProfile from './components/InterviewerPages/InterviewerProfile';
import InterviewerSettings from './components/InterviewerPages/InterviewerSettings';
import InterviewerPendingRequests from './components/InterviewerPages/PendingRequests';
import InterviewerCompletedInterviews from './components/InterviewerPages/CompletedInterviews';
import InterviewerScheduledInterviews from './components/InterviewerPages/ScheduledInterviews';
import InterviewerCandidateSingleView from './components/InterviewerPages/SingleView';

// CompanyAdmin pages
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
