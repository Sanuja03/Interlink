import { useNavigate } from "react-router-dom";
import Button from "./Button";

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

export default function TicketCard({ ticket, onEdit, onDelete, isAdmin }) {
  const navigate = useNavigate();

  // Decide navigation route
  const ticketRoute = isAdmin
    ? `/admin/tickets/${ticket.id}`
    : `/candidate/tickets/${ticket.id}`;

  const statusColors = {
    OPEN: "bg-blue-100 text-blue-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-200 text-gray-700",
  };

  const priorityColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const categoryColors = {
    LOGIN: "bg-blue-100 text-blue-700",
    PAYMENT: "bg-purple-100 text-purple-700",
    TECHNICAL: "bg-indigo-100 text-indigo-700",
    GENERAL: "bg-gray-200 text-gray-700",
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border-l-4 hover:shadow-md transition ${
        ticket.priority === "URGENT"
          ? "border-red-500"
          : ticket.priority === "HIGH"
          ? "border-orange-400"
          : ticket.priority === "MEDIUM"
          ? "border-yellow-400"
          : ticket.priority === "LOW"
          ? "border-green-400"
          : "border-[#24698B]"
      }`}
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

            {isAdmin && ticket.category && (
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
          {/* ADMIN ACTIONS */}
          {isAdmin && (
            <div className="flex gap-3">
              <Button onClick={() => onEdit(ticket)}>Update</Button>

              <Button variant="danger" onClick={() => onDelete(ticket.id)}>
                Delete
              </Button>
            </div>
          )}

          {/* NAVIGATION ARROW */}
          <button
            onClick={() => navigate(ticketRoute)}
            className="text-[#24698B] hover:translate-x-1 transition text-xl"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
