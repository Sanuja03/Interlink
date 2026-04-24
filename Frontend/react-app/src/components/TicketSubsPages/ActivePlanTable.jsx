import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { isExpired, isFree, displayStatus, statusStyle, fmt } from "../../utils/subscriptionUtils";
import UsageCell from "./UsageCell";
import ConfirmPaymentModal from "./ConfirmPaymentModal";
import RenewModal from "./RenewModal";
import ChangePlanModal from "./ChangePlanModal";

// Column layout: Company | Plan | Jobs | AI CV | Interviewers | Start | End | Status | Actions
const COLS = "grid-cols-[1.3fr_1.2fr_0.6fr_0.6fr_0.7fr_0.85fr_0.85fr_0.85fr_1.6fr]";

/**
 * ActivePlanTable
 * Renders the subscriptions data grid with inline plan-change dropdown
 * and action buttons (Confirm Pay, Renew, Undo). Modals are delegated
 * to separate focused components.
 *
 * Props:
 *  - data    {array}     list of active subscription objects from the API
 *  - refresh {function}  re-fetches the subscription list
 *  - onUndo  {function}  triggers the undo-renewal API call for a given id
 */
export default function ActivePlanTable({ data, refresh, onUndo }) {
  const [plans,           setPlans]           = useState([]);
  const [openDropdown,    setOpenDropdown]     = useState(null);
  const [renewModal,      setRenewModal]       = useState(null);
  const [paymentModal,    setPaymentModal]     = useState(null);
  const [changePlanModal, setChangePlanModal]  = useState(null);
  const [customStartDate, setCustomStartDate]  = useState("");

  // Lazy-load available plans only when the dropdown is first opened
  const fetchPlans = async () => {
    if (plans.length > 0) return;
    const res = await api.get("/subscriptions");
    setPlans(res.data);
  };

  const handleConfirmPayment = async () => {
    try {
      await api.put(`/active-subscriptions/${paymentModal.id}/confirm-payment`);
      toast.success(
        isExpired(paymentModal)
          ? `Renewed immediately for ${paymentModal.companyName}`
          : `Payment confirmed — renews on ${fmt(paymentModal.endDate)}`
      );
      setPaymentModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data || "Failed to confirm payment");
    }
  };

  const handleRenew = async () => {
    try {
      await api.put(`/active-subscriptions/${renewModal.id}/extend`);
      toast.success(`${renewModal.companyName}'s plan renewed for 1 month`);
      setRenewModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data || "Renewal failed");
    }
  };

  const handleChangePlan = async () => {
    try {
      await api.put(
        `/active-subscriptions/${changePlanModal.row.id}/change-plan/${changePlanModal.plan.id}`,
        { startDate: customStartDate || null }
      );
      toast.success(`Plan changed to ${changePlanModal.plan.name}`);
      setChangePlanModal(null);
      setCustomStartDate("");
      refresh();
    } catch (err) {
      toast.error("Plan change failed");
    }
  };

  const closeChangePlan = () => {
    setChangePlanModal(null);
    setCustomStartDate("");
  };

  return (
    <div onClick={() => setOpenDropdown(null)}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">

        {/* TABLE HEADER */}
        <div className={`grid ${COLS} bg-[#0C3E56] text-white px-5 py-4
          text-[11px] font-semibold uppercase tracking-wide rounded-t-2xl`}>
          <div>Company</div>
          <div>Plan</div>
          <div>Jobs</div>
          <div>AI CV</div>
          <div>Interviewers</div>
          <div>Start</div>
          <div>End</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {data.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            No subscriptions found
          </p>
        ) : (
          data.map((row) => {
            const expired = isExpired(row);
            const free    = isFree(row);
            const status  = displayStatus(row);

            return (
              <div
                key={row.id}
                className={`grid ${COLS} px-5 py-3.5 border-b text-sm items-center transition
                  ${expired ? "bg-red-50/60" : "hover:bg-gray-50/60"}`}
              >
                {/* COMPANY */}
                <div className="font-medium text-gray-800 truncate pr-2 text-xs">
                  {row.companyName || row.companyId}
                </div>

                {/* PLAN DROPDOWN */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <div
                    onClick={() => {
                      fetchPlans();
                      setOpenDropdown(openDropdown === row.id ? null : row.id);
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200
                      bg-white inline-flex items-center gap-1.5 cursor-pointer
                      hover:border-[#24698B] transition shadow-sm w-[110px]"
                  >
                    <span className="flex-1 truncate">{row.planName}</span>
                    <span className="text-gray-400 text-[9px]">▼</span>
                  </div>

                  {openDropdown === row.id && (
                    <div className="absolute z-[999] top-full mt-1 w-[140px] bg-white
                      border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {plans.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setOpenDropdown(null);
                            if (p.name === row.planName) return;
                            setChangePlanModal({ row, plan: p });
                            setCustomStartDate("");
                          }}
                          className={`px-4 py-2 text-xs cursor-pointer
                            hover:bg-[#24698B] hover:text-white transition
                            ${p.name === row.planName
                              ? "bg-gray-100 font-semibold pointer-events-none"
                              : ""}`}
                        >
                          {p.name}
                          {p.name === row.planName && (
                            <span className="ml-1 text-[9px] text-gray-400">(current)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* USAGE CELLS */}
                <UsageCell used={row.activeJobsUsed  ?? 0} limit={row.activeJobsLimit  ?? 0} />
                <UsageCell used={row.aiCvUsed        ?? 0} limit={row.aiCvLimit        ?? 0} />
                <UsageCell used={row.interviewersUsed ?? 0} limit={row.interviewersLimit ?? 0} />

                {/* DATES */}
                <div className="text-gray-500 text-xs">{fmt(row.startDate)}</div>
                <div className={`text-xs font-medium ${expired ? "text-red-400" : "text-gray-500"}`}>
                  {free || !row.endDate ? "—" : fmt(row.endDate)}
                </div>

                {/* STATUS BADGE */}
                <div className="flex flex-col gap-1 items-start">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                    whitespace-nowrap ${statusStyle(status)}`}>
                    ● {status}
                  </span>
                  {!free && row.paymentConfirmed && !expired && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold
                      bg-blue-50 text-blue-500 border border-blue-100 whitespace-nowrap">
                      ✓ Paid
                    </span>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center justify-center gap-1 flex-nowrap">
                  {!free && !row.paymentConfirmed && (
                    <button
                      onClick={() => setPaymentModal(row)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md
                        bg-emerald-600 text-white hover:bg-emerald-700
                        transition whitespace-nowrap shrink-0"
                    >
                      {expired ? "Pay & Renew" : "Confirm Pay"}
                    </button>
                  )}
                  {!free && (
                    <button
                      onClick={() => setRenewModal(row)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md
                        bg-[#24698B] text-white hover:bg-[#1e5a76]
                        transition whitespace-nowrap shrink-0"
                    >
                      Renew
                    </button>
                  )}
                  {!free && row.endDate && (
                    <button
                      onClick={() => onUndo(row.id)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md
                        bg-gray-200 text-gray-600 hover:bg-gray-300
                        transition whitespace-nowrap shrink-0"
                    >
                      Undo
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODALS — rendered outside the table so z-index is never clipped */}
      {paymentModal && (
        <ConfirmPaymentModal
          row={paymentModal}
          onCancel={() => setPaymentModal(null)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {renewModal && (
        <RenewModal
          row={renewModal}
          onCancel={() => setRenewModal(null)}
          onConfirm={handleRenew}
        />
      )}

      {changePlanModal && (
        <ChangePlanModal
          row={changePlanModal.row}
          plan={changePlanModal.plan}
          customStartDate={customStartDate}
          onStartDateChange={setCustomStartDate}
          onCancel={closeChangePlan}
          onConfirm={handleChangePlan}
        />
      )}
    </div>
  );
}