import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import EvaluationForm from "../../components/InterviewerPages/SingleViewLayout/EvaluationForm";
import CandidateCard from "../../components/InterviewerPages/SingleViewLayout/CandidateCard";
import "./SingleView.css";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e0edf3'/%3E%3Ccircle cx='60' cy='45' r='22' fill='%2324698b'/%3E%3Cellipse cx='60' cy='95' rx='32' ry='22' fill='%2324698b'/%3E%3C/svg%3E";

const SingleView = () => {
  const { interviewId } = useParams();
  const location        = useLocation();
  const navigate        = useNavigate();

  const interview = location.state?.interview;

  // ── Candidate data (fetched here, passed to CandidateCard) ──
  const [candidate, setCandidate] = useState(null);

  // ── Scorecard + evaluation data (fetched here, passed to EvaluationForm) ──
  const [scorecardId, setScorecardId]               = useState(null);
  const [scorecardName, setScorecardName]           = useState(null);
  const [scorecardFields, setScorecardFields]       = useState([]);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [existingScores, setExistingScores]         = useState({});
  const [evalLoading, setEvalLoading]               = useState(true);

  useEffect(() => {
    if (!interview) {
      setEvalLoading(false);
      return;
    }

    // Show what we already know from the card immediately
    setCandidate({
      image:       PLACEHOLDER_IMG,
      id:          interview.candidateId || "—",
      name:        interview.candidateName || "—",
      cvName:      "Loading...",
      profileLink: "#",
    });

    // Kick off all data fetches
    fetchCandidateData(interview.candidateId, interview.jobApplicationId);
    fetchEvaluationData(interview.scheduledId);
  }, [interview]);

  // ── Candidate data fetching (only fields CandidateCard displays) ──
  const fetchCandidateData = async (candidateId, jobApplicationId) => {
    try {
      // Fetch only what's needed for: image, name
      let candData = null;
      if (candidateId) {
        const { data, error } = await supabase
          .from("candidates")
          .select("first_name, last_name, profile_picture_url")
          .eq("candidate_id", candidateId)
          .single();
        if (!error) candData = data;
        else console.warn("[SingleView] candidates:", error.message);
      }

      // Fetch only what's needed for: cvName, profileLink, name (fallback)
      let appData = null;
      if (jobApplicationId) {
        const { data, error } = await supabase
          .from("job_applications")
          .select("resume_url, linkedin_url, candidate_name")
          .eq("id", jobApplicationId)
          .single();
        if (!error) appData = data;
        else console.warn("[SingleView] job_applications:", error.message);
      }

      // Build display name
      const supabaseName = candData
        ? `${candData.first_name || ""} ${candData.last_name || ""}`.trim()
        : "";
      const displayName =
        supabaseName ||
        appData?.candidate_name ||
        interview?.candidateName ||
        "—";

      // Build CV name (just the filename)
      const cvName = appData?.resume_url
        ? decodeURIComponent(appData.resume_url.split("/").pop().split("?")[0]) || "Resume.pdf"
        : "No resume uploaded";

      // Set only the 5 fields CandidateCard now displays
      setCandidate({
        image:       candData?.profile_picture_url || PLACEHOLDER_IMG,
        id:          candidateId || "—",
        name:        displayName,
        cvName,
        profileLink: appData?.linkedin_url || "#",
      });
    } catch (err) {
      console.error("[SingleView] fetchCandidateData error:", err);
    }
  };

  // Evaluation card  data fetching 
  const fetchEvaluationData = async (scheduledId) => {
    try {
      setEvalLoading(true);

      // Get scorecard_id from interview_scheduled
      const { data: schedData, error: schedError } = await supabase
        .from("interview_scheduled")
        .select("scorecard_id")
        .eq("scheduled_id", scheduledId)
        .single();

      if (schedError || !schedData?.scorecard_id) {
        console.warn("[SingleView] scorecard_id fetch:", schedError?.message);
        setEvalLoading(false);
        return;
      }

      const sid = schedData.scorecard_id;
      setScorecardId(sid);

      // Fetch template name
      const { data: tmpl } = await supabase
        .from("scorecard_templates")
        .select("template_name")
        .eq("scorecard_template_id", sid)
        .single();
      if (tmpl?.template_name) setScorecardName(tmpl.template_name);

      // Fetch scorecard fields
      const { data: fieldRows, error: fieldError } = await supabase
        .from("scorecard_template_fields")
        .select("scorecard_field_id, field_label, max_score, display_order")
        .eq("scorecard_template_id", sid)
        .order("display_order", { ascending: true });

      if (fieldError) {
        console.error("[SingleView] fields error:", fieldError);
        setEvalLoading(false);
        return;
      }
      setScorecardFields(fieldRows || []);

      // Check for existing draft/submission
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvalLoading(false);
        return;
      }

      const { data: existing, error: subError } = await supabase
        .from("interviewer_score_submissions")
        .select("score_submission_id, overall_comments, is_submitted")
        .eq("scheduled_id", scheduledId)
        .eq("interviewer_user_id", user.id)
        .maybeSingle();

      if (subError) console.warn("[SingleView] submission check:", subError);

      if (existing) {
        setExistingSubmission(existing);

        //  Load saved field scores
        const { data: valueRows } = await supabase
          .from("interviewer_score_field_values")
          .select("scorecard_field_id, score_given")
          .eq("score_submission_id", existing.score_submission_id);

        const scoreMap = {};
        (valueRows || []).forEach((v) => {
          scoreMap[v.scorecard_field_id] = v.score_given;
        });
        setExistingScores(scoreMap);
      }
    } catch (err) {
      console.error("[SingleView] fetchEvaluationData error:", err);
    } finally {
      setEvalLoading(false);
    }
  };

  // display candidate data if there is or show default
  const displayCandidate = candidate || {
    image:       PLACEHOLDER_IMG,
    id:          interview?.candidateId || "—",
    name:        interview?.candidateName || "—",
    cvName:      "—",
    profileLink: "#",
  };

  return (
    <DashboardLayout>
      <div className="singleview-page">
        <div className="singleview-top">
          <h1 className="singleview-title">Interview Details</h1>
          <button className="singleview-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        {!interview ? (
          <div className="singleview-empty-card">
            <p className="singleview-empty-text">
              No interview data found for <strong>{interviewId}</strong>.
            </p>
            <p className="singleview-empty-sub">
              This can happen if the page was refreshed directly.
            </p>
          </div>
        ) : (
          <>
            <div className="singleview-main-layout">

              {/* ── Left panel: interview details ── */}
              <div className="singleview-left-panel">
                <div className="singleview-info-box">
                  <span className="singleview-box-label">Interview ID</span>
                  <span className="singleview-box-value">{interview.interviewId}</span>
                </div>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Date — Time</span>
                  <span className="singleview-box-value">
                    {interview.date} — {interview.time}
                  </span>
                </div>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Job Applied</span>
                  <span className="singleview-box-value">{interview.jobTitle}</span>
                </div>

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Mode</span>
                  <span className="singleview-box-value">{interview.mode}</span>
                </div>

                {interview.mode?.toLowerCase() === "online" && interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="singleview-meeting-link"
                  >
                    Meeting Link
                  </a>
                )}

                <div className="singleview-info-box">
                  <span className="singleview-box-label">Meeting Status</span>
                  <span
                    className={`singleview-status-badge ${
                      interview.meetingStatus === "ONGOING"
                        ? "singleview-status-ongoing"
                        : interview.meetingStatus === "COMPLETED"
                        ? "singleview-status-completed"
                        : "singleview-status-scheduled"
                    }`}
                  >
                    {interview.meetingStatus}
                  </span>
                </div>

                {/* History button — placeholder, no action yet */}
                <button className="singleview-history-btn" type="button">
                  Candidate History
                </button>
              </div>

              {/* Right panel: candidate card */}
              <CandidateCard candidate={displayCandidate} />
            </div>

            {/* Evaluation form (receives fetched data as props) */}
            <EvaluationForm
              scheduledId={interview.scheduledId}
              scorecardId={scorecardId}
              scorecardName={scorecardName}
              fields={scorecardFields}
              initialSubmission={existingSubmission}
              initialScores={existingScores}
              loading={evalLoading}
              onSubmitSuccess={() => navigate("/interviewer/completed-interviews")}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleView;