import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";

const CandidateProfile = ({ user }) => {

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <ProfileHeader user={user} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard value="12" label="Applications" />
        <StatsCard value="5" label="Interviews" />
        <StatsCard value="3" label="Offers" />
      </div>

      {/* About */}
      <InfoCard title="About">
        {user.bio || "No bio provided"}
      </InfoCard>

      {/* Skills */}
      <InfoCard title="Skills">
        <div className="flex flex-wrap gap-2">
          {user.skills?.map((skill, i) => (
            <span
              key={i}
              className="bg-[#0F4C5C] text-white px-2 py-1 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </InfoCard>

      {/* Education */}
      <InfoCard title="Education">
        {user.education || "No education details"}
      </InfoCard>
    </div>
  );
};

export default CandidateProfile;