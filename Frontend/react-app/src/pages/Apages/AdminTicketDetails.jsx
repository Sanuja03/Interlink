import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

import ConfirmModal from "../../components/TicketSubsPages/ConfirmModal";
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

// Inline style object instead of template literal — avoids Tailwind purge issues
const selectStyle = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "14px",
  fontWeight: 500,
  background: "white",
  color: "#374151",
  outline: "none",
  cursor: "pointer",
};

export default function AdminTicketDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [ticket,          setTicket]          = useState(null);
  const [reply,           setReply]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [updating,        setUpdating]        = useState(false);
  const [error,           setError]           = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [priority,        setPriority]        = useState("MEDIUM");
  const [category,        setCategory]        = useState("GENERAL");
  const [status,          setStatus]          = useState("OPEN");

  const chatBottomRef  = useRef(null);
  const initialLoad    = useRef(true); // track first load to skip auto-scroll

  useEffect(() => { fetchTicket(); }, []);

  useEffect(() => {
    // Skip scroll on the very first load — only scroll when a NEW message arrives
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.responses?.length]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      const t = res.data;   //extracts the ticket object from the response and assigns it to variable t
      setTicket(t);         //updates the state variable ticket with the fetched ticket data, triggering a re-render
      setPriority(t.priority || "MEDIUM");
      setCategory(t.category || "GENERAL");   // Set defaults if API returns null/undefined
      setStatus(t.status    || "OPEN");
    } catch (err) {
      console.error(err);
      setError("Could not load ticket.");
    }
  };

  const updateTicketSettings = async () => {  //handles the update of ticket settings (priority, category, status) 
    setUpdating(true);
    try {
      await api.put(`/tickets/${id}`, { priority, category, status });
      toast.success("Ticket updated successfully.");
      await fetchTicket();      //refetch
    } catch (err) {
      toast.error("Failed to update ticket.");
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {   //async function that sends a reply to the ticket
    const trimmed = reply.trim(); 
    if (!trimmed) return;       //if blank reply, do nothing
    setSending(true);
    try {
      await api.post(`/tickets/${id}/reply`, { sender: "ADMIN", message: trimmed });
      setReply("");
      await fetchTicket();    //refetch
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
      setShowDeleteModal(false);  //delete modal closes
    }
  };

  if (error && !ticket) {   //if there's an error and no ticket data, show error message and back button
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button onClick={() => navigate("/admin/tickets")}
          className="bg-[#24698B] text-white px-6 py-2 rounded-lg hover:opacity-90">
          ← Back
        </button>
      </div>
    );
  }

  if (!ticket) {  //loading spinner ui
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>   
          </svg>
          Loading ticket…
        </div>
      </div>
    );
  }

  const isClosed      = ticket.status === "CLOSED";     //stores these values for future use
  const hasReplies    = ticket.responses && ticket.responses.length > 0;
  const requesterName = ticket.submittedBy ?? ticket.email?.split("@")[0] ?? "Requester"; //default fallback requester

  return (
    <div className="max-w-3xl mx-auto">

      {/* PAGE TITLE */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Admin Support Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage and monitor support tickets</p>
      </div>

      {/* BACK */}
      <button
        onClick={() => navigate("/admin/tickets")}
        className="inline-flex items-center gap-1.5 text-sm text-[#24698B]
          font-medium hover:underline mb-5"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        ← Back to tickets
      </button>

      {/* ── MAIN CARD ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* blue top bar */}
        <div className="h-3 bg-[#24698B]" />

        {/* ── TICKET INFO ───────────────────────────────────────────────── */}
        <div className="px-7 py-6 border-b border-gray-500">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-[#24698B] opacity-50 uppercase
                tracking-widest mb-1">
                Ticket #{ticket.id}
              </p>
              <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 
              rounded-full text-xs font-semibold
              ${STATUS_PILL[ticket.status] ?? STATUS_PILL.CLOSED}`}>     {/*status pill with fallback to CLOSED style */}
              {ticket.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-5">   {/*meta data row*/}

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

          <div className="bg-[#F4F8FA] rounded-xl px-5 py-4 text-sm text-gray-700    
            whitespace-pre-wrap leading-relaxed border border-[#E0EEF5]">       {/* description area */}
            {ticket.description}
          </div>
        </div>

        {/* ── ADMIN CONTROLS ────────────────────────────────────────────── */}
        <div className="px-7 py-6 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Admin Controls
          </p>

          {/* Three dropdowns in a row + Save button */}
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={selectStyle}
              >
                <option value="OPEN">Open</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={selectStyle}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={selectStyle}
              >
                <option value="GENERAL">General</option>
                <option value="LOGIN">Login Issue</option>
                <option value="PAYMENT">Payment Issue</option>
                <option value="TECHNICAL">Technical Issue</option>
              </select>
            </div>

            {/* save button */}
            <button
              onClick={updateTicketSettings}
              disabled={updating}     //if updating is true, button disabled
              style={{
                border: "none",
                height: "42px",
                padding: "0 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                background: updating ? "#6b7280" : "#0C3E56",   //if updating is true, bg gray, else blue
                color: "white",
                cursor: updating ? "not-allowed" : "pointer",  //if updating is true, cursor not-allowed, else pointer
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",      //keeps text in one line
                opacity: updating ? 0.6 : 1,
                transition: "background 0.15s",
              }}
            >
              {updating ? (   //if updating is true, show spinner icon, else show checkmark icon
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )} 
              {updating ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* ── CONVERSATION ──────────────────────────────────────────────── */}
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
             {/* message count render if only has relpies */}
            {hasReplies && (
              <span className="text-xs text-[#24698B] bg-[#EAF3F8]
                border border-[#B8D8EA] px-2.5 py-0.5 rounded-full font-medium">
                {ticket.responses.length} message{ticket.responses.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* messages */}
          <div className="px-7 py-5 bg-[#F8FAFB] min-h-[160px] flex flex-col gap-1">

            {/* no meassages */}
            {!hasReplies ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg className="w-9 h-9 mb-3 opacity-20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="text-sm">No messages yet.</p>
              </div>
            ) : (
              <>
                {ticket.responses.map((res, idx) => {   //loop through responses 
                  const isMe     = res.sender === "ADMIN"; //identify owner
                  const prev     = ticket.responses[idx - 1];
                  const showName = !prev || prev.sender !== res.sender;
                  return (
                    <div key={res.id} //right align if sender is admin, left align if requester
                      className={`flex flex-col
                        ${isMe ? "items-end" : "items-start"}  
                        ${showName ? "mt-4" : "mt-0.5"}`}>
                      
                      {showName && ( //only show name if sender is different from previous message
                        <span className="text-[11px] font-medium text-gray-400 mb-1 px-1">
                          {isMe ? "You (Support Team)" : requesterName}
                        </span>
                      )}
                      
                      
                      <div className={`max-w-[60%] px-4 py-2.5 text-sm leading-relaxed 
                        break-words shadow-sm
                        ${isMe //message bubble style: blue for admin, gray for requester
                          ? "bg-[#0C3E56] text-white rounded-2xl rounded-tr-sm"
                          : "bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
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
              This ticket is closed — change the status above to reopen it.
            </div>
          ) : (
            <div className="px-7 py-4 border-t border-gray-100 bg-white">
              <div className="flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply(); // Ctrl+Enter or Cmd+Enter to send
                  }}
                  placeholder="Type your reply… (Ctrl+Enter to send)"
                  rows={2}
                  disabled={sending}
                  className="flex-1 bg-[#F4F8FA] border border-[#D6E8F2] rounded-xl
                    px-4 py-2.5 text-sm outline-none resize-none
                    focus:ring-2 focus:ring-[#24698B]/20 focus:border-[#24698B]
                    disabled:opacity-50 placeholder:text-gray-400 transition"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}  //button disabled if sending or reply is blank
                  className="h-11 w-11 shrink-0 flex items-center justify-center
                    rounded-xl bg-[#0C3E56] text-white
                    hover:bg-[#14597A] active:scale-95 transition
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "none" }}
                >
                  {sending ? ( //if sending is true, show spinner icon, else show paper plane icon
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v4M12 18v4"/>
                    </svg>
                  ) : ( //paper plane icon
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

             // red delete button with trash can icon
              className="inline-flex items-center gap-1.5 text-xs text-red-400
                hover:text-red-600 font-medium transition"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" //trash can icon
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