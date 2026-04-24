/**
 * PlanBaseModal
 * Generic modal wrapper used by subscription plan modals.
 * Closes when the backdrop is clicked.
 *
 * Props:
 *  - children  {ReactNode}  modal body content
 *  - onClose   {function}   called on backdrop click
 */
export function PlanBaseModal({ children, onClose }) {
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-8 rounded-2xl w-[420px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }
  
  /**
   * PlanModalFooter
   * Cancel / Confirm button row used at the bottom of plan modals.
   *
   * Props:
   *  - onCancel      {function}  cancel handler
   *  - onConfirm     {function}  confirm handler
   *  - confirmLabel  {string}    label for the confirm button
   *  - confirmClass  {string}    Tailwind classes for the confirm button colour
   */
  export function PlanModalFooter({ onCancel, onConfirm, confirmLabel, confirmClass }) {
    return (
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg text-sm transition ${confirmClass}`}
        >
          {confirmLabel}
        </button>
      </div>
    );
  }