import { useNavigate } from "react-router-dom";

export default function UserCard({ user }) {
  const navigate = useNavigate();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex items-center justify-between p-4 rounded-xl
                    bg-[#24698B]/15 border border-[#DADEE0]">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* USER INFO */}
        <div>
          <h3 className="font-semibold text-[#24698B]">
            {user.name}
          </h3>

          <p className="text-sm text-gray-600">{user.role}</p>

          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <div>📧 {user.email}</div>
            <div>📍 {user.location}</div>
            <div>🏢 {user.company}</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/User/${user.id}`, { state: user })}
            className="bg-[#24698B] text-white px-3 py-1 rounded-md text-xs hover:bg-[#1e5873]"
          >
            View Profile
          </button>

          <button className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600">
            Remove User
          </button>
        </div>

        {/* AVATAR */}
        <div className="w-10 h-10 rounded-full bg-[#0C3E56] text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>

      </div>
    </div>
  );
}