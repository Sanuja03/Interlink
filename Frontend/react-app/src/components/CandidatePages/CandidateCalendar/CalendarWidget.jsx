/**
 * CalendarWidget — reusable calendar component
 *
 * Props:
 *   interviews          {Object}   - Map of 'YYYY-MM-DD' → [{ title, time, mode, job }, ...]
 *   showJoinButton      {boolean}  - Show "Join Interview" button (default: true)
 *   showGenerateButton  {boolean}  - Show "Generate Questions" button (default: true)
 *   onJoinInterview     {Function} - Called with (interview) when Join is clicked
 *   onGenerateQuestions {Function} - Called with (interview) when Generate is clicked
 *   defaultView         {string}   - 'Month' | 'Week' | 'Day' (default: 'Month')
 */

import { useState, useRef, useEffect } from 'react';

/* ─── Constants ─────────────────────────────────────────────── */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VIEWS = ['Month', 'Week', 'Day'];

/* ─── Helpers ───────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatLong = (y, m, d) => `${d} ${MONTHS[m]} ${y}`;

function buildGrid(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'prev' });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'current' });
    const rem = 7 - (cells.length % 7);
    if (rem < 7) for (let d = 1; d <= rem; d++) cells.push({ day: d, type: 'next' });
    return cells;
}

function weekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

/* ─── Styles ─────────────────────────────────────────────────── */
const widgetStyles = `
  /* ── layout ── */
  .cw-wrap   { display:flex; flex-direction:column; gap:24px; width:100%; }

  /* ── header & dropdown ── */
  .cw-header { display:flex; align-items:center; }
  .cw-view-wrap { position:relative; }
  .cw-view-btn {
    display:flex; align-items:center; gap:6px;
    background:#f0f0f0; border:1.5px solid #d1d5db; border-radius:8px;
    padding:7px 16px; font-size:13px; font-weight:600; color:#374151;
    cursor:pointer; transition:background .18s; user-select:none;
  }
  .cw-view-btn:hover { background:#e5e7eb; }
  .cw-dropdown {
    position:absolute; top:calc(100% + 6px); left:0; z-index:200;
    background:#fff; border:1.5px solid #e5e7eb; border-radius:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.12); min-width:140px; overflow:hidden;
  }
  .cw-dropdown-item { padding:10px 16px; font-size:13px; font-weight:600; color:#374151; cursor:pointer; transition:background .15s; }
  .cw-dropdown-item:hover  { background:#f3f7fa; color:#1a3f5c; }
  .cw-dropdown-item.active { background:#e8f4fd; color:#1a6a82; }

  /* ── navigation bar ── */
  .cw-nav { display:flex; gap:8px; align-items:center; }
  .cw-select { border:1px solid #d1d5db; border-radius:6px; padding:5px 10px; font-size:13px; font-weight:600; color:#374151; background:#fff; cursor:pointer; outline:none; }
  .cw-select:focus { border-color:#1a6a82; }
  .cw-nav-btn { background:#fff; border:1.5px solid #d1d5db; border-radius:8px; padding:5px 12px; font-size:18px; cursor:pointer; color:#374151; transition:background .15s; }
  .cw-nav-btn:hover { background:#f3f7fa; }
  .cw-period-label { font-size:14px; font-weight:700; color:#1a3f5c; min-width:160px; text-align:center; }

  /* ── card ── */
  .cw-card { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; overflow:hidden; box-shadow:0 2px 10px rgba(26,63,92,.07); }

  /* ── Month grid ── */
  .cw-grid { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #e5e7eb; }
  .cw-day-header { text-align:center; padding:10px 0; font-size:12px; font-weight:700; color:#6b7280; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; background:#fafbfc; }
  .cw-day-header:last-child { border-right:none; }
  .cw-cell { min-height:72px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:6px 8px; position:relative; cursor:pointer; transition:background .15s; }
  .cw-cell:hover { background:#f0f7fa; }
  .cw-cell:nth-child(7n) { border-right:none; }
  .cw-cell--empty { background:#fafbfc; cursor:default; }
  .cw-cell--empty:hover { background:#fafbfc; }
  .cw-cell--today  { background:#e8f4fd; border:1.5px solid #1a6a82 !important; }
  .cw-cell--selected:not(.cw-cell--today) { background:#d0eaf7; }
  .cw-cell__num { font-size:13px; font-weight:600; color:#374151; }
  .cw-cell--other-month .cw-cell__num { color:#c1c8d0; }
  .cw-cell--today .cw-cell__num { color:#1a6a82; font-weight:800; }
  .cw-cell__dot { width:7px; height:7px; border-radius:50%; background:#1a6a82; position:absolute; bottom:8px; left:50%; transform:translateX(-50%); }

  /* ── Week grid ── */
  .cw-week-grid { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #e5e7eb; }
  .cw-week-col  { border-right:1px solid #e5e7eb; min-height:240px; display:flex; flex-direction:column; }
  .cw-week-col:last-child { border-right:none; }
  .cw-week-col-header { padding:10px 0 8px; text-align:center; border-bottom:1px solid #e5e7eb; background:#fafbfc; }
  .cw-week-day  { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
  .cw-week-date { font-size:20px; font-weight:700; color:#374151; margin-top:2px; }
  .cw-week-date.today-circle { background:#1a6a82; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; margin:2px auto 0; }
  .cw-week-body { flex:1; padding:8px 6px; display:flex; flex-direction:column; gap:6px; }
  .cw-iv-card { background:linear-gradient(135deg,#1a6a82,#1a3f5c); border-radius:8px; padding:8px 10px; cursor:pointer; transition:opacity .15s; }
  .cw-iv-card:hover { opacity:.88; }
  .cw-iv-card__title { font-size:11px; font-weight:700; color:#fff; line-height:1.3; }
  .cw-iv-card__time  { font-size:10px; color:#a8d8ea; margin-top:3px; }
  .cw-week-empty { font-size:11px; color:#d1d5db; text-align:center; padding-top:12px; }

  /* ── Day card ── */
  .cw-day-hdr { padding:20px 24px 16px; border-bottom:1px solid #e5e7eb; }
  .cw-day-hdr__title { font-size:18px; font-weight:700; color:#1a1a1a; }
  .cw-day-hdr__sub   { font-size:13px; color:#6b7280; margin-top:2px; }
  .cw-day-body  { padding:20px 24px 24px; }
  .cw-day-empty { text-align:center; padding:40px 0; color:#9ca3af; font-size:14px; font-weight:500; }

  /* ── Detail panel ── */
  .cw-detail { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; padding:28px 32px; box-shadow:0 2px 10px rgba(26,63,92,.07); }
  .cw-detail__date    { font-size:20px; font-weight:700; color:#1a1a1a; text-align:center; margin-bottom:22px; }
  .cw-detail__row     { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:#1a1a1a; margin-bottom:10px; }
  .cw-detail__icon    { font-size:18px; flex-shrink:0; }
  .cw-detail__actions { display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
  .cw-btn {
    background: linear-gradient(135deg, #1d6fa5, #1a6a82);
    border: none;
    border-radius: 8px;
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    width: 200px;
    box-shadow: 0 4px 12px rgba(26, 106, 130, 0.2);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  }
  .cw-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(26, 106, 130, 0.3);
  }
  .cw-no-iv   { text-align:center; color:#9ca3af; font-size:14px; font-weight:500; padding:16px 0; }

  @media(max-width:768px){
    .cw-cell  { min-height:48px; padding:4px; }
    .cw-detail { padding:20px 16px; }
    .cw-detail__actions { align-items:stretch; }
    .cw-btn   { width:100%; }
    .cw-week-date { font-size:15px; }
  }
`;

