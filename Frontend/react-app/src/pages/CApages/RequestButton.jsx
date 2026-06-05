import { useState } from "react";
import InterviewRequestPopup from "../../components/CompanyPages/InterviewRequestPopup";


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