import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/subscriptionUtils";

// ─── Style Maps ──────────────────────────────────────────────────────────────

const statusColors = {
  OPEN:     "bg-[#EAF3F8] text-[#24698B]",
  PENDING:  "bg-[#FFF4E5] text-[#C77700]",
  RESOLVED: "bg-[#E8F7EF] text-[#1F8A5F]",
  CLOSED:   "bg-gray-100 text-gray-600",
};

const priorityColors = {
  LOW:    "bg-[#E8F7EF] text-[#1F8A5F]",
  MEDIUM: "bg-[#FFF4E5] text-[#C77700]",
  HIGH:   "bg-[#FFE9E5] text-[#D14343]",
  URGENT: "bg-[#D14343] text-white",
};

const categoryColors = {
  LOGIN:     "bg-[#F1F5F9] text-[#334155]",
  PAYMENT:   "bg-[#F5F3FF] text-[#6D28D9]",
  TECHNICAL: "bg-[#EEF2FF] text-[#4338CA]",
  GENERAL:   "bg-gray-100 text-gray-600",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the current viewer hasn't read the ticket yet.
 * Backed by real requesterRead / adminRead flags set by the server —
 * flips true whenever the other side replies, flips false when the
 * viewer opens GET /tickets/:id.
 */
function hasUnread(ticket, isAdmin) {
  return isAdmin ? ticket.adminRead === false : ticket.requesterRead === false;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * TicketCard
 * Displays a single ticket summary row with status/priority/category badges
 * and an unread-reply indicator. Navigates to the ticket detail page on click.
 *
 * Props:
 *  - ticket  {object}   ticket data from the API
 *  - isAdmin {boolean}  controls route and unread logic
 */
export default function TicketCard({ ticket, isAdmin }) {
  const navigate    = useNavigate();
  const ticketRoute = isAdmin ? `/admin/tickets/${ticket.id}` : `/tickets/${ticket.id}`;
  const unread      = hasUnread(ticket, isAdmin);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#24698B] hover:shadow-md transition">
      <div className="flex justify-between items-start">

        {/* LEFT — ticket info */}
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-[#24698B]">
              #{ticket.id} — {ticket.title}
            </h3>
            {unread && (
              <span className="inline-flex items-center gap-1 bg-red-500 text-white
                text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shrink-0">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                New reply
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
          <p className="text-xs text-gray-400 mt-2">{formatDate(ticket.createdAt)}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {ticket.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${statusColors[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
                {ticket.status}
              </span>
            )}
            {isAdmin && ticket.priority && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${priorityColors[ticket.priority] ?? "bg-gray-100 text-gray-600"}`}>
                {ticket.priority}
              </span>
            )}
            {ticket.category && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${categoryColors[ticket.category] ?? "bg-gray-100 text-gray-600"}`}>
                {ticket.category}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT — navigate arrow with unread dot */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="relative">
            {unread && (
              <span className="absolute -top-1 -right-1 z-10 w-3 h-3 rounded-full
                bg-red-500 border-2 border-white" />
            )}
            <button
              onClick={() => navigate(ticketRoute)}
              className="h-9 w-9 flex items-center justify-center rounded-full
                bg-[#EAF3F8] text-[#24698B] hover:bg-[#d8eaf3] transition"
              style={{ border: "none", outline: "none", boxShadow: "none" }}
            >
              →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}