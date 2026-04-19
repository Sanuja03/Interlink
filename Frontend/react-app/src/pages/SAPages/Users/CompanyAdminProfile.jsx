import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";

const CompanyAdminProfile = ({ user }) => {
  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <ProfileHeader user={user} />

      {/* System Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard value="120" label="Users" />
        <StatsCard value="45" label="Companies" />
        <StatsCard value="300" label="Interviews" />
        <StatsCard value="98%" label="Success Rate" />
      </div>

      {/* Role Permissions */}
      <InfoCard title="Permissions">
        <ul className="list-disc ml-4">
          <li>Manage Users</li>
          <li>Approve Companies</li>
          <li>View Reports</li>
        </ul>
      </InfoCard>

      {/* Activity */}
      <InfoCard title="Recent Activity">
        <p>Last login: Today</p>
        <p>Updated system settings</p>
      </InfoCard>
    </div>
  );
};

export default CompanyAdminProfile;