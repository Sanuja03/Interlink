const StatsCard = ({ value, label }) => {
  return (
    <div className="bg-[#0F4C5C] text-white p-4 rounded-lg text-center">
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
};

export default StatsCard;