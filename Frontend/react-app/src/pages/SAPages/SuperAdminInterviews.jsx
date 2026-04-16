//import { useNavigate } from "react-router-dom";

export default function SuperAdminInterviews() {
  //const navigate = useNavigate();

  return (
    <div className="space-y-6 text-black font-outfit">

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by date, company, role..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />

        <button className="w-12 h-12 rounded-full bg-[#24698B] text-white shadow flex items-center justify-center">
          {/* Filter Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-7 7v5l-4-2v-3L3 6V4z" />
          </svg>
        </button>
      </div>

      {/* Interviews Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#24698B]">
          ■ Interviews
        </h2>

        <div className="bg-[#24698B] text-white text-sm px-4 py-1 rounded-full shadow">
          522 Total
        </div>
      </div>

      {/* Interview Card */}
      <InterviewCard />

    </div>
  );
}


/* Interview Card Component */
function InterviewCard() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">

      <div className="grid grid-cols-2 gap-6">

        {/* LEFT SECTION */}
        <div className="space-y-4">

          <div className="flex items-center gap-4">
            <div className="bg-[#24698B]/20 px-4 py-2 rounded-full font-medium">
              ID-IN5690
            </div>

            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Online
            </span>
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            📅 18 Feb 2026
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            ⏰ 10:00 AM – 10:45 AM
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl font-medium">
            Software Engineer
          </div>

          <div className="bg-[#24698B]/20 px-4 py-2 rounded-xl text-sm">
            🔗 meeting.com
          </div>

          <div className="bg-[#24698B]/20 px-4 py-3 rounded-xl text-sm">
            <p className="font-medium mb-1">Notes</p>
            Ask some questions about company
          </div>

        </div>


        {/* RIGHT SECTION */}
        <div className="bg-[#24698B]/20 rounded-2xl p-6 space-y-4">

          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[#24698B]">
                Sarah Johnson
              </h3>
              <p className="text-sm text-gray-700">sarahjohn@gmail.com</p>
              <p className="text-sm text-gray-700">Colombo, Sri Lanka</p>
              <p className="text-sm text-gray-700">University of Moratuwa</p>
            </div>

            <img
              src="https://i.pravatar.cc/100"
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Skills:</p>
            <div className="flex flex-wrap gap-2">
              <SkillTag label="JavaScript" />
              <SkillTag label="React" />
              <SkillTag label="Node.js" />
              <SkillTag label="Communication" />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button className="flex-1 bg-[#0C3E56] text-white py-2 rounded-full shadow hover:opacity-90">
              CV
            </button>
            <button className="flex-1 bg-[#0C3E56] text-white py-2 rounded-full shadow hover:opacity-90">
              Projects
            </button>
          </div>

        </div>

      </div>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <button className="bg-red-600 text-white px-6 py-2 rounded-full shadow hover:opacity-90">
          Cancel Interview
        </button>
      </div>

    </div>
  );
}


/* Skill Tag */
function SkillTag({ label }) {
  return (
    <span className="px-3 py-1 text-xs bg-white rounded-full shadow">
      {label}
    </span>
  );
}