import { useNavigate } from "react-router-dom";
import {approveCompany,rejectCompany,} from "../../../api/SAdminCompanyApi";
import { createActivityLog } from "../../../api/ActivityLogsApi";
import { useAuth } from "../../../context/Authcontext";

export default function CompanyCard({ type, company, refresh }) {
  const navigate = useNavigate();
  const { user } = useAuth(); // get logged-in user

  if (!company) return null;

  // Map backend → frontend
  const name = company.companyName;
  const email = company.companyEmail;
  const location = company.companyLocation;

  // APPROVE
  const handleApprove = async () => {
    try {
      await approveCompany(company.id);

      // Log activity
      await createActivityLog({
        userId: user?.id ?? null,
        userRole: user?.role ?? "UNKNOWN",
        action: "APPROVE",
        entityType: "COMPANY",
        description: `Approved company: ${name}`,
      });

      refresh();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  // REJECT
  const handleReject = async () => {
    try {
      await rejectCompany(company.id);

      // Log activity
      await createActivityLog({
        userId: user?.id ?? null,
        userRole: user?.role ?? "UNKNOWN",
        action: "REJECT",
        entityType: "COMPANY",
        description: `Rejected company: ${name}`,
      });

      refresh();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  return (
    <div
      className="flex items-center justify-between bg-[#24698B]/20
                 rounded-xl p-4 border-l-4 border-[#24698B]
                 hover:shadow-md transition"
    >
      {/* Company Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-xs font-bold text-[#24698B]">
          {name?.charAt(0) || "C"}
        </div>

        <div>
          <p className="font-semibold">{name || "Company Name"}</p>
          <p className="text-sm text-gray-600">
            {email || "email@company.com"} · {location || "Location"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">

        {/* Pending Actions */}
        {type === "pending" && (
          <>
            <button
              onClick={handleApprove}
              className="px-3 py-1 bg-[#1F6434] text-white rounded-md text-sm hover:bg-[#174d29]"
            >
              Approve
            </button>

            <button
              onClick={handleReject}
              className="px-3 py-1 bg-[#D11405] text-white rounded-md text-sm hover:bg-[#a10f03]"
            >
              Reject
            </button>
          </>
        )}

        {/* View Profile */}
        <button
          onClick={() => navigate(`/admin/Company/${company.id}`)}
          className="px-3 py-1 bg-[#004668] text-white rounded-md text-sm hover:bg-[#00334d]"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}