import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import JobPosts from './pages/JobPosts';
import JobPostDetails from './pages/JobPostDetails';
import Dashboard from './pages/Dashboard';
import AIQuestions from './pages/AIQuestions';
import Calendar from './pages/Calendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/job-posts" element={<JobPosts />} />
        <Route path="/job-posts/:id" element={<JobPostDetails />} />
        <Route path="/ai-questions" element={<AIQuestions />} />
        <Route path="/calender" element={<Calendar />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
