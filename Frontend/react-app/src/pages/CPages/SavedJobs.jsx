import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const SavedJobs = () => {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/saved-jobs')
            .then(res => {
                setSavedJobs(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching saved jobs:", err);
                setSavedJobs([]);
                setLoading(false);
            });
    }, []);

    const removeSavedJob = (jobId) => {
        api.delete(`/candidate/saved-jobs/${jobId}`)
            .then(() => {
                setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
            })
            .catch(err => console.error("Error removing saved job:", err));
    };

    const formatEnum = (val) => {
        if (!val) return '';
        return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    return (
        <div className="min-h-screen flex bg-gray-50" style={{ gap: '2.5rem' }}>
            <Sidebar />

            <main className="flex-1 w-full px-4 py-8 overflow-y-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#1a3f5c' }}>Saved Jobs</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and apply to jobs you've saved for later.</p>
                </div>

                <div className="flex-1 flex flex-col gap-4 max-w-5xl">
                    {loading ? (
                        <div className="flex justify-center py-16 text-gray-400">Loading saved jobs...</div>
                    ) : savedJobs.length > 0 ? (
                        <>
                            <p className="text-xs text-gray-400 font-medium mb-2">
                                {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
                            </p>

                            {savedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center gap-5 rounded-2xl px-6 py-5 shadow-md relative group"
                                    style={{ background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)' }}
                                >
                                    {/* Logo */}
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/30">
                                        <img src={job.logo || '/default-company-logo.png'} alt={job.company} className="w-12 h-12 object-contain" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-white font-bold text-lg leading-tight pr-8">{job.title}</h2>
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

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => navigate(`/candidate/jobposts/${job.jobId}`)}
                                            className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                            style={{ background: 'linear-gradient(135deg, #1d6fa5, #1a6a82)', outline: 'none', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => navigate(`/candidate/jobapply/${job.jobId}`)}
                                            className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                            style={{ background: 'linear-gradient(135deg, #0C3E56, #1a6a82)', outline: 'none', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                    
                                    {/* Unsave button */}
                                    <button 
                                        onClick={() => removeSavedJob(job.jobId)}
                                        className="absolute top-2 right-5 p-2 rounded-full transition-colors border-none outline-none focus:outline-none bg-blue-100 text-[#1a3f5c] hover:bg-blue-200"
                                        title="Remove from saved jobs"
                                        style={{ border: 'none', outline: 'none' }}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100 h-64">
                            <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-800 text-lg font-bold">No saved jobs yet</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-4 max-w-sm">When you find a job you like but aren't ready to apply, save it here to review later.</p>
                            <button 
                                onClick={() => navigate('/candidate/jobposts')} 
                                className="px-6 py-2 rounded-full text-white text-sm font-semibold shadow-md transition-opacity"
                                style={{ background: 'linear-gradient(135deg, #1a6a82, #1a3f5c)' }}
                            >
                                Browse Jobs
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SavedJobs;
