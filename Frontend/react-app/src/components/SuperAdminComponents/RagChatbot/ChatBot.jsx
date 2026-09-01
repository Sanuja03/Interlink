import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, getHistory } from "../../../api/RagChatbotApi";

export default function ChatBot() {
  const [input,        setInput]        = useState("");
  const [messages,     setMessages]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [remaining,    setRemaining]    = useState(null);
  const [limit,        setLimit]        = useState(null); // read from backend, not hardcoded
  const [warning,      setWarning]      = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  const textareaRef    = useRef(null);
  const messageAreaRef = useRef(null);

  // Scroll to bottom of message area when messages update
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load today's history and current limits on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        const { history = [], remaining: rem, limit: lim } = res.data;

        const normalized = history.map((m) => ({
          role: m.role === "assistant" ? "ai" : "user",
          text: m.content,
          time: formatTime(new Date(m.time)),
        }));

        setMessages(normalized);
        if (rem !== undefined) { setRemaining(rem); setLimitReached(rem <= 0); }
        if (lim !== undefined)   setLimit(lim);

      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([]);
      }
    };
    fetchHistory();
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || limitReached) return;

    const userMessage = {
      role: "user",
      text: input.trim(),
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setWarning(null);
    setInput("");

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await sendMessage(userMessage.text);
      const { reply, remaining: rem, warning: warn, limitReached: limited, limit: lim } = res.data;

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply, time: formatTime(new Date()) },
      ]);

      if (rem !== undefined) setRemaining(rem);
      if (lim !== undefined) setLimit(lim);
      if (warn)              setWarning(warn);
      if (limited)           setLimitReached(true);

    } catch (err) {
      if (err.response?.status === 429) {
        setLimitReached(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: err.response.data?.error ?? "Daily message limit reached.",
            time: formatTime(new Date()),
            isError: true,
          },
        ]);
      } else {
        const errorText =
          typeof err.response?.data === "string"
            ? err.response.data
            : err.message ?? "An error occurred.";
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: errorText, time: formatTime(new Date()), isError: true },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, limitReached]);

  // Calculate usage percent from backend-supplied values
  const usagePercent = limit && remaining !== null
    ? Math.round(((limit - remaining) / limit) * 100)
    : 0;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.statusDot} />
          <span style={styles.headerTitle}>Interlink Bot</span>
          <span style={styles.ragBadge}>Chatbot</span>
        </div>

        {/* Daily usage — displays backend-configured limit */}
        <div style={styles.usageWrapper}>
          <span style={styles.usageText}>
            {remaining ?? "..."} / {limit ?? "..."} remaining
          </span>
          <div style={styles.usageTrack}>
            <div
              style={{
                ...styles.usageFill,
                width: `${usagePercent}%`,
                background: usagePercent >= 90 ? "#dc2626"
                          : usagePercent >= 70 ? "#d97706"
                          : "#24698B",
              }}
            />
          </div>
        </div>
      </div>

      {/* Warning banner — shown when approaching limit */}
      {warning && (
        <div style={styles.warningBanner}>{warning}</div>
      )}

      {/* Limit reached banner */}
      {limitReached && (
        <div style={styles.limitBanner}>
          Daily message limit reached. Your messages will reset tomorrow.
        </div>
      )}

      {/* Message feed */}
      <div style={styles.messageArea} ref={messageAreaRef}>
        {messages.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>How can I help you today?</p>
            <p style={styles.emptySubtitle}>
              Ask me anything about Interlink or your recruitment workflows.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageRow key={i} msg={msg} />
        ))}

        {loading && <TypingIndicator />}
      </div>

      {/* Input area */}
      <div style={styles.inputBar}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={limitReached ? "Daily limit reached." : "Ask about Interlink or recruitment..."}
          rows={1}
          style={{ ...styles.textarea, opacity: limitReached ? 0.5 : 1 }}
          disabled={loading || limitReached}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || limitReached}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() || limitReached ? 0.5 : 1,
            cursor:  loading || !input.trim() || limitReached ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function MessageRow({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ ...styles.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && <Avatar label="AI" color="#24698B" bg="#e0f0f5" />}
      <div style={{ maxWidth: "72%" }}>
        <div
          style={{
            ...styles.bubble,
            background: isUser ? "#24698B" : "#f5f7f9",
            color:      isUser ? "#fff"     : "#1a1a1a",
            border:     isUser ? "none"     : "1px solid #e8ecef",
            borderTopRightRadius: isUser ? 4  : 14,
            borderTopLeftRadius:  isUser ? 14 : 4,
            ...(msg.isError && { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }),
          }}
        >
          {msg.text}
        </div>
        {msg.time && <div style={styles.timestamp}>{msg.time}</div>}
      </div>
      {isUser && <Avatar label="You" color="#24698B" bg="#d6eaf2" />}
    </div>
  );
}

function Avatar({ label, color, bg }) {
  return (
    <div style={{ ...styles.avatar, background: bg, color }}>{label}</div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 0" }}>
      <Avatar label="AI" color="#24698B" bg="#e0f0f5" />
      <div style={styles.typingBubble}>
        <span style={{ ...styles.dot, animationDelay: "0s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
        <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 120px)",
    maxWidth: 820,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e8ecef",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #e8ecef",
    background: "#fff",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#24698B",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
  },
  ragBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 7px",
    background: "#e0f0f5",
    color: "#24698B",
    borderRadius: 4,
    letterSpacing: "0.06em",
  },
  usageWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  usageText: {
    fontSize: 11,
    color: "#6b7280",
    whiteSpace: "nowrap",
  },
  usageTrack: {
    width: 80,
    height: 4,
    background: "#e8ecef",
    borderRadius: 99,
    overflow: "hidden",
  },
  usageFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.3s ease, background 0.3s ease",
  },
  warningBanner: {
    padding: "8px 20px",
    background: "#fffbeb",
    borderBottom: "1px solid #fde68a",
    fontSize: 12,
    color: "#92400e",
    textAlign: "center",
  },
  limitBanner: {
    padding: "8px 20px",
    background: "#fef2f2",
    borderBottom: "1px solid #fecaca",
    fontSize: 12,
    color: "#991b1b",
    textAlign: "center",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#f9fafb",
  },
  emptyState: {
    margin: "auto",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 6px",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  timestamp: {
    fontSize: 10,
    color: "#a0aab4",
    marginTop: 4,
    paddingLeft: 2,
  },
  typingBubble: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    background: "#f5f7f9",
    border: "1px solid #e8ecef",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: "12px 16px",
  },
  dot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#a0aab4",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  inputBar: {
    display: "flex",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #e8ecef",
    background: "#fff",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    border: "1px solid #e8ecef",
    borderRadius: 8,
    resize: "none",
    outline: "none",
    lineHeight: 1.5,
    minHeight: 42,
    maxHeight: 120,
    background: "#f9fafb",
    color: "#1a1a1a",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#24698B",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
};