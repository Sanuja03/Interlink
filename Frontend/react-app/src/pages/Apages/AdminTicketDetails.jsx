import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

import TicketButton from "../../components/TicketSubsPages/TicketButton";
import ConfirmModal from "../../components/TicketSubsPages/ConfirmModal";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/subscriptionUtils";

// ─── Style Map ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  OPEN:     "bg-green-100 text-green-700",
  PENDING:  "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-blue-100 text-blue-700",
  CLOSED:   "bg-gray-200 text-gray-600",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminTicketDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [ticket,          setTicket]          = useState(null);
  const [reply,           setReply]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [updating,        setUpdating]        = useState(false);
  const [error,           setError]           = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("GENERAL");
  const [status,   setStatus]   = useState("OPEN");

  const chatBottomRef = useRef(null);

  useEffect(() => { fetchTicket(); }, []);
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.responses]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      const t   = res.data;
      setTicket(t);
      setPriority(t.priority || "MEDIUM");
      setCategory(t.category || "GENERAL");
      setStatus(t.status    || "OPEN");
    } catch (err) {
      console.error(err);
      setError("Could not load ticket.");
    }
  };

  const updateTicketSettings = async () => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${id}`, { priority, category, status });
      toast.success("Ticket updated successfully.");
      await fetchTicket();
    } catch (err) {
      toast.error("Failed to update ticket.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/reply`, { sender: "ADMIN", message: trimmed });
      setReply("");
      await fetchTicket();
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Ticket deleted successfully.");
      navigate("/admin/tickets");
    } catch (err) {
      toast.error("Failed to delete ticket.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // ── Error / Loading states ────────────────────────────────────────────────

  if (error && !ticket) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F7FA]">
        <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-20 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => navigate("/admin/tickets")}
            className="mt-6 bg-[#24698B] text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            ← Back to tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F7FA]">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
          </svg>
          Loading ticket…
        </div>
      </div>
    );
  }

  const isClosed   = ticket.status === "CLOSED";
  const hasReplies = ticket.responses && ticket.responses.length > 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Support Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor support tickets</p>
      </div>
  
      <div>

        <button
          onClick={() => navigate("/admin/tickets")}
          className="inline-flex items-center gap-2 bg-[#EAF3F8] text-[#24698B]
            px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d8eaf3] transition mb-8"
          style={{ border: "none", outline: "none", boxShadow: "none" }}
        >
          ← Back to tickets
        </button>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white p-10 rounded-2xl shadow-sm border">

          {/* HEADER ROW */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">Ticket #{ticket.id}</h2>
            <span className={`px-4 py-1 rounded-full text-sm font-medium
              ${STATUS_STYLES[ticket.status] ?? "bg-gray-200 text-gray-600"}`}>
              {ticket.status}
            </span>
          </div>

          {/* INFO GRID */}
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 mb-8">
            <div className="space-y-1">
              <p><strong>Submitted By:</strong> {ticket.submittedBy ?? "—"}</p>
              <p><strong>Date Submitted:</strong> {formatDate(ticket.createdAt)}</p>
              <p><strong>Category:</strong> {ticket.category ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Email:</strong> {ticket.email ?? "—"}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              {ticket.priority && <p><strong>Priority:</strong> {ticket.priority}</p>}
            </div>
          </div>

          {/* SUBJECT */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Subject</h3>
            <p className="text-gray-800">{ticket.title}</p>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3">Description</h3>
            <div className="bg-gray-50 border p-6 rounded-xl text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* ADMIN CONTROLS */}
          <div className="mb-10">
            <h3 className="font-semibold text-gray-700 mb-4">Admin Controls</h3>
            <div className="flex gap-6 flex-wrap items-end">
              <div>
                <label className="text-sm font-medium block mb-2">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                    font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#24698B]">
                  <option value="OPEN">Open</option>
                  <option value="PENDING">Pending</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                    font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#24698B]">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                    font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#24698B]">
                  <option value="GENERAL">General</option>
                  <option value="LOGIN">Login Issue</option>
                  <option value="PAYMENT">Payment Issue</option>
                  <option value="TECHNICAL">Technical Issue</option>
                </select>
              </div>
              <TicketButton variant="success" onClick={updateTicketSettings} disabled={updating}>
                {updating ? "Saving…" : "Update"}
              </TicketButton>
            </div>
          </div>

          {/* CONVERSATION */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-4">Conversation</h3>

            {!hasReplies ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg className="w-10 h-10 mb-3 opacity-30" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="text-sm">No messages yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto
                px-2 py-3 bg-gray-50 rounded-xl border">
                {ticket.responses.map((res) => {
                  const isAdmin = res.sender === "ADMIN";
                  return (
                    <div key={res.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`flex flex-col gap-1 max-w-[70%] ${isAdmin ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-400 px-2">
                          {isAdmin
                            ? "You (Support Team)"
                            : `${ticket.submittedBy ?? ticket.email ?? "Requester"}`}
                        </span>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                          ${isAdmin
                            ? "bg-[#0C3E56] text-white rounded-tr-none"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                          }`}>
                          {res.message}
                        </div>
                        <span className="text-[11px] text-gray-400 px-2">
                          {formatDate(res.sentAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          {/* REPLY BOX */}
          {isClosed ? (
            <div className="bg-gray-50 border border-dashed border-gray-300
              rounded-xl p-5 text-sm text-gray-500 text-center mb-6">
              This ticket is closed. Reopen it by changing the status above.
            </div>
          ) : (
            <div className="border-t pt-6 mb-6">
              <h3 className="font-semibold mb-3 text-gray-700 text-sm">Reply to requester</h3>
              <div className="flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
                  }}
                  placeholder="Type your response… (Ctrl+Enter to send)"
                  rows={3}
                  disabled={sending}
                  className="flex-1 border rounded-xl p-4 focus:ring-2 focus:ring-[#24698B]
                    outline-none resize-none disabled:opacity-60 text-sm"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="h-12 w-12 flex items-center justify-center rounded-xl
                    bg-[#0C3E56] text-white hover:bg-[#14597A] transition
                    disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {sending ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* DELETE */}
          <div className="border-t pt-5">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 text-sm text-red-500
                hover:text-red-600 font-medium transition"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
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