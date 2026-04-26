import { useState } from "react";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";

/**
 * FinalizedPanelButton
 *
 * Self-contained component: renders the trigger button and manages
 * its own popup open/close state internally.
 *
 * Props:
 *  - interviewDetails     : object
 *  - acceptedInterviewers : array
 *  - scorecards           : array — passed down from page so the dropdown works
 *  - onSendDetails        : (payload) => void
 */
const FinalizedPanelButton = ({
  interviewDetails = {},
  acceptedInterviewers = [],
  scorecards = [],
  onSendDetails,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sc-final-btn" onClick={() => setOpen(true)}>
        Finalized Panel
      </button>

      <FinalizedPanelPopup
        open={open}
        onClose={() => setOpen(false)}
        interviewDetails={interviewDetails}
        acceptedInterviewers={acceptedInterviewers}
        scorecards={scorecards}
        onSendDetails={onSendDetails}
      />
    </>
  );
};

export default FinalizedPanelButton;