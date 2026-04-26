import { useState } from "react";
import RequestStatusPopup from "../../components/CompanyPages/RequestStatusPopup";

/**
 * StatusButton
 *
 * Self-contained component: renders the trigger button and manages
 * its own popup open/close state internally.
 *
 * Props:
 *  - panelSize        : number
 *  - interviewers     : array
 *  - onResendRequest  : (id) => void
 *  - onFinalizePanel  : () => void
 */
const StatusButton = ({
  panelSize = 2,
  interviewers = [],
  onResendRequest,
  onFinalizePanel,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sc-status-btn" onClick={() => setOpen(true)}>
        Status
      </button>

      <RequestStatusPopup
        open={open}
        onClose={() => setOpen(false)}
        panelSize={panelSize}
        interviewers={interviewers}
        onResendRequest={onResendRequest}
        onFinalizePanel={onFinalizePanel}
      />
    </>
  );
};

export default StatusButton;