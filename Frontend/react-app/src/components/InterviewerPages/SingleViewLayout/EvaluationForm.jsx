import { useState } from "react";
import "./EvaluationForm.css";

const template = {
  dynamicFields: [
    { id: 1, label: "Technical Skills", maxScore: 10 },
    { id: 2, label: "Communication", maxScore: 10 },
    { id: 3, label: "Problem Solving", maxScore: 10 },
  ],
};

const EvaluationForm = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="evaluation-card">
      <h2 className="evaluation-title">Candidate Evaluation Form</h2>

      <div className="evaluation-grid">
        {template.dynamicFields.map((field) => (
          <input
            key={field.id}
            type="number"
            min="0"
            max={field.maxScore}
            className="evaluation-input"
            placeholder={`${field.label} (0-${field.maxScore})`}
          />
        ))}

        <textarea
          className="evaluation-textarea"
          placeholder="Comments"
        />

        <select className="evaluation-input">
          <option value="">Recommendation</option>
          <option>Strong Hire</option>
          <option>Hire</option>
          <option>Hold</option>
          <option>Reject</option>
        </select>
      </div>

      <div className="evaluation-actions">
        <button className="evaluation-draft">Save Draft</button>

        <button
          className={`evaluation-submit ${submitted ? "disabled" : ""}`}
          onClick={() => setSubmitted(true)}
          disabled={submitted}
        >
          {submitted ? "Submitted" : "Submit Evaluation"}
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;