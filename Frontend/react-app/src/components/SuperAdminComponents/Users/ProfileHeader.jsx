const ProfileHeader = ({ user }) => {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  const statusColor =
    user?.accountStatus === "suspended"
      ? "bg-red-500"
      : user?.accountStatus === "flagged"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="bg-[#0F4C5C] text-white p-6 rounded-xl shadow-md flex items-center gap-4">
      {/* Avatar: use photoUrl if available, else initials */}
      {user?.photoUrl ? (
        <img
          src={user.photoUrl}
          alt="profile"
          className="w-16 h-16 rounded-full border-2 border-white object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full border-2 border-white bg-[#24698B] flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
      )}

      <div className="flex-1">
        <h2 className="text-xl font-semibold">{user?.name || user?.email}</h2>
        <p className="text-sm opacity-80">{user?.email}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-white text-[#0F4C5C] px-2 py-0.5 rounded font-medium capitalize">
            {user?.role?.replace("_", " ")}
          </span>
          <span className={`text-xs text-white px-2 py-0.5 rounded font-medium capitalize ${statusColor}`}>
            {user?.accountStatus || "active"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;