import { useEffect, useState } from "react";
import api from "../../lib/api";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import TicketSearch from "../../components/TicketSubsPages/TicketSearch";

// ─── Config ──────────────────────────────────────────────────────────────────

const COUNTERS_CONFIG = [
  { label: "Open",     key: "OPEN",     accent: "#E07A3A", bg: "#FFF8F4", border: "#F5D0B8" },
  { label: "Pending",  key: "PENDING",  accent: "#C09A10", bg: "#FFFDF0", border: "#EEE09A" },
  { label: "Resolved", key: "RESOLVED", accent: "#2A9E6E", bg: "#F3FDF8", border: "#A8DECA" },
  { label: "Total",    key: null,       accent: "#24698B", bg: "#F4FAFD", border: "#B8D8EA" },
];

const CATEGORY_OPTIONS = [
  { value: "GENERAL",   label: "General"         },
  { value: "LOGIN",     label: "Login Issue"      },
  { value: "PAYMENT",   label: "Payment Issue"    },
  { value: "TECHNICAL", label: "Technical Issue"  },
];

// ─── Sorting ─────────────────────────────────────────────────────────────────

const PRIORITY_WEIGHT = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
const STATUS_WEIGHT   = { OPEN: 1, PENDING: 2, RESOLVED: 3, CLOSED: 4 };

function sortTickets(list) {
  return [...list].sort((a, b) => {
    const sd = (STATUS_WEIGHT[a.status]   ?? 5) - (STATUS_WEIGHT[b.status]   ?? 5);    //js sort logic negative comes first
    if (sd !== 0) return sd;    //if both status same this becomes zero
    if (a.status === "OPEN" && b.status === "OPEN") {
      const pd = (PRIORITY_WEIGHT[a.priority] ?? 5) - (PRIORITY_WEIGHT[b.priority] ?? 5);
      if (pd !== 0) return pd;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// ─── Shared select style ─────────────────────────────────────────────────────

const selectClass = `
  h-[42px] pl-3.5 pr-8 rounded-xl
  border border-[#D6E6F2] bg-white
  text-sm font-medium text-[#1C3A4A]
  appearance-none cursor-pointer outline-none
  transition-all duration-150
  focus:border-[#24698B] focus:ring-2 focus:ring-[#24698B]/10
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminTickets() {
  const [tickets,         setTickets]         = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [priorityFilter,  setPriorityFilter]  = useState("");
  const [categoryFilter,  setCategoryFilter]  = useState("");
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  useEffect(() => { fetchTickets(); }, []);

 
  useEffect(() => {
    let data = [...tickets];    //cloned array

    if (search.trim()) {   //if search is not empty
      const lower = search.toLowerCase();
      data = data.filter((t) =>
        (t.title       || "").toLowerCase().includes(lower) ||
        (t.description || "").toLowerCase().includes(lower) ||
        (t.submittedBy || "").toLowerCase().includes(lower) ||
        (t.email       || "").toLowerCase().includes(lower)
      );
    }
    if (statusFilter)   data = data.filter((t) => t.status   === statusFilter);
    if (priorityFilter) data = data.filter((t) => t.priority === priorityFilter);   //creates a new array that passes the condition
    if (categoryFilter) data = data.filter((t) => t.category === categoryFilter);

    setFilteredTickets(data);
  }, [search, statusFilter, priorityFilter, categoryFilter, tickets]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
  };

  // ── Active filter display ───────────────────────────────────────────────────
  const activeChips = [
    statusFilter   && { key: "status",   label: `Status: ${statusFilter}`,     onRemove: () => setStatusFilter("") },
    priorityFilter && { key: "priority", label: `Priority: ${priorityFilter}`, onRemove: () => setPriorityFilter("") },
    categoryFilter && { key: "category", label: `Category: ${categoryFilter}`, onRemove: () => setCategoryFilter("") },
  ].filter(Boolean);

  const getCount = (key) =>
    key ? filteredTickets.filter((t) => t.status === key).length : tickets.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Support Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor support tickets</p>
      </div>
  
      <div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* SEARCH + FILTER TOOLBAR */}
        <div className="bg-white border border-[#E4EFF7] rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-3 flex-wrap">

            <TicketSearch onSearch={setSearch} />
            <div className="w-px h-6 bg-[#D6E6F2] shrink-0" />

            <select className={selectClass} value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Status</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select className={selectClass} value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <select className={selectClass} value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {activeChips.map((chip) => (
                <span key={chip.key}
                  className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full
                    bg-[#EBF5FB] border border-[#BDD8EA] text-[#24698B] text-xs font-medium">
                  {chip.label}
                  <button
                    onClick={chip.onRemove}   //defined in activeChips array above
                    className="text-[#24698B] text-[11px] opacity-70 hover:opacity-100
                      bg-transparent border-none cursor-pointer p-0 leading-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-xs text-[#9BB8CC] hover:text-[#1C3A4A]
                  bg-transparent border-none cursor-pointer px-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* STATUS COUNTERS */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {COUNTERS_CONFIG.map(({ label, key, accent, bg, border }) => (
            <div key={label} className="rounded-[14px] p-6"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
                <span className="text-xs font-semibold" style={{ color: accent }}>{label}</span>
              </div>
              <div className="text-[40px] font-bold" style={{ color: accent }}>
                {loading ? "—" : getCount(key)}
              </div>
            </div>
          ))}
        </div>

        {/* TICKET LIST */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="bg-white border border-dashed border-[#D6E6F2]
              rounded-xl p-12 text-center text-[#9BB8CC] text-sm">
              Loading tickets…
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D6E6F2]
              rounded-xl p-12 text-center text-[#9BB8CC] text-sm">
              No tickets match your search.
            </div>
          ) : (
            sortTickets(filteredTickets).map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} isAdmin={true} />
            ))
          )}
        </div>

      </div>

      
    </div>
  );
}