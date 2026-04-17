import { useState } from "react";
import Button from "./Button";

export default function ActivePlanTable({ data }) {
  const [tableData, setTableData] = useState(data);

  /*
  =========================================
  STATUS COLOR STYLING
  =========================================
  */

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

  /*
  =========================================
  RENEW MEMBERSHIP FUNCTION
  =========================================
  */

  const renewMembership = (index) => {
    const updated = [...tableData];

    const currentEnd = new Date(updated[index].end);
    currentEnd.setFullYear(currentEnd.getFullYear() + 1);

    updated[index].end = currentEnd.toDateString();
    updated[index].status = "Active";

    setTableData(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-10 mb-12">
      {/* TABLE HEADER */}

      <div className="grid grid-cols-7 bg-[#0C3E56] text-white p-4 rounded-md font-semibold text-sm">
        <div>Company Name</div>
        <div>Plan</div>
        <div>Start Date</div>
        <div>End Date</div>
        <div>Status</div>
        <div>Amount</div>
        <div>Action</div>
      </div>

      {/* TABLE ROWS */}

      {tableData.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-7 p-4 border-b text-sm items-center"
        >
          {/* NAME */}

          <div className="flex items-center gap-3">
            <div className="bg-[#24698B] text-white text-xs font-semibold w-8 h-8 flex items-center justify-center rounded-full">
              {row.name.substring(0, 2).toUpperCase()}
            </div>

            {row.name}
          </div>

          <div>{row.plan}</div>

          <div>{row.start}</div>

          <div>{row.end}</div>

          {/* STATUS */}

          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                row.status
              )}`}
            >
              ● {row.status}
            </span>
          </div>

          {/* AMOUNT */}

          <div className="font-semibold">{row.amount}</div>

          {/* ACTION */}

          <div>
            <Button
              onClick={() => renewMembership(index)}
              className="bg-[#24698B] text-white text-xs px-4 py-1.5 rounded-lg shadow hover:bg-[#1e5a76]"
            >
              Update Membership
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
