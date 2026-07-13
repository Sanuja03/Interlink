/**
 * SearchFilterBar — shared across Users, Jobs, Companies, Activities pages.
 *
 * FilterConfig types:
 *   { key, label, value, onChange, options }           → <select>
 *   { key, label, value, onChange, type: "date" }      → date input (inline, no label row)
 *   { key, label, value, onChange, type: "tabs", options } → pill tabs (second row)
 */
export default function SearchFilterBar({
  search = "",
  onSearch,
  filters = [],
  onClear,
  placeholder = "Search...",
  actions,
}) {
  const hasActiveFilters =
    search.trim() !== "" || filters.some((f) => f.value && f.value !== "");

  const tabFilters    = filters.filter((f) => f.type === "tabs");
  const inlineFilters = filters.filter((f) => f.type !== "tabs"); // selects + dates together

  return (
    <div className="bg-white rounded-2xl border border-[#DADEE0] shadow-sm p-4 space-y-3">

      {/* ROW 1 — Search + inline filters + clear + actions */}
      <div className="flex items-center gap-2.5 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DADEE0] bg-gray-50
                       text-sm text-gray-700 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#24698B]/30 focus:border-[#24698B]
                       transition-all"
          />
        </div>

        {/* Inline filters — selects and dates side by side, same height */}
        {inlineFilters.map((f) =>
          f.type === "date" ? (
            /* Date: input only, no label — placeholder-style via title attr */
            <div key={f.key} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <input
                type="date"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                title={f.label}
                className="pl-8 pr-3 py-2.5 rounded-xl border border-[#DADEE0] bg-gray-50 text-sm
                           text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#24698B]/30
                           focus:border-[#24698B] transition-all cursor-pointer w-[150px]"
              />
              {/* Floating label above when empty */}
              {!f.value && (
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {f.label}
                </span>
              )}
            </div>
          ) : (
            <select
              key={f.key}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#DADEE0] bg-gray-50 text-sm
                         text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#24698B]/30
                         focus:border-[#24698B] transition-all cursor-pointer"
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )
        )}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200
                       bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100
                       transition-colors whitespace-nowrap"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        )}

        {/* Right-side slot */}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>

      {/* ROW 2 — Tab filters */}
      {tabFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {tabFilters.map((f) =>
            f.options.map((o) => (
              <button
                key={`${f.key}-${o.value}`}
                onClick={() => f.onChange(o.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  f.value === o.value
                    ? "bg-[#24698B] text-white border-[#24698B] shadow-sm"
                    : "bg-white text-gray-500 border-[#DADEE0] hover:border-[#24698B] hover:text-[#24698B]"
                }`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}