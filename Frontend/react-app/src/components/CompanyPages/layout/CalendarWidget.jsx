import { useState } from "react";
import "./CalendarWidget.css"; // ✅ IMPORTANT

/* ─── Helpers ───────────────────────── */
const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* ─── Main Component ─────────────────── */
export default function CalendarWidget({
  interviews = {},
  onJoinInterview,
  onGenerateQuestions,
  defaultView = "Month",
}) {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState(defaultView);
  const [selectedDate, setSelectedDate] = useState(null);

  /* ─── Month Grid ─────────────────── */
  const renderMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={"empty" + i} className="cw-cell empty" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${pad(month + 1)}-${pad(d)}`;
      const ivs = interviews[dateKey] || [];
      const hasEvent = ivs.length > 0;

      cells.push(
        <div
          key={d}
          className="cw-cell"
          onClick={() => setSelectedDate(dateKey)}
        >
          <span>{d}</span>
          {hasEvent && <div className="cw-dot" />}
        </div>
      );
    }

    return <div className="cw-grid">{cells}</div>;
  };

  /* ─── Week View ─────────────────── */
  const renderWeek = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());

    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const key = toKey(d);
      const ivs = interviews[key] || [];

      days.push(
        <div key={i} className="cw-week-day">
          <div className="cw-week-date">{d.getDate()}</div>

          {ivs.length > 0 ? (
            ivs.map((iv, idx) => (
              <div
                key={idx}
                className="cw-event"
                onClick={() => setSelectedDate(key)}
              >
                {iv.title}
              </div>
            ))
          ) : (
            <div className="cw-empty">—</div>
          )}
        </div>
      );
    }

    return <div className="cw-week-grid">{days}</div>;
  };

  /* ─── Day View ─────────────────── */
  const renderDay = () => {
    const key = toKey(currentDate);
    const ivs = interviews[key] || [];

    return (
      <div className="cw-day">
        {ivs.length > 0 ? (
          ivs.map((iv, idx) => (
            <div key={idx} className="cw-day-card">
              <h4>{iv.title}</h4>
              <p>{iv.time}</p>
              <p>{iv.mode}</p>
            </div>
          ))
        ) : (
          <p>No interviews for this day</p>
        )}
      </div>
    );
  };

  /* ─── Navigation ─────────────────── */
  const next = () => {
    const d = new Date(currentDate);
    if (view === "Month") d.setMonth(d.getMonth() + 1);
    else if (view === "Week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const prev = () => {
    const d = new Date(currentDate);
    if (view === "Month") d.setMonth(d.getMonth() - 1);
    else if (view === "Week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  /* ─── Selected Detail ───────────────── */
  const selectedInterviews = selectedDate
    ? interviews[selectedDate] || []
    : [];

  return (
    <div className="cw-container">

      {/* Header */}
      <div className="cw-header">
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option>Month</option>
          <option>Week</option>
          <option>Day</option>
        </select>

        <div className="cw-nav">
          <button onClick={prev}>‹</button>
          <button onClick={next}>›</button>
        </div>
      </div>

      {/* Views */}
      {view === "Month" && renderMonth()}
      {view === "Week" && renderWeek()}
      {view === "Day" && renderDay()}

      {/* Detail Panel */}
      {selectedInterviews.length > 0 && (
        <div className="cw-detail">
          {selectedInterviews.map((selectedInterview, idx) => {
            const modeLower = selectedInterview.mode?.toLowerCase() || '';
            const isOnline = modeLower.includes('online');
            const isPhysical = modeLower.includes('physical') || modeLower.includes('onsite');
            return (
              <div key={idx} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: idx < selectedInterviews.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <h3>{selectedInterview.title}</h3>
                <p>⏰ {selectedInterview.time}</p>
                <p>🌐 {selectedInterview.mode}</p>
                {isOnline && selectedInterview.meetingLink && (
                  <p style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
                    <span>🔗</span>
                    <a href={selectedInterview.meetingLink.startsWith('http') ? selectedInterview.meetingLink : `https://${selectedInterview.meetingLink}`} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       style={{ color: '#1a6a82', textDecoration: 'underline', wordBreak: 'break-all' }}>
                      {selectedInterview.meetingLink}
                    </a>
                  </p>
                )}
                {isPhysical && selectedInterview.interviewLocation && (
                  <p style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
                    <span>📍</span>
                    <span>{selectedInterview.interviewLocation}</span>
                  </p>
                )}

                <div className="cw-actions">
                  {selectedInterview.meetingLink && (
                    <button onClick={() => onJoinInterview?.(selectedInterview)}>
                      Join Interview
                    </button>
                  )}

                  <button
                    onClick={() =>
                      onGenerateQuestions?.(selectedInterview)
                    }
                  >
                    Generate Questions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}