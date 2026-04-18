import { useNavigate } from "react-router-dom";

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketCard({ ticket, isAdmin }) {
  const navigate = useNavigate();

  const ticketRoute = isAdmin
    ? `/admin/tickets/${ticket.id}`
    : `/tickets/${ticket.id}`;

// 🎯 STATUS (neutral + consistent)
const statusColors = {
  OPEN: "bg-[#EAF3F8] text-[#24698B]",
  PENDING: "bg-[#FFF4E5] text-[#C77700]",
  RESOLVED: "bg-[#E8F7EF] text-[#1F8A5F]",
  CLOSED: "bg-gray-100 text-gray-600",
};

// ⚠️ PRIORITY (ONLY place with strong colors)
const priorityColors = {
  LOW: "bg-[#E8F7EF] text-[#1F8A5F]",
  MEDIUM: "bg-[#FFF4E5] text-[#C77700]",
  HIGH: "bg-[#FFE9E5] text-[#D14343]",
  URGENT: "bg-[#D14343] text-white", // strong for urgency
};

// 🧩 CATEGORY (make subtle, not loud)
const categoryColors = {
  LOGIN: "bg-[#F1F5F9] text-[#334155]",
  PAYMENT: "bg-[#F5F3FF] text-[#6D28D9]",
  TECHNICAL: "bg-[#EEF2FF] text-[#4338CA]",
  GENERAL: "bg-gray-100 text-gray-600",
};

  return (
    <div
      className="
        bg-white p-6 rounded-xl shadow-sm
        border-l-4 border-[#24698B]
        hover:shadow-md transition
      "
    >
      {/* TOP ROW */}
      <div className="flex justify-between items-start">
        
        {/* LEFT SIDE */}
        <div className="flex-1 pr-6">
          <h3 className="text-lg font-semibold text-[#24698B] mb-1">
            #{ticket.id} — {ticket.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {ticket.description}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            {formatDate(ticket.createdAt)}
          </p>

          {/* BADGES */}
          <div className="flex flex-wrap gap-2 mt-3">
            {ticket.status && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[ticket.status]
                }`}
              >
                {ticket.status}
              </span>
            )}

            {isAdmin && ticket.priority && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  priorityColors[ticket.priority]
                }`}
              >
                {ticket.priority}
              </span>
            )}

{ticket.category && (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      categoryColors[ticket.category]
    }`}
  >
    {ticket.category}
  </span>
)}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-end gap-3">

          {/* NAVIGATION ARROW ONLY */}
          <button
            onClick={() => navigate(ticketRoute)}
            className="
              h-9 w-9 flex items-center justify-center
              rounded-full
              bg-[#EAF3F8] text-[#24698B]
              hover:bg-[#d8eaf3]
              transition
            "
            style={{
              fontFamily: "Poppins, sans-serif",
              border: "none",
              outline: "none",
              boxShadow: "none",
            }}
          >
            →
          </button>

        </div>
      </div>
    </div>
  );
}