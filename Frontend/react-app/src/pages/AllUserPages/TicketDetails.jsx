import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Error loading ticket", err);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/tickets/${id}/reply`, {
        sender: "REQUESTER",
        message: reply,
      });

      setReply("");
      fetchTicket();
    } catch (err) {
      console.error("Error sending reply", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/${id}`);
      navigate("/tickets");
    } catch (err) {
      console.error("Error deleting ticket", err);
    }
  };

  if (!ticket) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7FA]">
      {/* HEADER */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <img src={logo} alt="Interlink" className="h-10" />
          <h1 className="text-xl font-semibold text-gray-700">
            Support Ticket
          </h1>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-10">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/tickets")}
          className="bg-[#24698B] text-white px-6 py-2 rounded-full shadow-sm mb-8 hover:opacity-90"
        >
          ← Back to tickets
        </button>

        {/* TICKET CARD */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Ticket #{ticket.id}
            </h2>

            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                ticket.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {/* INFO SECTION */}
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 mb-8">
            <div>
              <p>
                <strong>Submitted By:</strong> {ticket.submittedBy}
              </p>

              <p className="mt-1">
                <strong>Date Submitted:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p>
                <strong>Email:</strong> {ticket.email}
              </p>

              <p className="mt-1">
                <strong>Status:</strong> {ticket.status}
              </p>
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* SUBJECT */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Subject</h3>

            <p className="text-gray-800">{ticket.title}</p>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3">Description</h3>

            <div className="bg-gray-50 border p-6 rounded-xl text-gray-700">
              {ticket.description}
            </div>
          </div>

          {/* CONVERSATION */}
          {ticket.responses && ticket.responses.length > 0 && (
            <div className="space-y-4 mb-10">
              <h3 className="font-semibold text-gray-700">Conversation</h3>

              {ticket.responses.map((res) => (
                <div
                  key={res.id}
                  className={`p-5 rounded-xl text-sm ${
                    res.sender === "ADMIN"
                      ? "bg-blue-50 border-l-4 border-[#24698B]"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {res.sender === "ADMIN" ? "Support Team" : "You"}
                  </p>

                  <p>{res.message}</p>

                  <span className="text-xs text-gray-400">
                    {new Date(res.sentAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* REPLY SECTION */}
          {ticket.status !== "CLOSED" && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">
                Respond to ticket
              </h3>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response here..."
                className="w-full border rounded-xl p-4 mb-5 focus:ring-2 focus:ring-[#24698B] outline-none"
              />

              <div className="flex gap-5">
                <button
                  onClick={handleReply}
                  className="bg-[#24698B] text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90"
                >
                  Send Response
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90"
                >
                  Delete Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
