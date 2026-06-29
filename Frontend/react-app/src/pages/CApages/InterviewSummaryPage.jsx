import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import api from "../../lib/api";

/* ─── Interlink Design Tokens ──────────────────────────────────────────────── */
const brand = {
  primary:       "#24698B",
  primaryLight:  "rgba(36,105,139,0.10)",
  primaryBorder: "rgba(36,105,139,0.25)",
  dark:          "#0C3E56",
  nav:           "#DADEE0",
  navText:       "#4a5568",
  text:          "#000000",
  textMuted:     "#6b7280",
  textLight:     "#9ca3af",
  surface:       "#ffffff",
  surfaceAlt:    "#f8fafc",
  border:        "#e5e9eb",
  success:       "#15803d",
  successBg:     "rgba(21,128,61,0.08)",
  successBorder: "rgba(21,128,61,0.25)",
  danger:        "#b91c1c",
  dangerBg:      "rgba(185,28,28,0.08)",
  dangerBorder:  "rgba(185,28,28,0.25)",
  radius:        "8px",
  font:          "'Outfit', sans-serif",
};

/* ─── Google Font inject (Outfit) ───────────────────────────────────────────── */
if (!document.getElementById("interlink-outfit-font")) {
  const link = document.createElement("link");
  link.id   = "interlink-outfit-font";
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
}

/* ─── Score chip ─────────────────────────────────────────────────────────────*/
const ScoreCell = ({ score }) => {
  if (!score || !score.submitted) {
    return (
      <span style={{ fontSize: 13, color: brand.textLight, fontFamily: brand.font }}>
        —
      </span>
    );
  }
  const pct  = Math.round((score.totalScore / score.maxPossibleScore) * 100);
  const good = pct >= 60;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{
        display: "inline-block",
        background: good ? brand.successBg : brand.dangerBg,
        border: `1px solid ${good ? brand.successBorder : brand.dangerBorder}`,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 500,
        color: good ? brand.success : brand.danger,
        fontFamily: brand.font,
        whiteSpace: "nowrap",
      }}>
        {score.totalScore}/{score.maxPossibleScore}
      </span>
      <div style={{ height: 3, borderRadius: 99, background: brand.border, width: 64 }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          width: `${pct}%`,
          background: good ? brand.success : brand.danger,
          transition: "width .4s",
        }} />
      </div>
    </div>
  );
};

/* ─── Status badge ────────────────────────────────────────────────────────────*/
const StatusBadge = ({ status }) => {
  const pass = status === "PASS";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: pass ? brand.successBg : brand.dangerBg,
      color:      pass ? brand.success    : brand.danger,
      border:     `1px solid ${pass ? brand.successBorder : brand.dangerBorder}`,
      padding: "4px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      fontFamily: brand.font,
    }}>
      <span style={{ fontSize: 8 }}>●</span>
      {pass ? "Passed" : "Failed"}
    </span>
  );
};

/* ─── Round pill ──────────────────────────────────────────────────────────────*/
const RoundPill = ({ current, total }) => (
  <span style={{
    display: "inline-block",
    background: brand.primaryLight,
    border: `1px solid ${brand.primaryBorder}`,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 500,
    color: brand.primary,
    fontFamily: brand.font,
  }}>
    {current} / {total}
  </span>
);

