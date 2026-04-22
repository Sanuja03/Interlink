const InfoCard = ({ title, children }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-[#0F4C5C] font-semibold mb-2">{title}</h3>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  );
};

export default InfoCard;