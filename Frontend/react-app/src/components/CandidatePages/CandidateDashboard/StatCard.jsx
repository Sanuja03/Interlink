/* ============================================================
   StatCard — CSS + JSX in one file
   ============================================================ */

const statCardStyles = `
  .stat-card {
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 18px;
    padding: 18px 20px 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 140px;
    flex: 1;
    box-shadow: 0 2px 8px rgba(26,63,92,0.07);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .stat-card:hover {
    box-shadow: 0 6px 20px rgba(26,63,92,0.13);
    transform: translateY(-2px);
  }

  .stat-card__label {
    font-size: 0.82rem;
    font-weight: 700;
    color: #1a6a82;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin: 0;
  }

  .stat-card__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #e0f4fa 0%, #c8e8f5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a6a82;
    flex-shrink: 0;
    margin: 4px 0 2px;
  }

  .stat-card__count {
    font-size: 2rem;
    font-weight: 800;
    color: #1a3f5c;
    margin: 0;
    line-height: 1.1;
  }
`;

const StatCard = ({ label, count, icon }) => (
  <>
    <style>{statCardStyles}</style>
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__icon">{icon}</div>
      <p className="stat-card__count">{String(count).padStart(2, "0")}</p>
    </div>
  </>
);

export default StatCard;
