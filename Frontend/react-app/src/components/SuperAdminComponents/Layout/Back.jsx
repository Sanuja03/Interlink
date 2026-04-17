import { useNavigate } from "react-router-dom";

export default function BackButton({
  label = "Back",
  to = -1,
  className = "",
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof to === "number") {
      navigate(to);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-medium 
                  text-[#24698B] hover:text-[#1e5873]
                  transition group ${className}`}
    >
      <span className="text-base transform group-hover:-translate-x-1 transition">
        ←
      </span>
      {label}
    </button>
  );
}