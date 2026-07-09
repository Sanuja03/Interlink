import { useAuth } from "../../context/Authcontext";

// Local icon components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8l3.5 3.5L13 4.5"
      stroke="#24698B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SuperAdminProfile() {
  const { appUser } = useAuth();

  const joined = appUser?.createdAt
    ? new Date(appUser.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const lastLogin = appUser?.lastLoginAt
    ? new Date(appUser.lastLoginAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const initial = appUser?.email?.charAt(0).toUpperCase() ?? "S";

  const permissions = [
    "Manage Users",
    "Manage Companies",
    "Manage Job Posts",
    "System Settings",
    "Billing and Subscription",
  ];

  return (
    <div className="space-y-4 sm:space-y-5 font-outfit">

      {/* PROFILE HEADER */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm overflow-hidden">
        <div className="h-20 sm:h-24 bg-gradient-to-r from-[#0C3E56] to-[#24698B]" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-9">
          <div className="flex items-end justify-between">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0C3E56] text-white flex items-center justify-center text-xl sm:text-2xl font-bold rounded-xl border-4 border-white shadow-md shrink-0">
              {initial}
            </div>
            {/* Read-only status badge — no edit button for super admin */}
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                appUser?.accountStatus === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {appUser?.accountStatus ?? "—"}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-[#0C3E56]">
                {appUser?.email ?? "—"}
              </h2>
              <span className="text-[10px] font-semibold bg-[#24698B]/10 text-[#24698B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {appUser?.role ?? "—"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 mt-2 text-xs text-gray-400">
              <span>Joined {joined}</span>
              <span>Last login {lastLogin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PERMISSIONS — static list tied to super_admin role */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="w-1 h-4 bg-[#24698B] rounded-full" />
          <h3 className="text-[#0C3E56] font-semibold text-xs sm:text-sm tracking-wide uppercase">
            Permissions
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {permissions.map((perm, i) => (
            <div
              key={i}
              className="py-2.5 sm:py-3 flex justify-between items-center group"
            >
              <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#24698B] transition-colors pr-3">
                {perm}
              </span>
              <div className="w-6 h-6 bg-[#24698B]/10 rounded-full flex items-center justify-center shrink-0">
                <CheckIcon />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}