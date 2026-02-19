import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const allJobs = [
    {
        id: 1,
        title: 'Software Engineer',
        company: 'Horizon Global',
        location: 'Colombo',
        mode: 'Hybrid',
        logo: 'https://img.icons8.com/color/96/globe--v1.png',
    },
    {
        id: 2,
        title: 'UI/UX Designer',
        company: 'PixelCraft Studio',
        location: 'Colombo',
        mode: 'Remote',
        logo: 'https://img.icons8.com/color/96/cottage.png',
    },
    {
        id: 3,
        title: 'Data Analyst Intern',
        company: 'Insight Labs',
        location: 'Kandy',
        mode: 'Onsite',
        logo: 'https://img.icons8.com/color/96/globe.png',
    },
    {
        id: 4,
        title: 'Software Engineer',
        company: 'CodeWave Solutions',
        location: 'Colombo',
        mode: 'Onsite',
        logo: 'https://img.icons8.com/color/96/conference-call.png',
    },
    {
        id: 5,
        title: 'Backend Developer',
        company: 'TechBridge',
        location: 'Galle',
        mode: 'Remote',
        logo: 'https://img.icons8.com/color/96/server.png',
    },
    {
        id: 6,
        title: 'Mobile App Developer',
        company: 'AppNest',
        location: 'Colombo',
        mode: 'Hybrid',
        logo: 'https://img.icons8.com/color/96/smartphone-tablet.png',
    },
];

const categories = ['Engineering', 'Design', 'Marketing', 'Finance', 'Healthcare'];
const experiences = ['Entry Level', 'Mid Level', 'Senior Level', 'Director'];
const techStacks = ['React', 'Node.js', 'Python', 'Java', 'Flutter'];

const JobPosts = () => {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [experience, setExperience] = useState('');
    const [techStack, setTechStack] = useState('');
    const [filter, setFilter] = useState('');
    const [visibleCount, setVisibleCount] = useState(4);

    const filtered = allJobs.filter((job) => {
        const search = (keyword + filter).toLowerCase();
        return (
            job.title.toLowerCase().includes(search) ||
            job.company.toLowerCase().includes(search) ||
            job.location.toLowerCase().includes(search)
        );
    });

    const visible = filtered.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">

                {/* Search Bar */}
                <div className="w-full flex items-center rounded-full border border-gray-300 bg-white shadow-sm overflow-hidden mb-3">
                    <div className="flex items-center px-4 flex-1 border-r border-gray-200">
                        <svg className="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                        />
                    </div>
                    <div className="border-r border-gray-200">
                        <select value={category} onChange={(e) => setCategory(e.target.value)}
                            className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer">
                            <option value="">Category ▾</option>
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="border-r border-gray-200">
                        <select value={experience} onChange={(e) => setExperience(e.target.value)}
                            className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer">
                            <option value="">Experience ▾</option>
                            {experiences.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className="border-r border-gray-200">
                        <select value={techStack} onChange={(e) => setTechStack(e.target.value)}
                            className="py-3 px-4 text-sm text-gray-600 bg-transparent focus:outline-none cursor-pointer">
                            <option value="">Tech Stack ▾</option>
                            {techStacks.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <button
                        className="bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm px-8 py-3 transition-colors duration-200"
                    >
                        Search
                    </button>
                </div>

                {/* Filter row */}
                <div className="flex items-center gap-2 mb-5">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-full px-4 py-1.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 w-36"
                    />
                </div>

                {/* Job Cards */}
                <div className="flex flex-col gap-4">
                    {visible.map((job) => (
                        <div
                            key={job.id}
                            className="flex items-center gap-5 rounded-2xl px-6 py-5 shadow-md"
                            style={{ background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)' }}
                        >
                            {/* Logo */}
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/30">
                                <img src={job.logo} alt={job.company} className="w-12 h-12 object-contain" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-white font-bold text-lg leading-tight">{job.title}</h2>
                                <p className="text-blue-100 text-sm font-medium">{job.company}</p>
                                <p className="text-blue-200 text-xs mt-0.5">{job.location} | {job.mode}</p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-blue-800 transition-colors duration-200">
                                    View Details
                                </button>
                                <button className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-blue-800 transition-colors duration-200">
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                {visibleCount < filtered.length && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setVisibleCount((v) => v + 4)}
                            className="px-10 py-2.5 rounded-full text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
                            style={{ background: 'linear-gradient(to right, #1a6a82, #1a3f5c)' }}
                        >
                            Load more..
                        </button>
                    </div>
                )}

                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 mt-12 text-sm">No jobs found matching your search.</p>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default JobPosts;
