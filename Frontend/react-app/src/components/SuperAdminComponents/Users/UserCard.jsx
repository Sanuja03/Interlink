import { useNavigate } from "react-router-dom";

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "suspended": return "bg-red-100 text-red-600";
    case "flagged":   return "bg-yellow-100 text-yellow-700";
    default:          return "bg-green-100 text-green-700";
  }
};

export default function UserCard({ user }) {
  const navigate = useNavigate();

  // userId comes from API as userId (UUID)
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email?.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#24698B]/10 border border-[#DADEE0]">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#0C3E56] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {initials}
        </div>

        <div>
          <h3 className="font-semibold text-[#24698B]">
            {user.name || user.email}
          </h3>
          <p className="text-sm text-gray-500 capitalize">
            {user.role?.replace("_", " ")}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">📧 {user.email}</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge(user.accountStatus)}`}>
          {user.accountStatus || "active"}
        </span>

        <button
          onClick={() => navigate(`/admin/User/${user.userId}`, { state: { role: user.role } })}
          className="bg-[#24698B] text-white px-3 py-1.5 rounded-md text-xs hover:bg-[#1e5873] transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}