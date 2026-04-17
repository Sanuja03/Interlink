import { useLocation } from "react-router-dom";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";

export default function SuperAdminViewCompany() {
  const { state: user } = useLocation();
    

  return (
 
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <BackButton label="Back to Companies" to="/admin/Companies" />
        


      {/* HEADER */}
      <div className="bg-[#24698B] p-6 rounded-xl shadow">
        <div className="bg-white rounded-xl p-4 flex justify-between items-center">

          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              LOGO
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                {user?.companyName || "Inova IT Systems"}
              </h2>
              <p className="text-sm text-gray-500">Technology</p>

              <div className="text-xs text-gray-500 flex gap-4 mt-1">
                <span>info@company.com</span>
                <span>+94 77 123 4567</span>
                <span>Colombo</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Joined: Oct 2025
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { value: "247", label: "Interviews" },
          { value: "53", label: "Hired" },
          { value: "4.8/5", label: "Rating" },
          { value: "91%", label: "Success" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#24698B] text-white p-4 rounded-xl text-center shadow"
          >
            <h2 className="font-bold">{item.value}</h2>
            <p className="text-xs opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      {/* JOBS */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-[#24698B] font-semibold mb-4">
          Jobs Posted by the Company
        </h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-[#24698B]/10 p-3 rounded-lg"
            >
              <div>
                <h4 className="text-sm font-semibold">
                  Full Stack Developer
                </h4>
                <p className="text-xs text-gray-500">
                  5 days ago • 45 Applicants • Full Time
                </p>
              </div>

              <span className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-full">
                Open
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-2 gap-4">

        {/* Activity */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-[#24698B] font-semibold mb-3">
            Recent Activities
          </h3>

          <ul className="text-sm text-gray-600 space-y-2">
            <li>New job posted</li>
            <li>Candidate applied</li>
            <li>Interview scheduled</li>
            <li>Profile updated</li>
          </ul>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-[#24698B] font-semibold mb-3">
            Calendar
          </h3>

          <div className="grid grid-cols-5 gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-[#24698B]/20 rounded"
              />
            ))}
          </div>
        </div>

      </div>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4">
        <button className="bg-red-500 text-white px-6 py-2 rounded-full">
          Suspend Company
        </button>

        <button className="bg-gray-200 px-6 py-2 rounded-full">
          Flag Company
        </button>
      </div>

    </div>
  );
}