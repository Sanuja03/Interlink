import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import api from '../../lib/api';

// ── Shared helpers ─────────────────────────────────────────────────────────────
const inputStyle = {
    width: '100%', border: '1px solid #d1d5db', borderRadius: '8px',
    padding: '9px 14px', fontSize: '14px', color: '#111',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
};

const Field = ({ label, value, onChange, type = 'text', placeholder, error }) => (
    <div style={{ marginBottom: '12px' }}>
        {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>{label}</label>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder || label} style={{ ...inputStyle, borderColor: error ? 'red' : '#d1d5db' }} disabled={type === 'email'} />
        {error && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div style={{ marginBottom: '10px' }}>
        {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>{label}</label>}
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    </div>
);

const DatePair = ({ startDate, endDate, onStartChange, onEndChange }) => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
                style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
        </div>
        <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>End Date</label>
            <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)}
                style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }} />
        </div>
    </div>
);

const CardTitle = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <div style={{ width: '8px', height: '20px', background: '#1a6a82', borderRadius: '2px', flexShrink: 0 }} />
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a6a82' }}>{label}</span>
    </div>
);

const EditButtons = ({ onCancel, onSave }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
        <button onClick={onCancel} style={{
            border: '1px solid #d1d5db', background: '#fff', borderRadius: '30px',
            padding: '10px 36px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer',
        }}>Cancel</button>
        <button onClick={onSave} style={{
            background: 'linear-gradient(135deg, #1a6a82, #1a3f5c)', border: 'none', borderRadius: '30px',
            padding: '10px 36px', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer',
        }}>Save Changes</button>
    </div>
);

const AddMoreBtn = ({ onClick }) => (
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
        border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
        color: '#111', padding: '4px 0', marginTop: '6px',
    }}>
        <span style={{
            width: '26px', height: '26px', borderRadius: '6px', background: '#1a6a82', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', lineHeight: 1,
        }}>+</span>
        Add more
    </button>
);

const EditIcon = ({ onClick }) => (
    <svg onClick={onClick} className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" />
    </svg>
);

const SectionCard = ({ title, onEdit, children }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4" style={{ border: '2px solid #1a6a82' }}>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            <EditIcon onClick={onEdit} />
        </div>
        {children}
    </div>
);

const InfoField = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-blue-500">{icon}</div>
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm text-gray-700 font-medium">{value}</p>
        </div>
    </div>
);

const SkillBadge = ({ label, color }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-700">
        <span className={`w-2 h-2 rounded-full ${color}`}></span>{label}
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
        try {
            for (const entry of expEntries) {
                if (!entry.id) {
                    // New entry - POST
                    if (!entry.company.trim() || !entry.startDate) {
                        setExpError('Company and Start Date are required for each entry.');
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
            setResumes(prev => [res.data, ...prev]);
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
        <div className="min-h-screen flex bg-gray-50" style={{ gap: '2.5rem' }}>
            <Sidebar />
            <main className="flex-1 w-full px-6 py-6 overflow-y-auto">

                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4" style={{ border: '2px solid #1a6a82' }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {/* Profile Picture Wrapper with onClick */}
                                <div
                                    className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden ring-2 ring-blue-100 cursor-pointer relative group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <img
                                        src={personal.profilePictureUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Hover overlay for edit icon */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z" /></svg>
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
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">{getFullName()}</h1>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 14H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2zM4 2a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2H4z" /></svg>
                                    {personal.headline || 'Add a headline'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {personal.location || 'Location Not Set'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Personal Information ──────────────────────────────────── */}
                {editingPersonal ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Personal Information" />

                        {validationErrs.global && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
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
                            label="Location"
                            value={personalDraft.location}
                            onChange={v => setPersonalDraft(d => ({ ...d, location: v }))}
                            error={validationErrs.location}
                        />

                        <Field
                            label="Email Address"
                            value={personalDraft.email}
                            onChange={() => { }} // Readonly as it's tied to Auth
                            type="email"
                        />

                        <Field
                            label="Phone Number"
                            value={personalDraft.phone}
                            onChange={v => setPersonalDraft(d => ({ ...d, phone: v }))}
                            error={validationErrs.phone}
                        />

                        <Field
                            label="Bio"
                            value={personalDraft.bio}
                            onChange={v => setPersonalDraft(d => ({ ...d, bio: v }))}
                            error={validationErrs.bio}
                        />

                        <Field
                            label="Headline"
                            value={personalDraft.headline}
                            onChange={v => setPersonalDraft(d => ({ ...d, headline: v }))}
                            error={validationErrs.headline}
                            placeholder="e.g. Junior Software Engineer"
                        />

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Date of Birth</label>
                            <input type="date" value={personalDraft.dob} onChange={e => setPersonalDraft(d => ({ ...d, dob: e.target.value }))} max="2026-12-31" style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Availibility</label>
                            <select value={personalDraft.availability} onChange={e => setPersonalDraft(d => ({ ...d, availability: e.target.value }))} style={inputStyle}>
                                {['full time', 'part time', 'internship', 'freelance'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                        <EditButtons onCancel={() => setEditingPersonal(false)} onSave={savePersonal} />
                    </div>
                ) : (
                    <SectionCard title="Personal Information" onEdit={startEditPersonal}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoField label="Email Address" value={personal.email} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                            <InfoField label="Phone Number" value={personal.phone || '—'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                            <InfoField label="Location" value={personal.location || '—'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                            <InfoField label="Availability" value={personal.availability} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                            <InfoField label="Date of Birth" value={personal.dob || '—'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                            {personal.bio && (
                                <div className="col-span-1 sm:col-span-2">
                                    <InfoField label="Bio" value={personal.bio} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ── Education ─────────────────────────────────────────────── */}
                {editingEdu ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Education Details" />
                        {eduError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{eduError}</div>
                        )}
                        {eduEntries.map((entry, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a6a82' }}>Entry {i + 1}</span>
                                    <button onClick={() => deleteEduEntry(i)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>✕ Remove</button>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Degree / Qualification</label>
                                    <input value={entry.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="e.g. BSc in Computer Science" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Institution</label>
                                    <input value={entry.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="e.g. University of Colombo" style={inputStyle} />
                                </div>
                                <DatePair startDate={entry.startDate} endDate={entry.endDate} onStartChange={v => updateEdu(i, 'startDate', v)} onEndChange={v => updateEdu(i, 'endDate', v)} />
                            </div>
                        ))}
                        <AddMoreBtn onClick={() => setEduEntries(prev => [...prev, { id: null, degree: '', institution: '', startDate: '', endDate: '' }])} />
                        <EditButtons onCancel={() => { setEditingEdu(false); setEduError(''); }} onSave={saveEducation} />
                    </div>
                ) : (
                    <SectionCard title="Education" onEdit={() => setEditingEdu(true)}>
                        {eduEntries.length === 0 ? (
                            <p className="text-sm text-gray-400">No education entries yet. Click edit to add.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {eduEntries.map((entry, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{entry.degree || '—'}</p>
                                                    <p className="text-xs text-blue-500 font-medium mt-0.5">{entry.institution || '—'}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Work Experience" />
                        {expError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{expError}</div>
                        )}
                        {expEntries.map((entry, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a6a82' }}>Entry {i + 1}</span>
                                    <button onClick={() => deleteExpEntry(i)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>✕ Remove</button>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Company</label>
                                    <input value={entry.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Company name" style={inputStyle} />
                                </div>
                                <DatePair startDate={entry.startDate} endDate={entry.endDate} onStartChange={v => updateExp(i, 'startDate', v)} onEndChange={v => updateExp(i, 'endDate', v)} />
                                <div style={{ marginBottom: '12px', marginTop: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Position / Job Title</label>
                                    <input value={entry.jobTitle} onChange={e => updateExp(i, 'jobTitle', e.target.value)} placeholder="Position" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Description</label>
                                    <input value={entry.description} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Roles and responsibilities" style={inputStyle} />
                                </div>
                            </div>
                        ))}
                        <AddMoreBtn onClick={() => setExpEntries(prev => [...prev, { id: null, company: '', startDate: '', endDate: '', jobTitle: '', description: '' }])} />
                        <EditButtons onCancel={() => { setEditingExp(false); setExpError(''); }} onSave={saveExperience} />
                    </div>
                ) : (
                    <SectionCard title="Work Experience / Internship" onEdit={() => setEditingExp(true)}>
                        {expEntries.length === 0 ? (
                            <p className="text-sm text-gray-400">No experience added yet. Click edit to add.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {expEntries.map((entry, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{entry.jobTitle || 'No Title'}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0a2 2 0 002-2m-2 2a2 2 0 01-2-2m-10 2a2 2 0 002-2m-2 2a2 2 0 01-2-2" /></svg>
                                                        <p className="text-xs text-blue-500 font-medium">{entry.company || 'Unknown Company'}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{entry.description || ''}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
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

                {/* ── Skills & Technologies ───────────────────────────── */}
                {editingSkills ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Skills and Technology" />
                        {skillError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{skillError}</div>
                        )}
                        {skillEntries.map((skill, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <input
                                    value={skill}
                                    onChange={e => updateSkill(i, e.target.value)}
                                    placeholder="Skill name"
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button onClick={() => removeSkill(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '20px', padding: '0 8px' }}>×</button>
                            </div>
                        ))}
                        <AddMoreBtn onClick={addSkill} />
                        <EditButtons onCancel={() => { setEditingSkills(false); setSkillError(''); }} onSave={saveSkills} />
                    </div>
                ) : (
                    <SectionCard title="Skills & Technologies" onEdit={() => setEditingSkills(true)}>
                        {skillEntries.filter(s => s.trim()).length === 0 ? (
                            <p className="text-sm text-gray-400">No skills added yet. Click edit to add.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {skillEntries.filter(s => s.trim()).map((s, i) => <SkillBadge key={i} label={s} color="bg-blue-400" />)}
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── Resume / CV ───────────────────────────────────────── */}
                {editingCV ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Upload CV" />
                        {cvError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{cvError}</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '56px', height: '56px', background: '#e8f4fd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="28" height="28" fill="none" stroke="#1a6a82" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Accepted: PDF, DOC, DOCX — Max 5 MB</p>
                                <label style={{ display: 'inline-block', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', background: '#fff' }}>
                                    Choose File
                                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => { setCvFile(e.target.files[0]); setCvError(''); }} />
                                </label>
                                <span style={{ marginLeft: '10px', fontSize: '13px', color: '#9ca3af' }}>
                                    {cvFile ? cvFile.name : 'No File Chosen'}
                                </span>
                            </div>
                        </div>
                        <EditButtons onCancel={() => { setEditingCV(false); setCvFile(null); setCvError(''); }} onSave={uploadCV} />
                    </div>
                ) : (
                    <SectionCard title="Resume / CV" onEdit={() => setEditingCV(true)}>
                        {resumes.length === 0 ? (
                            <p className="text-sm text-gray-400">No CV uploaded yet. Click edit to upload.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {resumes.map(r => (
                                    <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{r.fileName}</p>
                                                <p className="text-xs text-gray-400">{r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Download</a>
                                            <button onClick={() => deleteResume(r.id)} className="flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── Job Preferences ───────────────────────────────────────── */}
                {editingJobPref ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Job preference" />
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#222', marginBottom: '10px' }}>Job Roles</p>
                        {jobRoles.map((role, i) => (
                            <select
                                key={i}
                                value={role}
                                onChange={e => updateJobRole(i, e.target.value)}
                                style={{ ...inputStyle, marginBottom: '10px' }}
                            >
                                {allRoles.map(r => <option key={r}>{r}</option>)}
                            </select>
                        ))}
                        <AddMoreBtn onClick={addJobRole} />
                        <div style={{ marginTop: '18px' }}>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#222', marginBottom: '10px' }}>Work Mode</p>
                            <select value={workMode} onChange={e => setWorkMode(e.target.value)} style={inputStyle}>
                                {allModes.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <EditButtons onCancel={() => setEditingJobPref(false)} onSave={() => setEditingJobPref(false)} />
                    </div>
                ) : (
                    <SectionCard title="Job Preferences" onEdit={() => setEditingJobPref(true)}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Preferred Roles</p>
                                <div className="flex flex-wrap gap-2">
                                    {jobRoles.map(r => <span key={r} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">{r}</span>)}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Work Mode</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">{workMode}</span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}

            </main>
        </div>
    );
};

export default Profile;
