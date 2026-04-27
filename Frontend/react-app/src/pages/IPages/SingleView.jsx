import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import EvaluationForm from "../../components/InterviewerPages/SingleViewLayout/EvaluationForm";
import CandidateCard from "../../components/InterviewerPages/SingleViewLayout/CandidateCard";
import "./SingleView.css";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e0edf3'/%3E%3Ccircle cx='60' cy='45' r='22' fill='%2324698b'/%3E%3Cellipse cx='60' cy='95' rx='32' ry='22' fill='%2324698b'/%3E%3C/svg%3E";

// ── Hardcoded candidates (mirrors ShortlistedCandidates.jsx) ──
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

const getHardcodedCandidate = (jobApplicationId) =>
  HARDCODED_CANDIDATES.find(
    (c) => c.jobApplicationId === Number(jobApplicationId)
  ) || null;

const SingleView = () => {
  const { interviewId } = useParams();
  const location        = useLocation();
  const navigate        = useNavigate();

  const interview = location.state?.interview;

  const [candidate,   setCandidate]   = useState(null);
  const [scorecardId, setScorecardId] = useState(null);
  const [scorecardName, setScorecardName] = useState(null);

  useEffect(() => {
    if (!interview) return;

    // ── Step 1: Show hardcoded data immediately ──
    const hardcoded = getHardcodedCandidate(interview.jobApplicationId);
    setCandidate({
      image:       PLACEHOLDER_IMG,
      id:          interview.candidateId || hardcoded?.candidateId || "—",
      name:        hardcoded?.candidateName || interview.candidateName || "—",
      cvName:      "Loading...",
      cvUrl:       "#",
      profileLink: "#",
      history:     "Loading additional details...",
    });

    // ── Step 2: Fetch scorecard_id + scorecard name from interview_scheduled ──
    if (interview.scheduledId) {
      supabase
        .from("interview_scheduled")
        .select("scorecard_id")
        .eq("scheduled_id", interview.scheduledId)
        .single()
        .then(async ({ data: schedData, error: schedError }) => {
          if (schedError || !schedData?.scorecard_id) {
            console.warn("[SingleView] scorecard_id fetch:", schedError?.message);
            return;
          }
          const sid = schedData.scorecard_id;
          setScorecardId(sid);

          // Also fetch template name for display
          const { data: tmpl } = await supabase
            .from("scorecard_templates")
            .select("template_name")
            .eq("scorecard_template_id", sid)
            .single();
          if (tmpl?.template_name) setScorecardName(tmpl.template_name);
        });
    }

    // ── Step 3: Enrich candidate from Supabase ──
    enrichCandidate(interview.candidateId, interview.jobApplicationId);
  }, [interview]);

  const enrichCandidate = async (candidateId, jobApplicationId) => {
    try {
      let candData = null;
      if (candidateId) {
        const { data, error } = await supabase
          .from("candidates")
          .select("candidate_id, first_name, last_name, profile_picture_url, headline, bio, location")
          .eq("candidate_id", candidateId)
          .single();
        if (!error) candData = data;
        else console.warn("[SingleView] candidates:", error.message);
      }

      let appData = null;
      if (jobApplicationId) {
        const { data, error } = await supabase
          .from("job_applications")
          .select("resume_url, linkedin_url, current_role, current_company, years_of_experience, candidate_name")
          .eq("id", jobApplicationId)
          .single();
        if (!error) appData = data;
        else console.warn("[SingleView] job_applications:", error.message);
      }

      const hardcoded   = getHardcodedCandidate(jobApplicationId);
      const supabaseName = candData
        ? `${candData.first_name || ""} ${candData.last_name || ""}`.trim()
        : "";
      const displayName = supabaseName || hardcoded?.candidateName || appData?.candidate_name || "—";

      const resumeUrl = appData?.resume_url || null;
      const cvName    = resumeUrl
        ? decodeURIComponent(resumeUrl.split("/").pop().split("?")[0]) || "Resume.pdf"
        : "No resume uploaded";

      const parts = [];
      if (candData?.headline) parts.push(candData.headline);
      if (appData?.current_role && appData?.current_company)
        parts.push(`Currently: ${appData.current_role} at ${appData.current_company}`);
      else if (appData?.current_role)
        parts.push(`Current Role: ${appData.current_role}`);
      if (appData?.years_of_experience != null)
        parts.push(`${appData.years_of_experience} yr(s) experience`);
      if (candData?.bio)      parts.push(candData.bio);
      if (candData?.location) parts.push(`Location: ${candData.location}`);

      setCandidate({
        image:       candData?.profile_picture_url || PLACEHOLDER_IMG,
        id:          candData?.candidate_id || candidateId || "—",
        name:        displayName,
        cvName,
        cvUrl:       resumeUrl || "#",
        profileLink: appData?.linkedin_url || "#",
        history:     parts.length > 0 ? parts.join(" · ") : "No additional info available.",
      });
    } catch (err) {
      console.error("[SingleView] enrichCandidate error:", err);
    }
  };

  const displayCandidate = candidate || {
    image:       PLACEHOLDER_IMG,
    id:          interview?.candidateId || "—",
    name:        interview?.candidateName || "—",
    cvName:      "—",
    cvUrl:       "#",
    profileLink: "#",
    history:     "—",
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
              </div>

              {/* ── Right panel: candidate card ── */}
              <CandidateCard candidate={displayCandidate} />
            </div>

            {/* ── Evaluation form with live scorecard fields ── */}
            <EvaluationForm
              onSubmitSuccess={() => navigate("/interviewer/completed-interviews")}
              scheduledId={interview.scheduledId}
              scorecardId={scorecardId}
              scorecardName={scorecardName}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleView;