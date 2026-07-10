
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";


export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  // Still checking auth — show a simple loader
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.1rem",
        color: "#666",
      }}>
        Loading...
      </div>
    );
  }

  // Not logged - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role - redirect to their own dashboard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const dashboardMap = {
      candidate: "/candidate/dashboard",
      company_admin: "/company/dashboard",
      interviewer: "/interviewer/dashboard",
      super_admin: "/admin/dashboard",
    };
    const fallback = dashboardMap[role] || "/Login";
    return <Navigate to={fallback} replace />;
  }

  return children;
}