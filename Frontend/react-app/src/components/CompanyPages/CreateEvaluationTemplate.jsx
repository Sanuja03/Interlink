import { useState } from "react";
import "./CreateEvaluationTemplate.css";

const CreateEvaluationTemplate = () => {
  const [templateName, setTemplateName] = useState("Default Evaluation Form");
  const [fields, setFields] = useState([
    { id: 1, label: "Technical Skills", maxScore: 10 },
    { id: 2, label: "Communication", maxScore: 10 },
  ]);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        label: "",
        maxScore: 10,
      },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const deleteField = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleSaveTemplate = () => {
    const template = {
      templateName,
      dynamicFields: fields,
      fixedFields: ["comments", "recommendation"],
    };

    console.log("Saved Template:", template);
    alert("Evaluation template saved successfully!");
  };

  return (
    <div className="template-page">
      <div className="template-card">
        <h1 className="template-title">Create Evaluation Template</h1>

        <div className="template-group">
          <label className="template-label">Template Name</label>
          <input
            type="text"
            className="template-input"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>

        <div className="template-section">
          <div className="template-section-top">
            <h2 className="template-subtitle">Custom Evaluation Fields</h2>
            <button className="template-add-btn" onClick={addField}>
              + Add Field
            </button>
          </div>

          {fields.map((field, index) => (
            <div className="template-field-row" key={field.id}>
              <input
                type="text"
                className="template-input"
                placeholder={`Field ${index + 1} Name`}
                value={field.label}
                onChange={(e) =>
                  updateField(field.id, "label", e.target.value)
                }
              />

              <input
                type="number"
                min="1"
                className="template-input score-input"
                placeholder="Max Score"
                value={field.maxScore}
                onChange={(e) =>
                  updateField(field.id, "maxScore", e.target.value)
                }
              />

              <button
                className="template-delete-btn"
                onClick={() => deleteField(field.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="template-section">
          <h2 className="template-subtitle">Always Included Fields</h2>

          <div className="fixed-field-box">Comments</div>
          <div className="fixed-field-box">Recommendation</div>
        </div>

        <div className="template-section">
          <h2 className="template-subtitle">Live Preview</h2>

          <div className="preview-box">
            {fields.map((field) => (
              <input
                key={field.id}
                type="number"
                disabled
                className="template-input preview-input"
                placeholder={`${field.label || "Untitled Field"} (0-${
                  field.maxScore || 10
                })`}
              />
            ))}

            <textarea
              disabled
              className="template-textarea"
              placeholder="Comments"
            />

            <select disabled className="template-input preview-input">
              <option>Recommendation</option>
              <option>Strong Hire</option>
              <option>Hire</option>
              <option>Hold</option>
              <option>Reject</option>
            </select>
          </div>
        </div>

        <div className="template-actions">
          <button className="template-save-btn" onClick={handleSaveTemplate}>
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvaluationTemplate;