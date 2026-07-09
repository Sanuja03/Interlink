import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import Footer from "../../components/TicketSubsPages/Footer";
import ConfirmModal from "../../components/TicketSubsPages/ConfirmModal";
import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/subscriptionUtils";


const STATUS_PILL = {
  OPEN:     "bg-[#EAF3F8] text-[#24698B] border border-[#B8D8EA]",
  PENDING:  "bg-amber-50 text-amber-700 border border-amber-200",
  RESOLVED: "bg-blue-50 text-blue-700 border border-blue-200",
  CLOSED:   "bg-gray-100 text-gray-500 border border-gray-200",
};

const CATEGORY_LABELS = {
  GENERAL: "General", LOGIN: "Login Issue",
  PAYMENT: "Payment Issue", TECHNICAL: "Technical Issue",
};

export default function TicketDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [ticket,          setTicket]          = useState(null);
  const [reply,           setReply]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [error,           setError]           = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const chatBottomRef = useRef(null);

  useEffect(() => { fetchTicket(); }, []);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.responses]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load ticket.");
    }
  };

  const handleReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/reply`, { sender: "REQUESTER", message: trimmed });
      setReply("");
      await fetchTicket();
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Ticket deleted successfully.");
      navigate("/tickets");
    } catch (err) {
      toast.error("Failed to delete ticket.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (error && !ticket) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button onClick={() => navigate("/tickets")}
              className="bg-[#24698B] text-white px-6 py-2 rounded-full hover:opacity-90">
              ← Back to tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
            </svg>
            Loading ticket…
          </div>
        </div>
      </div>
    );
  }

  const isClosed   = ticket.status === "CLOSED";
  const hasReplies = ticket.responses && ticket.responses.length > 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-grow px-8 py-8">


          {/* ── MAIN CARD ──────────────────────────────────────────────── */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* blue top bar */}
            <div className="h-3 bg-[#24698B]" />

            {/* ── TICKET INFO ─────────────────────────────────────────── */}
            <div className="px-7 py-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-[#24698B]/50 uppercase
                    tracking-widest mb-1">
                    Ticket #{ticket.id}
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1
                  rounded-full text-xs font-semibold
                  ${STATUS_PILL[ticket.status] ?? STATUS_PILL.CLOSED}`}>
                  {ticket.status}
                </span>
              </div>

              {/* meta data row */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#24698B] opacity-50" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {ticket.submittedBy ?? "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#24698B] opacity-50" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {ticket.email ?? "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#24698B] opacity-50" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatDate(ticket.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#24698B] opacity-50" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  {CATEGORY_LABELS[ticket.category] ?? ticket.category ?? "—"}
                </span>
              </div>

              {/* description */}
              <div className="bg-[#F4F8FA] rounded-xl px-5 py-4 text-sm text-gray-700
                whitespace-pre-wrap leading-relaxed border border-[#E0EEF5]">
                {ticket.description}
              </div>
            </div>

            {/* ── CONVERSATION ────────────────────────────────────────── */}
            <div>
              {/* header */}
              <div className="px-7 py-4 border-b border-gray-100 bg-[#F4F8FA]
                flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#24698B]" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Conversation</span>
                </div>
                {hasReplies && (
                  <span className="text-xs text-[#24698B] bg-[#EAF3F8]
                    border border-[#B8D8EA] px-2.5 py-0.5 rounded-full font-medium">
                    {ticket.responses.length} message{ticket.responses.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* messages */}
              <div className="px-7 py-5 bg-[#F8FAFB] min-h-[160px] flex flex-col gap-1">
                {!hasReplies ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <svg className="w-9 h-9 mb-3 opacity-20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p className="text-sm">No messages yet. Start the conversation below.</p>
                  </div>
                ) : (
                  <>
                    {ticket.responses.map((res, idx) => {
                      const isAdmin  = res.sender === "ADMIN";
                      const prev     = ticket.responses[idx - 1];
                      const showName = !prev || prev.sender !== res.sender;
                      return (
                        <div key={res.id}
                          className={`flex flex-col
                            ${isAdmin ? "items-start" : "items-end"}
                            ${showName ? "mt-4" : "mt-0.5"}`}>
                          {showName && (
                            <span className="text-[11px] font-medium text-gray-400 mb-1 px-1">
                              {isAdmin ? "Support Team" : "You"}
                            </span>
                          )}
                          <div className={`max-w-[60%] px-4 py-2.5 text-sm leading-relaxed
                            break-words shadow-sm
                            ${isAdmin
                              ? "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                              : "bg-[#0C3E56] text-white rounded-2xl rounded-tr-sm"
                            }`}>
                            {res.message}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                            {formatDate(res.sentAt)}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </>
                )}
              </div>

              {/* reply box */}
              {isClosed ? (
                <div className="px-7 py-4 border-t border-gray-100 bg-gray-50
                  text-xs text-center text-gray-400">
                  This ticket is closed. No further replies can be added.
                </div>
              ) : (
                <div className="px-7 py-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
                      }}
                      placeholder="Type your message… (Ctrl+Enter to send)"
                      rows={2}
                      disabled={sending}
                      className="flex-1 bg-[#F4F8FA] border border-[#D6E8F2] rounded-xl
                        px-4 py-2.5 text-sm outline-none resize-none
                        focus:ring-2 focus:ring-[#24698B]/20 focus:border-[#24698B]
                        disabled:opacity-50 placeholder:text-gray-400 transition"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending || !reply.trim()}
                      className="h-11 w-11 shrink-0 flex items-center justify-center
                        rounded-xl bg-[#0C3E56] text-white
                        hover:bg-[#14597A] active:scale-95 transition
                        disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ border: "none" }}
                    >
                      {sending ? (
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M12 2v4M12 18v4"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* delete */}
              <div className="px-7 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400
                    hover:text-red-600 font-medium transition"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete this ticket
                </button>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Ticket?"
        message={`Ticket #${ticket.id} — "${ticket.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}