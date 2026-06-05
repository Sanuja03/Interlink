import "./Sidebar.css";

import interlink from "../../../assets/interlink.png";
import dashboardIcon from "../../../assets/dashboard.png";
import interviewIcon from "../../../assets/interviews.png";
import calendarIcon from "../../../assets/calendar.png";
import defaultAvatar from "../../../assets/default-avatar.png";

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const profile = {
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    avatar: null,
  };

  const location = useLocation();
  const currentPath = location.pathname;

  const interviewSubItems = [
    { label: "Scheduled", href: "/interviewer/scheduled-interviews" },
    { label: "Pending", href: "/interviewer/pending-requests" },
    { label: "Completed", href: "/interviewer/completed-interviews" },
  ];

  const isInterviewRoute =
    currentPath === "/interviews" ||
    interviewSubItems.some((sub) => sub.href === currentPath);

  const [openInterviews, setOpenInterviews] = useState(isInterviewRoute);

  useEffect(() => {
    if (isInterviewRoute) {
      setOpenInterviews(true);
    }
  }, [isInterviewRoute]);

  const menuItems = [
    { label: "Dashboard", href: "/interviewer/dashboard", icon: dashboardIcon },
    { label: "Interview Management", href: "/interviews", icon: interviewIcon },
    { label: "Calendar", href: "/interviewer/calendar", icon: calendarIcon },
  
  ];

  return (
    <aside className="sidebar">
      {/* interlink logo */}
      <div className="sidebar-logo">
        <img src={interlink} alt="InterLink logo" />
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isInterviewParent = item.href === "/interviews";

          const isActive = isInterviewParent
            ? isInterviewRoute
            : currentPath === item.href;

          if (isInterviewParent) {
            return (
              <div key={item.href}>
                <div
                  onClick={() => setOpenInterviews((prev) => !prev)}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                >
                  <img src={item.icon} alt={`${item.label} icon`} />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  <span
                    style={{
                      fontSize: 12,
                      transform: openInterviews ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    ›
                  </span>
                </div>

                {openInterviews && (
                  <div className="sidebar-submenu">
                    {interviewSubItems.map((sub) => {
                      const subActive = currentPath === sub.href;

                      return (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={`sidebar-subitem ${
                            subActive ? "active" : ""
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <img src={item.icon} alt={`${item.label} icon`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* bottom profile */}
      <div className="sidebar-profile">
        <Link to="/interviewer/profile">
          <img src={profile.avatar || defaultAvatar} alt={profile.name} />
          <div className="sidebar-profile-text">
            <p className="sidebar-profile-name">{profile.name}</p>
            <p className="sidebar-profile-email">{profile.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;