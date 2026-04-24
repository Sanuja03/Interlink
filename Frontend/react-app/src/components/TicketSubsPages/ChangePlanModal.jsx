import { PlanBaseModal, PlanModalFooter } from "./PlanBaseModal";

/**
 * ChangePlanModal
 * Shown when an admin selects a different plan from the plan dropdown in the table.
 *
 * Props:
 *  - row             {object}    the subscription row being changed
 *  - plan            {object}    the new plan being selected
 *  - customStartDate {string}    controlled date input value
 *  - onStartDateChange {function} updates the date input
 *  - onCancel        {function}  closes the modal and resets state
 *  - onConfirm       {function}  triggers the change-plan API call
 */
export default function ChangePlanModal({
  row,
  plan,
  customStartDate,
  onStartDateChange,
  onCancel,
  onConfirm,
}) {
  const isFreeDowngrade = plan.name === "Free";

  return (
    <PlanBaseModal onClose={onCancel}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Change Plan</h3>
      <p className="text-sm text-gray-500 mb-4">
        Changing <b>{row.companyName}</b> from <b>{row.planName}</b> to{" "}
        <b>{plan.name}</b>.
      </p>

      {isFreeDowngrade ? (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700 mb-4">
          ⬇ Downgrading to Free removes the billing cycle. All usage counts reset to 0.
        </div>
      ) : (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-3">
            🚀 New plan takes effect <b>immediately</b>. All usage counts reset to 0.
            <div className="text-xs text-blue-400 mt-1">
              Leave start date empty to use today.
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm
              focus:outline-none focus:border-[#24698B]"
          />
        </div>
      )}

      <PlanModalFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel="Confirm Change"
        confirmClass="bg-[#24698B] hover:bg-[#1e5a76]"
      />
    </PlanBaseModal>
  );
}