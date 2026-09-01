import "./CandidateCard.css";

// Compact candidate strip: identity on the left, page actions on the right.
// Actions are passed in as children from SingleView.jsx.
const CandidateCard = ({ candidate, children }) => {
  return (
    <div className="candidatecard-panel">
      <div className="candidatecard-identity">
        <img
          src={candidate.image}
          alt={candidate.name}
          className="candidatecard-image"
        />

        <div className="candidatecard-text">
          <span className="candidatecard-name">{candidate.name}</span>
          <span className="candidatecard-id">ID: {candidate.id}</span>
        </div>
      </div>

      {children && <div className="candidatecard-actions">{children}</div>}
    </div>
  );
};

export default CandidateCard;