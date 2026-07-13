// Reusable card component to display titled information sections
const InfoCard = ({ title, children }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      
      {/* Card title */}
      <h3 className="text-[#0F4C5C] font-semibold mb-3">
        {title}
      </h3>

      {/* Card content */}
      <div className="text-sm text-gray-600">
        {children}
      </div>

    </div>
  );
};

export default InfoCard;