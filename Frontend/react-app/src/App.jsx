import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Signup from './components/LoginSignup/Signup'
import SignUpCompany from './components/LoginSignup/SignUpCompany'
import Login from './components/LoginSignup/Login'
import Dashboard from './components/InterviewPages/Dashboard'
import Calendar from './components/InterviewPages/Calendar'
import InterviewerProfile from './components/InterviewPages/InterviewerProfile'
import InterviewerSettings from './components/InterviewPages/InterviewerSettings'
import PendingRequests from './components/InterviewPages/PendingRequests'
import CompletedInterviews from './components/InterviewPages/CompletedInterviews'
import ScheduledInterviews from './components/InterviewPages/ScheduledInterviews'
import SingleView from "./components/InterviewPages/SingleView";
import ShortlistedCandidates from "./components/CompanyPages/ShortlistedCandidates";




function App() {


  return (
    <>

      <Routes>
     
        <Route path="/" element={<Navigate to="/InterviewerSettings" />} />

        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/SignUpCompany" element={<SignUpCompany />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Calendar" element={<Calendar />} />
        <Route path="/InterviewerProfile" element={<InterviewerProfile />} />
        <Route path="/InterviewerSettings" element={<InterviewerSettings />} />
        <Route path="/PendingRequests" element={<PendingRequests />} />
        <Route path="/CompletedInterviews" element={<CompletedInterviews />} />
        <Route path="/ScheduledInterviews" element={<ScheduledInterviews />} />
        <Route path="/SingleView/:interviewId" element={<SingleView />} />
        <Route path="/ShortlistedCandidates" element={<ShortlistedCandidates />} />
        



       

      </Routes>
    </>
  );
}

export default App;