import { useEffect, useState } from "react";
import api from "../../lib/api";

// Category values must match exactly what the backend stores
const CATEGORIES = [
  { value: "GENERAL",   label: "General"         },
  { value: "LOGIN",     label: "Login Issue"      },
  { value: "PAYMENT",   label: "Payment Issue"    },
  { value: "TECHNICAL", label: "Technical Issue"  },
];

export default function TicketModal({ ticket = null, onClose, onSuccess }) {
  const isEdit = Boolean(ticket?.id);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);

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
    setError(null);
  }, [ticket]);

  const validate = () => {
    if (!title.trim())       return "Title is required.";
    if (title.trim().length > 120) return "Title must be 120 characters or fewer.";
    if (!description.trim()) return "Description is required.";
    if (!category)           return "Please select a category.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title:       title.trim(),
        description: description.trim(),
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
      setError(serverMsg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl">

        <h1 className="text-2xl font-semibold text-[#0C3E56] mb-6">
          {isEdit ? "Edit Ticket" : "Create Ticket"}
        </h1>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Enter ticket title"
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#0C3E56]"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {title.length}/120
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-[#0C3E56] resize-none"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white
                focus:outline-none focus:ring-2 focus:ring-[#0C3E56]"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
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