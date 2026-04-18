import { useState } from "react";
import { sendMessage } from "../../../api/RagChatbotApi";

export default function ChatBot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };

    // Add user message instantly
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await sendMessage(message);

      const aiMessage = { role: "ai", text: res.data };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error("FULL ERROR:", err);

      let errorMsg = "Error occurred";

      if (err.response) {
        errorMsg =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
      } else if (err.request) {
        errorMsg = "No response from server";
      } else {
        errorMsg = err.message;
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: errorMsg },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Artificial Sanuja Bot</h2>

      {/* Chat Messages */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto border p-3 rounded-lg bg-white">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {typeof msg.text === "string"
                ? msg.text
                : JSON.stringify(msg.text, null, 2)}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 text-sm">AI is typing...</div>
        )}
      </div>

      {/* Input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full p-3 border rounded-lg resize-none"
        rows={3}
      />

      {/* Button */}
      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}