import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import api from '../../lib/api';

// ── Shared helpers ─────────────────────────────────────────────────────────────
// ── Shared helpers & modern styling ──────────────────────────────────────────
const profileCustomStyles = `
  .profile-input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;
    background: #ffffff;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .profile-input:focus {
    border-color: #1a6a82;
    box-shadow: 0 0 0 3px rgba(26, 106, 130, 0.15);
  }
  .profile-input:disabled {
    background: #f8fafc;
    color: #64748b;
    cursor: not-allowed;
  }
  .profile-section-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    margin-bottom: 20px;
    overflow: hidden;
  }
  .profile-section-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border-color: #cbd5e1;
  }
  .profile-btn-primary {
    background: linear-gradient(135deg, #1a6a82 0%, #1a3f5c 100%);
    border: none;
    border-radius: 9999px;
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(26, 106, 130, 0.3);
    transition: all 0.15s ease;
  }
  .profile-btn-primary:hover {
    opacity: 0.95;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(26, 106, 130, 0.4);
  }
  .profile-btn-primary:active {
    transform: translateY(0);
  }
  .profile-btn-secondary {
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 9999px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .profile-btn-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
  .profile-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #1a6a82;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.15s ease;
    margin-top: 6px;
  }
  .profile-add-btn:hover {
    background: #f0f9fb;
  }
  .profile-edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #1a6a82;
    background: #f0f9fb;
    border: 1px solid #d2edf3;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .profile-edit-btn:hover {
    background: #1a6a82;
    color: #ffffff;
    border-color: #1a6a82;
  }
  .profile-info-tile {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .profile-info-tile:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }
`;

const Field = ({ label, value, onChange, type = 'text', placeholder, error }) => (
    <div style={{ marginBottom: '14px' }}>
        {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>{label}</label>}
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || label}
            className="profile-input"
            style={{ borderColor: error ? '#ef4444' : undefined }}
            disabled={type === 'email'}
        />
        {error && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: '14px' }}>
        {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>{label}</label>}
        <select value={value} onChange={e => onChange(e.target.value)} className="profile-input">
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    </div>
);

