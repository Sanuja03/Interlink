import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function AdminTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");

  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/tickets/${id}`);

      setTicket(res.data);

      setPriority(res.data.priority || "MEDIUM");
      setCategory(res.data.category || "GENERAL");
      setStatus(res.data.status || "OPEN");
    } catch (err) {
      console.error("Error loading ticket", err);
    }
  };

  const updateTicketSettings = async () => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${id}`, {
        priority,
        category,
        status,
      });

      fetchTicket();
    } catch (err) {
      console.error("Error updating ticket", err);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;

    try {
      await axios.post(`http://localhost:8080/api/tickets/${id}/reply`, {
        sender: "ADMIN",
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
      navigate("/admin/tickets");
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
            Admin Support Dashboard
          </h1>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-10">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/admin/tickets")}
          className="bg-[#24698B] text-white px-6 py-2 rounded-full shadow-md mb-8 hover:opacity-90"
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
                  : ticket.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : ticket.status === "RESOLVED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {/* INFO */}
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

          {/* ADMIN CONTROLS */}
          <div className="mb-10">
            <h3 className="font-semibold text-gray-700 mb-4">Admin Controls</h3>

            <div className="flex gap-8 flex-wrap items-end">
              <div>
                <label className="text-sm font-medium block mb-2">Status</label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="OPEN">Open</option>
                  <option value="PENDING">Pending</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="GENERAL">General</option>
                  <option value="LOGIN">Login Issue</option>
                  <option value="PAYMENT">Payment Issue</option>
                  <option value="TECHNICAL">Technical Issue</option>
                </select>
              </div>

              <button
                onClick={updateTicketSettings}
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-sm hover:opacity-90"
              >
                Update
              </button>
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
                    {res.sender === "ADMIN" ? "Support Team" : "Requester"}
                  </p>

                  <p>{res.message}</p>

                  <span className="text-xs text-gray-400">
                    {new Date(res.sentAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* REPLY */}
          {ticket.status !== "CLOSED" && (
            <div>
              <h3 className="font-semibold mb-3 text-gray-700">
                Reply to requester
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
