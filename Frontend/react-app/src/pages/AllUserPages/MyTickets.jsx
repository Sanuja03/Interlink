
const STATUS_OPTIONS = [
  { value: "OPEN",     label: "Open",     dot: "bg-green-400" },
  { value: "PENDING",  label: "Pending",  dot: "bg-amber-400" },
  { value: "RESOLVED", label: "Resolved", dot: "bg-blue-400"  },
  { value: "CLOSED",   label: "Closed",   dot: "bg-slate-400" },
];

const CATEGORY_OPTIONS = [
  { value: "GENERAL",          label: "General"          },
  { value: "LOGIN_ISSUE",      label: "Login Issue"      },
  { value: "PAYMENT_ISSUE",    label: "Payment Issue"    },
  { value: "TECHNICAL_ISSUE",  label: "Technical Issue"  },
];

// ────────────────────────────────────────────────────────────────────────────
// FULL COMPONENT (copy MyTickets.jsx and replace with this version)
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import TicketModal from "../../components/TicketSubsPages/TicketModal";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";
import TicketSearch from "../../components/TicketSubsPages/TicketSearch";

const STATUS_OPTS = [
  { value: "OPEN",     label: "Open",     dot: "bg-green-400"  },
  { value: "PENDING",  label: "Pending",  dot: "bg-amber-400"  },
  { value: "RESOLVED", label: "Resolved", dot: "bg-blue-400"   },
  { value: "CLOSED",   label: "Closed",   dot: "bg-slate-400"  },
];

const CATEGORY_OPTS = [
  { value: "GENERAL",         label: "General"         },
  { value: "LOGIN_ISSUE",     label: "Login Issue"     },
  { value: "PAYMENT_ISSUE",   label: "Payment Issue"   },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
];

// Reusable custom dropdown filter pill
function FilterPill({ icon, label, options, value, onChange, dotKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
            ? "border-[#14597A] bg-[#EAF5FB] text-[#0C3E56]"
            : "border-[#D6E6F2] bg-white text-[#1C3A4A] hover:border-[#14597A] hover:bg-[#EAF5FB]"
          }
        `}
      >
        {icon}
        <span>{selectedOpt ? selectedOpt.label : label}</span>

        {/* Active badge */}
        {selectedOpt && (
          <span className="ml-1 inline-flex items-center justify-center bg-[#EAF3F8] text-[#14597A] text-[11px] font-semibold rounded-[8px] px-1.5 h-[18px]">
            1
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-[11px] h-[11px] ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="
          absolute top-[calc(100%+6px)] left-0 z-50
          bg-white rounded-[10px] p-1 min-w-[160px]
          shadow-[0_4px_20px_rgba(12,62,86,0.13),0_0_0_1px_rgba(12,62,86,0.08)]
          animate-fade-in
        ">
          {/* All option */}
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className="w-full text-left flex items-center px-2.5 py-[7px] rounded-[7px] text-[13px] text-[#8AAFC4] font-medium hover:bg-[#EAF3F8] transition-colors"
          >
            All {label.toLowerCase()}s
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-2.5 py-[7px] rounded-[7px] text-[13px] text-[#1C3A4A] hover:bg-[#EAF3F8] transition-colors"
            >
              {opt.dot && (
                <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${opt.dot}`} />
              )}
              <span className={opt.value === value ? "font-medium text-[#14597A]" : ""}>{opt.label}</span>
              {opt.value === value && (
                <svg className="ml-auto text-[#14597A]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tickets");
      setTickets(res.data);
      setFilteredTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const applyFilters = (query, status, category) => {
    let data = [...tickets];
    if (query.trim()) {
      const lower = query.toLowerCase();
      data = data.filter((t) =>
        (t.title || "").toLowerCase().includes(lower) ||
        (t.description || "").toLowerCase().includes(lower) ||
        (t.status || "").toLowerCase().includes(lower)
      );
    }
    if (status) data = data.filter((t) => t.status === status);
    if (category) {
      const normalized = category.toLowerCase().replace("_issue", "");
      data = data.filter((t) => (t.category || "").toLowerCase().includes(normalized));
    }
    setFilteredTickets(data);
  };

  const handleSearch = (query) => { setSearch(query); applyFilters(query, statusFilter, categoryFilter); };
  const handleStatusFilter = (value) => { setStatusFilter(value); applyFilters(search, value, categoryFilter); };
  const handleCategoryFilter = (value) => { setCategoryFilter(value); applyFilters(search, statusFilter, value); };
  const clearFilters = () => { setStatusFilter(""); setCategoryFilter(""); applyFilters(search, "", ""); };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/${id}`);
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F4F8FA] to-[#EAF3F8]">
      <div className="flex-grow py-10 px-6">

        {/* HEADER — unchanged */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="rounded-3xl p-8 shadow-lg bg-gradient-to-r from-[#0C3E56] to-[#14597A] text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <img src={logo} alt="Interlink Logo" className="h-9 w-auto object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold">Support Tickets</h1>
                  <p className="text-white/90 text-sm mt-1">Manage and track your support requests</p>
                </div>
              </div>
              <button
                onClick={() => setCreating(true)}
                className="bg-white text-[#0C3E56] px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition"
              >
                + Create Ticket
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => (window.location.href = "/settings")} className="text-white/90 hover:underline">
                ← Back to Settings
              </button>
              <div className="bg-white/20 px-5 py-2 rounded-xl text-sm">{filteredTickets.length} Tickets</div>
            </div>
          </div>
        </div>

        {/* ✨ REDESIGNED SEARCH + FILTERS */}
        <div className="max-w-5xl mx-auto bg-white border border-[#E4EFF7] rounded-2xl px-4 py-3 mb-8 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">

            <TicketSearch onSearch={handleSearch} />

            <div className="w-px h-6 bg-[#D6E6F2] shrink-0" />

            <FilterPill
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilter}
              options={STATUS_OPTS}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              }
            />

            <FilterPill
              label="Category"
              value={categoryFilter}
              onChange={handleCategoryFilter}
              options={CATEGORY_OPTS}
              icon={
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h7"/>
                </svg>
              }
            />

            {(statusFilter || categoryFilter) && (
              <button
                onClick={clearFilters}
                className="
                  flex items-center gap-1.5 px-3 h-[26px] rounded-full
                  bg-red-50 border-none text-[11.5px] font-semibold text-red-500
                  hover:bg-red-100 transition-colors cursor-pointer
                "
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* TICKETS */}
        <div className="max-w-5xl mx-auto space-y-6">
          {filteredTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-md text-center">
              <p className="text-xl text-gray-500 mb-6">No tickets match your search.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={() => setEditingTicket(ticket)}
                onDelete={(id) => handleDelete(id)}
              />
            ))
          )}
        </div>
      </div>

      {editingTicket && (
        <TicketModal ticket={editingTicket} onClose={() => setEditingTicket(null)} onSuccess={fetchTickets} />
      )}
      {creating && (
        <TicketModal onClose={() => setCreating(false)} onSuccess={fetchTickets} />
      )}

      <Footer />
    </div>
  );
}