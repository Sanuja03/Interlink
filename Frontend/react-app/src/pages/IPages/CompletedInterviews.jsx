import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import ScheduledInterviewCard from "../../components/InterviewerPages/ScheduledInterviewCardLayout/ScheduledInterviewCard";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./CompletedInterviews.css";

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

      // Drive off this interviewer's own submissions — NOT interview_scheduled.status.
      // This way interviews appear here as soon as THIS person submits, even if other
      // panelists haven't submitted yet (which keeps status = "scheduled" for them).
      const { data: mySubmissions, error: subFetchError } = await supabase
        .from("interviewer_score_submissions")
        .select("scheduled_id")
        .eq("interviewer_user_id", user.id)
        .eq("is_submitted", true);

      if (subFetchError) {
        setError("Failed to load your submitted evaluations.");
        console.error("[CompletedInterviews] subFetchError:", subFetchError);
        return;
      }

      if (!mySubmissions || mySubmissions.length === 0) {
        setCompletedInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      const mySubmittedScheduledIds = mySubmissions.map((s) => s.scheduled_id);

      // Fetch the interview_scheduled rows for every interview this user submitted.
      // No status filter — the row may still be "scheduled" if other panelists
      // haven't submitted yet, but this interviewer is personally done with it.
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
          interview_location,
          status,
          candidate_id,
          job_application_id,
          job_id
        `)
        .in("scheduled_id", mySubmittedScheduledIds);

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

      // Sort: most recent date first; within the same date, latest time first.
      // e.g. 2026-06-28 8 PM comes before 2026-06-28 9 AM, which comes before 2026-06-27.
      scheduledRows.sort((a, b) => {
        const dateCmp = b.interview_date.localeCompare(a.interview_date);
        if (dateCmp !== 0) return dateCmp;
        return b.interview_time.localeCompare(a.interview_time);
      });

      // All rows confirmed — this user personally submitted for each of them.
      const confirmedRows = scheduledRows;

      // Fetch job titles
      const jobIds = [...new Set(confirmedRows.map(r => r.job_id).filter(Boolean))];
      let jobMap = {};
      if (jobIds.length > 0) {
        const { data: jobRows } = await supabase
          .from("jobs")
          .select("id, job_title")
          .in("id", jobIds);

        (jobRows || []).forEach(j => {
          jobMap[j.id] = j.job_title;
        });
      }

      // Fetch candidate names
      const candidateIds = [...new Set(confirmedRows.map(r => r.candidate_id).filter(Boolean))];
      let candidateMap = {};
      if (candidateIds.length > 0) {
        const { data: candidateRows } = await supabase
          .from("candidates")
          .select("candidate_id, first_name, last_name")
          .in("candidate_id", candidateIds);

        (candidateRows || []).forEach(c => {
          candidateMap[c.candidate_id] = `${c.first_name || ""} ${c.last_name || ""}`.trim();
        });
      }

      // Fetch accepted panel members for the panel popup
      const { data: allPanelMembers } = await supabase
        .from("interview_request_interviewers")
        .select("request_id, interviewer_user_id, response_status")
        .in("request_id", requestIds)
        .eq("response_status", "accepted");

      // Fetch interviewer profiles for the panel popup
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

      // creating list of panel members for each request id
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

      // Map each row to card format
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

        return {
          interviewId:      item.interview_id,
          scheduledId:      item.scheduled_id,
          requestId:        item.request_id,
          date:             item.interview_date,
          time:             formatTime(item.interview_time),
          jobTitle:         jobMap[item.job_id] || "—",
          meetingStatus:    "COMPLETED",
          mode:             item.mode,
          meetingLink:      item.meeting_link || "",
          interviewLocation: item.interview_location || "",
          panelMembers:     panelByRequestId[item.request_id] || [],
          adminNote:        item.admin_notes || "",
          candidateId:      item.candidate_id,
          jobApplicationId: item.job_application_id,
          candidateName:    candidateMap[item.candidate_id] || null,
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

  /**takes what the user typed, and if it's not empty, looks through every completed
  interview and keeps only the ones where the typed text matches any of
  those 6 fields (case-insensitively). Then it updates the screen to
  show only those matches.*/
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
        item.time?.toLowerCase().includes(lower) ||
        item.candidateName?.toLowerCase().includes(lower)
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