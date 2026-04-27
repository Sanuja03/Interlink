import { useState } from "react";
import FinalizedPanelPopup from "../../components/CompanyPages/FinalizedPanelPopup";


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