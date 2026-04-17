import { useLocation } from "react-router-dom";
import CandidateProfile from "./CandidateProfile";
import CompanyAdminProfile from "./CompanyAdminProfile";
import InterviewerProfile from "./InterviewerProfile";
import BackButton from "../../../components/SuperAdminComponents/Layout/Back";

const UserProfileWrapper = () => {
  const location = useLocation();
  const user = location.state;

  if (!user) return <div>No user data</div>;

  switch (user.role) {
    case "Candidate":
      return (
        <>
          <BackButton label="Back to Users" to="/admin/Users" />
          <CandidateProfile user={user} />
        </>
      );
    case "Company Admin":
      return (
        <>
          <BackButton label="Back to Users" to="/admin/Users" />
          <CompanyAdminProfile user={user} />
        </>
      );
    case "Interviewer":
      return (
        <>
          <BackButton label="Back to Users" to="/admin/Users" />
          <InterviewerProfile user={user} />
        </>
      );
    default:
      return <div>Invalid Role</div>;
  }
};

export default UserProfileWrapper;