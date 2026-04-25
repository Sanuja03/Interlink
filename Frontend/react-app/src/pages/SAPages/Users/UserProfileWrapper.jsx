import { useLocation } from "react-router-dom";
import CandidateProfile from "./CandidateProfile";
import CompanyAdminProfile from "./CompanyAdminProfile";
import InterviewerProfile from "./InterviewerProfile";

const UserProfileWrapper = () => {
  const location = useLocation();
  const role = location.state?.role?.toLowerCase();

  switch (role) {
    case "candidate":
      return <CandidateProfile />;
    case "interviewer":
      return <InterviewerProfile />;
    case "company_admin":
      return <CompanyAdminProfile />;
    default:
      return <div className="p-6 text-gray-500 text-sm">Unknown or missing role</div>;
  }
};

export default UserProfileWrapper;