import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboardPage from "./modules/activity_logs/SAdminDashboard";
import AllActivitiesPage from "./modules/activity_logs/AllActivitiesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/SuperAdmin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/SuperAdmin/AllActivities" element={<AllActivitiesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
