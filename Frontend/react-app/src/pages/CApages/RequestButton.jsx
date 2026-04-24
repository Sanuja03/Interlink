import { useState } from "react";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";

/**
 * RequestButton
 *
 * Self-contained component: renders the trigger button and manages
 * its own popup open/close state internally.
 *
 * Props:
 *  - candidate : object — candidate data to pass to the popup
 */
const RequestButton = ({ candidate }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sc-request-btn" onClick={() => setOpen(true)}>
        Request
      </button>

      <InterviewRequestPopup
        open={open}
        onClose={() => setOpen(false)}
        candidate={candidate}
      />
    </>
  );
};

export default RequestButton;