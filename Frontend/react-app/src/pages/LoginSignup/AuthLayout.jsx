import "./Login.css";

import { Link } from "react-router-dom";

import interlink from "../../assets/interlink-logo.png";
import homeicon from "../../assets/homeicon.png";
import authArt from "../../assets/auth-illustration.svg";

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const defaultHighlights = [
  "AI-powered job matching",
  "Interviews scheduled in one place",
  "Verified candidates and companies",
];

/* Shared shell for Login / Signup / SignUpCompany / ForgotPassword —
   keeps the landing page's palette, typography and imagery. */
const AuthLayout = ({ title, subtitle, highlights = defaultHighlights, children }) => (
  <div className="auth-page">
    <div className="auth-shell">

      <aside className="auth-brand">
        <span className="auth-brand__circle auth-brand__circle--1" />
        <span className="auth-brand__circle auth-brand__circle--2" />

        <div className="home-button">
          <Link to="/"><img src={homeicon} alt="Home" /></Link>
        </div>

        <div className="auth-brand__body">
          <span className="auth-brand__badge">
            <span className="auth-brand__badge-dot" />
            Sri Lanka's #1 Recruitment Platform
          </span>
          <h2 className="auth-brand__title">
            Where Talent Meets <span className="auth-brand__accent">Opportunity</span>
          </h2>
          <p className="auth-brand__sub">
            Interlink brings job seekers and hiring teams together with AI-powered
            tools, smart scheduling and seamless hiring workflows.
          </p>
          <ul className="auth-brand__points">
            {highlights.map((point) => (
              <li key={point}><span className="auth-brand__check"><IconCheck /></span>{point}</li>
            ))}
          </ul>
        </div>

        <img src={authArt} alt="" className="auth-brand__art" />
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <img src={interlink} alt="InterLink Logo" className="interlinklogo" />
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__sub">{subtitle}</p>}
          {children}
        </div>
      </section>

    </div>
  </div>
);

export default AuthLayout;
