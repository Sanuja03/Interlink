import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../../../api/SAdminSettingsApi";
import { showSuccess, showError } from "../../SAToast";

export default function AuthenticationForm() {

  const [settings, setSettings] = useState({
    twoFactor: false,
    passwordPolicy: "",
    sessionTimeout: "",
    maxLoginAttempts: ""
  });

  const [loading, setLoading] = useState(false);

  // 🔹 LOAD SETTINGS
  useEffect(() => {
    getSettings("AUTH")
      .then(res => {
        const obj = {};

        res.data.forEach(item => {
          if (item.keyName === "twoFactor") {
            obj[item.keyName] = item.value === "true";
          } else {
            obj[item.keyName] = item.value;
          }
        });

        setSettings(prev => ({ ...prev, ...obj }));
      })
      .catch(err => console.error(err));
  }, []);

  // 🔹 HANDLE CHANGE
  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 🔹 SAVE SETTINGS
  const handleSave = async () => {
    setLoading(true);

    const payload = [
      { keyName: "twoFactor", value: settings.twoFactor.toString() },
      { keyName: "passwordPolicy", value: settings.passwordPolicy },
      { keyName: "sessionTimeout", value: settings.sessionTimeout },
      { keyName: "maxLoginAttempts", value: settings.maxLoginAttempts }
    ];

    try {
      await saveSettings("AUTH", payload);
      showSuccess("Authentication settings saved ✅");
    } catch (err) {
      console.error(err);
      showError("Failed to save ❌");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">

      {/* 2FA */}
      <div className="flex items-center justify-between">
        <label>Two-Factor Authentication</label>
        <input
          type="checkbox"
          checked={settings.twoFactor}
          onChange={(e) => handleChange("twoFactor", e.target.checked)}
          disabled={loading}
        />
      </div>

      {/* PASSWORD POLICY */}
      <div>
        <label className="text-sm">Password Policy</label>
        <select
          className="w-full border p-2 rounded mt-1"
          value={settings.passwordPolicy}
          onChange={(e) => handleChange("passwordPolicy", e.target.value)}
          disabled={loading}
        >
          <option value="">Select</option>
          <option value="STRONG">Strong (12+ chars, special chars)</option>
          <option value="MEDIUM">Medium</option>
        </select>
      </div>

      {/* SESSION TIMEOUT */}
      <div>
        <label className="text-sm">Session Timeout (minutes)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={settings.sessionTimeout}
          onChange={(e) => handleChange("sessionTimeout", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* MAX LOGIN ATTEMPTS */}
      <div>
        <label className="text-sm">Max Login Attempts</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={settings.maxLoginAttempts}
          onChange={(e) => handleChange("maxLoginAttempts", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-2 rounded text-white transition ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

    </div>
  );
}