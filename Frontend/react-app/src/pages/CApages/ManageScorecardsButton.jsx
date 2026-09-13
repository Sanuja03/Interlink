import { useState } from "react";
import ScorecardManager from "../../components/CompanyPages/ScorecardManager";


const ManageScorecardsButton = ({
  jobTitle = "",
  jobPostId = "",
  jobId = null,
  scorecards = [],
  onSave,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sc-template-btn" onClick={() => setOpen(true)}>
        Manage Scorecards
        {scorecards.length > 0 && (
          <span className="sc-template-count">{scorecards.length}</span>
        )}
      </button>
      

      <ScorecardManager
        open={open}
        onClose={() => setOpen(false)}
        jobTitle={jobTitle}
        jobPostId={jobPostId}
        jobId={jobId}
        scorecards={scorecards}
        onSave={onSave}
      />
    </>
  );
};

export default ManageScorecardsButton;