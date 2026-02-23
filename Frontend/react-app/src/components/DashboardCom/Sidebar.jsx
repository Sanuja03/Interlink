import './Sidebar.css'

import interlink from "../../assets/interlink.png";
import dashboardIcon from "../../assets/dashboard.png";
import interviewIcon from "../../assets/interviews.png";
import calendarIcon from "../../assets/calendar.png";
import settingsIcon from "../../assets/settings.png";
import defaultAvatar from "../../assets/default-avatar.png"; 

import { Link } from "react-router-dom";
import { useState } from "react";



const Sidebar = () => {
  // Dummy data 
  const profile = {
    name: "Sanj Perera",
    email: "senithi.perera@interlink.com",
    avatar: null, /* no profile pic uploaded */
  };

  const currentPath = window.location.pathname;

  // open dropdown automatically if you are in /interviews pages
  const [openInterviews, setOpenInterviews] = useState(
    currentPath.startsWith("/interviews")
  );



  const menuItems = [
    { label: "Dashboard", href: "/Dashboard", icon: dashboardIcon },
    { label: "Interview Management", href: "/interviews", icon: interviewIcon }, 
    { label: "Calendar", href: "/Calendar", icon: calendarIcon },
    { label: "Settings", href: "/InterviewerSettings", icon: settingsIcon },
  ];

  const interviewSubItems = [
    { label: "Scheduled", href: "/interviews/scheduled" },
    { label: "Pending", href: "/interviews/pending" },
    { label: "Completed", href: "/interviews/completed" },
  ];

  return (
    <aside className="sidebar">

      {/* interlink logo */}
      <div className="sidebar-logo">
        <img src={interlink} alt="InterLink logo"/>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {/* loop */}
        {menuItems.map((item) => {
          const isInterviewParent = item.href === "/interviews";
          const isActive = isInterviewParent
            ? currentPath.startsWith("/interviews")
            : currentPath === item.href;

         
          if (isInterviewParent) {
            return (
              <div key={item.href}>
                <div
                  onClick={() => setOpenInterviews((prev) => !prev)}
                  className={`sidebar-item ${isActive ? "active" : ""}`}>

                  <img src={item.icon} alt={`${item.label} icon`} />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {/* arrow */}
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

                {/* Sub menu */}
                {openInterviews && (
                  <div className="sidebar-submenu">
                    {interviewSubItems.map((sub) => {
                      const subActive = currentPath === sub.href;
                      return (
                        <a
                          key={sub.href}
                          href={sub.href}
                          className={`sidebar-subitem ${
                            subActive ? "active" : ""
                          }`}
                        >
                          {sub.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Normal items
          return (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <img src={item.icon} alt={`${item.label} icon`} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* bottom profile */}
      <div className="sidebar-profile">
        <Link to="/InterviewerProfile">
          <img
            src={profile.avatar || defaultAvatar}
            alt={profile.name}
          />
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