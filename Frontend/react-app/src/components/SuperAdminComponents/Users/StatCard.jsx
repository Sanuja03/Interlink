// Reusable card component to display key statistics
const StatsCard = ({ value, label }) => {
  return (
    <div className="bg-[#0F4C5C] text-white p-4 rounded-lg text-center">
      
      {/* Display main value or fallback if null/undefined */}
      <h2 className="text-xl font-bold">
        {value ?? "—"}
      </h2>

      {/* Display label for the statistic */}
      <p className="text-xs opacity-80 mt-1">
        {label}
      </p>

    </div>
  );
};

export default StatsCard;