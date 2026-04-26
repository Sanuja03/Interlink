import { useState } from "react";
import CreateEvaluationTemplate from "./CreateEvaluationTemplate";
import "./ScorecardManager.css";

/**
 * ScorecardManager
 *
 * Props:
 *  - open        : boolean — controls visibility
 *  - onClose     : () => void
 *  - jobTitle    : string
 *  - jobPostId   : string
 *  - scorecards  : array  — [{ id, name, fields:[{id,label,maxScore}], finalized }]
 *  - onSave      : (updatedList) => void — persist the full list to parent state
 */
const ScorecardManager = ({
  open,
  onClose,
  jobTitle = "",
  jobPostId = "",
  scorecards = [],
  onSave,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // null = create new

  if (!open) return null;

  /* ---- CRUD helpers ---- */

  const handleCreateNew = () => {
    setEditingCard(null);
    setEditorOpen(true);
  };

  const handleEdit = (card) => {
    if (card.finalized) return; // can't edit finalized cards
    setEditingCard(card);
    setEditorOpen(true);
  };

  const handleDelete = (id) => {
    const card = scorecards.find((c) => c.id === id);
    if (card?.finalized) return;
    if (!window.confirm("Are you sure you want to delete this scorecard template?")) return;
    const updated = scorecards.filter((c) => c.id !== id);
    onSave(updated);
  };

  const handleFinalize = (id) => {
    if (!window.confirm("Finalizing locks this template from editing. Continue?")) return;
    const updated = scorecards.map((c) =>
      c.id === id ? { ...c, finalized: true } : c
    );
    onSave(updated);
  };

  const handleSaveTemplate = (templateData) => {
    let updated;
    if (editingCard) {
      // editing existing
      updated = scorecards.map((c) =>
        c.id === editingCard.id ? { ...editingCard, ...templateData } : c
      );
    } else {
      // creating new
      const newCard = {
        id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...templateData,
        finalized: false,
      };
      updated = [...scorecards, newCard];
    }
    onSave(updated);
    setEditorOpen(false);
    setEditingCard(null);
  };

  return (
    <>
      <div className="scm-overlay" onClick={onClose}>
        <div className="scm-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="scm-header">
            <div>
              <h2 className="scm-title">Scorecard Templates</h2>
              <p className="scm-subtitle">
                {jobTitle} &nbsp;·&nbsp; {jobPostId}
              </p>
            </div>
            <button className="scm-create-btn" onClick={handleCreateNew}>
              + New Template
            </button>
          </div>

          {/* List */}
          <div className="scm-list">
            {scorecards.length === 0 && (
              <div className="scm-empty">
                <p>No scorecard templates yet.</p>
                <p>Click <strong>+ New Template</strong> to create one.</p>
              </div>
            )}

            {scorecards.map((card) => (
              <div
                key={card.id}
                className={`scm-card ${card.finalized ? "scm-card-finalized" : ""}`}
              >
                <div className="scm-card-info">
                  <h3 className="scm-card-name">
                    {card.name}
                    {card.finalized && (
                      <span className="scm-finalized-badge">Finalized</span>
                    )}
                  </h3>
                  <p className="scm-card-meta">
                    {card.fields.length} field{card.fields.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                    Max total: {card.fields.reduce((s, f) => s + Number(f.maxScore || 0), 0)} pts
                  </p>

                  <div className="scm-card-fields-preview">
                    {card.fields.map((f) => (
                      <span key={f.id} className="scm-field-chip">
                        {f.label || "Untitled"} ({f.maxScore})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="scm-card-actions">
                  {!card.finalized && (
                    <>
                      <button
                        className="scm-action-btn scm-edit-btn"
                        onClick={() => handleEdit(card)}
                      >
                        Edit
                      </button>
                      <button
                        className="scm-action-btn scm-finalize-btn"
                        onClick={() => handleFinalize(card.id)}
                      >
                        Finalize
                      </button>
                      <button
                        className="scm-action-btn scm-delete-btn"
                        onClick={() => handleDelete(card.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {card.finalized && (
                    <button
                      className="scm-action-btn scm-view-btn"
                      onClick={() => handleEdit({ ...card })} // opens read-only
                      title="View only — finalized templates cannot be edited"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Close */}
          <div className="scm-footer">
            <button className="scm-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Editor popup on top */}
      {editorOpen && (
        <CreateEvaluationTemplate
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditingCard(null);
          }}
          initialData={editingCard}
          readOnly={editingCard?.finalized || false}
          onSaveTemplate={handleSaveTemplate}
        />
      )}
    </>
  );
};

export default ScorecardManager;