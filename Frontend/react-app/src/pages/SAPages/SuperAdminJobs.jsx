import { useNavigate } from "react-router-dom";
import JobCard from "../../components/SuperAdminComponents/Jobs/JobCard";

export default function SuperAdminJobs() {
  const navigate = useNavigate();

  // Dummy data (later replace with API)
  const jobs = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Horizon Global",
      location: "Colombo | Hybrid",
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Remote",
    },
  ];

  return (
    <div className="space-y-6 font-outfit">

      {/* HEADER */}
      <h1 className="text-xl font-semibold text-[#24698B]">
        All Jobs
      </h1>

      {/* LIST */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onClick={() => navigate(`/SuperAdmin/Jobs/${job.id}`)}
          />
        ))}
      </div>

      {/* LOAD MORE */}
      <div className="flex justify-center">
        <button className="bg-[#24698B] text-white px-4 py-2 rounded-full text-sm">
          Load more...
        </button>
      </div>

    </div>
  );
}