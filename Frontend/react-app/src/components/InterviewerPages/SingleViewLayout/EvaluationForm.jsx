import { useEffect, useState, useMemo } from "react";
import "./EvaluationForm.css";

import { supabase } from "../../../lib/supabase";
import { calculateScore } from "../../CompanyPages/ScorecardUtils";

const EvaluationForm = ({
  scheduledId,
  scorecardId,
  scorecardName,
  fields = [],
  initialSubmission = null,
  initialScores = {},
  loading = false,
  onSubmitSuccess,
}) => {
  // ── Form state (initialised from props, then user-controlled) ──
  const [scores, setScores]             = useState({});
  const [comments, setComments]         = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [isSubmitted, setIsSubmitted]   = useState(false);

  // ── UI state (saving/error/messages stay local) ──
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

 
  useEffect(() => {
    setScores(initialScores || {});
  }, [initialScores]);

  useEffect(() => {
    if (initialSubmission) {
      setSubmissionId(initialSubmission.score_submission_id);
      setComments(initialSubmission.overall_comments || "");
      setIsSubmitted(initialSubmission.is_submitted || false);
    } else {
      setSubmissionId(null);
      setComments("");
      setIsSubmitted(false);
    }
  }, [initialSubmission]);

  // Auto-calculate recommendation from current scores
  const scoreResult = useMemo(() => {
    const fieldScores = fields.map((f) => ({
      score:    Number(scores[f.scorecard_field_id] || 0),
      maxScore: Number(f.max_score),
    }));
    return calculateScore(fieldScores);
  }, [fields, scores]);

  const handleSave = async (submit = false) => {
    if (isSubmitted) return;
    setSaving(true);
    setSaveMessage("");
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated."); return; }

      const autoRecommendation = scoreResult.grade.label;
      let currentSubmissionId = submissionId;

      // insert or update submission row
      if (currentSubmissionId) {
        const { error: updateError } = await supabase
          .from("interviewer_score_submissions")
          .update({
            overall_comments:     comments,
            final_recommendation: autoRecommendation,
            is_submitted:         submit,
            submitted_at:         submit ? new Date().toISOString() : null,
            updated_at:           new Date().toISOString(),
          })
          .eq("score_submission_id", currentSubmissionId);
        if (updateError) throw updateError;

      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("interviewer_score_submissions")
          .insert({
            scheduled_id:         scheduledId,
            interviewer_user_id:  user.id,
            overall_comments:     comments,
            final_recommendation: autoRecommendation,
            is_submitted:         submit,
            submitted_at:         submit ? new Date().toISOString() : null,
          })
          .select("score_submission_id")
          .single();
        if (insertError) throw insertError;
        currentSubmissionId = inserted.score_submission_id;
        setSubmissionId(currentSubmissionId);
      }

      // delete old field values, then insert fresh ones
      await supabase
        .from("interviewer_score_field_values")
        .delete()
        .eq("score_submission_id", currentSubmissionId);

      const fieldValueRows = fields.map((field) => ({
        score_submission_id: currentSubmissionId,
        scorecard_field_id:  field.scorecard_field_id,
        score_given:         Number(scores[field.scorecard_field_id] || 0),
      }));

      if (fieldValueRows.length > 0) {
        const { error: valError } = await supabase
          .from("interviewer_score_field_values")
          .insert(fieldValueRows);
        if (valError) throw valError;
      }

      // On final submit: only mark interview_scheduled as completed
      // when ALL accepted panel members have submitted their evaluation.
      if (submit) {
        // 1. Get the request_id for this scheduled interview
        const { data: schedRow, error: schedFetchError } = await supabase
          .from("interview_scheduled")
          .select("request_id")
          .eq("scheduled_id", scheduledId)
          .single();

        if (schedFetchError) {
          console.warn("[EvaluationForm] request_id fetch warning:", schedFetchError);
        }

        if (schedRow?.request_id) {
          // 2. Count how many interviewers accepted this request
          const { count: acceptedCount, error: acceptedError } = await supabase
            .from("interview_request_interviewers")
            .select("*", { count: "exact", head: true })
            .eq("request_id", schedRow.request_id)
            .eq("response_status", "accepted");

          if (acceptedError) {
            console.warn("[EvaluationForm] accepted count warning:", acceptedError);
          }

          // 3. Count how many of them have now submitted (including this one just saved above)
          const { count: submittedCount, error: submittedError } = await supabase
            .from("interviewer_score_submissions")
            .select("*", { count: "exact", head: true })
            .eq("scheduled_id", scheduledId)
            .eq("is_submitted", true);

          if (submittedError) {
            console.warn("[EvaluationForm] submitted count warning:", submittedError);
          }

          // 4. Only flip to completed when every accepted panelist has submitted
          if (
            acceptedCount != null &&
            submittedCount != null &&
            submittedCount >= acceptedCount
          ) {
            const { error: statusError } = await supabase
              .from("interview_scheduled")
              .update({ status: "completed", updated_at: new Date().toISOString() })
              .eq("scheduled_id", scheduledId);

            if (statusError) {
              console.warn("[EvaluationForm] status update warning:", statusError);
            }
          }
        }

        setIsSubmitted(true);
        setSaveMessage("Evaluation submitted successfully.");

        if (onSubmitSuccess) {
          setTimeout(() => onSubmitSuccess(), 1500);
        }
      } else {
        setSaveMessage("Draft saved.");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      console.error("[EvaluationForm] save error:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Empty/loading states ──
  if (!scorecardId && !loading) {
    return (
      <div className="evaluation-card">
        <h2 className="evaluation-title">Candidate Evaluation Form</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          No scorecard has been assigned to this interview yet.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="evaluation-card">
        <h2 className="evaluation-title">Candidate Evaluation Form</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading evaluation form...</p>
      </div>
    );
  }

  return (
    <div className="evaluation-card">
      <h2 className="evaluation-title">
        Candidate Evaluation Form
        {scorecardName && (
          <span className="evaluation-scorecard-name"> - {scorecardName}</span>
        )}
      </h2>

      {isSubmitted && (
        <div className="evaluation-submitted-banner">
          ✓ Evaluation submitted
        </div>
      )}

      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
      )}

      <div className="evaluation-grid">
        {fields.map((field) => (
          <div key={field.scorecard_field_id} className="evaluation-field-wrap">
            <label className="evaluation-field-label">
              {field.field_label}
              <span className="evaluation-field-max"> (max {field.max_score})</span>
            </label>

            <input
              type="number"
              min="0"
              max={field.max_score}
              className="evaluation-input"
              placeholder={`0 – ${field.max_score}`}
              value={scores[field.scorecard_field_id] ?? ""}
              disabled={isSubmitted}
              onChange={(e) => {
                const val = Math.min(
                  Number(field.max_score),
                  Math.max(0, Number(e.target.value))
                );
                setScores((prev) => ({ ...prev, [field.scorecard_field_id]: val }));
              }}
            />
          </div>
        ))}

        <textarea
          className="evaluation-textarea"
          placeholder="Overall comments..."
          value={comments}
          disabled={isSubmitted}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {/* Auto-calculated score result banner */}
      {fields.length > 0 && (
        <div className="evaluation-score-result">
          <div className="evaluation-score-bar-track">
            <div
              className="evaluation-score-bar-fill"
              style={{
                width: `${scoreResult.percentage}%`,
                backgroundColor: scoreResult.grade.color,
              }}
            />
          </div>
          <div className="evaluation-score-row">
            <span className="evaluation-score-pct" style={{ color: scoreResult.grade.color }}>
              {scoreResult.percentage}%
            </span>
            <span className="evaluation-score-detail">
              {scoreResult.totalScore} / {scoreResult.totalMax} pts
            </span>
            <span
              className="evaluation-score-badge"
              style={{ backgroundColor: scoreResult.grade.color }}
            >
              {scoreResult.grade.label}
            </span>
          </div>
          <p className="evaluation-score-note">
            Final recommendation is auto-calculated from your scores.
          </p>
        </div>
      )}

      {saveMessage && (
        <p style={{ color: "#15803d", fontSize: "13px", marginTop: "8px" }}>{saveMessage}</p>
      )}

      {!isSubmitted && (
        <div className="evaluation-actions">
          <button
            className="evaluation-draft"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            className="evaluation-submit"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            Submit Evaluation
          </button>
        </div>
      )}
    </div>
  );
};

export default EvaluationForm;