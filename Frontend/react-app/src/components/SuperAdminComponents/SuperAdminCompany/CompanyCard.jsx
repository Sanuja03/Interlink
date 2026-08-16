import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { approveCompany, rejectCompany } from "../../../api/SAdminCompanyApi";
import { createActivityLog } from "../../../api/ActivityLogsApi";
import { useAuth } from "../../../context/AuthContext";

export default function CompanyCard({ type, company, refresh }) {
  const navigate = useNavigate();
  const { appUser } = useAuth(); // appUser.role reads from /auth/me — correct role, not JWT "authenticated"

  if (!company) return null;

  const name     = company.companyName;
  const email    = company.companyEmail;
  const location = company.companyLocation;

  const handleApprove = async () => {
    try {
      // Approval and activity log are separate try/catch blocks so a log
      // failure does not cause a misleading "Approve failed" error
      await approveCompany(company.id);
      toast.success(`${name} approved.`);
      refresh();
    } catch (err) {
      console.error("Approve failed:", err);
      toast.error("Failed to approve company.");
      return; // stop here — do not log if the approval itself failed
    }

    try {
      await createActivityLog({
        userId:      appUser?.userId ?? null,
        userRole:    appUser?.role   ?? "UNKNOWN",
        action:      "APPROVE",
        entityType:  "COMPANY",
        description: `Approved company: ${name}`,
      });
    } catch (err) {
      // Log failure is non-fatal — company is already approved
      console.error("Activity log failed after approve:", err);
    }
  };

  const handleReject = async () => {
    try {
      await rejectCompany(company.id);
      toast("Company rejected", { style: { background: "#ef4444", color: "#fff" } });
      refresh();
    } catch (err) {
      console.error("Reject failed:", err);
      toast.error("Failed to reject company.");
      return;
    }

    try {
      await createActivityLog({
        userId:      appUser?.userId ?? null,
        userRole:    appUser?.role   ?? "UNKNOWN",
        action:      "REJECT",
        entityType:  "COMPANY",
        description: `Rejected company: ${name}`,
      });
    } catch (err) {
      console.error("Activity log failed after reject:", err);
    }
  };

  return (
    <div className="tw-preflight flex items-center justify-between bg-[#24698B]/20
                    rounded-xl p-4 border-l-4 border-[#24698B] hover:shadow-md transition">

      {/* Company info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center
                justify-center text-xs font-bold text-[#24698B] overflow-hidden">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // Fall back to initial if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <span
            className="w-full h-full flex items-center justify-center"
            style={{ display: company.logoUrl ? "none" : "flex" }}
          >
            {name?.charAt(0) || "C"}
          </span>
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