import { BrowserRouter, Routes, Route } from "react-router-dom";
import AllActivitiesPage from "./pages/AllActivities";
import DashboardLayout from "./components/Layout/Dashboardlayout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminCompanies from "./pages/SuperAdminCompanies";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/SuperAdmin/dashboard" element={<DashboardLayout><SuperAdminDashboard /></DashboardLayout>} />
        <Route path="/SuperAdmin/AllActivities" element={<DashboardLayout><AllActivitiesPage /></DashboardLayout>} />
        <Route path="/SuperAdmin/Companies" element={<DashboardLayout><SuperAdminCompanies /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
