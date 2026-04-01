import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/CandidateDashboard/Footer';
import logo from '../assets/logo.png';

/* ─── Inline styles ─── */
const landingPageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

/* ── Reset / root ──────────────────────────────────── */
.lp {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    color: #1a2e3b;
    background: #ffffff;
    overflow-x: hidden;
}

/* ── Landing Navbar ─────────────────────────────────── */
.lp-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(12, 62, 86, 0.08);
    transition: box-shadow 0.3s ease, background 0.3s ease;
}

.lp-nav--scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 24px rgba(12, 62, 86, 0.10);
}

.lp-nav__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 28px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.lp-nav__logo {
    height: 44px;
    width: auto;
    object-fit: contain;
}

.lp-nav__links {
    display: flex;
    align-items: center;
    gap: 6px;
}

.lp-nav__link {
    background: none;
    border: none;
    cursor: pointer;
    color: #3a5568;
    font-family: 'Outfit', sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 8px;
    transition: color 0.2s, background 0.2s;
}

.lp-nav__link:hover {
    color: #0C3E56;
    background: rgba(12, 62, 86, 0.06);
}

.lp-nav__signin {
    color: #0C3E56;
    font-weight: 600;
    font-size: 0.92rem;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.2s;
}

.lp-nav__signin:hover {
    background: rgba(12, 62, 86, 0.07);
}

.lp-nav__cta {
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    font-weight: 600;
    font-size: 0.92rem;
    padding: 9px 22px;
    border-radius: 50px;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.2s;
    white-space: nowrap;
}

.lp-nav__cta:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.lp-nav__hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: #0C3E56;
    padding: 6px;
}

.lp-nav__mobile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 24px 18px;
    background: #fff;
    border-top: 1px solid rgba(12, 62, 86, 0.08);
}

.lp-nav__mlink {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    text-decoration: none;
    color: #3a5568;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 10px 12px;
    border-radius: 8px;
    text-align: left;
    transition: background 0.2s;
}

.lp-nav__mlink:hover {
    background: rgba(12, 62, 86, 0.06);
}

.lp-nav__mcta {
    display: block;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    text-decoration: none;
    text-align: center;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 11px 20px;
    border-radius: 50px;
    margin-top: 6px;
}

/* ── Hero Section ───────────────────────────────────── */
.lp-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 110px 28px 60px;
    background: linear-gradient(145deg, #f4f8fb 0%, #e8f2f8 50%, #d5eaf4 100%);
    overflow: hidden;
    text-align: center;
}

.lp-hero__bg-circles {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.lp-hero__circle {
    position: absolute;
    border-radius: 50%;
}

.lp-hero__circle--1 {
    width: 520px;
    height: 520px;
    top: -180px;
    right: -140px;
    background: radial-gradient(circle, rgba(26, 106, 130, 0.12) 0%, transparent 70%);
}

.lp-hero__circle--2 {
    width: 360px;
    height: 360px;
    bottom: -100px;
    left: -80px;
    background: radial-gradient(circle, rgba(12, 62, 86, 0.10) 0%, transparent 70%);
}

.lp-hero__circle--3 {
    width: 200px;
    height: 200px;
    top: 40%;
    left: 10%;
    background: radial-gradient(circle, rgba(29, 111, 165, 0.08) 0%, transparent 70%);
}

.lp-hero__content {
    position: relative;
    max-width: 780px;
    z-index: 1;
}

.lp-hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(12, 62, 86, 0.09);
    color: #0C3E56;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 50px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 22px;
}

.lp-hero__badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1a6a82;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.4);
        opacity: 0.6;
    }
}

.lp-hero__title {
    font-size: clamp(2.4rem, 5.5vw, 4rem);
    font-weight: 800;
    line-height: 1.12;
    color: #0C3E56;
    margin: 0 0 16px;
}

.lp-hero__title-accent {
    background: linear-gradient(135deg, #1a6a82, #1d6fa5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.lp-hero__sub {
    font-size: 1.08rem;
    color: #4a6b7c;
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto 32px;
}

.lp-hero__actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 28px;
}

.lp-hero__search {
    margin-top: 10px;
}

.lp-hero__searchbox {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 2px solid rgba(12, 62, 86, 0.15);
    border-radius: 50px;
    padding: 8px 8px 8px 18px;
    max-width: 520px;
    margin: 0 auto;
    box-shadow: 0 4px 20px rgba(12, 62, 86, 0.08);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.lp-hero__searchbox:focus-within {
    border-color: #1a6a82;
    box-shadow: 0 4px 24px rgba(26, 106, 130, 0.16);
}

.lp-hero__searchbox svg {
    color: #1a6a82;
    flex-shrink: 0;
}

.lp-hero__searchbox input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    color: #1a2e3b;
    background: transparent;
}

