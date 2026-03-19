import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

/* ─── Sample interview data (keyed YYYY-MM-DD) ──────────────── */
const INTERVIEWS = {
  '2025-09-18': {
    title: 'Software Engineer – CodeWave Solutions',
    time: '10:00 AM – 11:00 AM',
    mode: 'Online Interview',
    job: { title: 'Software Engineer', company: 'CodeWave Solutions', techStack: 'React' },
  },
  '2025-09-24': {
    title: 'UI/UX Designer – PixelCraft Studio',
    time: '02:00 PM – 03:00 PM',
    mode: 'Online Interview',
    job: { title: 'UI/UX Designer', company: 'PixelCraft Studio', techStack: 'Figma' },
  },
  '2026-03-19': {
    title: 'Project Manager – Inova',
    time: '09:00 AM – 09:30 AM',
    mode: 'Online Interview',
    job: { title: 'Project Manager', company: 'Inova', techStack: 'Agile' },
  },
  '2026-03-23': {
    title: 'Software Engineer – Alpha Tech',
    time: '11:00 AM – 12:00 PM',
    mode: 'Online Interview',
    job: { title: 'Software Engineer', company: 'Alpha Tech', techStack: 'Node.js' },
  },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VIEWS = ['Month', 'Week', 'Day'];

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
const calStyles = `
  .cal-root { display:flex; min-height:100vh; background:#f3f7fa; font-family:'Inter','Segoe UI',sans-serif; }
  .cal-main  { flex:1; display:flex; flex-direction:column; min-width:0; overflow-x:hidden; }
  .cal-content { flex:1; padding:28px 32px 40px; display:flex; flex-direction:column; gap:24px; max-width:960px; width:100%; margin:0 auto; }

  .cal-header-row { display:flex; align-items:center; }
  .cal-view-wrap  { position:relative; }
  .cal-view-btn {
    display:flex; align-items:center; gap:6px;
    background:#f0f0f0; border:1.5px solid #d1d5db; border-radius:8px;
    padding:7px 16px; font-size:13px; font-weight:600; color:#374151;
    cursor:pointer; transition:background .18s; user-select:none;
  }
  .cal-view-btn:hover { background:#e5e7eb; }
  .cal-dropdown {
    position:absolute; top:calc(100% + 6px); left:0; z-index:200;
    background:#fff; border:1.5px solid #e5e7eb; border-radius:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.12); min-width:140px; overflow:hidden;
  }
  .cal-dropdown-item { padding:10px 16px; font-size:13px; font-weight:600; color:#374151; cursor:pointer; transition:background .15s; }
  .cal-dropdown-item:hover  { background:#f3f7fa; color:#1a3f5c; }
  .cal-dropdown-item.active { background:#e8f4fd; color:#1a6a82; }

  .cal-selectors { display:flex; gap:8px; align-items:center; }
  .cal-select { border:1px solid #d1d5db; border-radius:6px; padding:5px 10px; font-size:13px; font-weight:600; color:#374151; background:#fff; cursor:pointer; outline:none; }
  .cal-select:focus { border-color:#1a6a82; }
  .cal-nav-btn { background:#fff; border:1.5px solid #d1d5db; border-radius:8px; padding:5px 12px; font-size:18px; cursor:pointer; color:#374151; transition:background .15s; }
  .cal-nav-btn:hover { background:#f3f7fa; }
  .cal-period-label { font-size:14px; font-weight:700; color:#1a3f5c; min-width:160px; text-align:center; }

  .cal-card { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; overflow:hidden; box-shadow:0 2px 10px rgba(26,63,92,.07); }

  /* Month grid */
  .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #e5e7eb; }
  .cal-day-header { text-align:center; padding:10px 0; font-size:12px; font-weight:700; color:#6b7280; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; background:#fafbfc; }
  .cal-day-header:last-child { border-right:none; }
  .cal-cell { min-height:72px; border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:6px 8px; position:relative; cursor:pointer; transition:background .15s; }
  .cal-cell:hover { background:#f0f7fa; }
  .cal-cell:nth-child(7n) { border-right:none; }
  .cal-cell--empty { background:#fafbfc; cursor:default; }
  .cal-cell--empty:hover { background:#fafbfc; }
  .cal-cell--today { background:#e8f4fd; border:1.5px solid #1a6a82 !important; }
  .cal-cell--selected:not(.cal-cell--today) { background:#d0eaf7; }
  .cal-cell__num { font-size:13px; font-weight:600; color:#374151; }
  .cal-cell--other-month .cal-cell__num { color:#c1c8d0; }
  .cal-cell--today .cal-cell__num { color:#1a6a82; font-weight:800; }
  .cal-cell__dot { width:7px; height:7px; border-radius:50%; background:#1a6a82; position:absolute; bottom:8px; left:50%; transform:translateX(-50%); }

  /* Week grid */
  .week-grid { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #e5e7eb; }
  .week-col  { border-right:1px solid #e5e7eb; min-height:240px; display:flex; flex-direction:column; }
  .week-col:last-child { border-right:none; }
  .week-col-header { padding:10px 0 8px; text-align:center; border-bottom:1px solid #e5e7eb; background:#fafbfc; }
  .week-col-header__day  { font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
  .week-col-header__date { font-size:20px; font-weight:700; color:#374151; margin-top:2px; }
  .week-col-header__date.today-circle { background:#1a6a82; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; margin:2px auto 0; }
  .week-col-body { flex:1; padding:8px 6px; display:flex; flex-direction:column; gap:6px; }
  .week-interview-card { background:linear-gradient(135deg,#1a6a82,#1a3f5c); border-radius:8px; padding:8px 10px; cursor:pointer; transition:opacity .15s; }
  .week-interview-card:hover { opacity:.88; }
  .week-interview-card__title { font-size:11px; font-weight:700; color:#fff; line-height:1.3; }
  .week-interview-card__time  { font-size:10px; color:#a8d8ea; margin-top:3px; }
  .week-no-events { font-size:11px; color:#d1d5db; text-align:center; padding-top:12px; }

  /* Day view */
  .day-header { padding:20px 24px 16px; border-bottom:1px solid #e5e7eb; }
  .day-header__title { font-size:18px; font-weight:700; color:#1a1a1a; }
  .day-header__sub   { font-size:13px; color:#6b7280; margin-top:2px; }
  .day-body { padding:20px 24px 24px; display:flex; flex-direction:column; gap:14px; }
  .day-no-events { text-align:center; padding:40px 0; color:#9ca3af; font-size:14px; font-weight:500; }

  /* Detail panel */
  .cal-detail { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; padding:28px 32px; box-shadow:0 2px 10px rgba(26,63,92,.07); }
  .cal-detail__date { font-size:20px; font-weight:700; color:#1a1a1a; text-align:center; margin-bottom:22px; }
  .cal-detail__row  { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:#1a1a1a; margin-bottom:10px; }
  .cal-detail__icon { font-size:18px; flex-shrink:0; }
  .cal-detail__actions { display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
  .cal-btn {
    background:#fff; border:2px solid #d1d5db; border-radius:8px;
    padding:10px 28px; font-size:14px; font-weight:700; color:#1a1a1a;
    cursor:pointer; width:200px; transition:background .18s, border-color .18s, color .18s;
  }
  .cal-btn:hover { background:#f3f7fa; border-color:#1a6a82; color:#1a6a82; }
  .cal-empty-state { text-align:center; color:#9ca3af; font-size:14px; font-weight:500; padding:16px 0; }

  @media(max-width:768px){
    .cal-content { padding:16px 12px 28px; }
    .cal-cell    { min-height:48px; padding:4px; }
    .cal-detail  { padding:20px 16px; }
    .cal-detail__actions { align-items:stretch; }
    .cal-btn     { width:100%; }
    .week-col-header__date { font-size:15px; }
  }
`;

/* ─── Detail panel (shared across all views) ────────────────── */
const DetailPanel = ({ dateKey, navigate }) => {
  if (!dateKey) return null;
  const iv = INTERVIEWS[dateKey];
  const [y, m, d] = dateKey.split('-');
  return (
    <div className="cal-detail">
      <div className="cal-detail__date">{formatLong(y, parseInt(m) - 1, parseInt(d))}</div>
      {iv ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="cal-detail__row"><span className="cal-detail__icon">🌐</span>{iv.title}</div>
            <div className="cal-detail__row"><span className="cal-detail__icon">⏰</span>{iv.time}</div>
            <div className="cal-detail__row"><span className="cal-detail__icon">🌐</span>{iv.mode}</div>
          </div>
          <div className="cal-detail__actions">
            <button className="cal-btn">Join Interview</button>
            <button className="cal-btn" onClick={() => navigate('/ai-questions', { state: { job: iv.job } })}>
              Generate Questions
            </button>
          </div>
        </div>
      ) : (
        <div className="cal-empty-state">No interviews scheduled for this date.</div>
      )}
    </div>
  );
};

