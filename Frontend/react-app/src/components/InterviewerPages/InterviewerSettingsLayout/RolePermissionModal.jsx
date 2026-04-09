import React, { useMemo, useState } from "react";
import "./RolePermissionModal.css";

function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className={
        "rpm-switch " +
        (checked ? "rpm-switch--on " : "rpm-switch--off ") +
        (disabled ? "rpm-switch--disabled" : "")
      }
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      aria-disabled={disabled}
    >
      <span className="rpm-switch__knob" />
    </button>
  );
}

export default function RolePermissionModal({ open, onClose }) {
  const initialRoles = useMemo(
    () => [
      {
        id: 1,
        name: "Admin",
        perms: { role: true, schedule: true, final: true },
      },
      {
        id: 2,
        name: "HR Manager",
        perms: { role: true, schedule: true, final: true },
      },
      {
        id: 3,
        name: "Interviewer",
        perms: { role: true, schedule: false, final: false },
      },
    ],
    []
  );

  const [roles, setRoles] = useState(initialRoles);

  if (!open) return null;

  const updateRoleName = (id, value) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, name: value } : r)));
  };

  const updatePerm = (id, key, value) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, perms: { ...r.perms, [key]: value } } : r))
    );
  };

  const addRole = () => {
    const nextId = Math.max(...roles.map((r) => r.id)) + 1;
    setRoles((prev) => [
      ...prev,
      { id: nextId, name: "New Role", perms: { role: true, schedule: false, final: false } },
    ]);
  };

  const removeLastRole = () => {
    if (roles.length <= 1) return;
    setRoles((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    // later: send roles to backend
    onClose();
  };

  return (
    <div className="rpm-overlay" onMouseDown={onClose}>
      <div className="rpm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rpm-titleRow">
          <span className="rpm-titleSquare" />
          <h2 className="rpm-title">Role-Based Permission Settings</h2>
        </div>

        <div className="rpm-gridHeader">
          <div>Role</div>
          <div className="rpm-center">Role</div>
          <div className="rpm-center">Schedule Interview</div>
          <div className="rpm-center">Final Decision</div>
        </div>

        <div className="rpm-rows">
          {roles.map((r) => (
            <div className="rpm-row" key={r.id}>
              <input
                className="rpm-input"
                value={r.name}
                onChange={(e) => updateRoleName(r.id, e.target.value)}
              />

              <div className="rpm-center">
                <Switch
                  checked={r.perms.role}
                  onChange={(v) => updatePerm(r.id, "role", v)}
                />
              </div>

              <div className="rpm-center">
                <Switch
                  checked={r.perms.schedule}
                  onChange={(v) => updatePerm(r.id, "schedule", v)}
                />
              </div>

              <div className="rpm-center">
                <Switch
                  checked={r.perms.final}
                  onChange={(v) => updatePerm(r.id, "final", v)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rpm-addRow">
          <button className="rpm-squareBtn" type="button" onClick={addRole}>
            +
          </button>
          <button className="rpm-squareBtn" type="button" onClick={removeLastRole}>
            –
          </button>
        </div>

        <div className="rpm-actions">
          <button className="rpm-cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="rpm-save" type="button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}