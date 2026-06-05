import { useState, useRef } from "react";

export default function TicketSearch({ onSearch }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) return;
    setQuery(value);
    if (typeof onSearch === "function") onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    if (typeof onSearch === "function") onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={`
        flex items-center flex-1 min-w-[220px] max-w-[480px]
        gap-2 px-3 h-[40px] rounded-[10px]
        border-[1.5px] transition-all duration-200
        ${query ? "bg-white border-[#14597A]" : "bg-[#F4F8FA] border-transparent"}
        focus-within:bg-white focus-within:border-[#14597A]
      `}
    >
      {/* Search icon */}
      <svg
        className="w-[15px] h-[15px] text-[#14597A] opacity-50 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search tickets..."
        autoComplete="off"
        className="
          flex-1 bg-transparent border-none outline-none
          text-sm text-[#0C3E56] placeholder:text-[#8AAFC4]
          font-medium caret-[#14597A]
        "
      />

      {/* Clear button */}
      {query.length > 0 && (
        <button
          onClick={handleClear}
          title="Clear"
          className="
            shrink-0 flex items-center justify-center
            text-[#8AAFC4] hover:text-[#0C3E56]
            transition-colors duration-150
          "
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}