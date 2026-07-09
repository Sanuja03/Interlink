import "./CandidateActionButtons.css";

const CandidateActionButtons = ({
  onOpenRequest,
  onOpenFinalized,
  isFinalized = false,
}) => {
  if (isFinalized) {
    return (
      <div className="cab-group">
        <button className="cab-btn cab-btn--disabled" disabled>
          Request / Status
        </button>
        <button className="cab-btn cab-btn--finalized" onClick={onOpenFinalized}>
          Finalized
        </button>
      </div>
    );
  }

  return (
    <div className="cab-group">
      <button className="cab-btn cab-btn--primary" onClick={onOpenRequest}>
        Request / Status
      </button>
    </div>
  );
};

export default CandidateActionButtons;