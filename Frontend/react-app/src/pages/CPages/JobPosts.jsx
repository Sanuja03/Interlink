import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import FilterPanel from '../../components/CandidatePages/CandidateJobPosts/FilterPanel';
import { useNavigate, useSearchParams } from 'react-router-dom';

import api from '../../lib/api';

const JobPosts = () => {
    const [allJobs, setAllJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    useEffect(() => {
        api.get('/candidate/saved-jobs/ids')
            .then(res => setSavedJobIds(res.data || []))
            .catch(err => console.error("Error fetching saved job IDs:", err));

        api.get('/candidate/applications')
            .then(res => {
                const appData = res.data || [];
                const ids = appData.map(app => app.jobId);
                setAppliedJobIds(ids);
            })
            .catch(err => console.error("Error fetching applied job IDs:", err));
    }, []);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [visibleCount, setVisibleCount] = useState(5);
    const [filterExpanded, setFilterExpanded] = useState(false);

    // Read values directly from URL search parameters (single source of truth)
    const keyword = searchParams.get('keyword') || '';
    const filters = {
        category: searchParams.get('category') || '',
        experience: searchParams.get('experience') || '',
        mode: searchParams.get('mode') || '',
    };

    useEffect(() => {
        let url = '/cjobposts';
        const params = new URLSearchParams();
        if (filters.category) {
            params.append('category', filters.category);
        }
        if (filters.experience) {
            // "Entry Level" → "ENTRY_LEVEL", "Senior Level" → "SENIOR_LEVEL"
            const expParam = filters.experience.toUpperCase().replace(/\s+/g, '_');
            params.append('experienceLevel', expParam);
        }
        if (filters.mode) {
            // "Remote" → "REMOTE", "Onsite" → "ONSITE", "Hybrid" → "HYBRID"
            params.append('employmentType', filters.mode.toUpperCase());
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        api.get(url)
            .then(res => {
                const data = res.data;
                if (Array.isArray(data)) {
                    setAllJobs(data);
                } else if (data && Array.isArray(data.content)) {
                    setAllJobs(data.content);
                } else {
                    setAllJobs([]);
                }
            })
            .catch(err => {
                console.error("Error fetching jobs:", err);
                setAllJobs([]);
            });
    }, [filters.category, filters.experience, filters.mode]);

    const handleFilterChange = (field, value) => {
        setVisibleCount(5);
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(field, value);
        } else {
            params.delete(field);
        }
        setSearchParams(params);
    };

    const toggleSaveJob = (jobId) => {
        if (savedJobIds.includes(jobId)) {
            api.delete(`/candidate/saved-jobs/${jobId}`)
                .then(() => setSavedJobIds(prev => prev.filter(id => id !== jobId)))
                .catch(err => console.error("Error unsaving job:", err));
        } else {
            api.post(`/candidate/saved-jobs/${jobId}`)
                .then(() => setSavedJobIds(prev => [...prev, jobId]))
                .catch(err => console.error("Error saving job:", err));
        }
    };

    const handleReset = () => {
        setVisibleCount(5);
        setSearchParams({});
    };

    const hasFilters = Object.values(filters).some(Boolean);

    const filtered = sourceJobs.filter(job => {
        const kw = keyword.toLowerCase().trim();
        const matchesKeyword =
            !kw ||
            (job.title && job.title.toLowerCase().includes(kw)) ||
            (job.company && job.company.toLowerCase().includes(kw)) ||
            (job.location && job.location.toLowerCase().includes(kw));

        return matchesKeyword;
    });

    const formatEnum = (val) => {
        if (!val) return '';
        return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const formatMode = (mode) => {
        if (!mode) return '';
        return mode.charAt(0) + mode.slice(1).toLowerCase();
    };

    const visible = filtered.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex bg-gray-50" style={{ gap: '2.5rem' }}>
            <Sidebar />
            <main className="flex-1 w-full px-4 py-6 overflow-y-auto">



                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setFilterExpanded(v => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200"
                        style={{ borderColor: filterExpanded ? '#1a3f5c' : '#cbd5e1', background: filterExpanded ? '#1a3f5c' : '#fff', color: filterExpanded ? '#fff' : '#475569' }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        Filters
                        {hasFilters && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-xs font-bold" style={{ background: '#1a6a82', fontSize: '10px' }}>{Object.values(filters).filter(Boolean).length}</span>}
                    </button>
                </div>

                <div className="flex gap-5 items-start">
                    <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} expanded={filterExpanded} onToggle={() => setFilterExpanded(v => !v)} />

                    <div className="flex-1 flex flex-col gap-4">
                        <p className="text-xs text-gray-400 font-medium">
                            {loadingJobs ? 'Loading jobs...' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found`}
                        </p>

                        {visible.map((job) => (
                            <div
                                key={job.id}
                                className="flex items-center gap-5 rounded-2xl px-6 py-5 shadow-md relative group"
                                style={{ background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)' }}
                            >
                                {/* Logo */}
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/30">
                                    <img src={job.logo} alt={job.company} className="w-12 h-12 object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-white font-bold text-lg leading-tight">{job.title}</h2>
                                    <p className="text-blue-100 text-sm font-medium">{job.company}</p>
                                    <p className="text-blue-200 text-xs mt-0.5">{job.location} | {formatEnum(job.employmentType)}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', color: '#e0f2f7', fontWeight: 600 }}>
                                            {formatEnum(job.category)}
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '2px 10px', fontSize: '11px', color: '#e0f2f7', fontWeight: 600 }}>
                                            {formatEnum(job.experienceLevel)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleSaveJob(job.id)}
                                    className={`absolute top-2 right-5 p-2 rounded-full transition-colors border-none outline-none focus:outline-none ${savedJobIds.includes(job.id) ? 'bg-blue-100 text-[#1a3f5c]' : 'bg-blue-100/20 text-white hover:bg-blue-100/40'}`}
                                    title={savedJobIds.includes(job.id) ? "Unsave job" : "Save job"}
                                    style={{ border: 'none', outline: 'none' }}
                                >
                                    <svg className="w-5 h-5" fill={savedJobIds.includes(job.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="box" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button onClick={() => navigate(`/candidate/jobposts/${job.id}`)}
                                        className="text-white text-sm font-semibold px-5 py-2 rounded-full"
                                        style={{ background: 'linear-gradient(135deg, #1d6fa5, #1a6a82)', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/candidate/jobapply/${job.id}`)}
                                        disabled={appliedJobIds.includes(job.id)}
                                        className={`text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 ${appliedJobIds.includes(job.id) ? 'text-gray-200 opacity-70' : 'text-white hover:opacity-90 hover:shadow-lg'
                                            }`}
                                        style={{
                                            background: appliedJobIds.includes(job.id) ? '#718096' : 'linear-gradient(135deg, #0C3E56, #1a6a82)',
                                            outline: 'none',
                                            border: 'none',
                                            boxShadow: appliedJobIds.includes(job.id) ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
                                            cursor: appliedJobIds.includes(job.id) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {appliedJobIds.includes(job.id) ? 'Already Applied' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {visibleCount < filtered.length && (
                            <div className="flex justify-center mt-4">
                                <button onClick={() => setVisibleCount(v => v + 5)}
                                    className="px-10 py-2.5 rounded-full text-white text-sm font-semibold shadow-md"
                                    style={{ background: 'linear-gradient(to right, #1a6a82, #1a3f5c)', border: 'none' }}>
                                    Load more..
                                </button>
                            </div>
                        )}

                        {!loadingJobs && filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-gray-400 text-sm font-medium">No jobs found matching your filters.</p>
                                <button onClick={handleReset} className="mt-3 text-blue-700 text-xs font-semibold underline">Clear all filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobPosts;