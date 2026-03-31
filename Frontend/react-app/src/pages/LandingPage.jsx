import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';
import './LandingPage.css';

/* ─── Inline SVG icons (matching project's blue/teal palette) ─── */
const IconBriefcase = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
);
const IconUsers = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconCalendar = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconAI = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
);
const IconCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconArrow = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconStar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const IconSearch = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconShield = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconChart = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);
const IconMenu = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const IconClose = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

/* ─── Data ─── */
const features = [
    { icon: <IconBriefcase />, title: 'Smart Job Matching', desc: 'AI-powered job recommendations tailored to your skills, experience, and career goals.' },
    { icon: <IconCalendar />, title: 'Interview Scheduler', desc: 'Seamlessly schedule and manage interviews with integrated calendar and automated reminders.' },
    { icon: <IconAI />, title: 'AI Interview Prep', desc: 'Practice with intelligent mock interview questions and get real-time feedback to boost confidence.' },
    { icon: <IconChart />, title: 'Application Tracker', desc: 'Track every stage of your applications in one unified dashboard — never miss an update.' },
    { icon: <IconUsers />, title: 'Talent Discovery', desc: 'Employers discover top talent with advanced filters, verified profiles, and shortlisting tools.' },
    { icon: <IconShield />, title: 'Verified Profiles', desc: 'Every profile is authenticated for trust — so both sides can connect with confidence.' },
];

const candidateSteps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up, add your skills, experience, resume, and career preferences.' },
    { num: '02', title: 'Explore Job Posts', desc: 'Browse matched opportunities from top companies searching for your skills.' },
    { num: '03', title: 'Apply & Schedule', desc: 'Apply in one click and schedule interviews directly through the platform.' },
    { num: '04', title: 'Ace the Interview', desc: 'Use AI-powered prep questions to practice and walk in with confidence.' },
];

const companySteps = [
    { num: '01', title: 'Register Your Company', desc: 'Create a verified company profile and showcase your brand to candidates.' },
    { num: '02', title: 'Post Job Listings', desc: 'Create detailed job posts with requirements and reach thousands of talent.' },
    { num: '03', title: 'Review Candidates', desc: 'Filter and shortlist applicants using smart ranking and skill matching.' },
    { num: '04', title: 'Schedule & Hire', desc: 'Schedule interviews from the platform and make your best hire faster.' },
];

const testimonials = [
    { name: 'Priya Jayawardena', role: 'Software Engineer', company: 'WSO2', text: 'Interlink helped me land my dream job in just 3 weeks. The AI prep questions were spot-on!', stars: 5 },
    { name: 'Ashwin Perera', role: 'HR Manager', company: 'Dialog Axiata', text: 'Posting jobs and finding the right candidates has never been this effortless. Highly recommended.', stars: 5 },
    { name: 'Sareena Fernando', role: 'UX Designer', company: 'Axiata', text: 'The interview scheduler saved me so much back-and-forth. Everything in one place is a game changer.', stars: 4 },
];

const stats = [
    { value: '10K+', label: 'Active Job Seekers' },
    { value: '1.2K+', label: 'Companies Hiring' },
    { value: '95%', label: 'Interview Success Rate' },
    { value: '3×', label: 'Faster Hiring Process' },
];

/* ─── Landing Navbar ─── */
const LandingNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileOpen(false);
    };

    return (
        <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
            <div className="lp-nav__inner">
                <img src={logo} alt="Interlink" className="lp-nav__logo" />

                {/* Desktop links */}
                <div className="lp-nav__links">
                    <button className="lp-nav__link" onClick={() => scrollTo('features')}>Features</button>
                    <button className="lp-nav__link" onClick={() => scrollTo('howitworks')}>How It Works</button>
                    <button className="lp-nav__link" onClick={() => scrollTo('testimonials')}>Testimonials</button>
                    <Link to="/signin" className="lp-nav__signin">Sign In</Link>
                    <Link to="/register" className="lp-nav__cta">Get Started</Link>
                </div>

                {/* Mobile hamburger */}
                <button className="lp-nav__hamburger" onClick={() => setMobileOpen(v => !v)}>
                    {mobileOpen ? <IconClose /> : <IconMenu />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lp-nav__mobile">
                    <button className="lp-nav__mlink" onClick={() => scrollTo('features')}>Features</button>
                    <button className="lp-nav__mlink" onClick={() => scrollTo('howitworks')}>How It Works</button>
                    <button className="lp-nav__mlink" onClick={() => scrollTo('testimonials')}>Testimonials</button>
                    <Link to="/signin" className="lp-nav__mlink" onClick={() => setMobileOpen(false)}>Sign In</Link>
                    <Link to="/register" className="lp-nav__mcta" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                </div>
            )}
        </nav>
    );
};

