//import { /*useParams use with API later,*/ useNavigate } from "react-router-dom";
import BackButton from "../../components/SuperAdminComponents/Layout/Back";

export default function JobDetails() {
  //const { id } = useParams();
  //const navigate = useNavigate();

  // Dummy job (later fetch from API)
  const job = {
    title: "Software Engineer",
    company: "Horizon Global",
    status: "Active",
    description: "We are looking for a skilled developer...",
  };

  return (
    <div className="space-y-6 font-outfit">
      <BackButton label="Back to Jobs" to="/admin/Jobs" />
      
      {/* HEADER CARD */}
      <div className="bg-[#24698B]/15 p-6 rounded-xl border border-[#DADEE0] flex justify-between items-center">

        <div>
          <h2 className="text-lg font-semibold text-[#24698B]">
            {job.title}
          </h2>
          <p className="text-sm text-gray-600">{job.company}</p>

          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2 inline-block">
            {job.status}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button className="bg-yellow-400 text-white px-3 py-1 rounded-md text-sm">
            Flag
          </button>

          <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">
            Suspend
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white border border-[#DADEE0] rounded-xl p-6">
        <h3 className="text-[#24698B] font-semibold mb-2">
          Description
        </h3>
        <p className="text-sm text-gray-600">
          {job.description}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        {["Applications", "Under Review", "Interviews", "Engagements"].map((item, i) => (
          <div key={i} className="bg-[#24698B]/10 p-4 rounded-xl text-center">
            <p className="text-lg font-semibold text-[#24698B]">12</p>
            <p className="text-xs text-gray-600">{item}</p>
          </div>
        ))}
      </div>

    </div>
  );
}