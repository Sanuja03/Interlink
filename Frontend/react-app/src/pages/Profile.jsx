import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Edit icon SVG
const EditIcon = () => (
    <svg className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
    </svg>
);

// Reusable section card
const SectionCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            <EditIcon />
        </div>
        {children}
    </div>
);

// Info field with icon
const InfoField = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-blue-500">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm text-gray-700 font-medium">{value}</p>
        </div>
    </div>
);

// Skill badge
const SkillBadge = ({ label, color }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-700`}>
        <span className={`w-2 h-2 rounded-full ${color}`}></span>
        {label}
    </span>
);

const Profile = () => {
    const skills = [
        { label: 'React.js', color: 'bg-blue-400' },
        { label: 'JavaScript', color: 'bg-yellow-400' },
        { label: 'HTML & CSS', color: 'bg-green-400' },
        { label: 'SQL', color: 'bg-gray-400' },
        { label: 'Figma', color: 'bg-pink-400' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">

                {/* Profile Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden ring-2 ring-blue-100">
                                    <img
                                        src="https://randomuser.me/api/portraits/men/32.jpg"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">Daniel Perera</h1>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 14H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2zM4 2a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2H4z" />
                                    </svg>
                                    Junior Software Engineer
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Colombo, Sri Lanka
                                </div>
                            </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3 border border-gray-100">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                                        strokeDasharray="75 25" strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">75%</span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-700">Profile Completion</p>
                                <p className="text-xs text-gray-400">Complete to apply</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <SectionCard title="Personal Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField
                            label="Email Address"
                            value="daniel.perera@mail.com"
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />
                        <InfoField
                            label="Phone Number"
                            value="+94 77 456 9823"
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                        />
                        <InfoField
                            label="Location"
                            value="Colombo, Sri Lanka"
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        />
                        <InfoField
                            label="Availability"
                            value="Full-time"
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>
                </SectionCard>

                {/* Education */}
                <SectionCard title="Education">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">BSc in Information Technology</p>
                                    <p className="text-xs text-blue-500 font-medium mt-0.5">National Institute of Business Studies</p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">2021 – Present</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Work Experience */}
                <SectionCard title="Work Experience / Internship">
                    <div className="flex items-start gap-3">
                        <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Software Engineering Intern</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0a2 2 0 002-2m-2 2a2 2 0 01-2-2m-10 2a2 2 0 002-2m-2 2a2 2 0 01-2-2" />
                                        </svg>
                                        <p className="text-xs text-blue-500 font-medium">NovaTech Solutions</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Assisted in developing web application features and fixing bugs under senior developer supervision.
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">Jan 2024 – Jun 2024</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Skills & Technologies */}
                <SectionCard title="Skills & Technologies">
                    <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                            <SkillBadge key={s.label} label={s.label} color={s.color} />
                        ))}
                    </div>
                </SectionCard>

                {/* Resume / CV */}
                <SectionCard title="Resume / CV">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Daniel_Perera_CV.pdf</p>
                                <p className="text-xs text-gray-400">Last Updated: 15 June 2025</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Replace
                            </button>
                            <button className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* Job Preferences */}
                <SectionCard title="Job Preferences">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Preferred Roles</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Software Engineer</span>
                                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Frontend Developer</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Work Mode</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Hybrid</span>
                                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">Onsite</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

            </main>

            <Footer />
        </div>
    );
};

export default Profile;
