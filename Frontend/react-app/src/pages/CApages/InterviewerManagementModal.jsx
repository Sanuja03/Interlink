import "./InterviewerManagementModal.css";

import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

//pick a random character and make a 10 character pwd
const generatePassword = () => {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
    let out = "";
    for (let i = 0; i < 10; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

const createEmptyRow = () => ({
    id: Date.now() + Math.random(),
    employeeId: "",
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
    branch: "",
    password: generatePassword(),
    address: "",
    about: "",
    active: true,
    created: false,
    saved: false,
    errors: {},
    serverData: null,
});

export default function InterviewerManagementModal({ open, onClose }) {
    const [rows, setRows] = useState([createEmptyRow()]);
    const [existingInterviewers, setExistingInterviewers] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loadingId, setLoadingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [fetchingExisting, setFetchingExisting] = useState(false);
    const [activeTab, setActiveTab] = useState("create");
    const [deactivatingId, setDeactivatingId] = useState(null);
    const [activatingId, setActivatingId] = useState(null);

    // Active = not suspended (includes "active" and "inactive" statuses)
    const activeCount = useMemo(
        () =>
            existingInterviewers.filter((i) => i.accountStatus !== "suspended")
                .length,
        [existingInterviewers]
    );

    // Total count = only existing interviewers from the server
    const totalCount = useMemo(
        () => existingInterviewers.length,
        [existingInterviewers]
    );

    // Suspended count
    const suspendedCount = useMemo(
        () =>
            existingInterviewers.filter((i) => i.accountStatus === "suspended")
                .length,
        [existingInterviewers]
    );

    //calls the api to get interviewers only whenn model is open
    useEffect(() => {
        if (open) {
            fetchExistingInterviewers();
        }
    }, [open]);

    if (!open) return null;

    const fetchExistingInterviewers = async () => {
        try {
            setFetchingExisting(true);
            const response = await api.get("/auth/interviewers");
            const data = Array.isArray(response.data) ? response.data : [];
            setExistingInterviewers(data);

            if (data.length > 0) {
                setActiveTab("existing");
            }
        } catch (error) {
            console.error("Failed to fetch interviewers:", error);
            showMessage("Failed to load existing interviewers.", "error");
        } finally {
            setFetchingExisting(false);
        }
    };

    //below error message in green for 3 seconds
    const showMessage = (text, type = "info") => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const updateRow = (id, key, value) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          [key]: value,
                          saved: false,
                          errors: { ...row.errors, [key]: "" },
                      }
                    : row
            )
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, createEmptyRow()]);
    };

    const removeRow = (id) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    // VALIDATION
    const validateRow = (row) => {
        const errors = {};

        // Employee ID
        if (!row.employeeId.trim()) {
            errors.employeeId = "Employee ID is required";
        } else if (row.employeeId.trim().length < 2) {
            errors.employeeId = "Employee ID must be at least 2 characters";
        } else if (!/^[A-Za-z0-9\-_]+$/.test(row.employeeId.trim())) {
            errors.employeeId = "Only letters, numbers, hyphens, and underscores allowed";
        }

        // Full Name
        if (!row.name.trim()) {
            errors.name = "Full name is required";
        } else if (row.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        } else if (!/^[A-Za-z\s'.()-]+$/.test(row.name.trim())) {
            errors.name = "Name can only contain letters and spaces";
        }

        // Email
        if (!row.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
            errors.email = "Enter a valid email address";
        }

        // Phone Number
        if (!row.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number is required";
        } else if (!/^[0-9+\-\s()]+$/.test(row.phoneNumber.trim())) {
            errors.phoneNumber = "Phone number can only contain digits, +, -, (, )";
        } else {
            const digitsOnly = row.phoneNumber.replace(/\D/g, "");
            if (digitsOnly.length < 7) {
                errors.phoneNumber = "Phone number must have at least 7 digits";
            } else if (digitsOnly.length > 15) {
                errors.phoneNumber = "Phone number cannot exceed 15 digits";
            }
        }

        // Role
        if (!row.role.trim()) {
            errors.role = "Role is required";
        } else if (row.role.trim().length < 2) {
            errors.role = "Role must be at least 2 characters";
        }

        // Branch
        if (!row.branch.trim()) {
            errors.branch = "Branch is required";
        } else if (row.branch.trim().length < 2) {
            errors.branch = "Branch must be at least 2 characters";
        }

        // Password
        if (!row.password.trim()) {
            errors.password = "Password is required";
        } else if (row.password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(row.password)) {
            errors.password = "Password must include at least one uppercase letter";
        } else if (!/[a-z]/.test(row.password)) {
            errors.password = "Password must include at least one lowercase letter";
        } else if (!/[0-9]/.test(row.password)) {
            errors.password = "Password must include at least one number";
        }

        // Address (optional but validate if provided)
        if (row.address.trim() && row.address.trim().length < 5) {
            errors.address = "Address must be at least 5 characters if provided";
        }

        // About (optional but validate if provided)
        if (row.about.trim() && row.about.trim().length < 10) {
            errors.about = "About must be at least 10 characters if provided";
        } else if (row.about.trim().length > 500) {
            errors.about = "About cannot exceed 500 characters";
        }

        return errors;
    };

    const saveRow = (id) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;

                const errors = validateRow(row);
                const hasErrors = Object.keys(errors).length > 0;

                if (hasErrors) {
                    showMessage("Please fix the required fields before saving.", "error");
                    return { ...row, errors, saved: false };
                }

                return { ...row, errors: {}, saved: true };
            })
        );
    };

    const buildCopyText = (row) => {
        return `Hello ${row.name || "Interviewer"},

    Your interviewer account details are below.

    Employee ID: ${row.employeeId}
    Full Name: ${row.name}
    Email: ${row.email}
    Phone Number: ${row.phoneNumber}
    Role: ${row.role}
    Branch: ${row.branch}
    Temporary Password: ${row.password}
    Status: Active

    Please log in using the above email and temporary password.
    After logging in, update your profile details if needed.`;
    };

    const copyDetails = async (row) => {
        try {
            await navigator.clipboard.writeText(buildCopyText(row));
            setCopiedId(row.id);
            showMessage("Login details copied successfully.", "success");
            setTimeout(() => setCopiedId(null), 1800);
        } catch (err) {
            showMessage("Failed to copy details.", "error");
        }
    };

    const deactivateExistingAccount = async (interviewerId) => {
        try {
            setDeactivatingId(interviewerId);

            await api.put(`/auth/interviewers/${interviewerId}/deactivate`);

            setExistingInterviewers((prev) =>
                prev.map((item) =>
                    item.interviewerId === interviewerId
                        ? { ...item, accountStatus: "suspended" }
                        : item
                )
            );

            showMessage("Account deactivated (suspended) successfully.", "success");
        } catch (error) {
            console.error("Deactivate failed:", error);
            showMessage("Failed to deactivate account.", "error");
        } finally {
            setDeactivatingId(null);
        }
    };

    const activateExistingAccount = async (interviewerId) => {
        try {
            setActivatingId(interviewerId);

            await api.put(`/auth/interviewers/${interviewerId}/activate`);

            setExistingInterviewers((prev) =>
                prev.map((item) =>
                    item.interviewerId === interviewerId
                        ? { ...item, accountStatus: "inactive" }
                        : item
                )
            );

            showMessage("Account activated successfully.", "success");
        } catch (error) {
            console.error("Activate failed:", error);
            showMessage("Failed to activate account.", "error");
        } finally {
            setActivatingId(null);
        }
    };

    const createAccount = async (row) => {
        const errors = validateRow(row);

        if (Object.keys(errors).length > 0) {
            setRows((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, errors } : r))
            );
            showMessage("Please complete all required fields first.", "error");
            return;
        }

        try {
            setLoadingId(row.id);

            // converts frontend row to backend row
            const payload = {
                interviewerId: row.employeeId,
                fullName: row.name,
                email: row.email,
                phone: row.phoneNumber,
                interviewerRole: row.role,
                branch: row.branch,
                password: row.password,
                address: row.address,
                about: row.about,
                active: true,
            };

            // send row data to backend endpoint
            const response = await api.post("/auth/complete-interviewer-signup", payload);

            const createdData = response.data;

            setRows((prev) =>
                prev.map((r) =>
                    r.id === row.id
                        ? {
                              ...r,
                              created: true,
                              saved: true,
                              errors: {},
                              serverData: createdData,
                          }
                        : r
                )
            );

            fetchExistingInterviewers();
            showMessage(`Account created for ${row.name}.`, "success");
        } catch (error) {
            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Account creation failed.";

            showMessage(String(backendMessage), "error");
        } finally {
            setLoadingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="interviewer-modal-overlay" onClick={onClose}>
            {/* stoppropagation is used to prevent the click inside the form getting as click outside  */}
            <div className="interviewer-modal" onClick={(e) => e.stopPropagation()}>

                {/* stat cards */}
                <div className="interviewer-stats three-cards">
                    <div className="interviewer-stat-card">
                        <span>Active Accounts</span>
                        <strong>{activeCount}</strong>
                    </div>

                    <div className="interviewer-stat-card">
                        <span>Suspended</span>
                        <strong>{suspendedCount}</strong>
                    </div>

                    <div className="interviewer-stat-card">
                        <span>Total Interviewers</span>
                        <strong>{totalCount}</strong>
                    </div>
                </div>

                {/* tab buttons */}
                <div className="interviewer-tabs">
                    <button
                        type="button"
                        className={`interviewer-tab ${activeTab === "create" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("create")}
                    >
                        Create New
                    </button>
                    <button
                        type="button"
                        className={`interviewer-tab ${activeTab === "existing" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("existing")}
                    >
                        Existing Interviewers
                        {existingInterviewers.length > 0 && (
                            <span className="tab-count">{existingInterviewers.length}</span>
                        )}
                    </button>
                </div>


{/* CREATE */}
                {activeTab === "create" && (
                    <>
                        {/* add interviewer button */}
                        <div>
                            <button
                                type="button"
                                className="interviewer-add-btn"
                                onClick={addRow}
                            >
                                + Add Interviewer
                            </button>
                        </div>

                        {/* interviewer form */}
                        <div className="interviewer-cards">
                            {/* rows is an array and map will loop through each row/item in that array amd react shows a card fro each row */}
                            {rows.map((row) => (
                                <div className="interviewer-card" key={row.id}>
                                    <div className="interviewer-card-top">
                                        <div>
                                            <h3>Interviewer</h3>

                                            {/* badges on the left */}
                                            <div className="interviewer-badges">
                                                <span
                                                    className={`badge ${row.created ? "badge-created" : "badge-not-created"}`}
                                                >
                                                    {row.created ? "Account Created" : "Not Created"}
                                                </span>

                                                {row.saved && !row.created && (
                                                    <span className="badge badge-saved">Saved</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* badges on right */}
                                        <div className="interviewer-card-actions">
                                            <button
                                                type="button"
                                                className="btn secondary"
                                                onClick={() => copyDetails(row)}
                                            >
                                                {copiedId === row.id ? "Copied" : "Copy Details"}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn light"
                                                onClick={() => saveRow(row.id)}
                                                disabled={loadingId === row.id}
                                            >
                                                Save
                                            </button>

                                            {!row.created ? (
                                                <button
                                                    type="button"
                                                    className="btn primary"
                                                    onClick={() => createAccount(row)}
                                                    disabled={loadingId === row.id}
                                                >
                                                    {loadingId === row.id ? "Creating..." : "Create Account"}
                                                </button>
                                            ) : (
                                                <button type="button" className="btn success" disabled>
                                                    {" "}
                                                    Account Created
                                                </button>
                                            )}

                                            {/* if account not created and row length grater than 1 u should be able to remove*/}
                                            {!row.created && rows.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn danger"
                                                    onClick={() => removeRow(row.id)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* if account created and server data is available then show the details of the created account in a grid format with labels and values */}
                                    {row.created && row.serverData && (
                                        <div className="interviewer-created-details">
                                            <h4>✓ Account Created Successfully</h4>

                                            <div className="created-details-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">Employee ID</span>
                                                    <span className="detail-value">
                                                        {row.serverData.interviewerId}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Full Name</span>
                                                    <span className="detail-value">
                                                        {row.serverData.fullName}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Email</span>
                                                    <span className="detail-value">
                                                        {row.serverData.email}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Phone</span>
                                                    <span className="detail-value">
                                                        {row.serverData.phone}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Role</span>
                                                    <span className="detail-value">
                                                        {row.serverData.interviewerRole}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Branch</span>
                                                    <span className="detail-value">
                                                        {row.serverData.branch}
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Status</span>
                                                    <span className="detail-value">
                                                        <span
                                                            className={`badge ${
                                                                row.serverData.accountStatus === "active"
                                                                    ? "badge-active"
                                                                    : row.serverData.accountStatus === "suspended"
                                                                    ? "badge-suspended"
                                                                    : "badge-disabled"
                                                            }`}
                                                        >
                                                            {row.serverData.accountStatus}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="detail-item">
                                                    <span className="detail-label">Created At</span>
                                                    <span className="detail-value">
                                                        {formatDate(row.serverData.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* if account not created show the form */}
                                    {!row.created && (
                                        <div className="interviewer-form-grid">
                                            <div className="field">
                                                <label>Employee ID *</label>
                                                <input
                                                    type="text"
                                                    value={row.employeeId}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "employeeId", e.target.value)
                                                    }
                                                    placeholder="INT-001"
                                                />
                                                {row.errors.employeeId && (
                                                    <small className="error-text">
                                                        {row.errors.employeeId}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(
                                                            /[^A-Za-z\s'.()-]/g,
                                                            ""
                                                        );
                                                        updateRow(row.id, "name", val);
                                                    }}
                                                    placeholder="Enter full name"
                                                />
                                                {row.errors.name && (
                                                    <small className="error-text">
                                                        {row.errors.name}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    value={row.email}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "email", e.target.value)
                                                    }
                                                    placeholder="Enter email"
                                                />
                                                {row.errors.email && (
                                                    <small className="error-text">
                                                        {row.errors.email}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    value={row.phoneNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(
                                                            /[^0-9+\-\s()]/g,
                                                            ""
                                                        );
                                                        updateRow(row.id, "phoneNumber", val);
                                                    }}
                                                    placeholder="e.g. +94 77 123 4567"
                                                />
                                                {row.errors.phoneNumber && (
                                                    <small className="error-text">
                                                        {row.errors.phoneNumber}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Role *</label>
                                                <input
                                                    type="text"
                                                    value={row.role}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "role", e.target.value)
                                                    }
                                                    placeholder="Enter role"
                                                />
                                                {row.errors.role && (
                                                    <small className="error-text">
                                                        {row.errors.role}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Branch *</label>
                                                <input
                                                    type="text"
                                                    value={row.branch}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "branch", e.target.value)
                                                    }
                                                    placeholder="Enter branch"
                                                />
                                                {row.errors.branch && (
                                                    <small className="error-text">
                                                        {row.errors.branch}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field">
                                                <label>Temporary Password *</label>
                                                <div className="password-box">
                                                    <input
                                                        type="text"
                                                        value={row.password}
                                                        onChange={(e) =>
                                                            updateRow(row.id, "password", e.target.value)
                                                        }
                                                        placeholder="Temporary password"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="generate-btn"
                                                        onClick={() =>
                                                            updateRow(row.id, "password", generatePassword())
                                                        }
                                                    >
                                                        Generate
                                                    </button>
                                                </div>
                                                {row.errors.password && (
                                                    <small className="error-text">
                                                        {row.errors.password}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field full-width">
                                                <label>Address</label>
                                                <input
                                                    type="text"
                                                    value={row.address}
                                                    onChange={(e) =>
                                                        updateRow(row.id, "address", e.target.value)
                                                    }
                                                    placeholder="Enter address"
                                                />
                                                {row.errors.address && (
                                                    <small className="error-text">
                                                        {row.errors.address}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="field full-width">
                                                <label>About</label>
                                                <textarea
                                                    value={row.about}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 500) {
                                                            updateRow(row.id, "about", e.target.value);
                                                        }
                                                    }}
                                                    placeholder="Enter a short professional summary"
                                                />

                                                {/* error etxt and counter (for this if under 450 gray over 450 red) */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    {row.errors.about ? (
                                                        <small className="error-text">
                                                            {row.errors.about}
                                                        </small>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <small
                                                        style={{
                                                            color:
                                                                row.about.length > 450 ? "#dc2626" : "#94a3b8",
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {row.about.length}/500
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

{/* EXISTING */}
                {activeTab === "existing" && (
                    <div className="interviewer-cards">
                        {fetchingExisting && (
                            <div className="interviewer-loading">
                                Loading existing interviewers...
                            </div>
                        )}

                        {!fetchingExisting && existingInterviewers.length === 0 && (
                            <div className="interviewer-empty">
                                No interviewers have been created yet. Switch to the Create New
                                tab to add interviewers.
                            </div>
                        )}

                        {existingInterviewers.map((interviewer) => (
                            <div
                                className="interviewer-card"
                                key={interviewer.interviewerId}
                            >
                                <div className="interviewer-card-top">
                                    <div>
                                        <h3>{interviewer.fullName}</h3>
                                        <div className="interviewer-badges">

                                          {/* badge styling */}
                                            <span
                                                className={`badge ${
                                                    interviewer.accountStatus === "active"
                                                        ? "badge-active"
                                                        : interviewer.accountStatus === "suspended"
                                                        ? "badge-suspended"
                                                        : "badge-saved"
                                                }`}
                                            >
                                          {/* badge text */}
                                                {interviewer.accountStatus === "active"
                                                    ? "Active"
                                                    : interviewer.accountStatus === "suspended"
                                                    ? "Suspended"
                                                    : "Inactive"}
                                            </span>

                                            <span className="badge badge-created">
                                                Account Created
                                            </span>

                                            {interviewer.firstLogin && (
                                                <span className="badge badge-first-login">
                                                    First Login Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="interviewer-card-actions">

                                        {interviewer.accountStatus !== "suspended" && (
                                            <button
                                                type="button"
                                                className="btn danger"
                                                onClick={() =>
                                                    deactivateExistingAccount(interviewer.interviewerId)
                                                }
                                                disabled={
                                                    deactivatingId === interviewer.interviewerId
                                                }
                                            >
                                                {deactivatingId === interviewer.interviewerId
                                                    ? "Deactivating..."
                                                    : "Deactivate"}
                                            </button>
                                        )}

                                        {interviewer.accountStatus === "suspended" && (
                                            <button
                                                type="button"
                                                className="btn primary"
                                                onClick={() =>
                                                    activateExistingAccount(interviewer.interviewerId)
                                                }
                                                disabled={activatingId === interviewer.interviewerId}
                                            >
                                                {activatingId === interviewer.interviewerId
                                                    ? "Activating..."
                                                    : "Activate"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="created-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Employee ID</span>
                                        <span className="detail-value">
                                            {interviewer.interviewerId}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Email</span>
                                        <span className="detail-value">{interviewer.email}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Phone</span>
                                        <span className="detail-value">
                                            {interviewer.phone || "—"}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Role</span>
                                        <span className="detail-value">
                                            {interviewer.interviewerRole}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Branch</span>
                                        <span className="detail-value">{interviewer.branch}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Status</span>
                                        <span className="detail-value">
                                            {interviewer.accountStatus === "active"
                                                ? "Active"
                                                : interviewer.accountStatus === "suspended"
                                                ? "Suspended"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    {interviewer.address && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Address</span>
                                            <span className="detail-value">
                                                {interviewer.address}
                                            </span>
                                        </div>
                                    )}

                                    {interviewer.about && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">About</span>
                                            <span className="detail-value">{interviewer.about}</span>
                                        </div>
                                    )}

                                    <div className="detail-item">
                                        <span className="detail-label">Created At</span>
                                        <span className="detail-value">
                                            {formatDate(interviewer.createdAt)}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">Updated At</span>
                                        <span className="detail-value">
                                            {formatDate(interviewer.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {message && (
                    <div className={`interviewer-message ${messageType}`}>{message}</div>
                )}

                <div className="interviewer-footer">
                    <button
                        type="button"
                        className="footer-close-btn"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}