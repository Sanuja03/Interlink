import { fmt, isExpired } from "../../utils/subscriptionUtils";
import { PlanBaseModal, PlanModalFooter } from "./PlanBaseModal";

/**
 * ConfirmPaymentModal
 * Shown when an admin clicks "Confirm Pay" or "Pay & Renew" on a subscription row.
 *
 * Props:
 *  - row       {object}    the subscription row being confirmed
 *  - onCancel  {function}  closes the modal
 *  - onConfirm {function}  triggers the payment confirmation API call
 */
export default function ConfirmPaymentModal({ row, onCancel, onConfirm }) {
  const expired = isExpired(row);
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

  return (
    <PlanBaseModal onClose={onCancel}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Confirm Payment Received
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Confirming <b>{row.companyName}</b> has paid for their{" "}
        <b>{row.planName}</b> plan.
      </p>

      {expired ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700 mb-5">
          ⚡ Plan is expired — subscription will <b>renew immediately</b> from today.
          <div className="mt-1 font-medium text-emerald-600">
            New end date: {fmt(nextMonth)}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-5">
          🗓 Will auto-renew on <b>{fmt(row.endDate)}</b>. AI CV usage resets on renewal.
        </div>
      )}

      <PlanModalFooter
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel="Yes, Confirm Payment"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
      />
    </PlanBaseModal>
  );
}