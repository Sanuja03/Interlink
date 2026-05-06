import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  .apply-page {
    min-height: 100vh;
    display: flex;
    background: #f4f8fb;
    font-family: 'Outfit', system-ui, sans-serif;
  }

  .apply-main {
    flex: 1;
    padding: 32px 40px;
    overflow-y: auto;
  }

  /* ── Back link ── */
  .apply-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #1a6a82;
    font-size: 0.88rem;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 24px;
    transition: opacity 0.2s;
  }
  .apply-back:hover { opacity: 0.75; }

  /* ── Job hero banner ── */
  .apply-hero {
    background: linear-gradient(135deg, #1a6a82 0%, #0C3E56 100%);
    border-radius: 20px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
    box-shadow: 0 8px 32px rgba(12,62,86,0.18);
  }
  .apply-hero__logo {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .apply-hero__logo img { width: 44px; height: 44px; object-fit: contain; }
  .apply-hero__info { flex: 1; }
  .apply-hero__title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 4px;
  }
  .apply-hero__company { font-size: 1rem; color: #b0d8e8; font-weight: 500; margin: 0 0 8px; }
  .apply-hero__tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .apply-hero__tag {
    background: rgba(255,255,255,0.15);
    border-radius: 999px;
    padding: 3px 12px;
    font-size: 0.78rem;
    color: #e0f2f7;
    font-weight: 600;
  }
  .apply-hero__badge {
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.25);
    border-radius: 12px;
    padding: 12px 20px;
    text-align: center;
    flex-shrink: 0;
  }
  .apply-hero__badge-label { font-size: 0.72rem; color: rgba(255,255,255,0.7); font-weight: 500; display: block; }
  .apply-hero__badge-val { font-size: 1.1rem; font-weight: 800; color: #fff; display: block; margin-top: 2px; }

  /* ── Form layout ── */
  .apply-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }

  .apply-card {
    background: #fff;
    border-radius: 18px;
    padding: 28px 32px;
    box-shadow: 0 2px 16px rgba(12,62,86,0.07);
    margin-bottom: 20px;
  }
  .apply-card:last-child { margin-bottom: 0; }

  .apply-card__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0C3E56;
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .apply-card__title-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(26,106,130,0.12), rgba(12,62,86,0.08));
    display: grid;
    place-items: center;
    color: #1a6a82;
    flex-shrink: 0;
  }

  /* ── Field ── */
  .apply-frow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .apply-frow--full { grid-template-columns: 1fr; }
  .apply-field { display: flex; flex-direction: column; gap: 6px; }
  .apply-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #4a6b7c;
    letter-spacing: 0.02em;
  }
  .apply-label span { color: #e53e3e; }

  .apply-input,
  .apply-select,
  .apply-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #dde6ee;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.92rem;
    color: #1a2e3b;
    background: #f9fbfd;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    box-sizing: border-box;
  }
  .apply-input:focus,
  .apply-select:focus,
  .apply-textarea:focus {
    border-color: #1a6a82;
    box-shadow: 0 0 0 3px rgba(26,106,130,0.10);
    background: #fff;
  }
  .apply-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

  /* ── Upload zone ── */
  .apply-upload {
    display: block;
    width: 100%;
    box-sizing: border-box;
    border: 2px dashed #c5d9e8;
    border-radius: 14px;
    padding: 32px 28px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: #f4f8fb;
  }
  .apply-upload:hover { border-color: #1a6a82; background: #edf4f8; }
  .apply-upload.has-file { border-color: #1a6a82; background: #edf4f8; }
  .apply-upload__icon { color: #1a6a82; margin-bottom: 10px; }
  .apply-upload__label { font-size: 0.88rem; font-weight: 600; color: #0C3E56; margin-bottom: 4px; }
  .apply-upload__sub { font-size: 0.78rem; color: #7a9aaa; }
  .apply-upload__file-name { font-size: 0.82rem; font-weight: 600; color: #1a6a82; margin-top: 8px; }
  .apply-upload input[type="file"] {
    display: none !important;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    width: 0;
    height: 0;
  }

  /* ── Progress steps ── */
  .apply-steps {
    background: #fff;
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 2px 16px rgba(12,62,86,0.07);
    margin-bottom: 20px;
  }
  .apply-steps__title { font-size: 0.9rem; font-weight: 700; color: #0C3E56; margin: 0 0 16px; }
  .apply-step-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f4f8;
  }
  .apply-step-item:last-child { border-bottom: none; }
  .apply-step-num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .apply-step-text { font-size: 0.82rem; color: #4a6b7c; line-height: 1.5; }
  .apply-step-text strong { color: #0C3E56; display: block; margin-bottom: 1px; }

  /* ── Tips card ── */
  .apply-tips {
    background: linear-gradient(135deg, #0C3E56, #1a6a82);
    border-radius: 18px;
    padding: 24px;
    color: #fff;
    margin-bottom: 20px;
  }
  .apply-tips__title { font-size: 0.9rem; font-weight: 700; margin: 0 0 12px; }
  .apply-tips__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.85);
    line-height: 1.5;
  }
  .apply-tips__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6dd5f0;
    flex-shrink: 0;
    margin-top: 6px;
  }

  /* ── Submit button ── */
  .apply-submit-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  .apply-btn-cancel {
    padding: 12px 28px;
    border-radius: 50px;
    border: 1.5px solid #c5d9e8;
    background: #fff;
    color: #4a6b7c;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 0.92rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .apply-btn-cancel:hover { background: #f4f8fb; }
  .apply-btn-submit {
    padding: 12px 36px;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(12,62,86,0.25);
    transition: opacity 0.2s, transform 0.2s;
    outline: none;
  }
  .apply-btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }

  /* ── Success overlay ── */
  .apply-success {
    position: fixed;
    inset: 0;
    background: rgba(12,62,86,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    backdrop-filter: blur(4px);
  }
  .apply-success__box {
    background: #fff;
    border-radius: 24px;
    padding: 48px 52px;
    text-align: center;
    max-width: 420px;
    box-shadow: 0 24px 64px rgba(12,62,86,0.2);
    animation: popIn 0.35s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  .apply-success__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    display: grid;
    place-items: center;
    margin: 0 auto 20px;
    color: #fff;
  }
  .apply-success__title { font-size: 1.5rem; font-weight: 800; color: #0C3E56; margin: 0 0 10px; }
  .apply-success__sub { font-size: 0.95rem; color: #5a7a8a; line-height: 1.6; margin: 0 0 28px; }
  .apply-success__btn {
    padding: 12px 36px;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #1a6a82, #0C3E56);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    outline: none;
  }

  @media (max-width: 900px) {
    .apply-grid { grid-template-columns: 1fr; }
    .apply-main { padding: 20px 16px; }
    .apply-frow { grid-template-columns: 1fr; }
    .apply-hero { flex-direction: column; align-items: flex-start; }
  }
`;

const IconPerson = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconFile = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconUpload = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconCheck = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

import api from '../../lib/api';

const JobApply = () => {
  const formatDeadline = (value) => {
      if (!value) return 'No date';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return 'No date';
      return parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
      });
  };

  const formatEnum = (val) => {
      if (!val) return '';
      return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const formatMode = (mode) => {
      if (!mode) return '';
      return mode.charAt(0) + mode.slice(1).toLowerCase();
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
      api.get(`/jobs/${id}`)
          .then(res => setJob(res.data))
          .catch(err => {
              const text = err.response?.data || err.message;
              console.error("Error fetching job details:", text);
          });

      api.get(`/candidate/applications/prefill`)
          .then(res => {
              const data = res.data;
              setForm(p => ({
                  ...p,
                  firstName: data.firstName || '',
                  lastName: data.lastName || '',
                  email: data.email || '',
                  phone: data.phone || '',
                  address: data.location || '',
                  linkedin: data.linkedinUrl || '',
                  portfolio: data.portfolioUrl || '',
                  github: data.githubUrl || '',
                  yearsExp: data.yearsOfExperience ? String(data.yearsOfExperience) : '',
                  currentRole: data.currentRole || '',
                  currentCompany: data.currentCompany || '',
                  salary: data.expectedSalary ? String(data.expectedSalary) : ''
              }));
          })
          .catch(err => {
              console.error("Error fetching prefill data:", err);
          });
  }, [id]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '',
    linkedin: '', portfolio: '', github: '',
    yearsExp: '', currentRole: '', currentCompany: '',
    coverLetter: '',
    availability: '', salary: '', hearAbout: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = true;
    if (!form.lastName.trim()) e.lastName = true;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = true;
    if (!form.phone.trim()) e.phone = true;
    if (!resumeFile) e.resume = true;
    if (!form.coverLetter.trim()) e.coverLetter = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
        const applicationRequest = {
            jobId: id,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            linkedinUrl: form.linkedin,
            portfolioUrl: form.portfolio,
            coverLetter: form.coverLetter,
            githubUrl: form.github,
            yearsOfExperience: form.yearsExp && !isNaN(parseInt(form.yearsExp, 10)) ? parseInt(form.yearsExp, 10) : null,
            currentRole: form.currentRole,
            currentCompany: form.currentCompany,
            expectedSalary: form.salary ? parseFloat(form.salary.replace(/,/g, '')) : null,
            availableStartDate: form.availability || null,
            source: form.hearAbout
        };

        const formData = new FormData();
        formData.append('application', new Blob([JSON.stringify(applicationRequest)], { type: 'application/json' }));
        if (resumeFile) {
            formData.append('resume', resumeFile);
        }

        await api.post(`/candidate/applications`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        setSubmitted(true);
    } catch (err) {
        console.error("Error submitting application:", err);
        alert("Failed to submit application: " + (err.response?.data?.message || err.message));
    }
  };

  if (!job) return (
    <div className="apply-page">
      <style>{styles}</style>
      <Sidebar />
      <main className="apply-main">
        <button className="apply-back" onClick={() => navigate('/candidate/jobposts')}>
          ← Back to Jobs
        </button>
        <p style={{ color: '#5a7a8a', marginTop: 40, textAlign: 'center' }}>Job not found.</p>
      </main>
    </div>
  );

  return (
    <div className="apply-page">
      <style>{styles}</style>
      <Sidebar />

      <main className="apply-main">
        {/* Back */}
        <button className="apply-back" onClick={() => navigate('/candidate/jobposts')}>
          ← Back to Jobs
        </button>

        {/* Job Hero */}
        <div className="apply-hero">
          <div className="apply-hero__logo">
            <img src={job.logo} alt={job.company} />
          </div>
          <div className="apply-hero__info">
            <h1 className="apply-hero__title">{job.title}</h1>
            <p className="apply-hero__company">{job.company} · {job.location}</p>
            <div className="apply-hero__tags">
              <span className="apply-hero__tag">{formatMode(job.employmentType)}</span>
              <span className="apply-hero__tag">{formatEnum(job.experienceLevel)}</span>
              <span className="apply-hero__tag">{job.category}</span>
            </div>
          </div>
          <div className="apply-hero__badge">
            <span className="apply-hero__badge-label">Deadline</span>
            <span className="apply-hero__badge-val">{formatDeadline(job.deadline)}</span>
          </div>
        </div>

        {/* Form + Sidebar */}
        <form onSubmit={handleSubmit}>
          <div className="apply-grid">

            {/* LEFT: Main form */}
            <div>

              {/* Personal Info */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconPerson /></span>
                  Personal Information
                </h2>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">First Name <span>*</span></label>
                    <input className="apply-input" style={errors.firstName ? { borderColor: '#e53e3e' } : {}} value={form.firstName} onChange={set('firstName')} placeholder="Kamal" />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">Last Name <span>*</span></label>
                    <input className="apply-input" style={errors.lastName ? { borderColor: '#e53e3e' } : {}} value={form.lastName} onChange={set('lastName')} placeholder="Perera" />
                  </div>
                </div>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">Email Address <span>*</span></label>
                    <input className="apply-input" type="email" style={errors.email ? { borderColor: '#e53e3e' } : {}} value={form.email} onChange={set('email')} placeholder="kamal@email.com" />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">Phone Number <span>*</span></label>
                    <input className="apply-input" type="tel" style={errors.phone ? { borderColor: '#e53e3e' } : {}} value={form.phone} onChange={set('phone')} placeholder="+94 77 123 4567" />
                  </div>
                </div>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">Address</label>
                    <input className="apply-input" value={form.address} onChange={set('address')} placeholder="123, Main Street" />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">City</label>
                    <input className="apply-input" value={form.city} onChange={set('city')} placeholder="Colombo" />
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconFile /></span>
                  Resume / CV
                </h2>
                <label
                  className={`apply-upload ${resumeFile ? 'has-file' : ''}`}
                  style={errors.resume ? { borderColor: '#e53e3e' } : {}}
                >
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => { setResumeFile(e.target.files[0]); setErrors(p => ({ ...p, resume: false })); }} />
                  <div className="apply-upload__icon"><IconUpload /></div>
                  {resumeFile ? (
                    <>
                      <div className="apply-upload__label">File selected</div>
                      <div className="apply-upload__file-name">📄 {resumeFile.name}</div>
                    </>
                  ) : (
                    <>
                      <div className="apply-upload__label">Drag & drop your resume or click to browse</div>
                      <div className="apply-upload__sub">Accepted: PDF, DOC, DOCX · Max 5MB</div>
                    </>
                  )}
                </label>
              </div>

              {/* Cover Letter */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconFile /></span>
                  Cover Letter
                </h2>
                <div className="apply-field">
                  <label className="apply-label">Why are you a great fit for this role? <span>*</span></label>
                  <textarea
                    className="apply-textarea"
                    style={errors.coverLetter ? { borderColor: '#e53e3e' } : {}}
                    value={form.coverLetter}
                    onChange={set('coverLetter')}
                    placeholder="Tell the employer why you're interested in this position and what makes you stand out..."
                  />
                </div>
              </div>

              {/* Links */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconLink /></span>
                  Online Profiles
                </h2>
                <div className="apply-frow apply-frow--full">
                  <div className="apply-field">
                    <label className="apply-label">LinkedIn Profile URL</label>
                    <input className="apply-input" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                </div>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">Portfolio / Website</label>
                    <input className="apply-input" value={form.portfolio} onChange={set('portfolio')} placeholder="https://yourportfolio.com" />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">GitHub</label>
                    <input className="apply-input" value={form.github} onChange={set('github')} placeholder="https://github.com/yourusername" />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconBriefcase /></span>
                  Work Experience
                </h2>
                <div className="apply-frow apply-frow--full">
                  <div className="apply-field">
                    <label className="apply-label">Years of Experience</label>
                    <select className="apply-select" value={form.yearsExp} onChange={set('yearsExp')}>
                      <option value="">Select...</option>
                      <option>Less than 1 year</option>
                      <option>1 – 2 years</option>
                      <option>3 – 5 years</option>
                      <option>5 – 8 years</option>
                      <option>8+ years</option>
                    </select>
                  </div>
                </div>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">Current / Most Recent Role</label>
                    <input className="apply-input" value={form.currentRole} onChange={set('currentRole')} placeholder="e.g. Junior Developer" />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">Current / Most Recent Company</label>
                    <input className="apply-input" value={form.currentCompany} onChange={set('currentCompany')} placeholder="e.g. Tech Corp" />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="apply-card">
                <h2 className="apply-card__title">
                  <span className="apply-card__title-icon"><IconBriefcase /></span>
                  Preferences
                </h2>
                <div className="apply-frow">
                  <div className="apply-field">
                    <label className="apply-label">Available Start Date</label>
                    <input className="apply-input" type="date" value={form.availability} onChange={set('availability')} />
                  </div>
                  <div className="apply-field">
                    <label className="apply-label">Expected Salary (LKR / month)</label>
                    <input className="apply-input" value={form.salary} onChange={set('salary')} placeholder="e.g. 150,000" />
                  </div>
                </div>
                <div className="apply-frow apply-frow--full">
                  <div className="apply-field">
                    <label className="apply-label">How did you hear about this role?</label>
                    <select className="apply-select" value={form.hearAbout} onChange={set('hearAbout')}>
                      <option value="">Select...</option>
                      <option>Interlink Platform</option>
                      <option>LinkedIn</option>
                      <option>Company Website</option>
                      <option>Referral</option>
                      <option>Job Fair</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="apply-submit-row">
                <button type="button" className="apply-btn-cancel" onClick={() => navigate('/candidate/jobposts')}>
                  Cancel
                </button>
                <button type="submit" className="apply-btn-submit">
                  Submit Application <IconArrow />
                </button>
              </div>

            </div>

            {/* RIGHT: Steps + Tips */}
            <div>
              <div className="apply-steps">
                <p className="apply-steps__title">📋 Application Steps</p>
                {[
                  { title: 'Fill Personal Info', desc: 'Add your name, email and contact details.' },
                  { title: 'Upload Resume', desc: 'Attach your latest CV in PDF or DOC format.' },
                  { title: 'Write Cover Letter', desc: 'Explain why you\'re the right fit.' },
                  { title: 'Add Profile Links', desc: 'Share your LinkedIn, portfolio or GitHub.' },
                  { title: 'Set Preferences', desc: 'Add your availability and salary expectations.' },
                  { title: 'Submit', desc: 'Review and submit your application.' },
                ].map((s, i) => (
                  <div className="apply-step-item" key={i}>
                    <div className="apply-step-num">{i + 1}</div>
                    <div className="apply-step-text">
                      <strong>{s.title}</strong>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="apply-tips">
                <p className="apply-tips__title">💡 Tips for a Strong Application</p>
                {[
                  'Tailor your cover letter to this specific role.',
                  'Keep your resume to 1–2 pages and highlight relevant skills.',
                  'Include a portfolio link to showcase your work.',
                  'Double-check your contact details before submitting.',
                  'Apply early — roles close once filled.',
                ].map((tip, i) => (
                  <div className="apply-tips__item" key={i}>
                    <span className="apply-tips__dot" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </form>
      </main>

      {/* Success Modal */}
      {submitted && (
        <div className="apply-success">
          <div className="apply-success__box">
            <div className="apply-success__icon"><IconCheck /></div>
            <h2 className="apply-success__title">Application Submitted!</h2>
            <p className="apply-success__sub">
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received.
              We'll notify you by email once the employer reviews it.
            </p>
            <button className="apply-success__btn" onClick={() => navigate('/candidate/jobposts')}>
              Back to Jobs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApply;
