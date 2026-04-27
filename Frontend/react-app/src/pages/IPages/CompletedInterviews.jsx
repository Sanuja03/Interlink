import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import ScheduledInterviewCard from "../../components/InterviewerPages/ScheduledInterviewCardLayout/ScheduledInterviewCard";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./CompletedInterviews.css";

// hardcoded candidates 
const HARDCODED_CANDIDATES = [
  {
    candidateId:      "050e8591-fe88-4a6a-a48e-6f7ead2a710e",
    jobApplicationId: 8,
    candidateName:    "Senithi Vihara",
    jobTitle:         "Frontend Developer",
  },
  {
    candidateId:      "050e8591-fe88-4a6a-a48e-6f7ead2a710e",
    jobApplicationId: 7,
    candidateName:    "Sanuja Alphonsus",
    jobTitle:         "Frontend Developer",
  },
];

const getCandidateByAppId = (jobApplicationId) =>
  HARDCODED_CANDIDATES.find(
    (c) => c.jobApplicationId === Number(jobApplicationId)
  ) || null;

const CompletedInterviews = () => {
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchCompletedInterviews();
  }, []);

  const fetchCompletedInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get logged-in auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Unable to get current user. Please log in again.");
        return;
      }

      // Get request_ids where this interviewer accepted 
      const { data: panelRows, error: panelError } = await supabase
        .from("interview_request_interviewers")
        .select("request_id")
        .eq("interviewer_user_id", user.id)
        .eq("response_status", "accepted");

      if (panelError) {
        setError("Failed to load your interview assignments.");
        return;
      }

      if (!panelRows || panelRows.length === 0) {
        setCompletedInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      const requestIds = panelRows.map((r) => r.request_id);

      //  Fetch completed interview_scheduled rows 
      const { data: scheduledRows, error: scheduledError } = await supabase
        .from("interview_scheduled")
        .select(`
          scheduled_id,
          request_id,
          interview_id,
          interview_date,
          interview_time,
          mode,
          admin_notes,
          meeting_link,
          status,
          candidate_id,
          job_application_id,
          job_id
        `)
        .in("request_id", requestIds)
        .eq("status", "completed")
        .order("interview_date", { ascending: false });

      if (scheduledError) {
        setError("Failed to load completed interviews.");
        console.error("[CompletedInterviews] scheduledError:", scheduledError);
        return;
      }

      if (!scheduledRows || scheduledRows.length === 0) {
        setCompletedInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      // Verify this interviewer actually submitted scores 
      const scheduledIds = scheduledRows.map((r) => r.scheduled_id);
      const { data: submissionRows } = await supabase
        .from("interviewer_score_submissions")
        .select("scheduled_id")
        .in("scheduled_id", scheduledIds)
        .eq("interviewer_user_id", user.id)
        .eq("is_submitted", true);

      const submittedScheduledIds = new Set(
        (submissionRows || []).map((s) => s.scheduled_id)
      );

      const confirmedRows = scheduledRows.filter((r) =>
        submittedScheduledIds.has(r.scheduled_id)
      );

      if (confirmedRows.length === 0) {
        setCompletedInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      // Fetch accepted panel members
      const { data: allPanelMembers } = await supabase
        .from("interview_request_interviewers")
        .select("request_id, interviewer_user_id, response_status")
        .in("request_id", requestIds)
        .eq("response_status", "accepted");

      // Fetch interviewer profiles
      const panelUserIds = [...new Set(
        (allPanelMembers || []).map((r) => r.interviewer_user_id)
      )];

      let interviewerMap = {};
      if (panelUserIds.length > 0) {
        const { data: interviewerRows } = await supabase
          .from("interviewers")
          .select("user_id, interviewer_id, full_name, interviewer_role, phone")
          .in("user_id", panelUserIds);

        (interviewerRows || []).forEach((iv) => {
          interviewerMap[iv.user_id] = iv;
        });
      }

      // Group panel members by request_id 
      const panelByRequestId = {};
      (allPanelMembers || []).forEach((row) => {
        if (!panelByRequestId[row.request_id]) {
          panelByRequestId[row.request_id] = [];
        }
        const iv = interviewerMap[row.interviewer_user_id];
        panelByRequestId[row.request_id].push({
          emNo:     iv?.interviewer_id   || "—",
          name:     iv?.full_name        || "Unknown",
          position: iv?.interviewer_role || "—",
          mobile:   iv?.phone            || "—",
        });
      });

      // Map to card format
      const mapped = confirmedRows.map((item) => {
        const formatTime = (timeStr) => {
          if (!timeStr) return "";
          const [hourStr, minStr] = timeStr.split(":");
          let hour = parseInt(hourStr, 10);
          const min = minStr || "00";
          const ampm = hour >= 12 ? "PM" : "AM";
          hour = hour % 12 || 12;
          return `${String(hour).padStart(2, "0")}:${min} ${ampm}`;
        };

        const hardcoded = getCandidateByAppId(item.job_application_id);

        return {
          interviewId:      item.interview_id,
          scheduledId:      item.scheduled_id,
          requestId:        item.request_id,
          date:             item.interview_date,
          time:             formatTime(item.interview_time),
          jobTitle:         hardcoded?.jobTitle || "—",
          meetingStatus:    "COMPLETED",
          mode:             item.mode,
          meetingLink:      item.meeting_link || "",
          panelMembers:     panelByRequestId[item.request_id] || [],
          adminNote:        item.admin_notes || "",
          candidateId:      item.candidate_id,
          jobApplicationId: item.job_application_id,
          candidateName:    hardcoded?.candidateName || null,
        };
      });

      setCompletedInterviews(mapped);
      setFilteredInterviews(mapped);

    } catch (err) {
      console.error("[CompletedInterviews] unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setFilteredInterviews(completedInterviews);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = completedInterviews.filter(
      (item) =>
        item.interviewId?.toLowerCase().includes(lower) ||
        item.jobTitle?.toLowerCase().includes(lower) ||
        item.mode?.toLowerCase().includes(lower) ||
        item.date?.toLowerCase().includes(lower) ||
        item.time?.toLowerCase().includes(lower)
    );
    setFilteredInterviews(filtered);
  };

  return (
    <DashboardLayout>
      <div className="completed-page">
        <div className="completed-header">
          <h1 className="completed-title">Completed Interviews</h1>
        </div>

        <SearchBar
          onChange={handleSearch}
          onSearch={() => handleSearch(searchValue)}
        />

        <div className="scheduled-container">
          {loading ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">Loading completed interviews...</p>
            </div>
          ) : error ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">Error</p>
              <p className="scheduled-empty-sub">{error}</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">No Completed Interviews</p>
              <p className="scheduled-empty-sub">
                {searchValue
                  ? "No results match your search."
                  : "You have no completed interviews yet."}
              </p>
            </div>
          ) : (
            <div className="scheduled-grid">
              {filteredInterviews.map((item) => (
                <ScheduledInterviewCard
                  key={item.scheduledId}
                  interview={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompletedInterviews;