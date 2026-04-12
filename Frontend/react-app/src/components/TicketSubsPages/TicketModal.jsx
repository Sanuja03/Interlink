import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketModal({
  ticket = null, // default null
  onClose,
  onSuccess,
}) {
  // edit only if ticket AND ticket.id exist
  const isEdit = ticket && ticket.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isEdit) {
      setTitle(ticket.title || "");
      setDescription(ticket.description || "");
    } else {
      // Reset fields when switching to create mode
      setTitle("");
      setDescription("");
    }
  }, [ticket]);

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/tickets/${ticket.id}`, {
          title,
          description,
        });
      } else {
        await axios.post("http://localhost:8080/api/tickets", {
          title,
          description,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl">
        {/*Dynamic Heading */}
        <h1 className="text-2xl font-semibold text-[#0C3E56] mb-6">
          {isEdit ? "Edit Ticket" : "Create Ticket"}
        </h1>

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0C3E56]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter ticket title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="5"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0C3E56]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="bg-[#0C3E56] text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              {isEdit ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
