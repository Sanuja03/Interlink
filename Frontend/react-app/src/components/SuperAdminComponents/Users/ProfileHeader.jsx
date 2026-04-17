
const ProfileHeader = ({ user }) => {
  return (
    <div className="bg-[#0F4C5C] text-white p-6 rounded-xl shadow-md flex items-center gap-4">
      <img
        src="https://i.pravatar.cc/100"//{user.avatar}
        alt="profile"
        className="w-16 h-16 rounded-full border-2 border-white"
      />

      <div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-sm opacity-80">{user.email}</p>
        <span className="text-xs bg-white text-[#0F4C5C] px-2 py-1 rounded">
          {user.role}
        </span>
      </div>
    </div>
  );
};

export default ProfileHeader;

