//import "./Sidebar.css";
import interlink from "../../assets/interlink.png";

import dashboardIcon from "../../assets/dashboard.png";
import billingIcon from "../../assets/billing.png";
import settingsIcon from "../../assets/settings.png";
import defaultAvatar from "../../assets/default-avatar.png"; // default profile image

const Sidebar = () => {
  //Dummy profile data (simulating DB response)
  const profile = {
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    avatar: null, 
  };

  const currentPath = window.location.pathname;

  const menuItems = [
    { label: "Dashboard", href: "/SuperAdmin/dashboard", icon: dashboardIcon },
    { label: "Billing and subscription", href: "/billing", icon: billingIcon },
    { label: "System Settings", href: "/settings", icon: settingsIcon },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white flex flex-col border-r border-gray-200">
      
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-6">
        <img
          src={interlink}
          alt="InterLink logo"
          className="w-40 h-20 object-contain"
        />
      
      </div>

      {/* Menu */}
      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl no-underline transition
                ${
                  isActive
                    ? "bg-[#C8C8C8] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <img
                src={item.icon}
                alt={`${item.label} icon`}
                className={`w-5 h-5 object-contain flex-shrink-0
                  ${isActive ? "brightness-0 invert" : "opacity-80"}
                `}
              />
              <span className="text-base font-semibold">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Bottom profile */}
      <div className="mt-auto px-3 py-4 border-t border-gray-200">
        <a
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline hover:bg-gray-100 w-full"
        >
          <img
            src={profile.avatar || defaultAvatar} //fallback logic
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile.email}
            </p>
          </div>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;