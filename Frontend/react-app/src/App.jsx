import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import JobPosts from './pages/JobPosts';
import JobPostDetails from './pages/JobPostDetails';
import Dashboard from './pages/Dashboard';
import AIQuestions from './pages/AIQuestions';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
