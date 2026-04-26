import { useState } from "react";
import ScorecardManager from "../../components/CompanyPages/ScoreCardManager";

/**
 * ManageScorecardsButton
 *
 * Self-contained component: renders the trigger button and manages
 * its own popup open/close state internally.
 *
 * Props:
 *  - jobTitle    : string
 *  - jobPostId   : string
 *  - scorecards  : array  — lifted state from page
 *  - onSave      : (updatedList) => void — callback to update page state
 */
const ManageScorecardsButton = ({
  jobTitle = "",
  jobPostId = "",
  scorecards = [],
  onSave,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sc-template-btn" onClick={() => setOpen(true)}>
        📋 Manage Scorecards
        {scorecards.length > 0 && (
          <span className="sc-template-count">{scorecards.length}</span>
        )}
      </button>

      <ScorecardManager
        open={open}
        onClose={() => setOpen(false)}
        jobTitle={jobTitle}
        jobPostId={jobPostId}
        scorecards={scorecards}
        onSave={onSave}
      />
    </>
  );
};

export default ManageScorecardsButton;