/* ─── Month View ─────────────────────────────────────────────── */
const MonthView = ({ viewYear, viewMonth, todayKey, selectedDate, setSelectedDate }) => {
  const cells = buildGrid(viewYear, viewMonth);
  return (
    <div className="cal-card">
      <div className="cal-grid">
        {DAY_HEADERS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((cell, idx) => {
          const key = cell.type === 'current' ? `${viewYear}-${pad(viewMonth + 1)}-${pad(cell.day)}` : null;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          const hasIv = key && INTERVIEWS[key];
          let cls = 'cal-cell';
          if (cell.type !== 'current') cls += ' cal-cell--empty cal-cell--other-month';
          if (isToday) cls += ' cal-cell--today';
          if (isSelected && !isToday) cls += ' cal-cell--selected';
          return (
            <div key={idx} className={cls}
              onClick={() => cell.type === 'current' && setSelectedDate(prev => prev === key ? null : key)}>
              <span className="cal-cell__num">{cell.day}</span>
              {hasIv && <span className="cal-cell__dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Week View ──────────────────────────────────────────────── */
const WeekView = ({ pivotDate, todayKey, setSelectedDate }) => {
  const sun = weekStart(pivotDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun); d.setDate(sun.getDate() + i); return d;
  });
  return (
    <div className="cal-card">
      <div className="week-grid">
        {days.map((d, i) => {
          const key = toKey(d);
          const iv = INTERVIEWS[key];
          const isToday = key === todayKey;
          return (
            <div key={i} className="week-col">
              <div className="week-col-header">
                <div className="week-col-header__day">{DAY_FULL[i].slice(0, 3)}</div>
                <div className={`week-col-header__date${isToday ? ' today-circle' : ''}`}>{d.getDate()}</div>
              </div>
              <div className="week-col-body">
                {iv ? (
                  <div className="week-interview-card" onClick={() => setSelectedDate(key)}>
                    <div className="week-interview-card__title">{iv.title}</div>
                    <div className="week-interview-card__time">⏰ {iv.time}</div>
                  </div>
                ) : (
                  <div className="week-no-events">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Day View ───────────────────────────────────────────────── */
const DayView = ({ pivotDate }) => {
  const iv = INTERVIEWS[toKey(pivotDate)];
  const label = `${DAY_FULL[pivotDate.getDay()]}, ${formatLong(pivotDate.getFullYear(), pivotDate.getMonth(), pivotDate.getDate())}`;
  return (
    <div className="cal-card">
      <div className="day-header">
        <div className="day-header__title">{label}</div>
        <div className="day-header__sub">{iv ? '1 interview scheduled' : 'No interviews today'}</div>
      </div>
      {!iv && <div className="day-body"><div className="day-no-events">🗓️ No interviews scheduled for this day.</div></div>}
    </div>
  );
};

/* ─── Main Calendar Page ─────────────────────────────────────── */
const Calendar = () => {
  const now = new Date();
  const navigate = useNavigate();

  const [calView, setCalView] = useState('Month');
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [pivotDate, setPivotDate] = useState(new Date(now));
  const [selectedDate, setSelectedDate] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const todayKey = toKey(now);

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

  /* Key for the detail panel: Month uses selectedDate, Week uses selectedDate (set by clicking card), Day uses pivotDate always */
  const detailKey = calView === 'Day' ? toKey(pivotDate) : selectedDate;

  return (
    <>
      <style>{calStyles}</style>
      <div className="cal-root">
        <Sidebar />
        <div className="cal-main">
          <div className="cal-content">

            {/* Header */}
            <div className="cal-header-row">
              <div className="cal-view-wrap" ref={dropRef}>
                <button className="cal-view-btn" onClick={() => setDropOpen(o => !o)}>
                  {calView} view
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropOpen && (
                  <div className="cal-dropdown">
                    {VIEWS.map(v => (
                      <div key={v} className={`cal-dropdown-item${calView === v ? ' active' : ''}`} onClick={() => selectView(v)}>
                        {v} View
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="cal-selectors">
              <button className="cal-nav-btn" onClick={prevPeriod}>‹</button>
              {calView === 'Month' ? (
                <>
                  <select className="cal-select" value={viewMonth} onChange={e => { setViewMonth(Number(e.target.value)); setSelectedDate(null); }}>
                    {MONTHS.map((m, i) => <option key={m} value={i}>{m.slice(0, 3)}</option>)}
                  </select>
                  <select className="cal-select" value={viewYear} onChange={e => { setViewYear(Number(e.target.value)); setSelectedDate(null); }}>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </>
              ) : (
                <div className="cal-period-label">{periodLabel}</div>
              )}
              <button className="cal-nav-btn" onClick={nextPeriod}>›</button>
            </div>

            {/* Views */}
            {calView === 'Month' && (
              <MonthView
                viewYear={viewYear} viewMonth={viewMonth}
                todayKey={todayKey} selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            {calView === 'Week' && (
              <WeekView pivotDate={pivotDate} todayKey={todayKey} setSelectedDate={setSelectedDate} />
            )}
            {calView === 'Day' && (
              <DayView pivotDate={pivotDate} />
            )}

            {/* Detail panel — shown below all three views */}
            <DetailPanel dateKey={detailKey} navigate={navigate} />

          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Calendar;
