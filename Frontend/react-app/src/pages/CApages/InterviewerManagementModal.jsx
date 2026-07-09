import React, { useEffect, useMemo, useState } from "react";
import "./InterviewerManagementModal.css";
import api from "../../lib/api";
import { supabase } from "../../lib/supabase";

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

const createEmptyRow = () => ({
  id: Date.now() + Math.random(),
  employeeId: "", name: "", email: "", phoneNumber: "",
  role: "", branch: "", password: generatePassword(),
  address: "", about: "", active: true,
  created: false, saved: false, errors: {}, serverData: null,
});

export default function InterviewerManagementModal({ open, onClose, companyId }) {
  const [rows, setRows] = useState([createEmptyRow()]);
  const [existingInterviewers, setExistingInterviewers] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [deactivatingId, setDeactivatingId] = useState(null);

  // Subscription limit state
  const [interviewerLimit, setInterviewerLimit] = useState(null);  // null = not loaded yet
  const [limitError, setLimitError] = useState("");

  const activeCount = useMemo(
    () => existingInterviewers.filter((i) => i.accountStatus === "active").length,
    [existingInterviewers]
  );
  const totalCount = useMemo(() => existingInterviewers.length, [existingInterviewers]);

  useEffect(() => {
    if (open) {
      setRows([createEmptyRow()]);
      setLimitError("");
      fetchExistingInterviewers();
    }
  }, [open]);

  useEffect(() => {
    if (open && companyId) {
      fetchInterviewerLimit();
    }
  }, [open, companyId]);

  if (!open) return null;

  // ── Fetch plan limit + current interviewer count from Supabase ──
  const fetchInterviewerLimit = async () => {
    try {
      const { data, error } = await supabase
        .from("active_subscriptions")
        .select("plan_id, subscription_plans(interviewers, name)")
        .eq("company_id", companyId)
        .single();
  
      if (error || !data) return;
      const plan = data.subscription_plans;
      setInterviewerLimit({ limit: plan?.interviewers ?? null, planName: plan?.name ?? "Unknown" });
    } catch (err) {
      console.error("Failed to fetch interviewer limit:", err);
    }
  };
  


  const checkLimitBeforeCreate = async () => {
    if (!companyId) {
      setLimitError("Cannot verify subscription limit. Please reload and try again.");
      return false;
    }
  
    // Query subscription_plans directly via plan_id 
    const { data: subData, error: subError } = await supabase
      .from("active_subscriptions")
      .select("plan_id, subscription_plans(interviewers, name)")    // join to get plan details in one query 
      .eq("company_id", companyId)
      .single();
  
    if (subError || !subData) {
      setLimitError("Could not verify subscription limit. Please try again.");
      return false;
    }
  
    const plan = subData.subscription_plans;
    const limit = plan?.interviewers;
  
    if (!limit || limit <= 0) return true; // unlimited gets immediate pass
  
      // Count current interviewers for the company
    const { count, error: countError } = await supabase
      .from("interviewers")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);
  
    if (countError || count === null) {
      setLimitError("Could not verify interviewer count. Please try again.");
      return false;
    }
  
    if (count >= limit) {
      setLimitError(`Interviewer limit reached. Your ${plan.name} plan allows ${limit} interviewers. Please upgrade your plan.`);
      return false;
    }
  
    setLimitError("");   // Clear any previous limit errors
    return true;
  };



  const fetchExistingInterviewers = async () => {
    try {
      setFetchingExisting(true);
      const response = await api.get("/auth/interviewers");
      const data = Array.isArray(response.data) ? response.data : [];
      setExistingInterviewers(data);
      if (data.length > 0) setActiveTab("existing");
    } catch (error) {
      console.error("Failed to fetch interviewers:", error);
      showMessage("Failed to load existing interviewers.", "error");
    } finally {
      setFetchingExisting(false);
    }
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 4000);
  };

  const updateRow = (id, key, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [key]: value, saved: false, errors: { ...row.errors, [key]: "" } } : row
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (id) => setRows((prev) => prev.filter((row) => row.id !== id));

  const validateRow = (row) => {
    const errors = {};
    if (!row.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!row.name.trim()) errors.name = "Full name is required";
    if (!row.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(row.email)) errors.email = "Enter a valid email";
    if (!row.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!row.role.trim()) errors.role = "Role is required";
    if (!row.branch.trim()) errors.branch = "Branch is required";
    if (!row.password.trim()) errors.password = "Password is required";
    else if (row.password.length < 8) errors.password = "Password must be at least 8 characters";
    return errors;
  };

  const saveRow = (id) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const errors = validateRow(row);
        if (Object.keys(errors).length > 0) {
          showMessage("Please fix the required fields before saving.", "error");
          return { ...row, errors, saved: false };
        }
        return { ...row, errors: {}, saved: true };
      })
    );
  };

  const buildCopyText = (row) =>
    `Hello ${row.name || "Interviewer"},\n\nYour interviewer account details are below.\n\nEmployee ID: ${row.employeeId}\nFull Name: ${row.name}\nEmail: ${row.email}\nPhone Number: ${row.phoneNumber}\nRole: ${row.role}\nBranch: ${row.branch}\nTemporary Password: ${row.password}\nStatus: Active\n\nPlease log in using the above email and temporary password.`;

  const buildCopyTextFromServer = (interviewer) =>
    `Hello ${interviewer.fullName || "Interviewer"},\n\nYour interviewer account details are below.\n\nEmployee ID: ${interviewer.interviewerId}\nFull Name: ${interviewer.fullName}\nEmail: ${interviewer.email}\nPhone Number: ${interviewer.phone || "—"}\nRole: ${interviewer.interviewerRole}\nBranch: ${interviewer.branch}\nStatus: ${interviewer.accountStatus === "active" ? "Active" : "Inactive"}\n\nPlease log in using your email and the temporary password provided.`;

  const copyDetails = async (row) => {
    try {
      await navigator.clipboard.writeText(buildCopyText(row));
      setCopiedId(row.id);
      showMessage("Login details copied successfully.", "success");
      setTimeout(() => setCopiedId(null), 1800);
    } catch { showMessage("Failed to copy details.", "error"); }
  };

  const copyExistingDetails = async (interviewer) => {
    try {
      await navigator.clipboard.writeText(buildCopyTextFromServer(interviewer));
      setCopiedId(interviewer.interviewerId);
      showMessage("Details copied successfully.", "success");
      setTimeout(() => setCopiedId(null), 1800);
    } catch { showMessage("Failed to copy details.", "error"); }
  };

  const deactivateExistingAccount = async (interviewerId) => {
    try {
      setDeactivatingId(interviewerId);
      await api.put(`/auth/interviewers/${interviewerId}/deactivate`);
      setExistingInterviewers((prev) =>
        prev.map((item) =>
          item.interviewerId === interviewerId ? { ...item, accountStatus: "inactive" } : item
        )
      );
      showMessage("Account deactivated successfully.", "success");
    } catch {
      showMessage("Failed to deactivate account.", "error");
    } finally {
      setDeactivatingId(null);
    }
  };

  const createAccount = async (row) => {
    const errors = validateRow(row);
    if (Object.keys(errors).length > 0) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, errors } : r)));
      showMessage("Please complete all required fields first.", "error");
      return;
    }

    // Hard guard — should never happen but catches any race condition
    if (!companyId) {
      setLimitError("Company ID not loaded yet. Please close and reopen this panel.");
      return;
    }

    // ── SUBSCRIPTION LIMIT CHECK ──
    const allowed = await checkLimitBeforeCreate();
    if (!allowed) return;

    try {
      setLoadingId(row.id);
      const payload = {
        interviewerId: row.employeeId, fullName: row.name, email: row.email,
        phone: row.phoneNumber, interviewerRole: row.role, branch: row.branch,
        password: row.password, address: row.address, about: row.about, active: true,
      };
      const response = await api.post("/auth/complete-interviewer-signup", payload);
      const createdData = response.data;
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, created: true, saved: true, errors: {}, serverData: createdData } : r
        )
      );
      fetchExistingInterviewers();
      showMessage(`Account created for ${row.name}.`, "success");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.response?.data || "Account creation failed.";
      showMessage(String(backendMessage), "error");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  // Limit display info
  const limitInfo = interviewerLimit
    ? `${totalCount} / ${interviewerLimit.limit ?? "∞"} interviewers used`
    : null;

  
  
    return (
    <div className="interviewer-modal-overlay" onClick={onClose}>
      <div className="interviewer-modal" onClick={(e) => e.stopPropagation()}>

        <div className="interviewer-modal-header">
          <div>
            <h2>Interviewer Management</h2>
            <p>Create interviewer profiles and manage existing interviewer accounts.</p>
          </div>
          <button type="button" className="interviewer-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="interviewer-stats two-cards">
          <div className="interviewer-stat-card">
            <span>Active Accounts</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="interviewer-stat-card">
            <span>Total Interviewers</span>
            <strong>
              {totalCount}
              {interviewerLimit?.limit ? (
                <span style={{ fontSize: 12, fontWeight: 400, color: "#888", marginLeft: 4 }}>
                  / {interviewerLimit.limit}
                </span>
              ) : null}
            </strong>
          </div>
        </div>

        {/* LIMIT WARNING BANNER */}
        {limitError && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
            borderRadius: 10, padding: "12px 16px", margin: "0 0 12px 0",
            fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "flex-start"
          }}>
            <span>⚠️ {limitError}</span>
            <button onClick={() => setLimitError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>
        )}

        <div className="interviewer-tabs">
          <button type="button" className={`interviewer-tab ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>
            Create New
          </button>
          <button type="button" className={`interviewer-tab ${activeTab === "existing" ? "tab-active" : ""}`} onClick={() => setActiveTab("existing")}>
            Existing Interviewers
            {existingInterviewers.length > 0 && <span className="tab-count">{existingInterviewers.length}</span>}
          </button>
        </div>

        {activeTab === "create" && (
          <>
            <div className="interviewer-toolbar">
              <button type="button" className="interviewer-add-btn" onClick={addRow}>+ Add Interviewer</button>
              {limitInfo && <span style={{ fontSize: 12, color: "#888", marginLeft: 12 }}>{limitInfo}</span>}
            </div>

            <div className="interviewer-cards">
              {rows.map((row) => (
                <div className="interviewer-card" key={row.id}>
                  <div className="interviewer-card-top">
                    <div>
                      <h3>Interviewer</h3>
                      <div className="interviewer-badges">
                        <span className={`badge ${row.created ? "badge-created" : "badge-not-created"}`}>
                          {row.created ? "Account Created" : "Not Created"}
                        </span>
                        {row.saved && !row.created && <span className="badge badge-saved">Saved</span>}
                      </div>
                    </div>
                    <div className="interviewer-card-actions">
                      <button type="button" className="btn secondary" onClick={() => copyDetails(row)}>
                        {copiedId === row.id ? "Copied" : "Copy Details"}
                      </button>

                      <button type="button" className="btn light" onClick={() => saveRow(row.id)} disabled={loadingId === row.id}>Save</button>
                      {!row.created ? (
                        <button type="button" className="btn primary" onClick={() => createAccount(row)} disabled={loadingId === row.id}>
                          {loadingId === row.id ? "Creating..." : "Create Account"}
                        </button>
                      ) : (
                        <button type="button" className="btn success" disabled>Account Created</button>
                      )}
                      {!row.created && rows.length > 1 && (
                        <button type="button" className="btn danger" onClick={() => removeRow(row.id)}>Remove</button>
                      )}
                    </div>
                  </div>

                  {row.created && row.serverData && (
                    <div className="interviewer-created-details">
                      <h4>✓ Account Created Successfully</h4>
                      <div className="created-details-grid">
                        {[
                          ["Employee ID", row.serverData.interviewerId],
                          ["Full Name", row.serverData.fullName],
                          ["Email", row.serverData.email],
                          ["Phone", row.serverData.phone],
                          ["Role", row.serverData.interviewerRole],
                          ["Branch", row.serverData.branch],
                          ["Status", row.serverData.accountStatus],
                          ["Created At", formatDate(row.serverData.createdAt)],
                        ].map(([label, value]) => (
                          <div className="detail-item" key={label}>
                            <span className="detail-label">{label}</span>
                            <span className="detail-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!row.created && (
                    <div className="interviewer-form-grid">
                      {[
                        { key: "employeeId", label: "Employee ID *", placeholder: "INT-001" },
                        { key: "name", label: "Full Name *", placeholder: "Enter full name" },
                        { key: "email", label: "Email *", placeholder: "Enter email", type: "email" },
                        { key: "phoneNumber", label: "Phone Number *", placeholder: "Enter phone number" },
                        { key: "role", label: "Role *", placeholder: "Enter role" },
                        { key: "branch", label: "Branch *", placeholder: "Enter branch" },
                      ].map(({ key, label, placeholder, type = "text" }) => (
                        <div className="field" key={key}>
                          <label>{label}</label>
                          <input type={type} value={row[key]} placeholder={placeholder}
                            onChange={(e) => updateRow(row.id, key, e.target.value)} />
                          {row.errors[key] && <small className="error-text">{row.errors[key]}</small>}
                        </div>
                      ))}

                      <div className="field">
                        <label>Temporary Password *</label>
                        <div className="password-box">
                          <input type="text" value={row.password} placeholder="Temporary password"
                            onChange={(e) => updateRow(row.id, "password", e.target.value)} />
                          <button type="button" className="generate-btn" onClick={() => updateRow(row.id, "password", generatePassword())}>Generate</button>
                        </div>
                        {row.errors.password && <small className="error-text">{row.errors.password}</small>}
                      </div>

                      <div className="field full-width">
                        <label>Address</label>
                        <input type="text" value={row.address} placeholder="Enter address"
                          onChange={(e) => updateRow(row.id, "address", e.target.value)} />
                      </div>

                      <div className="field full-width">
                        <label>About</label>
                        <textarea value={row.about} placeholder="Enter a short professional summary"
                          onChange={(e) => updateRow(row.id, "about", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "existing" && (
          <div className="interviewer-cards">
            {fetchingExisting && <div className="interviewer-loading">Loading existing interviewers...</div>}
            {!fetchingExisting && existingInterviewers.length === 0 && (
              <div className="interviewer-empty">No interviewers have been created yet. Switch to the Create New tab to add interviewers.</div>
            )}
            {existingInterviewers.map((interviewer) => (
              <div className="interviewer-card" key={interviewer.interviewerId}>
                <div className="interviewer-card-top">
                  <div>
                    <h3>{interviewer.fullName}</h3>
                    <div className="interviewer-badges">
                      <span className={`badge ${interviewer.accountStatus === "active" ? "badge-active" : "badge-disabled"}`}>
                        {interviewer.accountStatus === "active" ? "Active" : "Inactive"}
                      </span>
                      <span className="badge badge-created">Account Created</span>
                      {interviewer.firstLogin && <span className="badge badge-first-login">First Login Pending</span>}
                    </div>
                  </div>
                  <div className="interviewer-card-actions">
                    <button type="button" className="btn secondary" onClick={() => copyExistingDetails(interviewer)}>
                      {copiedId === interviewer.interviewerId ? "Copied" : "Copy Details"}
                    </button>
                    {interviewer.accountStatus === "active" && (
                      <button type="button" className="btn danger"
                        onClick={() => deactivateExistingAccount(interviewer.interviewerId)}
                        disabled={deactivatingId === interviewer.interviewerId}>
                        {deactivatingId === interviewer.interviewerId ? "Deactivating..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="created-details-grid">
                  {[
                    ["Employee ID", interviewer.interviewerId],
                    ["Email", interviewer.email],
                    ["Phone", interviewer.phone || "—"],
                    ["Role", interviewer.interviewerRole],
                    ["Branch", interviewer.branch],
                    ["Status", interviewer.accountStatus],
                    ...(interviewer.address ? [["Address", interviewer.address]] : []),
                    ...(interviewer.about ? [["About", interviewer.about]] : []),
                    ["Created At", formatDate(interviewer.createdAt)],
                    ["Updated At", formatDate(interviewer.updatedAt)],
                  ].map(([label, value]) => (
                    <div className={`detail-item ${["Address", "About"].includes(label) ? "full-width" : ""}`} key={label}>
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {message && <div className={`interviewer-message ${messageType}`}>{message}</div>}

        <div className="interviewer-footer">
          <button type="button" className="footer-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}