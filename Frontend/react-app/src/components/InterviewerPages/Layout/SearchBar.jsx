//when user types onchange  called and when button clicked on search will be called from the parent
const SearchBar = ({ onChange, onSearch }) => {
    return (

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search candidate, job, ID..."
          onChange={(e) => onChange && onChange(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-[#DADEE0] bg-white shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[#24698B]"
        />
  
        <button
          onClick={onSearch}
          className="w-12 h-12 rounded-full bg-[#24698B] text-white shadow flex items-center justify-center hover:bg-[#1e5873] transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    );
  };
  
  export default SearchBar;