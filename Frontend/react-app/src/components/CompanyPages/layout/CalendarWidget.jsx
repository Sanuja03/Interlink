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
      const hasEvent = interviews[dateKey];

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
      const iv = interviews[key];

      days.push(
        <div key={i} className="cw-week-day">
          <div className="cw-week-date">{d.getDate()}</div>

          {iv ? (
            <div
              className="cw-event"
              onClick={() => setSelectedDate(key)}
            >
              {iv.title}
            </div>
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
    const iv = interviews[key];

    return (
      <div className="cw-day">
        {iv ? (
          <div className="cw-day-card">
            <h4>{iv.title}</h4>
            <p>{iv.time}</p>
            <p>{iv.mode}</p>
          </div>
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
  const selectedInterview = selectedDate
    ? interviews[selectedDate]
    : null;

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
      {selectedInterview && (
        <div className="cw-detail">
          <h3>{selectedInterview.title}</h3>
          <p>{selectedInterview.time}</p>
          <p>{selectedInterview.mode}</p>

          <div className="cw-actions">
            <button onClick={() => onJoinInterview?.(selectedInterview)}>
              Join Interview
            </button>

            <button
              onClick={() =>
                onGenerateQuestions?.(selectedInterview)
              }
            >
              Generate Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}