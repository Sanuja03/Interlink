import { useState, useEffect } from "react";
import { GRADE_BANDS } from "./ScorecardUtils";
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


  useEffect(() => {
    if (initialData) {
      setTemplateName(initialData.name || "");
      setFields(initialData.fields || []);
    } else {
      setTemplateName("Default Evaluation Form");
      setFields([
        { id: 1, label: "Technical Skills", maxScore: 10 },
        { id: 2, label: "Communication", maxScore: 10 },
      ]);
    }
  }, [initialData]);

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
  };

  const handleSave = () => {
    //validations
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
              {GRADE_BANDS.map((band, index) => {
                const upper = index === 0 ? 100 : GRADE_BANDS[index - 1].min - 1;
                return (
                  <span
                    key={band.label}
                    className="cet-band"
                    style={{ background: band.color }}
                  >
                    {band.min}–{upper}% {band.label}
                  </span>
                );
              })}
            </div>
            <p className="cet-formula">
              Score = ( Σ field scores ) / ( Σ max scores ) × 100
            </p>
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