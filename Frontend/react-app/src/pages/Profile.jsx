import React, { useState } from 'react';
import Sidebar from '../components/CandidateDashboard/Sidebar';

// ── Shared helpers ─────────────────────────────────────────────────────────────
const inputStyle = {
    width: '100%', border: '1px solid #d1d5db', borderRadius: '8px',
    padding: '9px 14px', fontSize: '14px', color: '#111',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
};

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div style={{ marginBottom: '12px' }}>
        {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>{label}</label>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder || label} style={inputStyle} />
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
    // Personal Info
    const [editingPersonal, setEditingPersonal] = useState(false);
    const [personal, setPersonal] = useState({ name: 'kamal Perera', location: 'Colombo, Sri Lanka', email: 'kamal.perera@mail.com', mobile: '+94 77 456 9823', dob: '', availability: 'full time' });
    const [personalDraft, setPersonalDraft] = useState({ ...personal });
    const startEditPersonal = () => { setPersonalDraft({ ...personal }); setEditingPersonal(true); };
    const savePersonal = () => { setPersonal({ ...personalDraft }); setEditingPersonal(false); };

    // Education
    const [editingEdu, setEditingEdu] = useState(false);
    const [eduEntries, setEduEntries] = useState([
        { school: '', startDate: '2020-01-18', endDate: '2026-01-18' },
        { school: '', startDate: '2020-01-18', endDate: '2026-01-18' },
    ]);
    const updateEdu = (i, field, val) => { const u = [...eduEntries]; u[i][field] = val; setEduEntries(u); };

    // Experience
    const [editingExp, setEditingExp] = useState(false);
    const [expEntries, setExpEntries] = useState([
        { company: '', startDate: '2020-01-18', endDate: '2026-01-18', position: '', others: '' },
    ]);
    const updateExp = (i, field, val) => { const u = [...expEntries]; u[i][field] = val; setExpEntries(u); };

    // Skills
    const [editingSkills, setEditingSkills] = useState(false);
    const [skillEntries, setSkillEntries] = useState(['Java', 'Python', 'Figma', 'HTML CSS']);
    const updateSkill = (i, val) => { const u = [...skillEntries]; u[i] = val; setSkillEntries(u); };
    const addSkill = () => setSkillEntries(prev => [...prev, '']);

    // CV
    const [editingCV, setEditingCV] = useState(false);
    const [cvFile, setCvFile] = useState(null);

    // Job Preferences
    const [editingJobPref, setEditingJobPref] = useState(false);
    const [jobRoles, setJobRoles] = useState(['Software Engineer', 'QA Engineer', 'Frontend Developer']);
    const updateJobRole = (i, val) => { const u = [...jobRoles]; u[i] = val; setJobRoles(u); };
    const addJobRole = () => setJobRoles(prev => [...prev, 'Software Engineer']);
    const [workMode, setWorkMode] = useState('Online');

    const allRoles = ['Software Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'UI/UX Designer'];
    const allModes = ['Online', 'Hybrid', 'Onsite', 'Remote'];

    const skills = [
        { label: 'React.js', color: 'bg-blue-400' }, { label: 'JavaScript', color: 'bg-yellow-400' },
        { label: 'HTML & CSS', color: 'bg-green-400' }, { label: 'SQL', color: 'bg-gray-400' },
        { label: 'Figma', color: 'bg-pink-400' },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50" style={{ gap: '2.5rem' }}>
            <Sidebar />
            <main className="flex-1 w-full px-6 py-6 overflow-y-auto">

                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4" style={{ border: '2px solid #1a6a82' }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden ring-2 ring-blue-100">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">{personal.name}</h1>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 14H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2zM4 2a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2H4z" /></svg>
                                    Junior Software Engineer
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {personal.location}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3 border border-gray-100">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="75 25" strokeLinecap="round" />
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

                {/* ── Personal Information ──────────────────────────────────── */}
                {editingPersonal ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Personal Information" />
                        <Field label="Name" value={personalDraft.name} onChange={v => setPersonalDraft(d => ({ ...d, name: v }))} />
                        <Field label="Location" value={personalDraft.location} onChange={v => setPersonalDraft(d => ({ ...d, location: v }))} />
                        <Field label="Email From Address" value={personalDraft.email} onChange={v => setPersonalDraft(d => ({ ...d, email: v }))} type="email" />
                        <Field label="Mobile" value={personalDraft.mobile} onChange={v => setPersonalDraft(d => ({ ...d, mobile: v }))} />
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
                            <InfoField label="Phone Number" value={personal.mobile} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
                            <InfoField label="Location" value={personal.location} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                            <InfoField label="Availability" value={personal.availability} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                            <InfoField label="Date of Birth" value={personal.dob || '—'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                        </div>
                    </SectionCard>
                )}

                {/* ── Education ─────────────────────────────────────────────── */}
                {editingEdu ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Education details" />
                        {eduEntries.map((entry, i) => (
                            <div key={i}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>School/University</label>
                                    <input value={entry.school} onChange={e => updateEdu(i, 'school', e.target.value)} placeholder="School / university" style={inputStyle} />
                                </div>
                                <DatePair startDate={entry.startDate} endDate={entry.endDate} onStartChange={v => updateEdu(i, 'startDate', v)} onEndChange={v => updateEdu(i, 'endDate', v)} />
                            </div>
                        ))}
                        <AddMoreBtn onClick={() => setEduEntries(prev => [...prev, { school: '', startDate: '', endDate: '' }])} />
                        <EditButtons onCancel={() => setEditingEdu(false)} onSave={() => setEditingEdu(false)} />
                    </div>
                ) : (
                    <SectionCard title="Education" onEdit={() => setEditingEdu(true)}>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5" /></svg>
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
                )}

                {/* ── Work Experience ───────────────────────────────────────── */}
                {editingExp ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Work Experiance" />
                        {expEntries.map((entry, i) => (
                            <div key={i}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Company</label>
                                    <input value={entry.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="company" style={inputStyle} />
                                </div>
                                <DatePair startDate={entry.startDate} endDate={entry.endDate} onStartChange={v => updateExp(i, 'startDate', v)} onEndChange={v => updateExp(i, 'endDate', v)} />
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Position</label>
                                    <input value={entry.position} onChange={e => updateExp(i, 'position', e.target.value)} placeholder="Position" style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Others</label>
                                    <input value={entry.others} onChange={e => updateExp(i, 'others', e.target.value)} placeholder="Other" style={inputStyle} />
                                </div>
                            </div>
                        ))}
                        <AddMoreBtn onClick={() => setExpEntries(prev => [...prev, { company: '', startDate: '', endDate: '', position: '', others: '' }])} />
                        <EditButtons onCancel={() => setEditingExp(false)} onSave={() => setEditingExp(false)} />
                    </div>
                ) : (
                    <SectionCard title="Work Experience / Internship" onEdit={() => setEditingExp(true)}>
                        <div className="flex items-start gap-3">
                            <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Software Engineering Intern</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0a2 2 0 002-2m-2 2a2 2 0 01-2-2m-10 2a2 2 0 002-2m-2 2a2 2 0 01-2-2" /></svg>
                                            <p className="text-xs text-blue-500 font-medium">NovaTech Solutions</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Assisted in developing web application features and fixing bugs under senior developer supervision.</p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">Jan 2024 – Jun 2024</span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* ── Skills & Technologies ─────────────────────────────────── */}
                {editingSkills ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Skills and Technology" />
                        {skillEntries.map((skill, i) => (
                            <input
                                key={i}
                                value={skill}
                                onChange={e => updateSkill(i, e.target.value)}
                                placeholder="Skill"
                                style={{ ...inputStyle, marginBottom: '10px' }}
                            />
                        ))}
                        <AddMoreBtn onClick={addSkill} />
                        <EditButtons onCancel={() => setEditingSkills(false)} onSave={() => setEditingSkills(false)} />
                    </div>
                ) : (
                    <SectionCard title="Skills & Technologies" onEdit={() => setEditingSkills(true)}>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(s => <SkillBadge key={s.label} label={s.label} color={s.color} />)}
                        </div>
                    </SectionCard>
                )}

                {/* ── Resume / CV ───────────────────────────────────────────── */}
                {editingCV ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                        <CardTitle label="Add CV" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '56px', height: '56px', background: '#e8f4fd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="28" height="28" fill="none" stroke="#1a6a82" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Please upload square image, size less than 100KB</p>
                                <label style={{ display: 'inline-block', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', background: '#fff' }}>
                                    Choose File
                                    <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setCvFile(e.target.files[0])} />
                                </label>
                                <span style={{ marginLeft: '10px', fontSize: '13px', color: '#9ca3af' }}>
                                    {cvFile ? cvFile.name : 'No File Chosen'}
                                </span>
                            </div>
                        </div>
                        <EditButtons onCancel={() => setEditingCV(false)} onSave={() => setEditingCV(false)} />
                    </div>
                ) : (
                    <SectionCard title="Resume / CV" onEdit={() => { }}>
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{cvFile ? cvFile.name : 'kamal_Perera_CV.pdf'}</p>
                                    <p className="text-xs text-gray-400">Last Updated: 15 June 2025</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingCV(true)} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Replace
                                </button>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download
                                </button>
                            </div>
                        </div>
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
