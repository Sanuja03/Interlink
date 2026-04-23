import { useEffect, useState } from "react";
import api from "../../lib/api";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";
import TicketSearch from "../../components/TicketSubsPages/TicketSearch";

// ── Counter strip config ──────────────────────────────────────────────────
const COUNTERS_CONFIG = [
  { label: "Open",     key: "OPEN",     accent: "#E07A3A", bg: "#FFF8F4", border: "#F5D0B8" },
  { label: "Pending",  key: "PENDING",  accent: "#C09A10", bg: "#FFFDF0", border: "#EEE09A" },
  { label: "Resolved", key: "RESOLVED", accent: "#2A9E6E", bg: "#F3FDF8", border: "#A8DECA" },
  { label: "Total",    key: null,       accent: "#24698B", bg: "#F4FAFD", border: "#B8D8EA" },
];

// ── Category options — values must match what the DB stores ───────────────
const CATEGORY_OPTIONS = [
  { value: "GENERAL",   label: "General"        },
  { value: "LOGIN",     label: "Login Issue"    },
  { value: "PAYMENT",   label: "Payment Issue"  },
  { value: "TECHNICAL", label: "Technical Issue"},
];

const selectClass = `
  h-[42px] pl-3.5 pr-8 rounded-xl
  border border-[#D6E6F2] bg-white
  text-sm font-medium text-[#1C3A4A]
  appearance-none cursor-pointer outline-none
  transition-all duration-150
  focus:border-[#24698B] focus:ring-2 focus:ring-[#24698B]/10
`;

// ── Sorting helpers ───────────────────────────────────────────────────────
const PRIORITY_WEIGHT = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
const STATUS_WEIGHT   = { OPEN: 1, PENDING: 2, RESOLVED: 3, CLOSED: 4 };

function sortTickets(list) {
  return [...list].sort((a, b) => {
    const sd = (STATUS_WEIGHT[a.status] ?? 5) - (STATUS_WEIGHT[b.status] ?? 5);
    if (sd !== 0) return sd;
    if (a.status === "OPEN" && b.status === "OPEN") {
      const pd = (PRIORITY_WEIGHT[a.priority] ?? 5) - (PRIORITY_WEIGHT[b.priority] ?? 5);
      if (pd !== 0) return pd;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

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

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/tickets");
      setTickets(res.data);
      setFilteredTickets(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tickets. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ── filtering ─────────────────────────────────────────────────────────
  const applyFilters = (query, status, priority, category, source = tickets) => {
    let data = [...source];

    if (query.trim()) {
      const lower = query.toLowerCase();
      data = data.filter((t) =>
        (t.title       || "").toLowerCase().includes(lower) ||
        (t.description || "").toLowerCase().includes(lower) ||
        (t.submittedBy || "").toLowerCase().includes(lower) ||
        (t.email       || "").toLowerCase().includes(lower)
      );
    }
    if (status)   data = data.filter((t) => t.status   === status);
    if (priority) data = data.filter((t) => t.priority === priority);
    if (category) data = data.filter((t) => t.category === category);

    setFilteredTickets(data);
  };

  const handleSearch         = (q) => { setSearch(q);        applyFilters(q, statusFilter, priorityFilter, categoryFilter); };
  const handleStatusFilter   = (v) => { setStatusFilter(v);  applyFilters(search, v, priorityFilter, categoryFilter); };
  const handlePriorityFilter = (v) => { setPriorityFilter(v);applyFilters(search, statusFilter, v, categoryFilter); };
  const handleCategoryFilter = (v) => { setCategoryFilter(v);applyFilters(search, statusFilter, priorityFilter, v); };

  const clearAll = () => {
    setStatusFilter(""); setPriorityFilter(""); setCategoryFilter("");
    applyFilters(search, "", "", "");
  };

  // ── active filter chips ───────────────────────────────────────────────
  const activeChips = [
    statusFilter   && { key: "status",   label: `Status: ${statusFilter}`,     onRemove: () => handleStatusFilter("") },
    priorityFilter && { key: "priority", label: `Priority: ${priorityFilter}`, onRemove: () => handlePriorityFilter("") },
    categoryFilter && { key: "category", label: `Category: ${categoryFilter}`, onRemove: () => handleCategoryFilter("") },
  ].filter(Boolean);

  const getCount = (key) =>
    key ? filteredTickets.filter((t) => t.status === key).length : tickets.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">

      {/* HEADER */}
      <div className="bg-white border-b border-[#E8EEF3]">
        <div className="max-w-[960px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Interlink" className="h-9" />
            <div className="w-px h-8 bg-[#E0ECF4]" />
            <div>
              <h1 className="text-[17px] font-semibold text-[#1C3A4A] m-0">
                Admin Support Dashboard
              </h1>
              <p className="text-xs text-[#9BB8CC] m-0">Manage and monitor support tickets</p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#24698B] bg-[#EBF5FB]
            border border-[#BDD8EA] rounded-full px-3.5 py-1.5">
            Admin View
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-grow max-w-[960px] mx-auto w-full px-8 py-10">

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* SEARCH + FILTER TOOLBAR */}
        <div className="bg-white border border-[#E4EFF7] rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-3 flex-wrap">

            <TicketSearch onSearch={handleSearch} />
            <div className="w-px h-6 bg-[#D6E6F2] shrink-0" />

            {/* Status */}
            <select className={selectClass} value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}>
              <option value="">Status</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Priority */}
            <select className={selectClass} value={priorityFilter}
              onChange={(e) => handlePriorityFilter(e.target.value)}>
              <option value="">Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Category — values now match DB exactly */}
            <select className={selectClass} value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}>
              <option value="">Category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {activeChips.map((chip) => (
                <span key={chip.key}
                  className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full
                    bg-[#EBF5FB] border border-[#BDD8EA] text-[#24698B] text-xs font-medium">
                  {chip.label}
                  <button onClick={chip.onRemove}
                    className="text-[#24698B] text-[11px] opacity-70 hover:opacity-100
                      bg-transparent border-none cursor-pointer p-0 leading-none">
                    ✕
                  </button>
                </span>
              ))}
              <button onClick={clearAll}
                className="text-xs text-[#9BB8CC] hover:text-[#1C3A4A]
                  bg-transparent border-none cursor-pointer px-1 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* COUNTERS */}
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

      <Footer />
    </div>
  );
}