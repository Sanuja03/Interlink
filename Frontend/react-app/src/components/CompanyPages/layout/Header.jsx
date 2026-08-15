// src/components/layout/Header.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

import logo from "../../../assets/logo.png"; 


export default function Header() {
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/create-job", label: "Create Job" },
    { to: "/job-management", label: "Job Management" },
    { to: "/application-management", label: "Application Management" },
    { to: "/logout", label: "Logout" }, // (you can change later)
  ];

  return (
    <header className="il-header">
      <div className="il-header__inner">
        {/* Left: Logo */}
        <div className="il-header__logoWrap">
          <img className="il-header__logo" src={logo} alt="Interlink" />
        </div>

        {/* Right: Links */}
        <nav className="il-header__nav" aria-label="Main navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                "il-header__link" + (isActive ? " is-active" : "")
              }
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}