/* ============================================================
   StatCard — Modern, responsive metric card with accent palettes
   ============================================================ */

const statThemes = {
  Interviews: {
    color: '#1a6a82',
    iconBg: '#f0f9fb',
    borderHover: '#1a6a82',
    tag: 'Scheduled',
    tagBg: '#e6f4f8',
  },
  Applications: {
    color: '#2563eb',
    iconBg: '#eff6ff',
    borderHover: '#3b82f6',
    tag: 'Submitted',
    tagBg: '#dbeafe',
  },
  Pending: {
    color: '#d97706',
    iconBg: '#fffbeb',
    borderHover: '#f59e0b',
    tag: 'In Review',
    tagBg: '#fef3c7',
  },
  Rejected: {
    color: '#e11d48',
    iconBg: '#fff1f2',
    borderHover: '#f43f5e',
    tag: 'Archived',
    tagBg: '#ffe4e6',
  },
};

const statCardStyles = `
  .stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 18px 20px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    min-width: 140px;
    flex: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card:hover {
    box-shadow: 0 10px 24px -4px rgba(26, 63, 92, 0.1);
    transform: translateY(-2px);
  }

  .stat-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .stat-card__label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin: 0;
  }

  .stat-card__icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.25s ease;
  }

  .stat-card:hover .stat-card__icon {
    transform: scale(1.08);
  }

  .stat-card__bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    width: 100%;
    margin-top: 4px;
  }

  .stat-card__count {
    font-size: 2.1rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-card__tag {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 9999px;
  }
`;

const StatCard = ({ label, count, icon }) => {
  const theme = statThemes[label] || {
    color: '#1a6a82',
    iconBg: '#f0f9fb',
    borderHover: '#1a6a82',
    tag: 'Total',
    tagBg: '#f1f5f9',
  };

  return (
    <>
      <style>{statCardStyles}</style>
      <div
        className="stat-card"
        style={{ '--hover-color': theme.borderHover }}
      >
        <div className="stat-card__top">
          <p className="stat-card__label">{label}</p>
          <div
            className="stat-card__icon"
            style={{ background: theme.iconBg, color: theme.color }}
          >
            {icon}
          </div>
        </div>

        <div className="stat-card__bottom">
          <p className="stat-card__count">{String(count).padStart(2, "0")}</p>
          <span
            className="stat-card__tag"
            style={{ background: theme.tagBg, color: theme.color }}
          >
            {theme.tag}
          </span>
        </div>
      </div>
    </>
  );
};

export default StatCard;