.lp-hero__searchbox input::placeholder {
    color: #9ab0bc;
}

.lp-hero__search-btn {
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 9px 22px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}

.lp-hero__search-btn:hover {
    opacity: 0.88;
}

.lp-hero__stats {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 0;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 8px 40px rgba(12, 62, 86, 0.12);
    margin-top: 52px;
    overflow: hidden;
    border: 1px solid rgba(12, 62, 86, 0.08);
    flex-wrap: wrap;
}

.lp-hero__stat {
    flex: 1;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 22px 28px;
    border-right: 1px solid rgba(12, 62, 86, 0.08);
}

.lp-hero__stat:last-child {
    border-right: none;
}

.lp-hero__stat-val {
    font-size: 1.9rem;
    font-weight: 800;
    color: #0C3E56;
    line-height: 1;
}

.lp-hero__stat-label {
    font-size: 0.82rem;
    color: #6a8fa0;
    font-weight: 500;
    margin-top: 4px;
    text-align: center;
}

/* ── Generic buttons ───────────────────────────────── */
.lp-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 50px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.22s ease;
    white-space: nowrap;
}

.lp-btn--lg {
    padding: 13px 28px;
    font-size: 1rem;
}

.lp-btn--full {
    width: 100%;
    justify-content: center;
}

.lp-btn--primary {
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
}

.lp-btn--primary:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(12, 62, 86, 0.28);
}

.lp-btn--outline {
    border: 2px solid #0C3E56;
    color: #0C3E56;
    background: transparent;
}

.lp-btn--outline:hover {
    background: rgba(12, 62, 86, 0.06);
    transform: translateY(-2px);
}

.lp-btn--white {
    background: #fff;
    color: #0C3E56;
}

.lp-btn--white:hover {
    background: #f0f7fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(12, 62, 86, 0.12);
}

.lp-btn--outline-white {
    border: 2px solid rgba(255, 255, 255, 0.8);
    color: #fff;
    background: transparent;
}

.lp-btn--outline-white:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #fff;
    transform: translateY(-2px);
}

/* ── Sections ──────────────────────────────────────── */
.lp-section {
    padding: 88px 28px;
}

.lp-section--light {
    background: #f4f8fb;
}

.lp-section--dark {
    background: linear-gradient(145deg, #0C3E56 0%, #0e4d6a 100%);
}

.lp-container {
    max-width: 1200px;
    margin: 0 auto;
}

.lp-section-head {
    text-align: center;
    max-width: 600px;
    margin: 0 auto 56px;
}

.lp-section-tag {
    display: inline-block;
    background: rgba(26, 106, 130, 0.12);
    color: #1a6a82;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 50px;
    margin-bottom: 14px;
}

.lp-section-tag--light {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
}

.lp-section-title {
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 800;
    color: #0C3E56;
    line-height: 1.15;
    margin: 0 0 14px;
}

.lp-section-title--light {
    color: #fff;
}

.lp-section-sub {
    font-size: 1rem;
    color: #5a7a8a;
    line-height: 1.7;
    margin: 0;
}

.lp-section-sub--light {
    color: rgba(255, 255, 255, 0.75);
}

/* ── Features Grid ─────────────────────────────────── */
.lp-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 22px;
}

.lp-feature-card {
    background: #fff;
    border-radius: 18px;
    padding: 30px 26px;
    border: 1px solid rgba(12, 62, 86, 0.07);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(12, 62, 86, 0.12);
}

.lp-feature-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(26, 106, 130, 0.12), rgba(12, 62, 86, 0.08));
    display: grid;
    place-items: center;
    color: #1a6a82;
    margin-bottom: 18px;
}

.lp-feature-card__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0C3E56;
    margin: 0 0 10px;
}

.lp-feature-card__desc {
    font-size: 0.92rem;
    color: #5a7a8a;
    line-height: 1.65;
    margin: 0;
}

/* ── How It Works Tabs ─────────────────────────────── */
.lp-tabs {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 44px;
    flex-wrap: wrap;
}

.lp-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Outfit', sans-serif;
    font-size: 0.97rem;
    font-weight: 600;
    padding: 11px 26px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.22s ease;
}

.lp-tab:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
}

.lp-tab--active {
    background: #fff;
    border-color: #fff;
    color: #0C3E56;
}

