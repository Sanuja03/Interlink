import { useEffect, useState } from "react";
import axios from "axios";
import TicketCard from "../../components/TicketSubsPages/TicketCard";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const editTicket = (ticket) => {
    console.log("Edit ticket", ticket);
  };

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const pendingCount = tickets.filter((t) => t.status === "PENDING").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const counters = [
    {
      label: "Open",
      value: openCount,
      accent: "#E07A3A",
      bg: "#FFF8F4",
      border: "#F5D0B8",
      dot: "#E07A3A",
    },
    {
      label: "Pending",
      value: pendingCount,
      accent: "#C09A10",
      bg: "#FFFDF0",
      border: "#EEE09A",
      dot: "#C09A10",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      accent: "#2A9E6E",
      bg: "#F3FDF8",
      border: "#A8DECA",
      dot: "#2A9E6E",
    },
    {
      label: "Total",
      value: tickets.length,
      accent: "#24698B",
      bg: "#F4FAFD",
      border: "#B8D8EA",
      dot: "#24698B",
    },
  ];

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "#F5F7FA" }}
    >
      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EEF3" }}>
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Interlink" className="h-9" />
            <div style={{ width: 1, height: 32, background: "#E0ECF4" }} />
            <div>
              <h1
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#1C3A4A",
                  margin: 0,
                }}
              >
                Admin Support Dashboard
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "#9BB8CC",
                  margin: 0,
                  marginTop: 1,
                }}
              >
                Manage and monitor support tickets
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#24698B",
              background: "#EBF5FB",
              border: "1px solid #BDD8EA",
              borderRadius: 20,
              padding: "5px 14px",
            }}
          >
            Admin View
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div
        className="flex-grow max-w-5xl mx-auto w-full px-8"
        style={{ paddingTop: 40, paddingBottom: 60 }}
      >
        {/* SEARCH */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ position: "relative", maxWidth: 380 }}>
            <svg
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
              }}
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="#AAC4D4" strokeWidth="2.2" />
              <path
                d="M13.5 13.5L17 17"
                stroke="#AAC4D4"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 13,
                paddingLeft: 38,
                paddingRight: 16,
                paddingTop: 10,
                paddingBottom: 10,
                background: "#fff",
                border: "1.5px solid #DDE8F0",
                borderRadius: 10,
                outline: "none",
                color: "#1C3A4A",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid #24698B";
                e.target.style.boxShadow = "0 0 0 3px rgba(36,105,139,0.09)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1.5px solid #DDE8F0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* COUNTER CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {counters.map(({ label, value, accent, bg, border, dot }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: "24px 24px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {/* Status dot + label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: accent,
                    letterSpacing: "0.03em",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Big number */}
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: accent,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION LABEL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1C3A4A" }}>
            Recent Support Tickets
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#24698B",
              background: "#EBF5FB",
              border: "1px solid #BDD8EA",
              borderRadius: 20,
              padding: "3px 12px",
            }}
          >
            {filteredTickets.length}{" "}
            {filteredTickets.length === 1 ? "ticket" : "tickets"}
          </span>
        </div>

        {/* DIVIDER */}
        <div style={{ height: 1, background: "#E4EEF5", marginBottom: 20 }} />

        {/* TICKET LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredTickets.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1.5px dashed #C8DDE9",
                borderRadius: 14,
                padding: "56px 0",
                textAlign: "center",
                color: "#9BB8CC",
                fontSize: 13,
              }}
            >
              No tickets match your search.
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={editTicket}
                onDelete={deleteTicket}
                isAdmin={true}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
