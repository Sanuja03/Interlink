// ─── Security & Validation Helpers ──────────────────────────────────────────

/** Regex patterns used to detect malicious input */
const HTML_TAGS_PATTERN   = /<[^>]*>/;
const SCRIPT_PATTERN      = /javascript:|on\w+\s*=/i;
const SQL_PATTERN         = /('|--|;|\b(DROP|SELECT|INSERT|DELETE|UPDATE|ALTER|EXEC)\b)/i;

/**
 * Strips all HTML tags from a string.
 * First line of defence against XSS — backend must also sanitize independently.
 *
 * @param {string} str - raw input value
 * @returns {string} cleaned string
 */
export function sanitizeInput(str) {
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Returns an error message if the string contains potentially
 * malicious patterns (HTML tags, script injection, SQL keywords).
 * Returns null if input is safe.
 *
 * @param {string} value     - the input value to check
 * @param {string} fieldName - human-readable field name for the error message
 * @returns {string|null}
 */
export function detectMaliciousInput(value, fieldName) {
  if (HTML_TAGS_PATTERN.test(value) || SCRIPT_PATTERN.test(value))
    return `${fieldName} contains invalid characters.`;
  if (SQL_PATTERN.test(value))
    return `${fieldName} contains invalid characters.`;
  return null;
}

// ─── Date Formatters ────────────────────────────────────────────────────────

/**
 * Formats a date string to "DD MMM YYYY, HH:MM" format.
 * Used in ticket pages (AdminTicketDetails, TicketCard).
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date string to "DD/MM/YYYY" format (short).
 * Used in subscription tables.
 */
export function fmt(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "—";
}

// ─── Subscription Helpers ────────────────────────────────────────────────────


export function isExpired(row) {
  if (!row.endDate) return false;   //end date exists? if not, can't be expired
  const end = new Date(row.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);   //set both date to midnight to compare only date part
  return end < today;
}

/** Returns true if the plan is the Free tier. */
export function isFree(row) {
  return row.planName === "Free";
}

/** Returns a human-readable status label for a subscription row. */
export function displayStatus(row) {
  return isExpired(row) ? "Expired" : row.status || "Active";
}

/** Tailwind classes for a subscription status badge. */
export function statusStyle(status) {
  switch (status) {
    case "Active":  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Expired": return "bg-red-100 text-red-600 border border-red-200";
    default:        return "bg-gray-100 text-gray-500 border border-gray-200";
  }
}