
import api from "../lib/api";


/*returns the monday of the current week*/
export const getMonday = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Returns array of 7 objects (Mon–Sun) for the current week.
 * Each: { dayName, shortDay, date, dateNum, fullDate (YYYY-MM-DD) }
 */
export const getCurrentWeekDates = (refDate = new Date()) => {
  const monday = getMonday(refDate);

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return {
      dayName: name,
      shortDay: shortDays[i],
      date: new Date(d),
      dateNum: d.getDate(),
      fullDate: `${yyyy}-${mm}-${dd}`,
    };
  });
};

/*returns ISO-like week key, e.g. "2026-W17"*/
export const getWeekKey = (refDate = new Date()) => {
  const monday = getMonday(refDate);
  const year = monday.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const days = Math.floor((monday - jan1) / 86400000);
  const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
};

/*Format Monday date as YYYY-MM-DD for API calls*/
export const getWeekStartDate = (refDate = new Date()) => {
  const monday = getMonday(refDate);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// ── API calls ──

/**
 * Check if this week's availability has been submitted.
 * GET /api/interviewer/availability/status?weekKey=2026-W17
 */
export const checkWeekStatus = async () => {
  try {
    const weekKey = getWeekKey();

    const res = await api.get("/interviewer/availability/status", {
      params: { weekKey },
    });

    return res.data;
  } catch (err) {
    console.error("Failed to check week status:", err);
    return { submitted: false, availableDays: [] };
  }
};

/**
 * Submit availability for the current week.
 * POST /api/interviewer/availability/submit
 */
export const submitAvailability = async (selectedDates) => {
  const weekKey = getWeekKey();
  const weekStartDate = getWeekStartDate();
  const weekDates = getCurrentWeekDates();

  const days = selectedDates.map((fullDate) => {
    const match = weekDates.find((d) => d.fullDate === fullDate);

    return {
      date: fullDate,
      dayName: match ? match.dayName : "",
    };
  });

  const res = await api.post("/interviewer/availability/submit", {
    weekKey,
    weekStartDate,
    days,
  });

  return res.data;
};

/**
 * Get saved availability for this week.
 * GET /api/interviewer/availability/my-week?weekKey=2026-W17
 */
export const getSavedAvailability = async () => {
  try {
    const weekKey = getWeekKey();

    const res = await api.get("/interviewer/availability/my-week", {
      params: { weekKey },
    });

    return res.data.availableDays || [];
  } catch (err) {
    console.error("Failed to get saved availability:", err);
    return [];
  }
};

/**
 * [COMPANY ADMIN] Get all available interviewers for a given week.
 * GET /api/company/availability/week?weekKey=2026-W17
 */
export const getAvailableInterviewersForWeek = async (weekKey) => {
  const key = weekKey || getWeekKey();

  const res = await api.get("/company/availability/week", {
    params: { weekKey: key },
  });

  return res.data;
};

/**
 * [COMPANY ADMIN] Get available interviewers for a specific date.
 * GET /api/company/availability/date?date=2026-04-23
 */
export const getAvailableInterviewersForDate = async (dateStr) => {
  const res = await api.get("/company/availability/date", {
    params: { date: dateStr },
  });

  return res.data;
};
