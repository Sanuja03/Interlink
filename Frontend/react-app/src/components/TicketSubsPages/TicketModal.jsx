import { useEffect, useState } from "react";
import api from "../../lib/api";
import { sanitizeInput, detectMaliciousInput } from "../../utils/subscriptionUtils";

// Category values must match exactly what the backend stores
const CATEGORIES = [
  { value: "GENERAL",   label: "General"        },
  { value: "LOGIN",     label: "Login Issue"     },
  { value: "PAYMENT",   label: "Payment Issue"   },
  { value: "TECHNICAL", label: "Technical Issue" },
];

const TITLE_MAX       = 100;
const TITLE_MIN       = 5;
const DESC_MAX        = 2000;
const DESC_MIN        = 10;


/**
 * TicketModal
 * Create / Edit ticket dialog with full inline field validation,
 * security sanitization, and character counters.
 *
 * Props:
 *  - ticket    {object|null}  if provided, pre-fills fields for editing
 *  - onClose   {function}     closes the modal
 *  - onSuccess {function}     called after successful create/update
 */
export default function TicketModal({ ticket = null, onClose, onSuccess }) {
  const isEdit = Boolean(ticket?.id);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
const [categoryOpen, setCategoryOpen] = useState(false);

  // Per-field inline errors — empty string means no error
  const [errors, setErrors] = useState({ title: "", description: "", category: "" });

  // Track whether the user has touched a field (so we don't show
  // errors on fields the user hasn't interacted with yet)
  const [touched, setTouched] = useState({ title: false, description: false, category: false });

  // Populate fields when editing
  useEffect(() => {
    if (isEdit) {
      setTitle(ticket.title       || "");
      setDescription(ticket.description || "");
      setCategory(ticket.category    || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
    }
    setErrors({ title: "", description: "", category: "" });
    setTouched({ title: false, description: false, category: false });
  }, [ticket]);

  // ── Validation ──────────────────────────────────────────────────────────

  /**
   * Validates a single field and returns an error string or "".
   * Security checks run before UX checks so malicious input is caught first.
   */
  const validateField = (name, value) => {
    switch (name) {
      case "title": {
        if (!value.trim())                    return "Title is required.";
        const sec = detectMaliciousInput(value, "Title");
        if (sec)                              return sec;
        if (value.trim().length < TITLE_MIN)  return `Title must be at least ${TITLE_MIN} characters.`;
        if (value.trim().length > TITLE_MAX)  return `Title must be ${TITLE_MAX} characters or fewer.`;
        return "";
      }
      case "description": {
        if (!value.trim())                    return "Description is required.";
        const sec = detectMaliciousInput(value, "Description");
        if (sec)                              return sec;
        if (value.trim().length < DESC_MIN)   return `Description must be at least ${DESC_MIN} characters.`;
        if (value.trim().length > DESC_MAX)   return `Description must be ${DESC_MAX} characters or fewer.`;
        return "";
      }
      case "category": {
        if (!value) return "Please select a category.";
        return "";
      }
      default: return "";
    }
  };

  /** Validates all fields at once. Returns true if all pass. */
  const validateAll = () => {
    const newErrors = {
      title:       validateField("title",       title),
      description: validateField("description", description),
      category:    validateField("category",    category),
    };
    setErrors(newErrors);
    // Mark all fields as touched so errors show immediately on submit
    setTouched({ title: true, description: true, category: true });
    return !Object.values(newErrors).some(Boolean);
  };

  // ── Change handlers (real-time validation after first touch) ─────────────

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (val.length > TITLE_MAX) return; // hard cap — enforced by maxLength too
    setTitle(val);
    if (touched.title) setErrors((prev) => ({ ...prev, title: validateField("title", val) }));
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    if (val.length > DESC_MAX) return;
    setDescription(val);
    if (touched.description) setErrors((prev) => ({ ...prev, description: validateField("description", val) }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setTouched((prev) => ({ ...prev, category: true }));
    setErrors((prev) => ({ ...prev, category: validateField("category", val) }));
  };

  const handleBlur = (name, value) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateAll()) return;

    setSubmitting(true);
    try {
      // Sanitize before sending — strips any HTML that slipped through
      const payload = {
        title:       sanitizeInput(title),
        description: sanitizeInput(description),
        category,
      };

      if (isEdit) {
        await api.put(`/tickets/${ticket.id}`, payload);
      } else {
        await api.post("/tickets", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message;
      // Show server error on the title field as a general form error
      setErrors((prev) => ({
        ...prev,
        title: serverMsg || "Something went wrong. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Returns border colour class based on touched + error state */
  const fieldBorder = (name) => {
    if (!touched[name]) return "border-gray-300";
    return errors[name] ? "border-red-400" : "border-emerald-400";
  };

  const descRemaining = DESC_MAX - description.length;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl">

        <h1 className="text-2xl font-semibold text-[#0C3E56] mb-6">
          {isEdit ? "Edit Ticket" : "Create Ticket"}
        </h1>

        <div className="flex flex-col gap-6">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={handleTitleChange}
              onBlur={() => handleBlur("title", title)}
              maxLength={TITLE_MAX}
              placeholder="Enter ticket title"
              className={`w-full border rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#0C3E56] transition
                ${fieldBorder("title")}`}
            />
            <div className="flex justify-between mt-1">
              {/* Inline error */}
              {touched.title && errors.title ? (
                <p className="text-xs text-red-500">{errors.title}</p>
              ) : (
                <span /> // keeps layout stable
              )}
              {/* Character counter — turns red near limit */}
              <p className={`text-xs ml-auto ${title.length >= TITLE_MAX - 10 ? "text-red-400" : "text-gray-400"}`}>
                {title.length}/{TITLE_MAX}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => handleBlur("description", description)}
              maxLength={DESC_MAX}
              placeholder="Describe the issue in detail…"
              className={`w-full border rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#0C3E56] resize-none transition
                ${fieldBorder("description")}`}
            />
            <div className="flex justify-between mt-1">
              {touched.description && errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ml-auto ${descRemaining < 100 ? "text-red-400" : "text-gray-400"}`}>
                {description.length}/{DESC_MAX}
              </p>
            </div>
          </div>

        
{/* CATEGORY */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Category <span className="text-red-500">*</span>
  </label>

  <div className="relative">
    <button
      type="button"
      onClick={() => setCategoryOpen(o => !o)}
      onBlur={() => handleBlur("category", category)}
      className={`w-full border rounded-xl px-4 py-3 bg-white text-left
        focus:outline-none focus:ring-2 focus:ring-[#0C3E56] transition
        flex items-center justify-between cursor-pointer ${fieldBorder("category")}`}
    >
      <span className={category ? "text-gray-800" : "text-gray-400"}>
        {CATEGORIES.find(c => c.value === category)?.label || "Select a category"}
      </span>
      <svg className={`w-4 h-4 text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    {categoryOpen && (
      <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50
        bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setCategory(c.value);
              setTouched(prev => ({ ...prev, category: true }));
              setErrors(prev => ({ ...prev, category: validateField("category", c.value) }));
              setCategoryOpen(false);
            }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-[#EAF3F8]
              transition-colors flex items-center justify-between"
            style={{ color: c.value === category ? "#0C3E56" : "#374151",
                     fontWeight: c.value === category ? 600 : 400 }}
          >
            {c.label}
            {c.value === category && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#0C3E56" strokeWidth={3} strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
      </div>
    )}
  </div>

  {touched.category && errors.category && (
    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
  )}
</div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded-xl border border-gray-300
                hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#0C3E56] text-white px-6 py-3 rounded-xl
                hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? (isEdit ? "Saving…" : "Creating…")
                : (isEdit ? "Update Ticket" : "Create Ticket")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}