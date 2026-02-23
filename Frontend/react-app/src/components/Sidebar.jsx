import { useState } from "react";
import logo from "../assets/logo.png";

const sidebarStyles = `
  .sidebar {
    height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    overflow: hidden;
    transition: width 0.25s ease;
    flex-shrink: 0;
  }

  .sidebar.expanded {
    width: 240px;
  }

  .sidebar.collapsed {
    width: 68px;
  }

  /* Toggle button */
  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    color: #6b7280;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .sidebar-toggle:hover {
    background: #f3f4f6;
    color: #111827;
  }

  /* Logo row */
  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 14px 14px;
    min-height: 64px;
  }

  .sidebar-logo-img {
    width: 120px;
    height: auto;
    object-fit: contain;
    transition: opacity 0.2s ease, width 0.2s ease;
  }

  .sidebar.collapsed .sidebar-logo-img {
    width: 0;
    opacity: 0;
    pointer-events: none;
  }

  .sidebar.collapsed .sidebar-logo {
    justify-content: center;
  }

  /* Nav */
  .sidebar-nav {
    padding: 0 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: #4b5563;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background 0.15s ease, color 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-nav-item:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .sidebar-nav-item.active {
    background: #c8c8c8;
    color: #ffffff;
  }

  .sidebar-nav-item.active .sidebar-icon {
    filter: brightness(0) invert(1);
  }

  .sidebar-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    opacity: 0.85;
  }

  .sidebar-label {
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  .sidebar.collapsed .sidebar-label {
    opacity: 0;
    width: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* Logout */
  .sidebar-logout {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    margin: 0 8px 4px;
    border-radius: 12px;
    text-decoration: none;
    color: #ef4444;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    background: none;
    border: none;
    width: calc(100% - 16px);
    transition: background 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-logout:hover {
    background: #fef2f2;
  }

  .sidebar.collapsed .sidebar-logout .sidebar-label {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  /* Profile */
  .sidebar-profile {
    padding: 12px 8px;
    border-top: 1px solid #e5e7eb;
  }

  .sidebar-profile-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    text-decoration: none;
    transition: background 0.15s ease;
    overflow: hidden;
    white-space: nowrap;
  }

  .sidebar-profile-link:hover {
    background: #f3f4f6;
  }

  .sidebar-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .sidebar-avatar-fallback {
    display: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #3b82f6;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-profile-info {
    min-width: 0;
    line-height: 1.3;
    transition: opacity 0.2s ease;
  }

  .sidebar.collapsed .sidebar-profile-info {
    opacity: 0;
    width: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .sidebar-profile-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  .sidebar-profile-email {
    font-size: 0.7rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }

  /* Tooltip on collapsed */
  .sidebar-nav-item[title]:hover::after {
    content: attr(title);
    position: fixed;
    left: 76px;
    background: #1f2937;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
  }
`;

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  const profile = {
    name: "Kamal Perera",
    email: "kamal.perera@interlink.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  const currentPath = window.location.pathname;

  const menuItems = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Job Posts",
      href: "/job-posts",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{sidebarStyles}</style>

      <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>

        {/* Logo + Toggle */}
        <div className="sidebar-logo">
          <img src={logo} alt="InterLink logo" className="sidebar-logo-img" />
          <button
            className="sidebar-toggle"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              style={{ width: 14, height: 14, transition: "transform 0.25s", transform: expanded ? "rotate(0deg)" : "rotate(180deg)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                title={!expanded ? item.label : undefined}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={() => { window.location.href = "/"; }}>
          <span className="sidebar-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          <span className="sidebar-label">Logout</span>
        </button>

        {/* Bottom Profile */}
        <div className="sidebar-profile">
          <a href="/profile" className="sidebar-profile-link" title={!expanded ? profile.name : undefined}>
            <img
              src={profile.avatar}
              alt={profile.name}
              className="sidebar-avatar"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span className="sidebar-avatar-fallback">KP</span>
            <div className="sidebar-profile-info">
              <p className="sidebar-profile-name">{profile.name}</p>
              <p className="sidebar-profile-email">{profile.email}</p>
            </div>
          </a>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
