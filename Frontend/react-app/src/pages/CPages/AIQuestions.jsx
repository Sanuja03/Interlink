import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import Footer from '../../components/CandidatePages/CandidateDashboard/Footer';
import api from '../../lib/api';
import { 
    Clock, 
    AlertTriangle, 
    Briefcase, 
    Building2, 
    MapPin, 
    Sparkles, 
    BrainCircuit, 
    Bot, 
    Send, 
    Trash2,
    Award,
    MessageSquare,
    Zap,
    Trophy,
    CheckCircle2,
    XCircle,
    BookOpen,
    Lightbulb
} from 'lucide-react';

const AIQuestions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract job details passed via state
    const job = location.state?.job || {
        id: null,
        title: 'Software Engineer',
        company: 'CodeWave Solutions',
        techStack: 'React',
    };

    const getDaysLeft = (deadlineStr) => {
        if (!deadlineStr) return "N/A";
        const deadlineDate = new Date(deadlineStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "Expired";
        if (diffDays === 0) return "Deadline Today";
        if (diffDays === 1) return "1 day left";
        return `${diffDays} days left`;
    };

    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evaluating, setEvaluating] = useState(false);

    // Track answers and scores for final aggregate save
    const [answersList, setAnswersList] = useState([]);
    const [scoresList, setScoresList] = useState([]);
    const [evaluationsList, setEvaluationsList] = useState([]);

    // Completion states
    const [isCompleted, setIsCompleted] = useState(false);
    const [finalScore, setFinalScore] = useState(null);

    // Fetch dynamic questions using RAG (based on job requirements)
    useEffect(() => {
        if (!job.id) {
            setError('No job selected. Please select a job from the list first.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        api.post('/candidate/question-generator/generate', { jobId: job.id })
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setQuestions(res.data);
                } else {
                    setError('Failed to generate interview questions.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error generating questions:', err);
                const backendMsg = err.response?.data?.message;
                setError(backendMsg ? `Backend Error: ${backendMsg}` : 'Failed to load dynamic interview questions. Make sure the backend server is running and the OpenAI key is configured.');
                setLoading(false);
            });
    }, [job.id]);

    // Timer effect
    useEffect(() => {
        if (loading || error || showFeedback || evaluating) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, error, showFeedback, evaluating, currentQ]);

    // Automate submission on timeout
    useEffect(() => {
        if (timeLeft === 0 && !showFeedback && !loading && !error && !evaluating) {
            handleSubmit();
        }
        // eslint-disable-next-line
    }, [timeLeft, showFeedback]);

    const handleSubmit = () => {
        if (!answer.trim() || evaluating) return;

        setEvaluating(true);

        // 1. Evaluate this single answer in-memory
        api.post('/candidate/question-generator/evaluate', {
            jobId: job.id,
            question: questions[currentQ],
            answer: answer
        })
        .then(res => {
            const evaluation = res.data;
            const receivedScore = evaluation.finalScore || evaluation.score || 0;
            setScore(receivedScore);
            setShowFeedback(true);
            setEvaluating(false);

            // Add current Q&A and score to history arrays
            const updatedAnswers = [...answersList, answer];
            const updatedScores = [...scoresList, receivedScore];
            const updatedEvaluations = [...evaluationsList, evaluation];

            // 2. Check if this is the final question
            const isFinal = currentQ === questions.length - 1;

            if (isFinal) {
                // Calculate average score
                const totalScore = updatedScores.reduce((sum, val) => sum + val, 0);
                const finalAverageScore = Math.round(totalScore / questions.length);
                setFinalScore(finalAverageScore);

                // Save overall session score as a single record
                api.post('/candidate/question-generator/save-score', {
                    jobId: job.id,
                    questions: questions,
                    answers: updatedAnswers,
                    score: finalAverageScore
                })
                .then(() => {
                    console.log('Overall score saved successfully to DB!');
                })
                .catch(saveErr => {
                    console.error('Failed to save overall score:', saveErr);
                });
            }

            // Transition to next question or complete session after 4 seconds
            setTimeout(() => {
                if (!isFinal) {
                    setAnswersList(updatedAnswers);
                    setScoresList(updatedScores);
                    setEvaluationsList(updatedEvaluations);
                    setCurrentQ(q => q + 1);
                    setAnswer('');
                    setShowFeedback(false);
                    setScore(null);
                    setTimeLeft(120);
                } else {
                    setEvaluationsList(updatedEvaluations);
                    setIsCompleted(true);
                }
            }, 4000);
        })
        .catch(err => {
            console.error('Error evaluating answer:', err);
            setScore(0);
            setShowFeedback(true);
            setEvaluating(false);

            const fallbackEval = {
                score: 0,
                technicalAccuracy: 0,
                coverage: 0,
                practicalUnderstanding: 0,
                communication: 0,
                bestPractices: 0,
                strengths: ["Submitted"],
                weaknesses: ["System feedback extraction mismatch"],
                missingTopics: [],
                recommendations: [],
                feedback: "Parsing error on assessment results.",
                finalScore: 0
            };

            const updatedAnswers = [...answersList, answer];
            const updatedScores = [...scoresList, 0];
            const updatedEvaluations = [...evaluationsList, fallbackEval];
            const isFinal = currentQ === questions.length - 1;

            if (isFinal) {
                const totalScore = updatedScores.reduce((sum, val) => sum + val, 0);
                const finalAverageScore = Math.round(totalScore / questions.length);
                setFinalScore(finalAverageScore);

                api.post('/candidate/question-generator/save-score', {
                    jobId: job.id,
                    questions: questions,
                    answers: updatedAnswers,
                    score: finalAverageScore
                })
                .catch(saveErr => console.error('Failed to save overall score:', saveErr));
            }

            setTimeout(() => {
                if (!isFinal) {
                    setAnswersList(updatedAnswers);
                    setScoresList(updatedScores);
                    setEvaluationsList(updatedEvaluations);
                    setCurrentQ(q => q + 1);
                    setAnswer('');
                    setShowFeedback(false);
                    setScore(null);
                    setTimeLeft(120);
                } else {
                    setEvaluationsList(updatedEvaluations);
                    setIsCompleted(true);
                }
            }, 4000);
        });
    };

    const handleClear = () => {
        setAnswer('');
    };

    // Derived helpers for Communication and Confidence ratings based on score
    const getCommunicationRating = (s) => {
        if (s >= 85) return 'Excellent';
        if (s >= 65) return 'Good';
        return 'Needs Work';
    };

    const getConfidenceRating = (s) => {
        if (s >= 80) return 'High';
        if (s >= 60) return 'Medium';
        return 'Low';
    };

    if (isCompleted) {
        // Compute Averages
        const avgTechnical = evaluationsList.length > 0 
            ? Math.round(evaluationsList.reduce((sum, e) => sum + (e.technicalAccuracy || 0), 0) / evaluationsList.length)
            : 0;
        const avgCoverage = evaluationsList.length > 0 
            ? Math.round(evaluationsList.reduce((sum, e) => sum + (e.coverage || 0), 0) / evaluationsList.length)
            : 0;
        const avgPractical = evaluationsList.length > 0 
            ? Math.round(evaluationsList.reduce((sum, e) => sum + (e.practicalUnderstanding || 0), 0) / evaluationsList.length)
            : 0;
        const avgCommunication = evaluationsList.length > 0 
            ? Math.round(evaluationsList.reduce((sum, e) => sum + (e.communication || 0), 0) / evaluationsList.length)
            : 0;
        const avgBestPractices = evaluationsList.length > 0 
            ? Math.round(evaluationsList.reduce((sum, e) => sum + (e.bestPractices || 0), 0) / evaluationsList.length)
            : 0;

        // Flatten qualitative lists
        const allStrengths = Array.from(new Set(evaluationsList.flatMap(e => e.strengths || []).filter(Boolean)));
        const allWeaknesses = Array.from(new Set(evaluationsList.flatMap(e => e.weaknesses || []).filter(Boolean)));
        const allMissingTopics = Array.from(new Set(evaluationsList.flatMap(e => e.missingTopics || []).filter(Boolean)));
        const allRecommendations = Array.from(new Set(evaluationsList.flatMap(e => e.recommendations || []).filter(Boolean)));

        return (
            <div className="min-h-screen flex bg-slate-50 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50/30">
                    <div className="max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8 animate-fade-in">
                        
                        {/* Header Banner */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-teal-500 to-blue-600"></div>
                            
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shadow-sm">
                                    <Trophy className="w-8 h-8 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-800">AI Assessment Report</h2>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                        Detailed breakdown for <strong>{job.title}</strong> at <strong>{job.company}</strong>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/candidate/dashboard')}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 outline-none border-none cursor-pointer text-xs"
                            >
                                Return to Dashboard
                            </button>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* Left Column: Scores & Rubrics */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-4">Overall Score</span>
                                    <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                            <circle 
                                                cx="50" cy="50" r="42" stroke="#0d9488" strokeWidth="8" fill="transparent" 
                                                strokeDasharray="263.89"
                                                strokeDashoffset={263.89 - (263.89 * (finalScore || 0)) / 100}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="text-4xl font-black text-slate-800">
                                            {finalScore !== null ? `${finalScore}%` : '--'}
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full">
                                        {finalScore >= 85 ? 'Excellent Performance' : finalScore >= 65 ? 'Good Performance' : 'Session Completed'}
                                    </div>
                                </div>

                                {/* Rubric Breakdown */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
                                    <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2">Rubric Breakdown</h3>
                                    
                                    <div className="flex flex-col gap-4">
                                        {/* Technical Accuracy (40 marks) */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Technical Accuracy</span>
                                                <span>{avgTechnical} / 40</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(avgTechnical / 40) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Concept Coverage (25 marks) */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Required Concepts Coverage</span>
                                                <span>{avgCoverage} / 25</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(avgCoverage / 25) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Practical Understanding (15 marks) */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Practical Understanding</span>
                                                <span>{avgPractical} / 15</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-violet-500 h-full rounded-full" style={{ width: `${(avgPractical / 15) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Communication (10 marks) */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Communication & Clarity</span>
                                                <span>{avgCommunication} / 10</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(avgCommunication / 10) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Best Practices (10 marks) */}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                                <span>Best Practices</span>
                                                <span>{avgBestPractices} / 10</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(avgBestPractices / 10) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detailed Qualitative Feedback */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                
                                {/* Strengths */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Candidate Strengths</span>
                                    </div>
                                    {allStrengths.length > 0 ? (
                                        <ul className="flex flex-col gap-2.5 pl-0 list-none m-0">
                                            {allStrengths.map((str, idx) => (
                                                <li key={idx} className="text-xs text-slate-600 bg-emerald-50/40 border border-emerald-100/50 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 animate-fade-in">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[10px] text-emerald-700 font-black shrink-0">✓</span>
                                                    <span className="leading-relaxed">{str}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No specific strengths recorded in evaluation.</div>
                                    )}
                                </div>

                                {/* Weaknesses */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                                        <XCircle className="w-4 h-4 text-rose-500" />
                                        <span>Candidate Weaknesses</span>
                                    </div>
                                    {allWeaknesses.length > 0 ? (
                                        <ul className="flex flex-col gap-2.5 pl-0 list-none m-0">
                                            {allWeaknesses.map((weak, idx) => (
                                                <li key={idx} className="text-xs text-slate-600 bg-rose-50/40 border border-rose-100/50 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 animate-fade-in">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-[10px] text-rose-700 font-black shrink-0">✗</span>
                                                    <span className="leading-relaxed">{weak}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No major weaknesses identified.</div>
                                    )}
                                </div>

                                {/* Missing Topics */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                                        <BookOpen className="w-4 h-4 text-indigo-500" />
                                        <span>Missing Technical Topics</span>
                                    </div>
                                    {allMissingTopics.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 animate-fade-in">
                                            {allMissingTopics.map((topic, idx) => (
                                                <span key={idx} className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-semibold">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">All expected context topics were successfully addressed.</div>
                                    )}
                                </div>

                                {/* Recommendations */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <span>Recommendations for Improvement</span>
                                    </div>
                                    {allRecommendations.length > 0 ? (
                                        <ul className="flex flex-col gap-2 pl-4 list-disc text-xs text-slate-600 leading-relaxed animate-fade-in">
                                            {allRecommendations.map((rec, idx) => (
                                                <li key={idx} className="pl-1">
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">No specific recommendations needed. Keep up the good work!</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50/30">
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="absolute inset-0 rounded-full bg-sky-200 blur-xl opacity-35 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-sky-100/80">
                            <Bot className="w-10 h-10 text-sky-600 animate-bounce" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1.5 border-2 border-white shadow-md">
                            <Sparkles className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2">Generating AI Interview</h3>
                    <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed animate-pulse">
                        Retrieving job parameters and tailoring real-time evaluation questions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50/30">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Interview Session Interrupted</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/candidate/jobposts')}
                            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 outline-none border-none cursor-pointer"
                        >
                            Back to Job Posts
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-slate-50 via-slate-100 to-sky-50/30">

                {/* Title Bar */}
                <div className="bg-slate-800 shadow-sm border-b border-slate-700/50 px-8 py-5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-sky-500/10 p-2 rounded-lg border border-sky-400/20">
                            <BrainCircuit className="w-5 h-5 text-sky-400 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] text-sky-400 uppercase tracking-widest font-extrabold">Interview Module</span>
                            <h1 className="text-base font-bold tracking-tight">AI Generated Questions</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md">
                        <Clock className="w-4 h-4 text-sky-300 animate-pulse" />
                        <span>{getDaysLeft(job.deadline)}</span>
                    </div>
                </div>

                <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

                    {/* Job Details Panel */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-50 pb-3">
                            <Briefcase className="w-4 h-4 text-sky-500" />
                            <span>Job Session Details</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    <Briefcase className="w-3 h-3 text-slate-400" />
                                    <span>Job Title</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 truncate" title={job.title}>{job.title}</div>
                            </div>
                            
                            <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    <Building2 className="w-3 h-3 text-slate-400" />
                                    <span>Company</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 truncate" title={job.company}>{job.company}</div>
                            </div>

                            <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Location</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 truncate" title={job.location || 'Remote'}>{job.location || 'Remote'}</div>
                            </div>

                            <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    <Sparkles className="w-3 h-3 text-slate-400 animate-pulse" />
                                    <span>Session Type</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800">Dynamic AI Interview</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Interview Simulator Panel */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                                <Bot className="w-4 h-4 text-sky-500 animate-bounce" style={{ animationDuration: '3s' }} />
                                <span>AI Interview Simulator</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Timer block */}
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                                    timeLeft <= 15 
                                        ? 'bg-red-50 text-red-600 animate-pulse border-red-100' 
                                        : 'bg-sky-50 text-sky-700 border-sky-100'
                                }`}>
                                    <Clock className={`w-3.5 h-3.5 ${timeLeft <= 15 ? 'animate-spin' : ''}`} style={{ animationDuration: timeLeft <= 15 ? '2s' : '' }} />
                                    <span>{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                                </div>
                                {/* Progress badge */}
                                <span className="bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                    Question {currentQ + 1} of {questions.length}
                                </span>
                            </div>
                        </div>

                        {/* Question Box with Bot prompt style */}
                        <div className="relative bg-gradient-to-r from-slate-50 to-sky-50/20 border border-slate-100 rounded-2xl p-5 pl-14 shadow-inner">
                            <div className="absolute top-5 left-4 bg-sky-500 text-white rounded-xl p-1.5 shadow-md">
                                <Bot className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">AI Interviewer Question</span>
                            <p className="text-slate-800 text-sm font-medium italic leading-relaxed">
                                "{questions[currentQ]}"
                            </p>
                        </div>

                        {/* Answer Text Area */}
                        <div className="relative">
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                disabled={evaluating || showFeedback}
                                placeholder="Write your professional answer here... (be detailed and clear to secure a higher evaluation score)"
                                rows={6}
                                className={`w-full rounded-2xl border p-4 text-sm text-slate-700 resize-none outline-none transition-all duration-200 ${
                                    (evaluating || showFeedback) 
                                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
                                }`}
                            />
                            {evaluating && (
                                <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-850 text-white rounded-xl shadow-lg border border-slate-700/80">
                                        <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-semibold">AI is analyzing your response...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-1">
                            <button
                                onClick={handleClear}
                                disabled={evaluating || showFeedback || !answer.trim()}
                                className={`flex items-center gap-2 font-semibold text-xs py-2.5 px-5 rounded-full transition-all duration-200 border-none outline-none ${
                                    (!answer.trim() || evaluating || showFeedback)
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 cursor-pointer'
                                }`}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Clear</span>
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!answer.trim() || evaluating || showFeedback}
                                className={`flex items-center gap-2 font-semibold text-xs py-2.5 px-6 rounded-full transition-all duration-200 shadow-md border-none outline-none ${
                                    (answer.trim() && !evaluating && !showFeedback)
                                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{evaluating ? 'Evaluating...' : 'Submit Answer'}</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Feedback Panel */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-sky-500" />
                                <span>Real-Time AI Feedback</span>
                            </div>
                            {showFeedback && (
                                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 animate-pulse">
                                    Feedback Active
                                </span>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Evaluation Score */}
                            <div className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-300 border ${
                                showFeedback 
                                    ? 'bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-100 shadow-md scale-102' 
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                             }`}>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                    showFeedback ? 'text-sky-600' : 'text-slate-400'
                                }`}>
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Evaluation Score</span>
                                </div>
                                <div className={`text-3xl font-extrabold tracking-tight ${
                                    showFeedback ? 'text-sky-700' : 'text-slate-300'
                                }`}>
                                    {showFeedback ? `${score}%` : '--'}
                                </div>
                            </div>

                            {/* Communication */}
                            <div className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-300 border ${
                                showFeedback 
                                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-100 shadow-md scale-102' 
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                             }`}>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                    showFeedback ? 'text-emerald-600' : 'text-slate-400'
                                }`}>
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Communication</span>
                                </div>
                                <div className={`text-xl font-extrabold ${
                                    showFeedback ? 'text-emerald-700' : 'text-slate-300'
                                }`}>
                                    {showFeedback ? getCommunicationRating(score) : '--'}
                                </div>
                            </div>

                            {/* Confidence Level */}
                            <div className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all duration-300 border ${
                                showFeedback 
                                    ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-100 shadow-md scale-102' 
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                             }`}>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                    showFeedback ? 'text-violet-600' : 'text-slate-400'
                                }`}>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Confidence Level</span>
                                </div>
                                <div className={`text-xl font-extrabold ${
                                    showFeedback ? 'text-violet-700' : 'text-slate-300'
                                }`}>
                                    {showFeedback ? getConfidenceRating(score) : '--'}
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
