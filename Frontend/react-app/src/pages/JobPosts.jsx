import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FilterPanel from '../components/FilterPanel';
import Searchbar from '../components/Searchbar';

export const allJobs = [
    {
        id: 1,
        title: 'Software Engineer',
        company: 'Horizon Global',
        location: 'Colombo',
        mode: 'Hybrid',
        category: 'Engineering',
        experience: 'Mid Level',
        techStack: 'React',
        logo: 'https://img.icons8.com/color/96/globe--v1.png',
    },
    {
        id: 2,
        title: 'UI/UX Designer',
        company: 'PixelCraft Studio',
        location: 'Colombo',
        mode: 'Remote',
        category: 'Design',
        experience: 'Entry Level',
        techStack: 'React',
        logo: 'https://img.icons8.com/color/96/cottage.png',
    },
    {
        id: 3,
        title: 'Data Analyst Intern',
        company: 'Insight Labs',
        location: 'Kandy',
        mode: 'Onsite',
        category: 'Engineering',
        experience: 'Entry Level',
        techStack: 'Python',
        logo: 'https://img.icons8.com/color/96/globe.png',
    },
    {
        id: 4,
        title: 'Software Engineer',
        company: 'CodeWave Solutions',
        location: 'Colombo',
        mode: 'Onsite',
        category: 'Engineering',
        experience: 'Senior Level',
        techStack: 'Java',
        logo: 'https://img.icons8.com/color/96/conference-call.png',
    },
    {
        id: 5,
        title: 'Backend Developer',
        company: 'TechBridge',
        location: 'Galle',
        mode: 'Remote',
        category: 'Engineering',
        experience: 'Mid Level',
        techStack: 'Node.js',
        logo: 'https://img.icons8.com/color/96/server.png',
    },
    {
        id: 6,
        title: 'Mobile App Developer',
        company: 'AppNest',
        location: 'Colombo',
        mode: 'Hybrid',
        category: 'Engineering',
        experience: 'Mid Level',
        techStack: 'Flutter',
        logo: 'https://img.icons8.com/color/96/smartphone-tablet.png',
    },
    {
        id: 7,
        title: 'Marketing Specialist',
        company: 'BrandPulse',
        location: 'Colombo',
        mode: 'Onsite',
        category: 'Marketing',
        experience: 'Entry Level',
        techStack: 'React',
        logo: 'https://img.icons8.com/color/96/advertising.png',
    },
    {
        id: 8,
        title: 'Finance Analyst',
        company: 'WealthTrack',
        location: 'Kandy',
        mode: 'Remote',
        category: 'Finance',
        experience: 'Senior Level',
        techStack: 'Python',
        logo: 'https://img.icons8.com/color/96/money.png',
    },
];

import { useNavigate } from 'react-router-dom';

const JobPosts = () => {
    // Read initial values from URL query params (passed from Home page Searchbar)
    const urlParams = new URLSearchParams(window.location.search);
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState(urlParams.get('keyword') || '');
    const [visibleCount, setVisibleCount] = useState(5);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [filters, setFilters] = useState({
        category: urlParams.get('category') || '',
        experience: urlParams.get('experience') || '',
        techStack: urlParams.get('techStack') || '',
        mode: '',
    });

    const handleFilterChange = (field, value) => {
        setVisibleCount(5);
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        setFilters({ category: '', experience: '', techStack: '', mode: '' });
        setKeyword('');
        setVisibleCount(5);
    };

    const hasFilters = Object.values(filters).some(Boolean);

    const filtered = allJobs.filter((job) => {
        const kw = keyword.toLowerCase().trim();
        const matchesKeyword =
            !kw ||
            job.title.toLowerCase().includes(kw) ||
            job.company.toLowerCase().includes(kw) ||
            job.location.toLowerCase().includes(kw);

        const matchesCategory = !filters.category || job.category === filters.category;
        const matchesExperience = !filters.experience || job.experience === filters.experience;
        const matchesTechStack = !filters.techStack || job.techStack === filters.techStack;
        const matchesMode = !filters.mode || job.mode === filters.mode;

        return matchesKeyword && matchesCategory && matchesExperience && matchesTechStack && matchesMode;
    });

    const visible = filtered.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex bg-gray-50" style={{ gap: '2.5rem' }}>
            <Sidebar />

            <main className="flex-1 w-full px-4 py-6 overflow-y-auto">

                {/* Shared Search Bar */}
                <div className="-mx-4">
                    <Searchbar
                        keyword={keyword}
                        onKeywordChange={(val) => { setKeyword(val); setVisibleCount(5); }}
                        onSearch={({ keyword: kw, category, experience, techStack }) => {
                            setKeyword(kw);
                            setFilters((prev) => ({
                                ...prev,
                                ...(category !== undefined && { category }),
                                ...(experience !== undefined && { experience }),
                                ...(techStack !== undefined && { techStack }),
                            }));
                            setVisibleCount(5);
                        }}
                    />
                </div>

                {/* Filter toggle icon row */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setFilterExpanded((v) => !v)}
                        title={filterExpanded ? 'Hide filters' : 'Show filters'}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200"
                        style={{
                            borderColor: filterExpanded ? '#1a3f5c' : '#cbd5e1',
                            background: filterExpanded ? '#1a3f5c' : '#fff',
                            color: filterExpanded ? '#fff' : '#475569',
                        }}
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        Filters
                        {hasFilters && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-xs font-bold" style={{ background: '#1a6a82', fontSize: '10px' }}>
                                {Object.values(filters).filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content: Filter Panel + Job Cards */}
                <div className="flex gap-5 items-start">

                    {/* Filter Panel — controlled by icon button */}
                    <FilterPanel
                        filters={filters}
                        onChange={handleFilterChange}
                        onReset={handleReset}
                        expanded={filterExpanded}
                        onToggle={() => setFilterExpanded((v) => !v)}
                    />

                    {/* Job Cards column */}
                    <div className="flex-1 flex flex-col gap-4">

                        {/* Results count */}
                        <p className="text-xs text-gray-400 font-medium">
                            {filtered.length} job{filtered.length !== 1 ? 's' : ''} found
                        </p>

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
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', color: '#e0f2f7', fontWeight: 600 }}>
                                            {job.category}
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', color: '#e0f2f7', fontWeight: 600 }}>
                                            {job.experience}
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', color: '#e0f2f7', fontWeight: 600 }}>
                                            {job.techStack}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => navigate(`/job-posts/${job.id}`)}
                                        className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-blue-800 transition-colors duration-200"
                                    >
                                        View Details
                                    </button>
                                    <button className="border border-white text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-white hover:text-blue-800 transition-colors duration-200">
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {visibleCount < filtered.length && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setVisibleCount((v) => v + 5)}
                                    className="px-10 py-2.5 rounded-full text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(to right, #1a6a82, #1a3f5c)' }}
                                >
                                    Load more..
                                </button>
                            </div>
                        )}

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-400 text-sm font-medium">No jobs found matching your filters.</p>
                                <button onClick={handleReset} className="mt-3 text-blue-700 text-xs font-semibold underline">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobPosts;
