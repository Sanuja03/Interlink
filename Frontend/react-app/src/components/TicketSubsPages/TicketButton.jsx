export default function TicketButton({
    children,
    onClick,
    variant = "primary",
  }) {
    
    const base =
  "px-4 py-1.5 rounded-lg text-sm font-normal transition-all duration-200";
  
    const variants = {
      primary:
        "bg-[#0C3E56] text-white hover:bg-[#14597A]",
  
      danger:
        "bg-red-500 text-white hover:bg-red-600",
  
      subtle:
        "bg-gray-100 text-gray-600 hover:bg-gray-200",
        
        success: "bg-[#2E9E5B] text-white hover:bg-[#25894e]",

    };
  
    return (
<button
  onClick={onClick}
  className={`${base} ${variants[variant]}`}
  style={{
    fontFamily: "Poppins, sans-serif",
    border: "none",
    outline: "none",
    boxShadow: "none"
  }}
>
  {children}
</button>
    );
  }