import { useState } from "react";
import api from "../../lib/api";
import CreateEvaluationTemplate from "./CreateEvaluationTemplate";
import "./ScorecardManager.css";


const ScorecardManager = ({
  open,
  onClose,
  jobTitle = "",
  jobPostId = "",
  jobId = null,
  scorecards = [],
  onSave,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  if (!open) return null;

  
  const reload = async () => {
    try {
      const res = await api.get("/company/scorecards", { params: { jobId } });
      onSave(res.data); 
    } catch (err) {
      console.error("[ScorecardManager] reload failed:", err);
    }
  };

 
  const handleCreateNew = () => {
    setEditingCard(null);
    setEditorOpen(true);
  };

  
  const handleEdit = (card) => {
    setEditingCard(card);
    setEditorOpen(true);
  };

 
  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingCard) {
       
        const res = await api.put(`/company/scorecards/${editingCard.id}`, {
          templateName: templateData.name,
          jobId,
          fields: templateData.fields.map((f, i) => ({
            fieldLabel:   f.label,
            maxScore:     f.maxScore,
            displayOrder: i,
          })),
        });
       
        onSave(scorecards.map((c) => (c.id === editingCard.id ? res.data : c)));
      } else {
       
        const res = await api.post("/company/scorecards", {
          templateName: templateData.name,
          jobId,
          fields: templateData.fields.map((f, i) => ({
            fieldLabel:   f.label,
            maxScore:     f.maxScore,
            displayOrder: i,
          })),
        });
        onSave([...scorecards, res.data]);
      }
      setEditorOpen(false);
      setEditingCard(null);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to save scorecard.");
    }
  };

  
  const handleFinalize = async (id) => {
    if (!window.confirm("Finalizing locks this template from editing. Continue?")) return;
    try {
      const res = await api.patch(`/company/scorecards/${id}/finalize`);
      onSave(scorecards.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to finalize.");
    }
  };

 
  const handleDelete = async (id) => {
    const card = scorecards.find((c) => c.id === id);
    if (card?.finalized) return;
    if (!window.confirm("Are you sure you want to delete this scorecard template?")) return;
    try {
      await api.delete(`/company/scorecards/${id}`);
      onSave(scorecards.filter((c) => c.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete.");
    }
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
                      onClick={() => handleEdit({ ...card })}
                      title="View only — finalized templates cannot be edited"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
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