/**
 * ConfirmModal — a clean styled confirmation dialog.
 *
 * Props:
 *  - isOpen    {boolean}   show/hide
 *  - title     {string}    bold heading
 *  - message   {string}    body text
 *  - onConfirm {function}  called when user clicks the confirm button
 *  - onCancel  {function}  called when user clicks Cancel or backdrop
 *  - confirmLabel {string} button label (default "Delete")
 *  - variant   {string}    "danger" | "warning"  (default "danger")
 */
export default function ConfirmModal({
    isOpen,
    title    = "Are you sure?",
    message  = "This action cannot be undone.",
    onConfirm,
    onCancel,
    confirmLabel = "Delete",
    variant  = "danger",
  }) {
    if (!isOpen) return null;
  
    const confirmStyles = {
      danger:  "bg-red-500 hover:bg-red-600 text-white",
      warning: "bg-amber-500 hover:bg-amber-600 text-white",
    };
  
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={onCancel}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
  
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">{title}</h2>
          <p className="text-sm text-gray-500 text-center mb-8">{message}</p>
  
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200
                text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition
                ${confirmStyles[variant] ?? confirmStyles.danger}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }