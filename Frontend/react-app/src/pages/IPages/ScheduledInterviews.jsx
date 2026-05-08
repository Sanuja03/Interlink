import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import ScheduledInterviewCard from "../../components/InterviewerPages/ScheduledInterviewCardLayout/ScheduledInterviewCard";
import SearchBar from "../../components/InterviewerPages/Layout/SearchBar";
import "./ScheduledInterviews.css";

const ScheduledInterviews = () => {
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const fetchScheduledInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get logged-in auth user 
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Unable to get current user. Please log in again.");
        return;
      }

      // 2. Get accepted request_ids for this interviewer 
      const { data: panelRows, error: panelError } = await supabase
        .from("interview_request_interviewers")
        .select("request_id")
        .eq("interviewer_user_id", user.id)
        .eq("response_status", "accepted");

      if (panelError) {
        setError("Failed to load your interview assignments.");
        console.error("[ScheduledInterviews] panelError:", panelError);
        return;
      }

      if (!panelRows || panelRows.length === 0) {
        setScheduledInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      const requestIds = panelRows.map((r) => r.request_id);

      // 3. Fetch interview_scheduled rows 
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
        .in("status", ["scheduled"])
        .order("interview_date", { ascending: true });

      if (scheduledError) {
        setError("Failed to load scheduled interviews.");
        console.error("[ScheduledInterviews] scheduledError:", scheduledError);
        return;
      }

      if (!scheduledRows || scheduledRows.length === 0) {
        setScheduledInterviews([]);
        setFilteredInterviews([]);
        return;
      }

      // 4. Fetch candidateid,candidate names for all candidate_ids in this batch
      const candidateIds = [...new Set(
        scheduledRows.map((r) => r.candidate_id).filter(Boolean)
      )];

      const candidateMap = {};
      if (candidateIds.length > 0) {
        const { data: candidateRows, error: cError } = await supabase
          .from("candidates")
          .select("candidate_id, first_name, last_name")
          .in("candidate_id", candidateIds);

        if (cError) {
          console.warn("[ScheduledInterviews] candidates fetch warning:", cError);
        }

        (candidateRows || []).forEach((c) => {
          candidateMap[c.candidate_id] =
            `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown";
        });
      }

      //  5. Fetch jobids,job titles for all job_ids in this batch 
      const jobIds = [...new Set(
        scheduledRows.map((r) => r.job_id).filter(Boolean)
      )];

      const jobMap = {};
      if (jobIds.length > 0) {
        const { data: jobRows, error: jError } = await supabase
          .from("jobs")
          .select("id, job_title, title")
          .in("id", jobIds);

        if (jError) {
          console.warn("[ScheduledInterviews] jobs fetch warning:", jError);
        }

        (jobRows || []).forEach((j) => {
          // Prefer job_title, fall back to title (some legacy rows use title)
          const t = j.job_title?.trim() || j.title?.trim() || "—";
          jobMap[j.id] = t;
        });
      }

      //  6. Fetch all accepted panel members(requestids,userids,response status) for these requests 
      const { data: allPanelMembers, error: pmError } = await supabase
        .from("interview_request_interviewers")
        .select("request_id, interviewer_user_id, response_status")
        .in("request_id", requestIds)
        .eq("response_status", "accepted");

      if (pmError) {
        console.warn("[ScheduledInterviews] panel member fetch warning:", pmError);
      }

      // 7. Fetch interviewer profiles for those user_ids 
      const panelUserIds = [...new Set(
        (allPanelMembers || []).map((r) => r.interviewer_user_id)
      )];

      const interviewerMap = {};
      if (panelUserIds.length > 0) {
        const { data: interviewerRows, error: ivError } = await supabase
          .from("interviewers")
          .select("user_id, interviewer_id, full_name, interviewer_role, phone")
          .in("user_id", panelUserIds);

        if (ivError) {
          console.warn("[ScheduledInterviews] interviewers fetch warning:", ivError);
        }

        (interviewerRows || []).forEach((iv) => {
          interviewerMap[iv.user_id] = iv;
        });
      }

      //  8. Group panel members by request_id 
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

      // 9. Map to card format 
      const mapped = scheduledRows.map((item) =>
        mapInterviewData(item, panelByRequestId, candidateMap, jobMap)
      );
      setScheduledInterviews(mapped);
      setFilteredInterviews(mapped);

    } catch (err) {
      console.error("[ScheduledInterviews] unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const mapInterviewData = (item, panelByRequestId, candidateMap, jobMap) => {
    const formatTime = (timeStr) => {
      if (!timeStr) return "";
      const [hourStr, minStr] = timeStr.split(":");
      let hour = parseInt(hourStr, 10);
      const min = minStr || "00";
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${String(hour).padStart(2, "0")}:${min} ${ampm}`;
    };

    const statusMap = {
      scheduled: "SCHEDULED",
      completed: "COMPLETED",
    };

    return {
      interviewId:      item.interview_id,
      scheduledId:      item.scheduled_id,
      requestId:        item.request_id,
      date:             item.interview_date,
      time:             formatTime(item.interview_time),
      jobTitle:         (item.job_id && jobMap[item.job_id]) || "—",
      meetingStatus:    statusMap[item.status] || item.status?.toUpperCase(),
      mode:             item.mode,
      meetingLink:      item.meeting_link || "",
      panelMembers:     panelByRequestId[item.request_id] || [],
      adminNote:        item.admin_notes || "",
      candidateId:      item.candidate_id,
      jobApplicationId: item.job_application_id,
      candidateName:    (item.candidate_id && candidateMap[item.candidate_id]) || null,
    };
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setFilteredInterviews(scheduledInterviews);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = scheduledInterviews.filter(
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
      <div className="scheduled-page">
        <div className="scheduled-header">
          <h1 className="scheduled-title">Scheduled Interviews</h1>
        </div>

        <SearchBar
          onChange={handleSearch}
          onSearch={() => handleSearch(searchValue)}
        />

        <div className="scheduled-container">
          {loading ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">Loading interviews...</p>
            </div>
          ) : error ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">Error</p>
              <p className="scheduled-empty-sub">{error}</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="scheduled-empty">
              <p className="scheduled-empty-title">No Scheduled Interviews</p>
              <p className="scheduled-empty-sub">
                {searchValue
                  ? "No results match your search."
                  : "You have no upcoming scheduled interviews."}
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

export default ScheduledInterviews;