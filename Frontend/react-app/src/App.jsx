import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Signup from './components/LoginSignup/Signup'
import SignUpCompany from './components/LoginSignup/SignUpCompany'
import Login from './components/LoginSignup/Login'




function App() {


  return (
    <>
      <Routes>
        //start app with signup
        <Route path="/" element={<Navigate to="/SignUpCompany" />} />

        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/SignUpCompany" element={<SignUpCompany />} />
      </Routes>
    </>
  );
}

export default App;