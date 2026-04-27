import { useState, useEffect, useMemo } from "react";
import { calculateScore } from "./scorecardUtils";
import "./CreateEvaluationTemplate.css";



const CreateEvaluationTemplate = ({
  open,
  onClose,
  initialData = null,
  readOnly = false,
  onSaveTemplate,
}) => {
  const [templateName, setTemplateName] = useState("Default Evaluation Form");
  const [fields, setFields] = useState([
    { id: 1, label: "Technical Skills", maxScore: 10 },
    { id: 2, label: "Communication", maxScore: 10 },
  ]);


  const [previewScores, setPreviewScores] = useState({});


  useEffect(() => {
    if (initialData) {
      setTemplateName(initialData.name || "");
      setFields(initialData.fields || []);
      setPreviewScores({});
    } else {
      setTemplateName("Default Evaluation Form");
      setFields([
        { id: 1, label: "Technical Skills", maxScore: 10 },
        { id: 2, label: "Communication", maxScore: 10 },
      ]);
      setPreviewScores({});
    }
  }, [initialData]);

 
  const previewResult = useMemo(() => {
    const fieldScores = fields.map((f) => ({
      score: previewScores[f.id] || 0,
      maxScore: f.maxScore,
    }));
    return calculateScore(fieldScores);
  }, [fields, previewScores]);

  if (!open) return null;

 
  const addField = () => {
    if (readOnly) return;
    setFields([
      ...fields,
      { id: Date.now(), label: "", maxScore: 10 },
    ]);
  };

  const updateField = (id, key, value) => {
    if (readOnly) return;
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: key === "maxScore" ? Number(value) || 0 : value } : field
      )
    );
  };

  const deleteField = (id) => {
    if (readOnly) return;
    setFields((prev) => prev.filter((field) => field.id !== id));
    setPreviewScores((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handlePreviewScore = (fieldId, value) => {
    const field = fields.find((f) => f.id === fieldId);
    const max = field ? Number(field.maxScore) || 0 : 0;
    let num = Number(value) || 0;
    if (num < 0) num = 0;
    if (num > max) num = max;
    setPreviewScores((prev) => ({ ...prev, [fieldId]: num }));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.");
      return;
    }
    if (fields.length === 0) {
      alert("Add at least one evaluation field.");
      return;
    }
    const emptyLabel = fields.find((f) => !f.label.trim());
    if (emptyLabel) {
      alert("All fields must have a label name.");
      return;
    }
    onSaveTemplate({ name: templateName, fields });
  };

  return (
    <div className="cet-overlay" onClick={onClose}>
      <div className="cet-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="cet-title">
          {readOnly ? "View Template" : initialData ? "Edit Template" : "Create Evaluation Template"}
        </h2>

        {/* Template name */}
        <div className="cet-group">
          <label className="cet-label">Template Name</label>
          <input
            type="text"
            className="cet-input"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            disabled={readOnly}
          />
        </div>

        {/* Dynamic fields */}
        <div className="cet-section">
          <div className="cet-section-top">
            <h3 className="cet-subtitle">Evaluation Criteria</h3>
            {!readOnly && (
              <button className="cet-add-btn" onClick={addField}>
                + Add Field
              </button>
            )}
          </div>

          {fields.length === 0 && (
            <p className="cet-empty-note">No fields added yet.</p>
          )}

          {fields.map((field, index) => (
            <div className="cet-field-row" key={field.id}>
              <span className="cet-field-num">{index + 1}</span>

              <input
                type="text"
                className="cet-input cet-field-name-input"
                placeholder={`Field ${index + 1} Name`}
                value={field.label}
                onChange={(e) => updateField(field.id, "label", e.target.value)}
                disabled={readOnly}
              />

              <div className="cet-max-score-wrap">
                <label className="cet-max-label">Max</label>
                <input
                  type="number"
                  min="1"
                  className="cet-input cet-score-input"
                  value={field.maxScore}
                  onChange={(e) => updateField(field.id, "maxScore", e.target.value)}
                  disabled={readOnly}
                />
              </div>

              {!readOnly && (
                <button
                  className="cet-delete-btn"
                  onClick={() => deleteField(field.id)}
                  title="Remove field"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Fixed fields */}
        <div className="cet-section">
          <h3 className="cet-subtitle">Always Included</h3>
          <div className="cet-fixed-fields">
            <span className="cet-fixed-chip">Comments</span>
            <span className="cet-fixed-chip">Recommendation</span>
          </div>
        </div>

        {/* Scoring formula explanation */}
        <div className="cet-section">
          <h3 className="cet-subtitle">Scoring System</h3>
          <div className="cet-scoring-info">
            <p>
              <strong>Weighted Percentage</strong> — Each field's score is divided by its max,
              then combined into an overall percentage (0–100%).
            </p>
            <div className="cet-grade-bands">
              <span className="cet-band cet-band-strong">90–100% Strong Hire</span>
              <span className="cet-band cet-band-hire">75–89% Hire</span>
              <span className="cet-band cet-band-hold">60–74% Hold</span>
              <span className="cet-band cet-band-reject">0–59% Reject</span>
            </div>
            <p className="cet-formula">
              Score = ( Σ field scores ) / ( Σ max scores ) × 100
            </p>
          </div>
        </div>

        {/* Live preview */}
        <div className="cet-section">
          <h3 className="cet-subtitle">Live Preview</h3>
          <div className="cet-preview-box">
            {fields.map((field) => (
              <div key={field.id} className="cet-preview-field">
                <label className="cet-preview-label">
                  {field.label || "Untitled Field"}
                  <span className="cet-preview-max"> / {field.maxScore || 0}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={field.maxScore || 0}
                  className="cet-input cet-preview-input"
                  placeholder="0"
                  value={previewScores[field.id] || ""}
                  onChange={(e) => handlePreviewScore(field.id, e.target.value)}
                />
              </div>
            ))}

            <textarea
              disabled
              className="cet-textarea"
              placeholder="Comments"
            />

            <select disabled className="cet-input cet-preview-select">
              <option>Recommendation</option>
              <option>Strong Hire</option>
              <option>Hire</option>
              <option>Hold</option>
              <option>Reject</option>
            </select>

            {/* Score result */}
            {fields.length > 0 && (
              <div className="cet-preview-result">
                <div className="cet-result-bar-track">
                  <div
                    className="cet-result-bar-fill"
                    style={{
                      width: `${previewResult.percentage}%`,
                      backgroundColor: previewResult.grade.color,
                    }}
                  />
                </div>
                <div className="cet-result-row">
                  <span className="cet-result-pct" style={{ color: previewResult.grade.color }}>
                    {previewResult.percentage}%
                  </span>
                  <span className="cet-result-detail">
                    {previewResult.totalScore} / {previewResult.totalMax} pts
                  </span>
                  <span
                    className="cet-result-grade"
                    style={{ backgroundColor: previewResult.grade.color }}
                  >
                    {previewResult.grade.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="cet-actions">
          {!readOnly && (
            <button className="cet-save-btn" onClick={handleSave}>
              {initialData ? "Update Template" : "Save Template"}
            </button>
          )}
          <button className="cet-cancel-btn" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvaluationTemplate;