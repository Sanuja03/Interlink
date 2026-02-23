import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Signup from './components/LoginSignup/Signup'
import SignUpCompany from './components/LoginSignup/SignUpCompany'
import Login from './components/LoginSignup/Login'
import Dashboard from './components/InterviewPages/Dashboard'
import Calendar from './components/InterviewPages/Calendar'
import InterviewMan from './components/InterviewPages/interviewMan'
import InterviewerProfile from './components/InterviewPages/InterviewerProfile'
import InterviewerSettings from './components/InterviewPages/InterviewerSettings'


function App() {


  return (
    <>

      <Routes>
     
        <Route path="/" element={<Navigate to="/Signup" />} />

        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/SignUpCompany" element={<SignUpCompany />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Calendar" element={<Calendar />} />
        <Route path="/InterviewMan" element={<InterviewMan />} />
        <Route path="/InterviewerProfile" element={<InterviewerProfile />} />
        <Route path="/InterviewerSettings" element={<InterviewerSettings />} />
       



       

      </Routes>
    </>
  );
}

export default App;