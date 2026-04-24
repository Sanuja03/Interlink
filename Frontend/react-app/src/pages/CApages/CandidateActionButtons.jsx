import RequestButton from "./RequestButton";
import StatusButton from "./StatusButton";
import FinalizedPanelButton from "./FinalizedPanelButton";

/**
 * CandidateActionButtons
 *
 * Groups the Request, Status, and Finalized Panel buttons
 * for a single candidate table row. Each button manages its own popup.
 *
 * Props:
 *  - candidate            : object — candidate data
 *  - interviewDetails     : object — interview info for finalized popup
 *  - acceptedInterviewers : array  — accepted interviewers for finalized popup
 *  - scorecards           : array  — scorecard templates (for finalized popup dropdown)
 *  - interviewers         : array  — all interviewers (for status popup)
 *  - panelSize            : number — panel size (for status popup)
 *  - onResendRequest      : (id) => void
 *  - onFinalizePanel      : () => void
 *  - onSendDetails        : (payload) => void
 */
const CandidateActionButtons = ({
  candidate,
  interviewDetails,
  acceptedInterviewers,
  scorecards,
  interviewers,
  panelSize,
  onResendRequest,
  onFinalizePanel,
  onSendDetails,
}) => {
  return (
    <div className="sc-action-group">
      <RequestButton candidate={candidate} />

      <StatusButton
        panelSize={panelSize}
        interviewers={interviewers}
        onResendRequest={onResendRequest}
        onFinalizePanel={onFinalizePanel}
      />

      <FinalizedPanelButton
        interviewDetails={interviewDetails}
        acceptedInterviewers={acceptedInterviewers}
        scorecards={scorecards}
        onSendDetails={onSendDetails}
      />
    </div>
  );
};

export default CandidateActionButtons;