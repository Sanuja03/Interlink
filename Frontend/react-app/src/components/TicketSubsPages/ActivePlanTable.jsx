import { useState } from "react";
import toast from "react-hot-toast";

export default function ActivePlanTable({ data, refresh, onUndo }) {

  const [selected, setSelected] = useState(null);
  const [plans, setPlans] = useState([]);
  const [pendingChange, setPendingChange] = useState(null);
  const [customStartDate, setCustomStartDate] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchPlans = async () => {
    const res = await fetch("http://localhost:8080/api/subscriptions");
    const json = await res.json();
    setPlans(json);
  };

  const confirmUpdate = async () => {
    await fetch(
      `http://localhost:8080/api/active-subscriptions/${selected.id}/extend`,
      { method: "PUT" }
    );

    toast.success("Membership renewed for 1 month");
    setSelected(null);
    refresh();
  };

  const confirmPlanChange = async () => {
    await fetch(
      `http://localhost:8080/api/active-subscriptions/${pendingChange.id}/change-plan/${pendingChange.planId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: customStartDate || null,
        }),
      }
    );

    toast.success("Plan updated successfully");
    setPendingChange(null);
    setCustomStartDate("");
    refresh();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div onClick={() => setOpenDropdown(null)}>

      <div className="bg-white rounded-2xl shadow-md p-8">

        {/* HEADER */}
        <div className="grid grid-cols-6 bg-[#0C3E56] text-white p-4 rounded-lg font-semibold text-sm">
          <div>Company</div>
          <div>Plan</div>
          <div>Start</div>
          <div>End</div>
          <div>Status</div>
          <div className="text-center">Action</div>
        </div>

        {/* ROWS */}
        {data.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-6 p-4 border-b text-sm items-center hover:bg-gray-50 transition"
          >
            {/* COMPANY */}
            <div>{row.companyName || row.companyId}</div>

            {/* PLAN DROPDOWN */}
            <div>
              <div className="relative w-[150px]">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchPlans();
                    setOpenDropdown(openDropdown === row.id ? null : row.id);
                  }}
                  className="
                    px-3 py-1.5 text-sm rounded-lg border border-gray-300
                    bg-white flex justify-between items-center cursor-pointer
                    hover:border-[#24698B] transition shadow-sm
                  "
                >
                  <span>{row.planName}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </div>

                {openDropdown === row.id && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl">
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(null);
                          setPendingChange({
                            id: row.id,
                            planId: p.id,
                            current: row.planName,
                          });
                        }}
                        className={`
                          px-4 py-2 text-sm cursor-pointer
                          hover:bg-[#24698B] hover:text-white transition
                          ${p.name === row.planName ? "bg-gray-100 font-semibold" : ""}
                        `}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* START */}
            <div>
              {row.planName === "Free"
                ? "-"
                : row.startDate
                ? new Date(row.startDate).toLocaleDateString()
                : "-"}
            </div>

            {/* END */}
            <div>
              {row.planName === "Free"
                ? "-"
                : row.endDate
                ? new Date(row.endDate).toLocaleDateString()
                : "-"}
            </div>

            {/* STATUS */}
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(row.status)}`}
              >
                ● {row.status}
              </span>
            </div>

            {/* ACTION BUTTONS (INSIDE TABLE PROPERLY) */}
            <div className="flex justify-center gap-3">

              <button
                disabled={row.planName === "Free"}
                onClick={() => setSelected(row)}
                className={`
                  px-4 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition
                  ${
                    row.planName === "Free"
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#24698B] text-white hover:bg-[#1e5a76]"
                  }
                `}
              >
                Renew Plan
              </button>

              <button
                onClick={() => onUndo(row.id)}
                className="
                  px-4 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap
                  bg-gray-500 text-white hover:bg-gray-600 transition
                "
              >
                Undo Renewal
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* RENEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl w-[360px] text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Renew Membership</h3>

            <p className="text-sm text-gray-600 mb-6">
              Extend by 1 month
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 rounded-lg">
                Cancel
              </button>

              <button onClick={confirmUpdate} className="px-4 py-2 bg-[#24698B] text-white rounded-lg">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN CHANGE MODAL */}
      {pendingChange && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl w-[360px] text-center shadow-xl">

            <h3 className="text-lg font-semibold mb-4">Change Plan</h3>

            <p className="text-sm text-gray-600 mb-4">
              From <b>{pendingChange.current}</b>
            </p>

            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mb-4 text-sm"
            />

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPendingChange(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmPlanChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}