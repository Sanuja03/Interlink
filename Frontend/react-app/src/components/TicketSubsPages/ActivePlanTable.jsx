import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../lib/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

const isExpired = (row) => {
  if (!row.endDate) return false;
  const end = new Date(row.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
};

const isFree = (row) => row.planName === "Free";
const fmt = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "—";
const displayStatus = (row) => isExpired(row) ? "Expired" : (row.status || "Active");

const statusStyle = (status) => {
  switch (status) {
    case "Active":  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Expired": return "bg-red-100 text-red-600 border border-red-200";
    default:        return "bg-gray-100 text-gray-500 border border-gray-200";
  }
};

// ─── Usage Cell: shows "used / limit" as plain text, no bar ─────────────────
function UsageCell({ used, limit }) {
  if (!limit || limit <= 0) return <span className="text-xs text-gray-400">— / ∞</span>;
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const color = pct >= 90 ? "text-red-500" : pct >= 65 ? "text-amber-500" : "text-gray-700";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {used} / {limit}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ActivePlanTable({ data, refresh, onUndo }) {
  const [plans, setPlans] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [renewModal, setRenewModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [changePlanModal, setChangePlanModal] = useState(null);
  const [customStartDate, setCustomStartDate] = useState("");

  const fetchPlans = async () => {
    if (plans.length > 0) return;
    const res = await api.get("/subscriptions");
    setPlans(res.data);
  };

  const handleConfirmPayment = async () => {
    try {
      await api.put(`/active-subscriptions/${paymentModal.id}/confirm-payment`);
      toast.success(isExpired(paymentModal)
        ? `Renewed immediately for ${paymentModal.companyName}`
        : `Payment confirmed — renews on ${fmt(paymentModal.endDate)}`);
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

  // cols: Company | Plan | Jobs | AI CV | Interviewers | Start | End | Status | Actions
  const cols = "grid-cols-[1.3fr_1.2fr_0.6fr_0.6fr_0.7fr_0.85fr_0.85fr_0.85fr_1.6fr]";

  return (
    <div onClick={() => setOpenDropdown(null)}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">

        {/* HEADER */}
        <div className={`grid ${cols} bg-[#0C3E56] text-white px-5 py-4 text-[11px] font-semibold uppercase tracking-wide rounded-t-2xl`}>
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
          <p className="text-center text-gray-400 py-10 text-sm">No subscriptions found</p>
        ) : (
          data.map((row) => {
            const expired = isExpired(row);
            const free = isFree(row);
            const status = displayStatus(row);

            return (
              <div
                key={row.id}
                className={`grid ${cols} px-5 py-3.5 border-b text-sm items-center transition
                  ${expired ? "bg-red-50/60" : "hover:bg-gray-50/60"}`}
              >
                {/* COMPANY */}
                <div className="font-medium text-gray-800 truncate pr-2 text-xs">
                  {row.companyName || row.companyId}
                </div>

                {/* PLAN DROPDOWN */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <div
                    onClick={() => { fetchPlans(); setOpenDropdown(openDropdown === row.id ? null : row.id); }}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white inline-flex items-center gap-1.5 cursor-pointer hover:border-[#24698B] transition shadow-sm w-[110px]"
                  >
                    <span className="flex-1 truncate">{row.planName}</span>
                    <span className="text-gray-400 text-[9px]">▼</span>
                  </div>
                  {openDropdown === row.id && (
                    <div className="absolute z-[999] top-full mt-1 w-[140px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {plans.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setOpenDropdown(null);
                            if (p.name === row.planName) return;
                            setChangePlanModal({ row, plan: p });
                            setCustomStartDate("");
                          }}
                          className={`px-4 py-2 text-xs cursor-pointer hover:bg-[#24698B] hover:text-white transition
                            ${p.name === row.planName ? "bg-gray-100 font-semibold pointer-events-none" : ""}`}
                        >
                          {p.name}
                          {p.name === row.planName && <span className="ml-1 text-[9px] text-gray-400">(current)</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* JOBS USAGE */}
                <UsageCell used={row.activeJobsUsed ?? 0} limit={row.activeJobsLimit ?? 0} />

                {/* AI CV USAGE */}
                <UsageCell used={row.aiCvUsed ?? 0} limit={row.aiCvLimit ?? 0} />

                {/* INTERVIEWER USAGE */}
                <UsageCell used={row.interviewersUsed ?? 0} limit={row.interviewersLimit ?? 0} />

                {/* START */}
                <div className="text-gray-500 text-xs">{fmt(row.startDate)}</div>

                {/* END — date only, no expired label */}
                <div className={`text-xs font-medium ${expired ? "text-red-400" : "text-gray-500"}`}>
                  {free || !row.endDate ? "—" : fmt(row.endDate)}
                </div>

                {/* STATUS */}
                <div className="flex flex-col gap-1 items-start">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${statusStyle(status)}`}>
                    ● {status}
                  </span>
                  {!free && row.paymentConfirmed && !expired && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-500 border border-blue-100 whitespace-nowrap">
                      ✓ Paid
                    </span>
                  )}
                </div>

                {/* ACTIONS — fixed single row, no wrap */}
                <div className="flex items-center justify-center gap-1 flex-nowrap">
                  {!free && !row.paymentConfirmed && (
                    <button
                      onClick={() => setPaymentModal(row)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition whitespace-nowrap shrink-0"
                    >
                      {expired ? "Pay & Renew" : "Confirm Pay"}
                    </button>
                  )}
                  {!free && (
                    <button
                      onClick={() => setRenewModal(row)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md bg-[#24698B] text-white hover:bg-[#1e5a76] transition whitespace-nowrap shrink-0"
                    >
                      Renew
                    </button>
                  )}
                  {!free && row.endDate && (
                    <button
                      onClick={() => onUndo(row.id)}
                      className="px-2 py-1.5 text-[10px] font-semibold rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 transition whitespace-nowrap shrink-0"
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

      {/* CONFIRM PAYMENT MODAL */}
      {paymentModal && (
        <Modal onClose={() => setPaymentModal(null)}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Payment Received</h3>
          <p className="text-sm text-gray-500 mb-4">
            Confirming <b>{paymentModal.companyName}</b> has paid for their <b>{paymentModal.planName}</b> plan.
          </p>
          {isExpired(paymentModal) ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700 mb-5">
              ⚡ Plan is expired — subscription will <b>renew immediately</b> from today.
              <div className="mt-1 font-medium text-emerald-600">
                New end date: {fmt(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString())}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-5">
              🗓 Will auto-renew on <b>{fmt(paymentModal.endDate)}</b>. AI CV usage resets on renewal.
            </div>
          )}
          <ModalFooter onCancel={() => setPaymentModal(null)} onConfirm={handleConfirmPayment}
            confirmLabel="Yes, Confirm Payment" confirmClass="bg-emerald-600 hover:bg-emerald-700" />
        </Modal>
      )}

      {/* MANUAL RENEW MODAL */}
      {renewModal && (
        <Modal onClose={() => setRenewModal(null)}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Renewal</h3>
          <p className="text-sm text-gray-500 mb-4">
            Manually renewing <b>{renewModal.companyName}</b>'s <b>{renewModal.planName}</b> plan. Admin override only.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700 mb-5">
            ⚠ Only use after confirming payment separately.
            <div className="mt-1 font-medium">
              New end date: {fmt(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString())}
            </div>
          </div>
          <ModalFooter onCancel={() => setRenewModal(null)} onConfirm={handleRenew}
            confirmLabel="Renew Manually" confirmClass="bg-[#24698B] hover:bg-[#1e5a76]" />
        </Modal>
      )}

      {/* CHANGE PLAN MODAL */}
      {changePlanModal && (
        <Modal onClose={() => { setChangePlanModal(null); setCustomStartDate(""); }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Change Plan</h3>
          <p className="text-sm text-gray-500 mb-4">
            Changing <b>{changePlanModal.row.companyName}</b> from <b>{changePlanModal.row.planName}</b> to <b>{changePlanModal.plan.name}</b>.
          </p>
          {changePlanModal.plan.name === "Free" ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700 mb-4">
              ⬇ Downgrading to Free removes the billing cycle. All usage counts reset to 0.
            </div>
          ) : (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-3">
                🚀 New plan takes effect <b>immediately</b>. All usage counts reset to 0.
                <div className="text-xs text-blue-400 mt-1">Leave start date empty to use today.</div>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#24698B]" />
            </div>
          )}
          <ModalFooter
            onCancel={() => { setChangePlanModal(null); setCustomStartDate(""); }}
            onConfirm={handleChangePlan}
            confirmLabel="Confirm Change"
            confirmClass="bg-[#24698B] hover:bg-[#1e5a76]"
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl w-[420px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmLabel, confirmClass }) {
  return (
    <div className="flex justify-end gap-3 mt-2">
      <button onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">Cancel</button>
      <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg text-sm transition ${confirmClass}`}>{confirmLabel}</button>
    </div>
  );
}