/* ─── Sub-components ─────────────────────────────────────────── */

/** Month grid */
const MonthGrid = ({ viewYear, viewMonth, todayKey, selectedDate, setSelectedDate, interviews }) => {
    const cells = buildGrid(viewYear, viewMonth);
    return (
        <div className="cw-card">
            <div className="cw-grid">
                {DAY_HEADERS.map(d => <div key={d} className="cw-day-header">{d}</div>)}
                {cells.map((cell, idx) => {
                    const key = cell.type === 'current' ? `${viewYear}-${pad(viewMonth + 1)}-${pad(cell.day)}` : null;
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDate;
                    const hasIv = key && interviews[key] && interviews[key].length > 0;
                    let cls = 'cw-cell';
                    if (cell.type !== 'current') cls += ' cw-cell--empty cw-cell--other-month';
                    if (isToday) cls += ' cw-cell--today';
                    if (isSelected && !isToday) cls += ' cw-cell--selected';
                    return (
                        <div key={idx} className={cls}
                            onClick={() => cell.type === 'current' && setSelectedDate(p => p === key ? null : key)}>
                            <span className="cw-cell__num">{cell.day}</span>
                            {hasIv && <span className="cw-cell__dot" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/** Week columns */
const WeekGrid = ({ pivotDate, todayKey, setSelectedDate, interviews }) => {
    const sun = weekStart(pivotDate);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sun); d.setDate(sun.getDate() + i); return d;
    });
    return (
        <div className="cw-card">
            <div className="cw-week-grid">
                {days.map((d, i) => {
                    const key = toKey(d);
                    const ivs = interviews[key] || [];
                    const isToday = key === todayKey;
                    return (
                        <div key={i} className="cw-week-col">
                            <div className="cw-week-col-header">
                                <div className="cw-week-day">{DAY_FULL[i].slice(0, 3)}</div>
                                <div className={`cw-week-date${isToday ? ' today-circle' : ''}`}>{d.getDate()}</div>
                            </div>
                            <div className="cw-week-body">
                                {ivs.length > 0 ? (
                                    ivs.map((iv, idx) => (
                                        <div key={idx} className="cw-iv-card" onClick={() => setSelectedDate(key)}>
                                            <div className="cw-iv-card__title">{iv.title}</div>
                                            <div className="cw-iv-card__time">⏰ {iv.time}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="cw-week-empty">—</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/** Single day header card */
const DayCard = ({ pivotDate, interviews }) => {
    const ivs = interviews[toKey(pivotDate)] || [];
    const label = `${DAY_FULL[pivotDate.getDay()]}, ${formatLong(
        pivotDate.getFullYear(), pivotDate.getMonth(), pivotDate.getDate())}`;
    return (
        <div className="cw-card">
            <div className="cw-day-hdr">
                <div className="cw-day-hdr__title">{label}</div>
                <div className="cw-day-hdr__sub">{ivs.length > 0 ? `${ivs.length} interview${ivs.length > 1 ? 's' : ''} scheduled` : 'No interviews today'}</div>
            </div>
            {ivs.length === 0 && <div className="cw-day-body"><div className="cw-day-empty">🗓️ No interviews scheduled for this day.</div></div>}
        </div>
    );
};

/** Detail panel — shown below the grid in all views */
export const DetailPanel = ({
    dateKey,
    interviews,
    showJoinButton = true,
    showGenerateButton = true,
    onJoinInterview,
    onGenerateQuestions,
}) => {
    if (!dateKey) return null;
    const ivs = interviews[dateKey] || [];
    const [y, m, d] = dateKey.split('-');

    const isPastDay = () => {
        const interviewDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return interviewDate < today;
    };

    return (
        <div className="cw-detail">
            <div className="cw-detail__date">{formatLong(y, parseInt(m) - 1, parseInt(d))}</div>
            {ivs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {ivs.map((iv, idx) => {
                        const modeLower = iv.mode?.toLowerCase() || '';
                        const isOnline = modeLower.includes('online');
                        const isPhysical = modeLower.includes('physical') || modeLower.includes('onsite');
                        return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: idx < ivs.length - 1 ? '20px' : '0', borderBottom: idx < ivs.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                <div>
                                    <div className="cw-detail__row"><span className="cw-detail__icon">💼</span>{iv.title}</div>
                                    <div className="cw-detail__row"><span className="cw-detail__icon">⏰</span>{iv.time}</div>
                                    <div className="cw-detail__row"><span className="cw-detail__icon">👥</span>{iv.mode}</div>
                                    {isOnline && iv.meetingLink && (
                                        <div className="cw-detail__row">
                                            <span className="cw-detail__icon">🔗</span>
                                            <a href={iv.meetingLink.startsWith('http') ? iv.meetingLink : `https://${iv.meetingLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#1a6a82', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                {iv.meetingLink}
                                            </a>
                                        </div>
                                    )}
                                    {isPhysical && iv.interviewLocation && (
                                        <div className="cw-detail__row">
                                            <span className="cw-detail__icon">📍</span>
                                            <span>{iv.interviewLocation}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="cw-detail__actions">
                                    {showJoinButton && iv.meetingLink && (
                                        isPastDay() ? (
                                            <button className="cw-btn" disabled style={{ background: '#9ca3af', boxShadow: 'none', cursor: 'not-allowed', opacity: 0.7 }}>
                                                Expired
                                            </button>
                                        ) : (
                                            <button className="cw-btn" onClick={() => onJoinInterview?.(iv)}>
                                                Join Interview
                                            </button>
                                        )
                                    )}
                                    {showGenerateButton && (
                                        <button className="cw-btn" onClick={() => onGenerateQuestions?.(iv)}>
                                            Generate Questions
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="cw-no-iv">No interviews scheduled for this date.</div>
            )}
        </div>
    );
};

/* ─── CalendarWidget ─────────────────────────────────────────── */
/**
 * Self-contained calendar widget. Accepts interview data and callbacks as props.
 * Renders Month / Week / Day views with a shared detail panel below.
 */
const CalendarWidget = ({
    interviews = {},
    showJoinButton = true,
    showGenerateButton = true,
    onJoinInterview,
    onGenerateQuestions,
    defaultView = 'Month',
}) => {
    const now = new Date();
    const todayKey = toKey(now);

    const [calView, setCalView] = useState(defaultView);
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [pivotDate, setPivotDate] = useState(new Date(now));
    const [selectedDate, setSelectedDate] = useState(null);
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const selectView = (v) => { setCalView(v); setDropOpen(false); setSelectedDate(null); };

    const prevPeriod = () => {
        setSelectedDate(null);
        if (calView === 'Month') {
            if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1);
        } else if (calView === 'Week') {
            setPivotDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
        } else {
            setPivotDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
        }
    };

    const nextPeriod = () => {
        setSelectedDate(null);
        if (calView === 'Month') {
            if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1);
        } else if (calView === 'Week') {
            setPivotDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
        } else {
            setPivotDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
        }
    };

    const periodLabel = (() => {
        if (calView === 'Month') return `${MONTHS[viewMonth]} ${viewYear}`;
        if (calView === 'Week') {
            const sun = weekStart(pivotDate);
            const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
            return `${sun.getDate()} ${MONTHS[sun.getMonth()].slice(0, 3)} – ${sat.getDate()} ${MONTHS[sat.getMonth()].slice(0, 3)} ${sat.getFullYear()}`;
        }
        return `${DAY_FULL[pivotDate.getDay()].slice(0, 3)}, ${pivotDate.getDate()} ${MONTHS[pivotDate.getMonth()]} ${pivotDate.getFullYear()}`;
    })();

    const yearOptions = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

    /* Key driving the detail panel */
    const detailKey = calView === 'Day' ? toKey(pivotDate) : selectedDate;

    return (
        <>
            <style>{widgetStyles}</style>
            <div className="cw-wrap">

                {/* View switcher */}
                <div className="cw-header">
                    <div className="cw-view-wrap" ref={dropRef}>
                        <button className="cw-view-btn" onClick={() => setDropOpen(o => !o)}>
                            {calView} view
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {dropOpen && (
                            <div className="cw-dropdown">
                                {VIEWS.map(v => (
                                    <div key={v} className={`cw-dropdown-item${calView === v ? ' active' : ''}`} onClick={() => selectView(v)}>
                                        {v} View
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="cw-nav">
                    <button className="cw-nav-btn" onClick={prevPeriod}>‹</button>
                    {calView === 'Month' ? (
                        <>
                            <select className="cw-select" value={viewMonth} onChange={e => { setViewMonth(Number(e.target.value)); setSelectedDate(null); }}>
                                {MONTHS.map((m, i) => <option key={m} value={i}>{m.slice(0, 3)}</option>)}
                            </select>
                            <select className="cw-select" value={viewYear} onChange={e => { setViewYear(Number(e.target.value)); setSelectedDate(null); }}>
                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </>
                    ) : (
                        <div className="cw-period-label">{periodLabel}</div>
                    )}
                    <button className="cw-nav-btn" onClick={nextPeriod}>›</button>
                </div>

                {/* Calendar grid */}
                {calView === 'Month' && (
                    <MonthGrid
                        viewYear={viewYear} viewMonth={viewMonth}
                        todayKey={todayKey} selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate} interviews={interviews}
                    />
                )}
                {calView === 'Week' && (
                    <WeekGrid pivotDate={pivotDate} todayKey={todayKey} setSelectedDate={setSelectedDate} interviews={interviews} />
                )}
                {calView === 'Day' && (
                    <DayCard pivotDate={pivotDate} interviews={interviews} />
                )}

                {/* Detail panel */}
                <DetailPanel
                    dateKey={detailKey}
                    interviews={interviews}
                    showJoinButton={showJoinButton}
                    showGenerateButton={showGenerateButton}
                    onJoinInterview={onJoinInterview}
                    onGenerateQuestions={onGenerateQuestions}
                />

            </div>
        </>
    );
};

export default CalendarWidget;
