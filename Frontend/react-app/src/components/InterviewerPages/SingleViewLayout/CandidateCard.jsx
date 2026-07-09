import "./CandidateCard.css";

// takes candidate object from SingleView.jsx and displays the relevant info in a card format
const CandidateCard = ({ candidate }) => {
  return (
    <div className="candidatecard-right-panel">
      <div className="candidatecard-top">
        <div className="candidatecard-image-wrap">
          <img
            src={candidate.image}
            alt={candidate.name}
            className="candidatecard-image"
          />
        </div>

        <div className="candidatecard-basic">
          <div className="candidatecard-small-box">
            <span className="candidatecard-small-label">Candidate ID</span>
            <span className="candidatecard-small-value">{candidate.id}</span>
          </div>

          <div className="candidatecard-small-box">
            <span className="candidatecard-small-label">Candidate Name</span>
            <span className="candidatecard-small-value">{candidate.name}</span>
          </div>
        </div>
      </div>

      <div className="candidatecard-details-box">
        <p className="candidatecard-detail-line">
          <strong>CV:</strong> {candidate.cvName}
        </p>

        <p className="candidatecard-detail-line">
          <strong>Profile:</strong>{" "}
          <a
            href={candidate.profileLink}
            target="_blank"
            rel="noreferrer"
            className="candidatecard-profile-link"
          >
            View Profile
          </a>
        </p>
      </div>
    </div>
  );
};

export default CandidateCard;