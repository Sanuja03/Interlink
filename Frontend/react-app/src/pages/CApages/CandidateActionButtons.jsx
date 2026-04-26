import FinalizedPanelButton from "./FinalizedPanelButton";

/**
 * CandidateActionButtons
 *
 * The "Request / Status" button calls onOpenRequest (handleOpenForCandidate
 * in ShortlistedCandidates) which checks /current and opens either the
 * Request popup or Status popup with the candidate passed correctly.
 *
 * StatusButton removed — its logic is owned by ShortlistedCandidates.
 */
const CandidateActionButtons = ({
  candidate,
  interviewDetails,
  acceptedInterviewers,
  scorecards,
  onOpenRequest,
  onSendDetails,
}) => {
  return (
    <div className="sc-action-group">
      <button className="sc-request-btn" onClick={onOpenRequest}>
        Request / Status
      </button>

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