const DatePair = ({ startDate, endDate, onStartChange, onEndChange }) => {
    const today = new Date().toLocaleDateString('en-CA');
    return (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    max={today}
                    onChange={e => onStartChange(e.target.value)}
                    className="profile-input"
                    style={{ fontSize: '13px' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>End Date</label>
                <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={e => onEndChange(e.target.value)}
                    className="profile-input"
                    style={{ fontSize: '13px' }}
                />
            </div>
        </div>
    );
};

const CardTitle = ({ label, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {icon && (
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9fb', color: '#1a6a82', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            )}
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{label}</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a6a82', background: '#e6f4f8', padding: '3px 10px', borderRadius: '9999px' }}>
            Editing
        </span>
    </div>
);

const EditButtons = ({ onCancel, onSave }) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <button type="button" onClick={onCancel} className="profile-btn-secondary">
            Cancel
        </button>
        <button type="button" onClick={onSave} className="profile-btn-primary">
            Save Changes
        </button>
    </div>
);

const AddMoreBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} className="profile-add-btn">
        <span style={{
            width: '22px', height: '22px', borderRadius: '6px', background: '#1a6a82', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', lineHeight: 1,
        }}>+</span>
        Add another entry
    </button>
);

const SectionCard = ({ title, icon, onEdit, children }) => (
    <div className="profile-section-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-[#f0f9fb] text-[#1a6a82] flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                )}
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
            </div>
            {onEdit && (
                <button type="button" onClick={onEdit} className="profile-edit-btn">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
                    </svg>
                    Edit
                </button>
            )}
        </div>
        {children}
    </div>
);

const InfoField = ({ icon, label, value }) => (
    <div className="profile-info-tile">
        <div className="w-8 h-8 rounded-lg bg-[#f0f9fb] text-[#1a6a82] flex items-center justify-center shrink-0 mt-0.5">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{value || '—'}</p>
        </div>
    </div>
);

const SkillBadge = ({ label }) => (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#f0f9fb] text-[#1a6a82] border border-[#d2edf3] hover:border-[#1a6a82] transition-colors shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a6a82]"></span>
        {label}
    </span>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Profile = () => {
    const fileInputRef = useRef(null);

    // Personal Info
    const [editingPersonal, setEditingPersonal] = useState(false);
    const [personal, setPersonal] = useState({
        firstName: '', lastName: '', location: '', email: '', phone: '', bio: '', availability: 'full time', profilePictureUrl: null, dob: '', headline: ''
    });
    const [personalDraft, setPersonalDraft] = useState({ ...personal });
    const [validationErrs, setValidationErrs] = useState({});

    // Load profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/candidate/profile/me');
                const d = res.data;
                setPersonal(prev => ({
                    ...prev,
                    firstName: d.firstName || '',
                    lastName: d.lastName || '',
                    email: d.email || '',
                    phone: d.phone || '',
                    location: d.location || '',
                    bio: d.bio || '',
                    profilePictureUrl: d.profilePictureUrl || null,
                    dob: d.dateOfBirth || '',
                    headline: d.headline || ''
                }));
                // Load education from API
                if (d.education && d.education.length > 0) {
                    setEduEntries(d.education.map(e => ({
                        id: e.id || null,
                        degree: e.degree || '',
                        institution: e.institution || '',
                        startDate: e.startDate || '',
                        endDate: e.endDate || ''
                    })));
                }
                // Load skills from API
                if (d.skills && d.skills.length > 0) {
                    setSkillEntries(d.skills.map(s => s.skillName || ''));
                }
                // Load resumes from API
                if (d.resumes) {
                    setResumes(d.resumes);
                }
                // Load experience from API
                if (d.experiences && d.experiences.length > 0) {
                    setExpEntries(d.experiences.map(e => ({
                        id: e.id || null,
                        company: e.ccompanyName || '',
                        jobTitle: e.jobTitle || '',
                        description: e.description || '',
                        startDate: e.startDate || '',
                        endDate: e.endDate || ''
                    })));
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, []);

    const startEditPersonal = () => { setPersonalDraft({ ...personal }); setValidationErrs({}); setEditingPersonal(true); };

    const savePersonal = async () => {
        setValidationErrs({});
        try {
            const res = await api.put('/candidate/profile/me', {
                firstName: personalDraft.firstName,
                lastName: personalDraft.lastName,
                phone: personalDraft.phone,
                location: personalDraft.location,
                bio: personalDraft.bio,
                dateOfBirth: personalDraft.dob || null,
                headline: personalDraft.headline
            });
            setPersonal(prev => ({
                ...prev,
                ...res.data,
                dob: res.data.dateOfBirth || ''
            }));
            window.dispatchEvent(new Event('candidate-profile-updated'));
            setEditingPersonal(false);
        } catch (err) {
            if (err.response?.status === 400) {
                // If the backend returns standard Spring validation errors (with "errors" array)
                if (err.response.data?.errors) {
                    const errs = {};
                    err.response.data.errors.forEach(e => errs[e.field] = e.defaultMessage);
                    setValidationErrs(errs);
                }
                // Or if we return a custom map {"message": ...}
                else if (err.response.data?.message) {
                    setValidationErrs({ global: err.response.data.message });
                }
                // Or just fallback
                else {
                    setValidationErrs({ global: "Validation failed. Please check your inputs." });
                }
            } else {
                setValidationErrs({ global: err.response?.data?.message || "An error occurred while saving." });
            }
        }
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/candidate/profile/me/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPersonal(prev => ({ ...prev, profilePictureUrl: res.data.profilePictureUrl }));
            window.dispatchEvent(new Event('candidate-profile-updated'));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to upload picture");
        }
    };

    // Education
    const [editingEdu, setEditingEdu] = useState(false);
    const [eduEntries, setEduEntries] = useState([]);
    const [eduError, setEduError] = useState('');
    const updateEdu = (i, field, val) => { const u = [...eduEntries]; u[i][field] = val; setEduEntries(u); };

    const saveEducation = async () => {
        setEduError('');
        const today = new Date().toLocaleDateString('en-CA');
        // Delete all existing entries that were removed (those without id won't need deletion)
        // For simplicity: delete entries that have an id but were removed
        // Then POST each entry that doesn't have an id yet
        try {
            for (const entry of eduEntries) {
                if (!entry.id) {
                    // New entry - POST
                    if (!entry.degree.trim() || !entry.institution.trim() || !entry.startDate) {
                        setEduError('Degree, Institution, and Start Date are required for each entry.');
                        return;
                    }
                    if (entry.startDate > today) {
                        setEduError('Start Date cannot be in the future.');
                        return;
                    }
                    if (entry.endDate && entry.endDate < entry.startDate) {
                        setEduError('End Date cannot be before Start Date.');
                        return;
                    }
                    const res = await api.post('/candidate/profile/me/education', {
                        degree: entry.degree.trim(),
                        institution: entry.institution.trim(),
                        startDate: entry.startDate,
                        endDate: entry.endDate || null
                    });
                    // Assign the returned id so we don't re-post on next save
                    entry.id = res.data.id;
                }
            }
            setEduEntries([...eduEntries]);
            setEditingEdu(false);
        } catch (err) {
            setEduError(err.response?.data?.message || 'Failed to save education.');
        }
    };

    const deleteEduEntry = async (i) => {
        const entry = eduEntries[i];
        if (entry.id) {
            try {
                await api.delete(`/candidate/profile/me/education/${entry.id}`);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete entry.');
                return;
            }
        }
        setEduEntries(prev => prev.filter((_, idx) => idx !== i));
    };

    // Experience
    const [editingExp, setEditingExp] = useState(false);
    const [expEntries, setExpEntries] = useState([]);
    const [expError, setExpError] = useState('');
    const updateExp = (i, field, val) => { const u = [...expEntries]; u[i][field] = val; setExpEntries(u); };

    const saveExperience = async () => {
        setExpError('');
        const today = new Date().toLocaleDateString('en-CA');
        try {
            for (const entry of expEntries) {
                if (!entry.id) {
                    // New entry - POST
                    if (!entry.company.trim() || !entry.startDate) {
                        setExpError('Company and Start Date are required for each entry.');
                        return;
                    }
                    if (entry.startDate > today) {
                        setExpError('Start Date cannot be in the future.');
                        return;
                    }
                    if (entry.endDate && entry.endDate < entry.startDate) {
                        setExpError('End Date cannot be before Start Date.');
                        return;
                    }
                    const res = await api.post('/candidate/profile/me/experience', {
                        ccompanyName: entry.company.trim(),
                        jobTitle: entry.jobTitle?.trim() || '',
                        description: entry.description?.trim() || '',
                        startDate: entry.startDate,
                        endDate: entry.endDate || null
                    });
                    entry.id = res.data.id;
                }
            }
            setExpEntries([...expEntries]);
            setEditingExp(false);
        } catch (err) {
            setExpError(err.response?.data?.message || 'Failed to save experience.');
        }
    };

    const deleteExpEntry = async (i) => {
        const entry = expEntries[i];
        if (entry.id) {
            try {
                await api.delete(`/candidate/profile/me/experience/${entry.id}`);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete entry.');
                return;
            }
        }
        setExpEntries(prev => prev.filter((_, idx) => idx !== i));
    };

    // Skills
    const [editingSkills, setEditingSkills] = useState(false);
    const [skillEntries, setSkillEntries] = useState([]);
    const [skillError, setSkillError] = useState('');
    const updateSkill = (i, val) => { const u = [...skillEntries]; u[i] = val; setSkillEntries(u); };
    const addSkill = () => setSkillEntries(prev => [...prev, '']);
    const removeSkill = (i) => setSkillEntries(prev => prev.filter((_, idx) => idx !== i));

    const saveSkills = async () => {
        setSkillError('');
        const filtered = skillEntries.map(s => s.trim()).filter(s => s.length > 0);
        if (filtered.length === 0) { setSkillError('Please add at least one skill.'); return; }
        try {
            const res = await api.put('/candidate/profile/me/skills', { skills: filtered });
            setSkillEntries(res.data.map(s => s.skillName));
            setEditingSkills(false);
        } catch (err) {
            setSkillError(err.response?.data?.message || 'Failed to save skills.');
        }
    };

    // CV / Resume
    const [editingCV, setEditingCV] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [cvError, setCvError] = useState('');

    const uploadCV = async () => {
        if (!cvFile) { setCvError('Please choose a file first.'); return; }
        setCvError('');
        const formData = new FormData();
        formData.append('file', cvFile);
        try {
            const res = await api.post('/candidate/profile/me/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumes([res.data]);
            setCvFile(null);
            setEditingCV(false);
        } catch (err) {
            setCvError(err.response?.data?.message || 'Failed to upload CV.');
        }
    };

    const deleteResume = async (resumeId) => {
        try {
            await api.delete(`/candidate/profile/me/resume/${resumeId}`);
            setResumes(prev => prev.filter(r => r.id !== resumeId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete resume.');
        }
    };

    // Job Preferences
    const [editingJobPref, setEditingJobPref] = useState(false);
    const [jobRoles, setJobRoles] = useState(['Software Engineer', 'QA Engineer', 'Frontend Developer']);
    const updateJobRole = (i, val) => { const u = [...jobRoles]; u[i] = val; setJobRoles(u); };
    const addJobRole = () => setJobRoles(prev => [...prev, 'Software Engineer']);
    const [workMode, setWorkMode] = useState('Online');

    const allRoles = ['Software Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'UI/UX Designer'];
    const allModes = ['Online', 'Hybrid', 'Onsite', 'Remote'];


    const getFullName = () => `${personal.firstName} ${personal.lastName}`.trim() || 'Your Name';

    return (
        <div className="min-h-screen flex bg-[#f8fafc] gap-3 sm:gap-6 lg:gap-8">
            <style>{profileCustomStyles}</style>
            <Sidebar />

            <main className="flex-1 min-w-0 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-7 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full space-y-5">

                    {/* ── Profile Hero Header ───────────────────────────────── */}
                    <div className="profile-section-card bg-white relative">
                        {/* Top decorative gradient bar */}
                        <div className="h-2.5 w-full bg-gradient-to-r from-[#1a6a82] via-[#2489a8] to-[#1a3f5c]"></div>

                        <div className="p-5 sm:p-7">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <div className="relative shrink-0">
                                        {/* Profile Picture with hover upload indicator */}
                                        <div
                                            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden ring-4 ring-[#e6f4f8] shadow-md cursor-pointer relative group bg-slate-100"
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Click to change profile picture"
                                        >
                                            <img
                                                src={personal.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                                                alt="Profile"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-[10px] text-white font-medium mt-0.5">Edit</span>
                                            </div>
                                        </div>

                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleProfilePicChange}
                                        />

                                        {/* Status badge dot */}
                                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" title="Profile Active"></span>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{getFullName()}</h1>
                                            {personal.availability && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    {personal.availability}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm font-medium text-[#1a6a82] flex items-center gap-1.5 mb-1">
                                            <svg className="w-4 h-4 shrink-0 text-[#1a6a82]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {personal.headline || 'Add your professional headline'}
                                        </p>

                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {personal.location || 'Location not set'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={startEditPersonal}
                                    className="profile-edit-btn self-start sm:self-center"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Personal Information ──────────────────────────────────── */}
                    {editingPersonal ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Personal Information"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />

                            {validationErrs.global && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {validationErrs.global}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="First Name"
                                    value={personalDraft.firstName}
                                    onChange={v => setPersonalDraft(d => ({ ...d, firstName: v }))}
                                    error={validationErrs.firstName}
                                />
                                <Field
                                    label="Last Name"
                                    value={personalDraft.lastName}
                                    onChange={v => setPersonalDraft(d => ({ ...d, lastName: v }))}
                                    error={validationErrs.lastName}
                                />
                            </div>

                            <Field
                                label="Headline"
                                value={personalDraft.headline}
                                onChange={v => setPersonalDraft(d => ({ ...d, headline: v }))}
                                error={validationErrs.headline}
                                placeholder="e.g. Full Stack Developer | React & Spring Boot"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Email Address (read-only)"
                                    value={personalDraft.email}
                                    onChange={() => { }}
                                    type="email"
                                />
                                <Field
                                    label="Phone Number"
                                    value={personalDraft.phone}
                                    onChange={v => setPersonalDraft(d => ({ ...d, phone: v }))}
                                    error={validationErrs.phone}
                                    placeholder="+94 77 123 4567"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Location"
                                    value={personalDraft.location}
                                    onChange={v => setPersonalDraft(d => ({ ...d, location: v }))}
                                    error={validationErrs.location}
                                    placeholder="e.g. Colombo, Sri Lanka"
                                />
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Availability</label>
                                    <select
                                        value={personalDraft.availability}
                                        onChange={e => setPersonalDraft(d => ({ ...d, availability: e.target.value }))}
                                        className="profile-input"
                                    >
                                        {['full time', 'part time', 'internship', 'freelance'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Date of Birth</label>
                                <input
                                    type="date"
                                    value={personalDraft.dob}
                                    onChange={e => setPersonalDraft(d => ({ ...d, dob: e.target.value }))}
                                    max={new Date().toLocaleDateString('en-CA')}
                                    className="profile-input"
                                    style={{ borderColor: validationErrs.dateOfBirth ? '#ef4444' : undefined }}
                                />
                                {validationErrs.dateOfBirth && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{validationErrs.dateOfBirth}</span>}
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>About / Bio</label>
                                <textarea
                                    rows={3}
                                    value={personalDraft.bio}
                                    onChange={e => setPersonalDraft(d => ({ ...d, bio: e.target.value }))}
                                    className="profile-input"
                                    placeholder="Write a brief professional summary about yourself..."
                                    style={{ resize: 'vertical' }}
                                />
                                {validationErrs.bio && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{validationErrs.bio}</span>}
                            </div>

                            <EditButtons onCancel={() => setEditingPersonal(false)} onSave={savePersonal} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Personal Information"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                            onEdit={startEditPersonal}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                                <InfoField
                                    label="Email Address"
                                    value={personal.email}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                />
                                <InfoField
                                    label="Phone Number"
                                    value={personal.phone || '—'}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                />
                                <InfoField
                                    label="Location"
                                    value={personal.location || '—'}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                />
                                <InfoField
                                    label="Availability"
                                    value={personal.availability ? personal.availability.toUpperCase() : '—'}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                />
                                <InfoField
                                    label="Date of Birth"
                                    value={personal.dob || '—'}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                />
                            </div>

                            {personal.bio && (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mt-3">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">About Me</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{personal.bio}</p>
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Education ─────────────────────────────────────────────── */}
                    {editingEdu ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Education Details"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" />
                                    </svg>
                                }
                            />
                            {eduError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {eduError}
                                </div>
                            )}
                            {eduEntries.map((entry, i) => (
                                <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/70 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a6a82]">Entry #{i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => deleteEduEntry(i)}
                                            className="text-xs text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Degree / Qualification</label>
                                        <input
                                            value={entry.degree}
                                            onChange={e => updateEdu(i, 'degree', e.target.value)}
                                            placeholder="e.g. BSc in Computer Science"
                                            className="profile-input"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Institution</label>
                                        <input
                                            value={entry.institution}
                                            onChange={e => updateEdu(i, 'institution', e.target.value)}
                                            placeholder="e.g. University of Colombo"
                                            className="profile-input"
                                        />
                                    </div>
                                    <DatePair
                                        startDate={entry.startDate}
                                        endDate={entry.endDate}
                                        onStartChange={v => updateEdu(i, 'startDate', v)}
                                        onEndChange={v => updateEdu(i, 'endDate', v)}
                                    />
                                </div>
                            ))}
                            <AddMoreBtn onClick={() => setEduEntries(prev => [...prev, { id: null, degree: '', institution: '', startDate: '', endDate: '' }])} />
                            <EditButtons onCancel={() => { setEditingEdu(false); setEduError(''); }} onSave={saveEducation} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Education"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" />
                                </svg>
                            }
                            onEdit={() => setEditingEdu(true)}
                        >
                            {eduEntries.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-400">No education entries added yet.</p>
                                    <button type="button" onClick={() => setEditingEdu(true)} className="mt-2 text-xs font-semibold text-[#1a6a82] hover:underline">
                                        + Add Education
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {eduEntries.map((entry, i) => (
                                        <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="w-10 h-10 rounded-xl bg-[#f0f9fb] text-[#1a6a82] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{entry.degree || '—'}</p>
                                                        <p className="text-xs text-[#1a6a82] font-semibold mt-0.5">{entry.institution || '—'}</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 self-start">
                                                        {entry.startDate ? entry.startDate.substring(0, 4) : '?'} – {entry.endDate ? entry.endDate.substring(0, 4) : 'Present'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Experience ────────────────────────────────────────────── */}
                    {editingExp ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Work Experience"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                            {expError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {expError}
                                </div>
                            )}
                            {expEntries.map((entry, i) => (
                                <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/70 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#1a6a82]">Position #{i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => deleteExpEntry(i)}
                                            className="text-xs text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Job Title / Role</label>
                                        <input
                                            value={entry.jobTitle}
                                            onChange={e => updateExp(i, 'jobTitle', e.target.value)}
                                            placeholder="e.g. Associate Software Engineer"
                                            className="profile-input"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Company Name</label>
                                        <input
                                            value={entry.company}
                                            onChange={e => updateExp(i, 'company', e.target.value)}
                                            placeholder="e.g. Acme Technologies"
                                            className="profile-input"
                                        />
                                    </div>
                                    <DatePair
                                        startDate={entry.startDate}
                                        endDate={entry.endDate}
                                        onStartChange={v => updateExp(i, 'startDate', v)}
                                        onEndChange={v => updateExp(i, 'endDate', v)}
                                    />
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Description & Responsibilities</label>
                                        <textarea
                                            rows={2}
                                            value={entry.description}
                                            onChange={e => updateExp(i, 'description', e.target.value)}
                                            placeholder="Key roles, achievements, and responsibilities..."
                                            className="profile-input"
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <AddMoreBtn onClick={() => setExpEntries(prev => [...prev, { id: null, company: '', startDate: '', endDate: '', jobTitle: '', description: '' }])} />
                            <EditButtons onCancel={() => { setEditingExp(false); setExpError(''); }} onSave={saveExperience} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Work Experience & Internships"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                            onEdit={() => setEditingExp(true)}
                        >
                            {expEntries.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-400">No experience or internships added yet.</p>
                                    <button type="button" onClick={() => setEditingExp(true)} className="mt-2 text-xs font-semibold text-[#1a6a82] hover:underline">
                                        + Add Experience
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {expEntries.map((entry, i) => (
                                        <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="w-10 h-10 rounded-xl bg-[#f0f9fb] text-[#1a6a82] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{entry.jobTitle || 'Role Not Specified'}</p>
                                                        <p className="text-xs text-[#1a6a82] font-semibold mt-0.5">{entry.company || 'Company'}</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 self-start">
                                                        {entry.startDate ? entry.startDate.substring(0, 4) : '?'} – {entry.endDate ? entry.endDate.substring(0, 4) : 'Present'}
                                                    </span>
                                                </div>
                                                {entry.description && (
                                                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                                                        {entry.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Skills & Technologies ───────────────────────────── */}
                    {editingSkills ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Skills & Technologies"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                }
                            />
                            {skillError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {skillError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                {skillEntries.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            value={skill}
                                            onChange={e => updateSkill(i, e.target.value)}
                                            placeholder="e.g. React.js, Python, Docker"
                                            className="profile-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(i)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                            title="Delete skill"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <AddMoreBtn onClick={addSkill} />
                            <EditButtons onCancel={() => { setEditingSkills(false); setSkillError(''); }} onSave={saveSkills} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Skills & Technologies"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                            onEdit={() => setEditingSkills(true)}
                        >
                            {skillEntries.filter(s => s.trim()).length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-400">No skills highlighted yet.</p>
                                    <button type="button" onClick={() => setEditingSkills(true)} className="mt-2 text-xs font-semibold text-[#1a6a82] hover:underline">
                                        + Add Skills
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2.5">
                                    {skillEntries.filter(s => s.trim()).map((s, i) => (
                                        <SkillBadge key={i} label={s} />
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Resume / CV ───────────────────────────────────────── */}
                    {editingCV ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Upload Resume / CV"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            />
                            {cvError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    {cvError}
                                </div>
                            )}
                            <div className="border-2 border-dashed border-slate-200 hover:border-[#1a6a82] rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-[#f0f9fb]/40 transition-colors">
                                <div className="w-12 h-12 bg-[#e6f4f8] text-[#1a6a82] rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">Upload your latest Resume or CV</p>
                                <p className="text-xs text-slate-400 mb-4">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>

                                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#1a6a82] to-[#1a3f5c] hover:opacity-95 shadow-sm cursor-pointer transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Browse Document
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        style={{ display: 'none' }}
                                        onChange={e => { setCvFile(e.target.files[0]); setCvError(''); }}
                                    />
                                </label>

                                {cvFile && (
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-[#1a6a82] font-semibold">
                                        <span>Selected: {cvFile.name}</span>
                                        <button type="button" onClick={() => setCvFile(null)} className="text-slate-400 hover:text-red-500 font-bold ml-1">✕</button>
                                    </div>
                                )}
                            </div>
                            <EditButtons onCancel={() => { setEditingCV(false); setCvFile(null); setCvError(''); }} onSave={uploadCV} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Resume / CV"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                            onEdit={() => setEditingCV(true)}
                        >
                            {resumes.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-400">No CV or Resume uploaded yet.</p>
                                    <button type="button" onClick={() => setEditingCV(true)} className="mt-2 text-xs font-semibold text-[#1a6a82] hover:underline">
                                        + Upload CV
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {resumes.map(r => (
                                        <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{r.fileName}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Uploaded {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <a
                                                    href={r.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1a6a82] to-[#1a3f5c] hover:opacity-95 px-3.5 py-1.5 rounded-lg shadow-2xs transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteResume(r.id)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* ── Job Preferences ───────────────────────────────────────── */}
                    {editingJobPref ? (
                        <div className="profile-section-card p-5 sm:p-7">
                            <CardTitle
                                label="Job Preferences"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                }
                            />
                            <div className="mb-4">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Preferred Job Roles</label>
                                <div className="space-y-2 mb-2">
                                    {jobRoles.map((role, i) => (
                                        <select
                                            key={i}
                                            value={role}
                                            onChange={e => updateJobRole(i, e.target.value)}
                                            className="profile-input"
                                        >
                                            {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    ))}
                                </div>
                                <AddMoreBtn onClick={addJobRole} />
                            </div>

                            <div className="mt-5">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Work Mode</label>
                                <select
                                    value={workMode}
                                    onChange={e => setWorkMode(e.target.value)}
                                    className="profile-input"
                                >
                                    {allModes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <EditButtons onCancel={() => setEditingJobPref(false)} onSave={() => setEditingJobPref(false)} />
                        </div>
                    ) : (
                        <SectionCard
                            title="Job Preferences"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                            onEdit={() => setEditingJobPref(true)}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Roles</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {jobRoles.map(r => (
                                            <span key={r} className="text-xs bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200 font-semibold shadow-2xs">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Mode</p>
                                    <span className="inline-flex items-center gap-1.5 text-xs bg-[#f0f9fb] text-[#1a6a82] border border-[#d2edf3] px-3.5 py-1.5 rounded-lg font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1a6a82]"></span>
                                        {workMode}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Profile;
