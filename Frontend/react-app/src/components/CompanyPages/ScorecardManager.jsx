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
  const [editingCard, setEditingCard] = useState(null);// stores which scorecard the user is currently editing - null means eduting a brand new one 

  if (!open) return null;


 //CREATE NEW
  const handleCreateNew = () => {
    setEditingCard(null);//clear out any previously edited card. We're starting fresh
    setEditorOpen(true);
  };

 //EDIT 
  const handleEdit = (card) => {
    setEditingCard(card);//pre-fill the form with that card's data. The user sees their existing fields and can modify them
    setEditorOpen(true);
  };

 //SAVE TEMPLATE
  const handleSaveTemplate = async (templateData) => {
    try {

      //UPDATE EXISTING TEMPLATE
      if (editingCard) {
       
        //replcae the scorecard of this id with teh below data sent 
        const res = await api.put(`/company/scorecards/${editingCard.id}`, {
          templateName: templateData.name,
          jobId,
          fields: templateData.fields.map((f, i) => ({
            fieldLabel:   f.label,
            maxScore:     f.maxScore,
            displayOrder: i,
          })),
        });
       
        //go through every card in the list and if cards id equals one we edited replae with it 
        onSave(scorecards.map((c) => (c.id === editingCard.id ? res.data : c)));
      } else {

       //CREATE NEW TEMPLATE
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

//FINALIZE TEMPLATE  
  const handleFinalize = async (id) => {
    if (!window.confirm("Finalizing locks this template from editing. Continue?")) return;
    try {
      const res = await api.patch(`/company/scorecards/${id}/finalize`);//HTTP verb for partial updates
      onSave(scorecards.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to finalize.");
    }
  };

 
 //DELETE TEMPLATE 
  const handleDelete = async (id) => {
    const card = scorecards.find((c) => c.id === id);//find teh scorecard
    if (card?.finalized) return;//if its finalized dont delete
    if (!window.confirm("Are you sure you want to delete this scorecard template?")) return;//confirms whtehr to delete
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

            {/*Card*/}
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
                        onClick={() => handleEdit(card)}>
                        Edit
                      </button>

                      <button
                        className="scm-action-btn scm-finalize-btn"
                        onClick={() => handleFinalize(card.id)}>
                        Finalize
                      </button>

                      <button
                        className="scm-action-btn scm-delete-btn"
                        onClick={() => handleDelete(card.id)}>
                        Delete
                      </button>
                    </>

                  )}
                  {card.finalized && (
                    <button
                      className="scm-action-btn scm-view-btn"
                      onClick={() => handleEdit({ ...card })}
                      title="View only — finalized templates cannot be edited">
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