/* ─── Main Landing Page ─── */
const LandingPage = () => {
    const [activeTab, setActiveTab] = useState('candidate');

    return (
        <div className="lp">
            <LandingNavbar />

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero__bg-circles">
                    <span className="lp-hero__circle lp-hero__circle--1" />
                    <span className="lp-hero__circle lp-hero__circle--2" />
                    <span className="lp-hero__circle lp-hero__circle--3" />
                </div>

                <div className="lp-hero__content">
                    <div className="lp-hero__badge">
                        <span className="lp-hero__badge-dot" />
                        Sri Lanka's #1 Recruitment Platform
                    </div>
                    <h1 className="lp-hero__title">
                        Connect Talent <br />
                        <span className="lp-hero__title-accent">with Opportunity</span>
                    </h1>
                    <p className="lp-hero__sub">
                        Interlink bridges the gap between ambitious job seekers and forward-thinking companies —
                        with AI-powered tools, smart scheduling, and seamless hiring workflows.
                    </p>

                    <div className="lp-hero__actions">
                        <Link to="/register?role=candidate" className="lp-btn lp-btn--primary lp-btn--lg">
                            I'm Looking for a Job <IconArrow />
                        </Link>
                        <Link to="/register?role=company" className="lp-btn lp-btn--outline lp-btn--lg">
                            I'm Hiring Talent <IconArrow />
                        </Link>
                    </div>

                    <div className="lp-hero__search">
                        <div className="lp-hero__searchbox">
                            <IconSearch />
                            <input type="text" placeholder="Search jobs, skills, or companies…" />
                            <button className="lp-hero__search-btn">Search</button>
                        </div>
                    </div>
                </div>

                {/* Floating stats card */}
                <div className="lp-hero__stats">
                    {stats.map((s) => (
                        <div key={s.label} className="lp-hero__stat">
                            <span className="lp-hero__stat-val">{s.value}</span>
                            <span className="lp-hero__stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="lp-section lp-section--light">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <span className="lp-section-tag">Platform Features</span>
                        <h2 className="lp-section-title">Everything You Need to Succeed</h2>
                        <p className="lp-section-sub">From finding your dream role to building your ideal team — Interlink has you covered at every step.</p>
                    </div>

                    <div className="lp-features">
                        {features.map((f) => (
                            <div key={f.title} className="lp-feature-card">
                                <div className="lp-feature-card__icon">{f.icon}</div>
                                <h3 className="lp-feature-card__title">{f.title}</h3>
                                <p className="lp-feature-card__desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="howitworks" className="lp-section lp-section--dark">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <span className="lp-section-tag lp-section-tag--light">Simple Process</span>
                        <h2 className="lp-section-title lp-section-title--light">How Interlink Works</h2>
                        <p className="lp-section-sub lp-section-sub--light">Get started in minutes — whether you're a candidate or a company.</p>
                    </div>

                    {/* Tab toggle */}
                    <div className="lp-tabs">
                        <button
                            className={`lp-tab${activeTab === 'candidate' ? ' lp-tab--active' : ''}`}
                            onClick={() => setActiveTab('candidate')}
                        >
                            <IconUsers /> For Candidates
                        </button>
                        <button
                            className={`lp-tab${activeTab === 'company' ? ' lp-tab--active' : ''}`}
                            onClick={() => setActiveTab('company')}
                        >
                            <IconBriefcase /> For Companies
                        </button>
                    </div>

                    <div className="lp-steps">
                        {(activeTab === 'candidate' ? candidateSteps : companySteps).map((s) => (
                            <div key={s.num} className="lp-step">
                                <div className="lp-step__num">{s.num}</div>
                                <div className="lp-step__body">
                                    <h3 className="lp-step__title">{s.title}</h3>
                                    <p className="lp-step__desc">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lp-steps-cta">
                        {activeTab === 'candidate' ? (
                            <Link to="/register?role=candidate" className="lp-btn lp-btn--white lp-btn--lg">
                                Register as Candidate <IconArrow />
                            </Link>
                        ) : (
                            <Link to="/register?role=company" className="lp-btn lp-btn--white lp-btn--lg">
                                Register Your Company <IconArrow />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── REGISTER CTA SPLIT ── */}
            <section className="lp-register">
                <div className="lp-register__card lp-register__card--candidate">
                    <div className="lp-register__icon"><IconUsers /></div>
                    <h2 className="lp-register__title">Job Seekers</h2>
                    <p className="lp-register__desc">Create your profile, showcase your skills, and connect with companies actively hiring right now.</p>
                    <ul className="lp-register__points">
                        {['Free to register', 'AI-powered job matching', 'Interview prep tools', 'Track your applications'].map(p => (
                            <li key={p}><span className="lp-check"><IconCheck /></span> {p}</li>
                        ))}
                    </ul>
                    <Link to="/register?role=candidate" className="lp-btn lp-btn--primary lp-btn--full">
                        Register as Candidate <IconArrow />
                    </Link>
                </div>

                <div className="lp-register__divider">
                    <span>OR</span>
                </div>

                <div className="lp-register__card lp-register__card--company">
                    <div className="lp-register__icon"><IconBriefcase /></div>
                    <h2 className="lp-register__title">Companies</h2>
                    <p className="lp-register__desc">Post jobs, discover verified talent, and streamline your entire hiring process in one platform.</p>
                    <ul className="lp-register__points">
                        {['Post unlimited jobs', 'Smart candidate filtering', 'Integrated scheduling', 'Hiring analytics dashboard'].map(p => (
                            <li key={p}><span className="lp-check"><IconCheck /></span> {p}</li>
                        ))}
                    </ul>
                    <Link to="/register?role=company" className="lp-btn lp-btn--primary lp-btn--full">
                        Register Your Company <IconArrow />
                    </Link>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" className="lp-section lp-section--light">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <span className="lp-section-tag">Testimonials</span>
                        <h2 className="lp-section-title">What Our Users Say</h2>
                        <p className="lp-section-sub">Real stories from candidates and employers who found success through Interlink.</p>
                    </div>

                    <div className="lp-testimonials">
                        {testimonials.map((t) => (
                            <div key={t.name} className="lp-testimonial">
                                <div className="lp-testimonial__stars">
                                    {Array.from({ length: t.stars }).map((_, i) => (
                                        <span key={i} className="lp-testimonial__star"><IconStar /></span>
                                    ))}
                                </div>
                                <p className="lp-testimonial__text">"{t.text}"</p>
                                <div className="lp-testimonial__author">
                                    <div className="lp-testimonial__avatar">{t.name[0]}</div>
                                    <div>
                                        <div className="lp-testimonial__name">{t.name}</div>
                                        <div className="lp-testimonial__role">{t.role} · {t.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA BANNER ── */}
            <section className="lp-cta-banner">
                <div className="lp-cta-banner__inner">
                    <h2 className="lp-cta-banner__title">Ready to Take the Next Step?</h2>
                    <p className="lp-cta-banner__sub">Join thousands of candidates and companies already using Interlink to find their perfect match.</p>
                    <div className="lp-cta-banner__actions">
                        <Link to="/register?role=candidate" className="lp-btn lp-btn--white lp-btn--lg">Find Jobs</Link>
                        <Link to="/register?role=company" className="lp-btn lp-btn--outline-white lp-btn--lg">Post a Job</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
