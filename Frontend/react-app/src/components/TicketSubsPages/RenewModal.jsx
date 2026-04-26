import { fmt } from "../../utils/subscriptionUtils";
import { PlanBaseModal, PlanModalFooter } from "./PlanBaseModal";

/**
 * RenewModal
 * Shown when an admin clicks "Renew" on a subscription row (manual override).
 *
 * Props:
 *  - row       {object}    the subscription row being renewed
 *  - onCancel  {function}  closes the modal
 *  - onConfirm {function}  triggers the manual renewal API call
 */
export default function RenewModal({ row, onCancel, onConfirm }) {
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

  return (
    <PlanBaseModal onClose={onCancel}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Renewal</h3>
      <p className="text-sm text-gray-500 mb-4">
        Manually renewing <b>{row.companyName}</b>'s <b>{row.planName}</b> plan.
        Admin override only.
      </p>

      <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700 mb-5">
        ⚠ Only use after confirming payment separately.
        <div className="mt-1 font-medium">
          New end date: {fmt(nextMonth)}
        </div>
      </div>

      <PlanModalFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel="Renew Manually"
        confirmClass="bg-[#24698B] hover:bg-[#1e5a76]"
      />
    </PlanBaseModal>
  );
}