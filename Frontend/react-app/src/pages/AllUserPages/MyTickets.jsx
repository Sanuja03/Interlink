import { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import TicketModal from "../../components/TicketSubsPages/TicketModal";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tickets");
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/${id}`);
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F4F8FA] to-[#EAF3F8]">
      {/* PAGE CONTENT */}
      <div className="flex-grow py-10 px-6">
        {/* HEADER */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="rounded-3xl p-8 shadow-lg bg-gradient-to-r from-[#0C3E56] to-[#14597A] text-white">
            {/* TOP ROW */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                {/* LOGO */}
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <img
                    src={logo}
                    alt="Interlink Logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>

                {/* TITLE */}
                <div>
                  <h1 className="text-3xl font-semibold">Support Tickets</h1>
                  <p className="text-white/90 text-sm mt-1">
                    Manage and track your support requests
                  </p>
                </div>
              </div>

              {/* CREATE BUTTON */}
              <button
                onClick={() => setCreating(true)}
                className="bg-white text-[#0C3E56] px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition"
              >
                + Create Ticket
              </button>
            </div>

            {/* BOTTOM ROW */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => (window.location.href = "/settings")}
                className="text-white/90 hover:underline"
              >
                ← Back to Settings
              </button>

              <div className="bg-white/20 px-5 py-2 rounded-xl text-sm">
                {tickets.length} Total Tickets
              </div>
            </div>
          </div>
        </div>

        {/* TICKETS LIST */}
        <div className="max-w-5xl mx-auto space-y-6">
          {tickets.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-md text-center">
              <p className="text-xl text-gray-500 mb-6">
                No tickets created yet.
              </p>

              <button
                onClick={() => setCreating(true)}
                className="bg-[#0C3E56] text-white px-6 py-3 rounded-xl shadow-md"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={() => handleEdit(ticket)}
                onDelete={(id) => handleDelete(id)}
              />
            ))
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingTicket && (
        <TicketModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSuccess={fetchTickets}
        />
      )}

      {/* CREATE MODAL */}
      {creating && (
        <TicketModal
          onClose={() => setCreating(false)}
          onSuccess={fetchTickets}
        />
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