/* ─── Main Page ───────────────────────────────────────────────────────────────*/
export default function InterviewSummaryPage() {
  const navigate = useNavigate();
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [deciding, setDeciding] = useState(null);
  const [toast,    setToast]    = useState({ message: "", visible: false, ok: true });

  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    if (!companyId) {
      setError("Company not found. Please log in again.");
      setLoading(false);
      return;
    }
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/interview-summary?companyId=${companyId}`);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load interviews:", err);
      setError("Failed to load interview data.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, ok = true) => {
    setToast({ message, visible: true, ok });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleDecision = async (scheduledId, decision) => {
    setDeciding(scheduledId);
    try {
      const res = await api.post(
        `/interview-summary/decide?companyId=${companyId}`,
        { scheduledId, decision }
      );
      setRows(prev =>
        prev.map(row =>
          row.scheduledId === scheduledId
            ? { ...row, currentStatus: decision }
            : row
        )
      );
      showToast(res.data.message, true);
    } catch (err) {
      console.error("Decision failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Something went wrong. Try again.";
      showToast(msg, false);
    } finally {
      setDeciding(null);
    }
  };

  const Th = ({ children, width, center }) => (
    <th style={{
      width,
      fontSize: 11,
      fontWeight: 600,
      color: brand.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      padding: "11px 16px",
      textAlign: center ? "center" : "left",
      borderBottom: `1.5px solid ${brand.border}`,
      background: brand.surfaceAlt,
      whiteSpace: "nowrap",
      fontFamily: brand.font,
    }}>
      {children}
    </th>
  );

  const Td = ({ children, style, center }) => (
    <td style={{
      padding: "14px 16px",
      fontSize: 13,
      color: brand.text,
      borderBottom: `1px solid ${brand.border}`,
      verticalAlign: "middle",
      textAlign: center ? "center" : "left",
      fontFamily: brand.font,
      ...style,
    }}>
      {children}
    </td>
  );

  /* ─── Loading ─── */
  if (loading) return (
    <DashboardLayout>
      <div style={{ padding: 40, fontFamily: brand.font }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: brand.textMuted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand.primary} strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span style={{ fontSize: 14 }}>Loading interviews…</span>
        </div>
      </div>
    </DashboardLayout>
  );

  /* ─── Error ─── */
  if (error) return (
    <DashboardLayout>
      <div style={{ padding: 40, fontFamily: brand.font }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: brand.dangerBg, border: `1px solid ${brand.dangerBorder}`,
          borderRadius: brand.radius, padding: "12px 18px",
          color: brand.danger, fontSize: 14, marginBottom: 20,
        }}>
          ⚠ {error}
        </div>
        <br />
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: `1px solid ${brand.border}`,
            color: brand.textMuted,
            padding: "8px 18px",
            borderRadius: brand.radius,
            cursor: "pointer",
            fontSize: 13,
            fontFamily: brand.font,
          }}
        >
          ← Go back
        </button>
      </div>
    </DashboardLayout>
  );

  /* ─── Main ─── */
  return (
    <DashboardLayout>

      {/* Toast */}
      <div style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        background: toast.ok ? brand.dark : brand.dangerBg,
        border: `1px solid ${toast.ok ? brand.primaryBorder : brand.dangerBorder}`,
        borderRadius: brand.radius,
        padding: "11px 20px",
        fontSize: 13,
        color: toast.ok ? "#ffffff" : brand.danger,
        fontFamily: brand.font,
        fontWeight: 500,
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity .25s, transform .25s",
        pointerEvents: "none",
        zIndex: 999,
        boxShadow: "0 4px 20px rgba(12,62,86,0.15)",
      }}>
        {toast.message}
      </div>

      <div style={{ padding: "28px 32px", fontFamily: brand.font }}>

        {/* Page header */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 600,
              color: brand.dark,
              margin: 0,
              letterSpacing: "-0.3px",
            }}>
              Interview Summary
            </h1>
            <p style={{ fontSize: 13, color: brand.textMuted, margin: "4px 0 0" }}>
              Review scores and make pass / fail decisions for your company's interviews.
            </p>
          </div>

          {rows.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Total",   value: rows.length,                                color: brand.primary  },
                { label: "Decided", value: rows.filter(r => !!r.currentStatus).length, color: brand.dark     },
                { label: "Pending", value: rows.filter(r => !r.currentStatus).length,  color: brand.textMuted },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: brand.surfaceAlt,
                  border: `1px solid ${brand.border}`,
                  borderRadius: brand.radius,
                  padding: "8px 16px",
                  textAlign: "center",
                  minWidth: 72,
                }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: stat.color, fontFamily: brand.font }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: brand.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: brand.font }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {rows.length === 0 ? (
          <div style={{
            padding: "60px 0",
            textAlign: "center",
            color: brand.textMuted,
            fontSize: 14,
            border: `1.5px dashed ${brand.border}`,
            borderRadius: 12,
            background: brand.surfaceAlt,
            fontFamily: brand.font,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 500, color: brand.dark, marginBottom: 6 }}>No interviews yet</div>
            <div style={{ fontSize: 13 }}>Completed interviews will appear here for your review.</div>
          </div>
        ) : (
          <div style={{
            overflowX: "auto",
            border: `1px solid ${brand.border}`,
            borderRadius: 12,
            boxShadow: "0 1px 6px rgba(12,62,86,0.06)",
            background: brand.surface,
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              minWidth: 960,
            }}>
              <thead>
                <tr>
                  <Th width="17%">Candidate</Th>
                  <Th width="10%">Interview ID</Th>
                  <Th width="9%">Date</Th>
                  <Th width="7%">Time</Th>
                  <Th width="8%" center>Round</Th>
                  <Th width="11%">Interviewer 1</Th>
                  <Th width="11%">Interviewer 2</Th>
                  <Th width="11%">Interviewer 3</Th>
                  <Th width="16%" center>Decision</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const decided      = !!row.currentStatus;
                  const isProcessing = deciding === row.scheduledId;

                  return (
                    <tr
                      key={row.scheduledId}
                      style={{
                        opacity: decided ? 0.6 : 1,
                        background: idx % 2 === 0 ? brand.surface : brand.surfaceAlt,
                      }}
                    >
                      {/* Candidate */}
                      <Td>
                        <div style={{ fontWeight: 600, fontSize: 14, color: brand.dark }}>
                          {row.candidateName}
                        </div>
                        <div style={{ fontSize: 12, color: brand.primary, marginTop: 2 }}>
                          {row.jobTitle}
                        </div>
                      </Td>

                      {/* Interview ID */}
                      <Td style={{ fontSize: 12, color: brand.textMuted, fontWeight: 500 }}>
                        {row.interviewId}
                      </Td>

                      {/* Date */}
                      <Td style={{ fontSize: 13 }}>
                        {row.interviewDate
                          ? new Date(row.interviewDate).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short",
                            })
                          : "—"}
                      </Td>

                      {/* Time */}
                      <Td style={{ fontSize: 13, color: brand.textMuted }}>
                        {row.interviewTime
                          ? String(row.interviewTime).substring(0, 5)
                          : "—"}
                      </Td>

                      {/* Round */}
                      <Td center>
                        <RoundPill current={row.currentRound} total={row.totalRounds} />
                      </Td>

                      {/* Interviewer scores */}
                      {[0, 1, 2].map(i => (
                        <Td key={i}>
                          <ScoreCell score={row.interviewerScores?.[i]} />
                        </Td>
                      ))}

                      {/* Decision */}
                      <Td center>
                        {decided ? (
                          <StatusBadge status={row.currentStatus} />
                        ) : (
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleDecision(row.scheduledId, "PASS")}
                              style={{
                                background: isProcessing ? brand.successBg : brand.success,
                                color: isProcessing ? brand.success : "#fff",
                                border: `1px solid ${brand.successBorder}`,
                                padding: "5px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: isProcessing ? "wait" : "pointer",
                                opacity: isProcessing ? 0.6 : 1,
                                fontFamily: brand.font,
                              }}
                            >
                              {isProcessing ? "…" : "Pass"}
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleDecision(row.scheduledId, "FAIL")}
                              style={{
                                background: "transparent",
                                color: brand.danger,
                                border: `1px solid ${brand.dangerBorder}`,
                                padding: "5px 14px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: isProcessing ? "wait" : "pointer",
                                opacity: isProcessing ? 0.6 : 1,
                                fontFamily: brand.font,
                              }}
                            >
                              {isProcessing ? "…" : "Fail"}
                            </button>
                          </div>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
