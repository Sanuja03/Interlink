import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import Footer from '../../components/CandidatePages/CandidateDashboard/Footer';
import { allJobs } from './JobPosts';

const JobPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);

    useEffect(() => {
        const foundJob = allJobs.find(j => j.id === parseInt(id));
        setJob(foundJob);
        window.scrollTo(0, 0);
    }, [id]);

    if (!job) {
        return (
            <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    Job Not Found.
                </div>
            </div>
        );
    }

    const currentId = parseInt(id);
    const prevId = currentId > 1 ? currentId - 1 : null;
    const nextId = currentId < allJobs.length ? currentId + 1 : null;

    return (
        <div style={{ minHeight: '100vh', background: '#ececec', display: 'flex', fontFamily: 'sans-serif' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <main style={{ flex: 1, maxWidth: '860px', margin: '0 auto', width: '100%', padding: '28px 20px 40px' }}>

                    {/* Back to jobs button */}
                    <button
                        onClick={() => navigate('/job-posts')}
                        style={{
                            background: '#d1d5db',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 22px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            cursor: 'pointer',
                            marginBottom: '24px',
                            display: 'inline-block',
                        }}
                    >
                        Back to jobs
                    </button>

                    {/* Main Card */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '18px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        overflow: 'hidden',
                        marginBottom: '28px',
                    }}>
                        {/* Gradient Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)',
                            padding: '28px 36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '20px',
                        }}>
                            {/* Left: Logo + Company */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    border: '2px solid rgba(255,255,255,0.35)',
                                }}>
                                    <img src={job.logo} alt={job.company} style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontSize: '22px', fontWeight: '400', marginBottom: '4px', lineHeight: 1.2 }}>{job.company}</div>
                                    <div style={{ color: '#b2d8e3', fontSize: '13px', fontWeight: '500' }}>{job.location} | {job.mode}</div>
                                </div>
                            </div>
                            {/* Right: Job Title */}
                            <div style={{ color: '#fff', fontSize: '26px', fontWeight: '700', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {job.title}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '32px 36px 28px' }}>

                            {/* About the Company */}
                            <section style={{ marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>About the Company</h2>
                                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>
                                    CodeWave Solutions is a Sri Lanka-based software development company specializing in web and mobile applications. We work with modern technologies to build scalable and user-friendly digital solutions for global clients.
                                </p>
                            </section>

                            {/* Job Description */}
                            <section style={{ marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Job Description</h2>
                                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>
                                    We are looking for a motivated and skilled {job.title} to join our development team. The selected candidate will be responsible for designing, developing, and maintaining web applications while collaborating with designers, project managers, and other developers to deliver high-quality solutions.
                                    <br />
                                    This role offers an opportunity to work with modern technologies, improve technical skills, and gain hands-on experience in a professional work environment.
                                </p>
                            </section>

                            {/* Key Requirements */}
                            <section style={{ marginBottom: '28px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Key Requirements</h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {[
                                        'Basic to intermediate knowledge of JavaScript and web development concepts',
                                        `Experience or familiarity with modern frontend frameworks`,
                                        'Understanding of REST APIs and backend integration',
                                        'Basic knowledge of databases such as MySQL or MongoDB',
                                        'Good problem-solving and analytical skills',
                                        'Ability to work effectively in a team',
                                        'Willingness to learn new technologies and tools',
                                    ].map((item, i) => (
                                        <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '18px', position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 0, top: 0, color: '#374151' }}>·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Benefits & Perks */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Benefits &amp; Perks</h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {[
                                        'Competitive salary package',
                                        'Flexible working hours',
                                        `Hybrid / remote work options`,
                                        'Supportive and friendly team environment',
                                        'Opportunities for learning and skill development',
                                        'Career growth and advancement opportunities',
                                        'Paid leave and public holidays',
                                    ].map((item, i) => (
                                        <li key={i} style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '18px', position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 0, top: 0, color: '#374151' }}>·</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => navigate('/ai-questions', { state: { job } })}
                                    style={{
                                        background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '30px',
                                        padding: '12px 28px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        minWidth: '160px',
                                    }}
                                >Generate Questions</button>
                                <button style={{
                                    background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '12px 40px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    minWidth: '140px',
                                }}>save</button>
                                <button style={{
                                    background: 'linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '12px 40px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    minWidth: '140px',
                                }}>apply now</button>
                            </div>
                        </div>
                    </div>

                    {/* Previous / Next Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => prevId && navigate(`/job-posts/${prevId}`)}
                            disabled={!prevId}
                            style={{
                                background: '#d1d5db',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '12px 48px',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: prevId ? '#1a1a1a' : '#9ca3af',
                                cursor: prevId ? 'pointer' : 'not-allowed',
                            }}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => nextId && navigate(`/job-posts/${nextId}`)}
                            disabled={!nextId}
                            style={{
                                background: '#d1d5db',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '12px 48px',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: nextId ? '#1a1a1a' : '#9ca3af',
                                cursor: nextId ? 'pointer' : 'not-allowed',
                            }}
                        >
                            Next
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default JobPostDetails;
