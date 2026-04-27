import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { calculateScore } from "../../CompanyPages/ScorecardUtils";
import "./EvaluationForm.css";


const EvaluationForm = ({ scheduledId, scorecardId, scorecardName, onSubmitSuccess }) => {
  const [fields, setFields]               = useState([]);
  const [scores, setScores]               = useState({});
  const [comments, setComments]           = useState("");
  const [submissionId, setSubmissionId]   = useState(null);
  const [isSubmitted, setIsSubmitted]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);
  const [saveMessage, setSaveMessage]     = useState("");

  useEffect(() => {
    if (scorecardId && scheduledId) {
      loadFormData();
    } else {
      setLoading(false);
    }
  }, [scorecardId, scheduledId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated."); return; }

      // get scorecard fields
      const { data: fieldRows, error: fieldError } = await supabase
        .from("scorecard_template_fields")
        .select("scorecard_field_id, field_label, max_score, display_order")
        .eq("scorecard_template_id", scorecardId)
        .order("display_order", { ascending: true });

      if (fieldError) {
        setError("Failed to load scorecard fields.");
        console.error("[EvaluationForm] fields error:", fieldError);
        return;
      }
      setFields(fieldRows || []);

      // Check for existing draft 
      const { data: existing, error: subError } = await supabase
        .from("interviewer_score_submissions")
        .select("score_submission_id, overall_comments, is_submitted")
        .eq("scheduled_id", scheduledId)
        .eq("interviewer_user_id", user.id)
        .maybeSingle();

      if (subError) console.warn("[EvaluationForm] submission check:", subError);

      if (existing) {
        setSubmissionId(existing.score_submission_id);
        setComments(existing.overall_comments || "");
        setIsSubmitted(existing.is_submitted || false);

        // Load saved field scores
        const { data: valueRows } = await supabase
          .from("interviewer_score_field_values")
          .select("scorecard_field_id, score_given")
          .eq("score_submission_id", existing.score_submission_id);

        const scoreMap = {};
        (valueRows || []).forEach((v) => {
          scoreMap[v.scorecard_field_id] = v.score_given;
        });
        setScores(scoreMap);
      }
    } catch (err) {
      console.error("[EvaluationForm] loadFormData error:", err);
      setError("Failed to load evaluation form.");
    } finally {
      setLoading(false);
    }
  };

const EvaluationForm = () => {
  const [submitted, setSubmitted] = useState(false);
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

      // ── Upsert submission row ──
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

      // Save field values (delete + reinsert) 
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

      // On final submit: mark interview_scheduled as completed
      if (submit) {
        const { error: statusError } = await supabase
          .from("interview_scheduled")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("scheduled_id", scheduledId);

        if (statusError) {
          console.warn("[EvaluationForm] status update warning:", statusError);
        }

        setIsSubmitted(true);
        setSaveMessage("Evaluation submitted successfully.");

        // Notify parent to redirect after short delay
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

  //  No scorecard assigned 
  if (!scorecardId) {
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
          <span className="evaluation-scorecard-name"> — {scorecardName}</span>
        )}
      </h2>

      {isSubmitted && (
        <div className="evaluation-submitted-banner">
          ✓ Evaluation submitted — redirecting to Completed Interviews...
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

      {/* Auto-calculated score result */}
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