.lp-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.lp-step {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 28px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: background 0.22s;
}

.lp-step:hover {
    background: rgba(255, 255, 255, 0.12);
}

.lp-step__num {
    font-size: 2.2rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.18);
    line-height: 1;
}

.lp-step__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.lp-step__desc {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.6;
    margin: 0;
}

.lp-steps-cta {
    text-align: center;
}

/* ── Register CTA Split ────────────────────────────── */
.lp-register {
    display: flex;
    align-items: stretch;
    max-width: 1100px;
    margin: 0 auto;
    padding: 72px 28px;
    gap: 0;
}

.lp-register__card {
    flex: 1;
    padding: 48px 44px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    border-radius: 22px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-register__card--candidate {
    background: linear-gradient(145deg, #f4f8fb, #e8f0f7);
    border: 1.5px solid rgba(12, 62, 86, 0.1);
}

.lp-register__card--company {
    background: linear-gradient(145deg, #e8f4f8, #d5eaf4);
    border: 1.5px solid rgba(26, 106, 130, 0.15);
}

.lp-register__card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(12, 62, 86, 0.12);
}

.lp-register__icon {
    width: 62px;
    height: 62px;
    border-radius: 16px;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    display: grid;
    place-items: center;
    color: #fff;
}

.lp-register__title {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0C3E56;
    margin: 0;
}

.lp-register__desc {
    font-size: 0.97rem;
    color: #4a6b7c;
    line-height: 1.65;
    margin: 0;
}

.lp-register__points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
}

.lp-register__points li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.94rem;
    color: #2a4a5c;
    font-weight: 500;
}

.lp-check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(26, 106, 130, 0.12);
    display: grid;
    place-items: center;
    color: #1a6a82;
    flex-shrink: 0;
}

.lp-register__divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 28px;
    flex-shrink: 0;
}

.lp-register__divider span {
    background: linear-gradient(145deg, #1a6a82, #0C3E56);
    color: #fff;
    font-weight: 700;
    font-size: 0.88rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 16px rgba(12, 62, 86, 0.22);
}

/* ── Testimonials ──────────────────────────────────── */
.lp-testimonials {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 22px;
}

.lp-testimonial {
    background: #fff;
    border: 1px solid rgba(12, 62, 86, 0.08);
    border-radius: 20px;
    padding: 30px 26px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lp-testimonial:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 32px rgba(12, 62, 86, 0.1);
}

.lp-testimonial__stars {
    display: flex;
    gap: 3px;
}

.lp-testimonial__star {
    color: #f59e0b;
}

.lp-testimonial__text {
    font-size: 0.97rem;
    color: #3a5568;
    line-height: 1.7;
    font-style: italic;
    margin: 0;
    flex: 1;
}

.lp-testimonial__author {
    display: flex;
    align-items: center;
    gap: 12px;
}

.lp-testimonial__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

.lp-testimonial__name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0C3E56;
}

.lp-testimonial__role {
    font-size: 0.82rem;
    color: #7a9aaa;
}

/* ── CTA Banner ────────────────────────────────────── */
.lp-cta-banner {
    background: linear-gradient(135deg, #0C3E56 0%, #1a6a82 60%, #1d6fa5 100%);
    padding: 80px 28px;
    text-align: center;
}

.lp-cta-banner__inner {
    max-width: 660px;
    margin: 0 auto;
}

.lp-cta-banner__title {
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 800;
    color: #fff;
    margin: 0 0 14px;
}

.lp-cta-banner__sub {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.7;
    margin: 0 0 36px;
}

.lp-cta-banner__actions {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 900px) {
    .lp-register {
        flex-direction: column;
    }

    .lp-register__divider {
        padding: 16px 0;
    }

    .lp-register__card {
        padding: 36px 28px;
    }

    .lp-nav__links {
        display: none;
    }

    .lp-nav__hamburger {
        display: block;
    }
}

@media (max-width: 600px) {
    .lp-hero {
        padding: 90px 18px 50px;
    }

    .lp-hero__actions {
        flex-direction: column;
        align-items: center;
    }

    .lp-hero__stats {
        margin-top: 36px;
    }

    .lp-hero__stat {
        min-width: 50%;
        padding: 16px 14px;
    }

    .lp-section {
        padding: 60px 18px;
    }

    .lp-register {
        padding: 48px 18px;
    }

    .lp-register__card {
        padding: 28px 20px;
    }
}
`;

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
            <style>{landingPageStyles}</style>
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
