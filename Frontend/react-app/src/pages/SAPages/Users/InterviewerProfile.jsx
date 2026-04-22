import ProfileHeader from "../../../components/SuperAdminComponents/Users/ProfileHeader";
import InfoCard from "../../../components/SuperAdminComponents/Users/InfoCard";
import StatsCard from "../../../components/SuperAdminComponents/Users/StatCard";

const InterviewerProfile = ({ user }) => {
  return (
    
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      
      {/* Header */}
      <ProfileHeader user={user} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard value="247" label="Interviews" />
        <StatsCard value="53" label="Candidates" />
        <StatsCard value="4.8/5" label="Rating" />
        <StatsCard value="91%" label="Success Rate" />
      </div>

      {/* About */}
      <InfoCard title="About">
        {user.bio || "Experienced interviewer with strong technical background."}
      </InfoCard>

      {/* Expertise */}
      <InfoCard title="Expertise">
        <div className="flex flex-wrap gap-2">
          {(user.skills || ["React", "Java", "System Design"]).map((skill, i) => (
            <span
              key={i}
              className="bg-[#24698B] text-white px-2 py-1 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </InfoCard>

      {/* Experience */}
      <InfoCard title="Experience">
        <ul className="space-y-2 text-sm">
          <li>Senior Software Engineer - 5 years</li>
          <li>Tech Lead - 2 years</li>
          <li>Interview Panel Member</li>
        </ul>
      </InfoCard>

      {/* Schedule / Availability */}
      <InfoCard title="Availability">
        <div className="grid grid-cols-7 gap-2 text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
            <div
              key={day}
              className="bg-[#24698B]/10 text-[#24698B] p-2 rounded text-center"
            >
              {day}
            </div>
          ))}
        </div>
      </InfoCard>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="bg-[#24698B] text-white px-4 py-2 rounded-md hover:bg-[#1e5873]">
          Assign Interview
        </button>
        <button className="border border-gray-300 px-4 py-2 rounded-md">
          Message
        </button>
      </div>
    </div>
  );
};

export default InterviewerProfile;