/**
 * CandidateActionButtons
 *
 * Props:
 *   onOpenRequest   : () => void   — opens Request/Status popup (pending state)
 *   onOpenFinalized : () => void   — opens view-only Finalized Panel popup
 *   isFinalized     : boolean      — true once "Send Scheduled Interview Details" succeeded
 */
const CandidateActionButtons = ({ onOpenRequest, onOpenFinalized, isFinalized = false }) => {
  if (isFinalized) {
    return (
      <div className="sc-action-group">
        {/* Greyed disabled Request/Status */}
        <button
          className="sc-request-btn"
          disabled
          style={{ opacity: 0.35, cursor: "not-allowed", pointerEvents: "none" }}
        >
          Request / Status
        </button>

        {/* Green Finalized button */}
        <button
          className="sc-request-btn"
          onClick={onOpenFinalized}
          style={{
            marginLeft: 8,
            background: "#166534",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✓ Finalized
        </button>
      </div>
    );
  }

  return (
    <div className="sc-action-group">
      <button className="sc-request-btn" onClick={onOpenRequest}>
        Request / Status
      </button>
    </div>
  );
};

export default CandidateActionButtons;