import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const mockQuestions = [
    "Can you explain the difference between state and props in React?",
    "What is the virtual DOM and how does it work?",
    "How do you manage side effects in React?",
    "Explain the concept of closures in JavaScript.",
    "What is a REST API and how have you used it?",
    "Describe how you would implement authentication in a web app.",
    "What is the difference between SQL and NoSQL databases?",
    "How do you optimize the performance of a React application?",
    "What are React hooks? Name a few you've used.",
    "Tell me about a challenging project and how you handled it.",
];

const AIQuestions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const job = location.state?.job || {
        title: 'Software Engineer',
        company: 'CodeWave Solutions',
        techStack: 'React',
    };

    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(Array(mockQuestions.length).fill(false));
    const [showFeedback, setShowFeedback] = useState(false);

    const handleSubmit = () => {
        const updated = [...submitted];
        updated[currentQ] = true;
        setSubmitted(updated);
        setShowFeedback(true);
        if (currentQ < mockQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQ(q => q + 1);
                setAnswer('');
                setShowFeedback(false);
            }, 1500);
        }
    };

    const handleClear = () => {
        setAnswer('');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', fontFamily: 'sans-serif' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

                {/* Title Bar */}
                <div style={{
                    background: '#4a4a4a',
                    padding: '16px 24px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                }}>
                    AI Generated Questions
                </div>

                <main style={{ flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%', padding: '28px 20px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Job Details Panel */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '2px solid #1a6a82',
                        padding: '22px 28px',
                    }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '18px', borderBottom: '1px solid #e9eaec', paddingBottom: '10px' }}>
                            Job Details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' }}>Selected Job Title</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{job.title}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' }}>Company Name</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{job.company}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '8px' }}>Required Skills</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {['React', 'JavaScript', 'SQL'].map(skill => (
                                        <span key={skill} style={{
                                            background: '#f3f4f6',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            padding: '3px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#374151',
                                        }}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' }}>Interview Type</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Technical / HR</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Interview Simulator Panel */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '2px solid #1a6a82',
                        padding: '22px 28px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>
                                AI INTERVIEW SIMULATOR
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#00b09b' }}>
                                Question {currentQ + 1} of {mockQuestions.length}
                            </div>
                        </div>

                        {/* Question Box */}
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '18px 20px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#1a1a1a',
                            fontStyle: 'italic',
                            fontWeight: '500',
                            lineHeight: '1.6',
                        }}>
                            "{mockQuestions[currentQ]}"
                        </div>

                        {/* Answer Text Area */}
                        <textarea
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Type your answer here or use the microphone..."
                            rows={6}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                padding: '14px 16px',
                                fontSize: '14px',
                                color: '#374151',
                                resize: 'vertical',
                                outline: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                background: '#fff',
                            }}
                        />

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
                            <button
                                onClick={handleClear}
                                style={{
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '11px 40px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer',
                                }}
                            >Clear</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!answer.trim()}
                                style={{
                                    background: answer.trim() ? 'linear-gradient(135deg, #1a6a82, #1a3f5c)' : '#9ca3af',
                                    border: 'none',
                                    borderRadius: '30px',
                                    padding: '11px 40px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    cursor: answer.trim() ? 'pointer' : 'not-allowed',
                                }}
                            >Submit</button>
                        </div>
                    </div>

                    {/* AI Feedback Panel */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '2px solid #1a6a82',
                        padding: '22px 28px',
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#111', letterSpacing: '0.5px', marginBottom: '20px' }}>
                            AI FEEDBACK PANEL
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {/* Technical Accuracy */}
                            <div style={{
                                background: '#e8f4fd',
                                borderRadius: '10px',
                                padding: '18px 12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: '#5ba4cf', fontWeight: '600', marginBottom: '8px' }}>Technical Accuracy</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a6a82' }}>
                                    {showFeedback ? '80%' : '--'}
                                </div>
                            </div>
                            {/* Communication */}
                            <div style={{
                                background: '#e8fdf4',
                                borderRadius: '10px',
                                padding: '18px 12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: '#4cb87a', fontWeight: '600', marginBottom: '8px' }}>Communication</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a7a4a' }}>
                                    {showFeedback ? 'Good' : '--'}
                                </div>
                            </div>
                            {/* Confidence Level */}
                            <div style={{
                                background: '#f5eeff',
                                borderRadius: '10px',
                                padding: '18px 12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: '600', marginBottom: '8px' }}>Confidence Level</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#d63384' }}>
                                    {showFeedback ? 'High' : '--'}
                                </div>
                            </div>
                        </div>
                    </div>

                </main>

                <Footer />
            </div>
        </div>
    );
};

export default AIQuestions;
