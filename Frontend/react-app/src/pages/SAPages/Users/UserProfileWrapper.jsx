import { useLocation } from "react-router-dom";
import CandidateProfile from "./CandidateProfile";
import CompanyAdminProfile from "./CompanyAdminProfile";
import InterviewerProfile from "./InterviewerProfile";

// Wrapper component to render profile based on user role
const UserProfileWrapper = () => {
  const location = useLocation();

  // Extract and normalize role from navigation state
  const role = location.state?.role?.toLowerCase();

  // Render component based on role
  switch (role) {
    case "candidate":
      return <CandidateProfile />;

    case "interviewer":
      return <InterviewerProfile />;

    case "company_admin":
      return <CompanyAdminProfile />;

    default:
      // Fallback for missing or unknown role
      return (
        <div className="p-6 text-gray-500 text-sm">
          Unknown or missing role
        </div>
      );
  }
};

export default UserProfileWrapper;