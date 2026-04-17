import "./Card.css";

const Card = ({ title, value, icon, variant }) => {
  return (
    <div className={`dashboard-card ${variant ? `card-${variant}` : ""}`}>
      <p className="card-title">{title}</p>

      {icon && (
        <img
          src={icon}
          alt={`${title} icon`}
          className="card-icon"
        />
      )}

      <h2 className="card-value">{value}</h2>
    </div>
  );
};

export default Card;
