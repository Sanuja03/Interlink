import { useEffect, useRef, useState } from "react";
import api from "../../lib/api";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import TicketModal from "../../components/TicketSubsPages/TicketModal";
import Footer from "../../components/TicketSubsPages/Footer";
import TicketSearch from "../../components/TicketSubsPages/TicketSearch";
import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";

// ── Filter options — values MUST match what the DB stores ─────────────────
const STATUS_OPTS = [
  { value: "OPEN",     label: "Open",     dot: "bg-green-400"  },
  { value: "PENDING",  label: "Pending",  dot: "bg-amber-400"  },
  { value: "RESOLVED", label: "Resolved", dot: "bg-blue-400"   },
  { value: "CLOSED",   label: "Closed",   dot: "bg-slate-400"  },
];

const CATEGORY_OPTS = [
  { value: "GENERAL",   label: "General"         },
  { value: "LOGIN",     label: "Login Issue"     },
  { value: "PAYMENT",   label: "Payment Issue"   },
  { value: "TECHNICAL", label: "Technical Issue" },
];

// ── Reusable custom dropdown filter pill ──────────────────────────────────
function FilterPill({ label, options, value, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null); // for detecting outside clicks

  const selectedOpt = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`
          flex items-center gap-1.5 px-3 h-[36px] rounded-[9px]
          border-[1.5px] text-[13px] font-medium
          transition-all duration-150 whitespace-nowrap
          ${selectedOpt
            ? "border-[#14597A] bg-[#EAF5FB] text-[#0C3E56]"     //selected option inside the box with different styling 
            : "border-[#D6E6F2] bg-white text-[#1C3A4A] hover:border-[#14597A] hover:bg-[#EAF5FB]"  //hover
          }
        `}
      >
        {icon}
        <span>{selectedOpt ? selectedOpt.label : label}</span>
        {selectedOpt && ( // show count badge if there's a selected option
          <span className="ml-1 inline-flex items-center justify-center bg-[#EAF3F8]
            text-[#14597A] text-[11px] font-semibold rounded-[8px] px-1.5 h-[18px]">
            1   
          </span>
        )}
        <svg
          className={`w-[11px] h-[11px] ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} //dropdown arrow animation
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2.5} strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

     
      {open && (     // dropdown menu
        <div className="
          absolute top-[calc(100%+6px)] left-0 z-50
          bg-white rounded-[10px] p-1 min-w-[160px]
          shadow-[0_4px_20px_rgba(12,62,86,0.13),0_0_0_1px_rgba(12,62,86,0.08)]
        ">
          <button  //clear filter button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left flex items-center px-2.5 py-[7px]
              rounded-[7px] text-[13px] text-[#8AAFC4] font-medium
              hover:bg-[#EAF3F8] transition-colors"
          >
            All {label.toLowerCase()}s
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-2.5 py-[7px]
                rounded-[7px] text-[13px] text-[#1C3A4A]
                hover:bg-[#EAF3F8] transition-colors"
            >
              {opt.dot && (
                <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${opt.dot}`} />
              )}
              <span className={opt.value === value ? "font-medium text-[#14597A]" : ""}>
                {opt.label}
              </span>
              {opt.value === value && (    //check mark icon for selected option
                <svg className="ml-auto text-[#14597A]" width="12" height="12"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={3} strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MyTickets() {
  const [tickets,         setTickets]         = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [editingTicket,   setEditingTicket]   = useState(null);
  const [creating,        setCreating]        = useState(false);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [categoryFilter,  setCategoryFilter]  = useState("");
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
      setFilteredTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query, status, category, source = tickets) => {
    let data = [...source];
    if (query.trim()) {
      const lower = query.toLowerCase();    //the text entered in the search box is compared to the title, description and status of each ticket
      data = data.filter((t) =>
        (t.title       || "").toLowerCase().includes(lower) ||
        (t.description || "").toLowerCase().includes(lower) ||
        (t.status      || "").toLowerCase().includes(lower)
      );
    }
    if (status)   data = data.filter((t) => t.status   === status);
    if (category) data = data.filter((t) => t.category === category);
    setFilteredTickets(data);
  };
  // handlers for search input and filter changes — update state and re-apply filters on the original tickets list
  const handleSearch         = (q) => { setSearch(q);        applyFilters(q, statusFilter, categoryFilter); };
  const handleStatusFilter   = (v) => { setStatusFilter(v);  applyFilters(search, v, categoryFilter); };
  const handleCategoryFilter = (v) => { setCategoryFilter(v);applyFilters(search, statusFilter, v); };
  const clearFilters         = ()  => { setStatusFilter(""); setCategoryFilter(""); applyFilters(search, "", ""); };

 const handleDelete = async (id) => {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await api.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  return (
    <div className="tw-preflight flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-grow px-8 py-8">

          {/* ── TOP BAR: title left, button right ── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Manage and track your support requests
              </p>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 bg-[#0C3E56] text-white
                px-5 py-2.5 rounded-xl text-sm font-semibold
                hover:bg-[#14597A] transition"
            >
              + Create Ticket
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200
              text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* ── SEARCH + FILTERS ── */}
          <div className="bg-white border border-[#E4EFF7]
            rounded-2xl px-4 py-3 mb-6 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">

              <TicketSearch onSearch={handleSearch} />
              <div className="w-px h-6 bg-[#D6E6F2] shrink-0" />

              <FilterPill
                label="Status"
                value={statusFilter}
                onChange={handleStatusFilter}
                options={STATUS_OPTS}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                }
              />

              <FilterPill
                label="Category"
                value={categoryFilter}
                onChange={handleCategoryFilter}
                options={CATEGORY_OPTS}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                }
              />

              <span className="ml-auto text-xs text-[#24698B] bg-[#EAF3F8]
                border border-[#B8D8EA] px-2.5 py-0.5 rounded-full font-medium">
                {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? "s" : ""}
              </span>

              {(statusFilter || categoryFilter) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 h-[26px] rounded-full
                    bg-red-50 border-none text-[11.5px] font-semibold text-red-500
                    hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* ── TICKET LIST ── */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm text-center
                text-gray-400 text-sm border border-gray-100">
                Loading your tickets…
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm text-center
                border border-gray-100">
                <p className="text-xl text-gray-500 mb-2">No tickets found.</p>
                <p className="text-sm text-gray-400">
                  {(statusFilter || categoryFilter)
                    ? "Try clearing your filters."
                    : "Click \"+ Create Ticket\" to raise your first ticket."}
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onEdit={() => setEditingTicket(ticket)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        <Footer />
      </div>

      {creating && (
        <TicketModal
          onClose={() => setCreating(false)}
          onSuccess={fetchTickets}
        />
      )}
    </div>
  );
}