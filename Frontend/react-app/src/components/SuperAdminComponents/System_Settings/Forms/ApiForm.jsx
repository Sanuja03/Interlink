import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../../../api/SAdminSettingsApi";
import { showSuccess, showError } from "../../SAToast";
import { createActivityLog } from "../../../../api/ActivityLogsApi";
import { useAuth } from "../../../../context/Authcontext";

export default function ApiForm({ loading, setLoading, onClose }) {
  const { appUser } = useAuth();

  const [settings, setSettings] = useState({
    rateLimit: "",
    apiKey: "",
    webhookUrl: "",
    apiEnabled: false
  });



  // LOAD
  useEffect(() => {
  getSettings("API")
    .then(res => {
      const items = Array.isArray(res) ? res : [];
      const obj = {};
      items.forEach(item => {
        if (item.keyName === "apiEnabled") {
          obj[item.keyName] = item.value === "true";
        } else {
          obj[item.keyName] = item.value;
        }
      });
      setSettings(prev => ({ ...prev, ...obj }));
    })
    .catch(err => console.error(err));
}, []);

  //  HANDLE CHANGE
  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // SAVE
  const handleSave = async () => {
     if (!settings.apiKey) {
      showError("Please fill all required fields");
      return;
    }
    if (!settings.rateLimit>0) {
      showError("Invalid rate limit value");
      return;
    }
    if (!settings.webhookUrl.startsWith("http://") && !settings.webhookUrl.includes(".")) {
      showError("Invalid webhook URL");
      return;
    }
    setLoading(true);

    const payload = [
      { keyName: "rateLimit", value: settings.rateLimit },
      { keyName: "apiKey", value: settings.apiKey },
      { keyName: "webhookUrl", value: settings.webhookUrl },
      { keyName: "apiEnabled", value: settings.apiEnabled.toString() }
    ];

    try {
      await saveSettings("API", payload);
      showSuccess("API settings saved ✅");
      await createActivityLog({
        userId: appUser?.userId ?? null,
        userRole: appUser?.role ?? "UNKNOWN",
        action: "UPDATE",
        entityType: "API_SETTINGS",
        description: "Updated API Settings"
      });
      setTimeout(() => {
        onClose();
        }, 5000);
    } catch (err) {
      console.error(err);
      showError("Failed to save ❌");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">

      {/* RATE LIMIT */}
      <div>
        <label className="text-sm">API Rate Limit</label>
        <input
          className="w-full border p-2 rounded mt-1"
          placeholder="e.g. 1000"
          value={settings.rateLimit}
          onChange={(e) => handleChange("rateLimit", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* API KEY */}
      <div>
        <label className="text-sm">API Key</label>
        <input
          type="password"
          className="w-full border p-2 rounded mt-1"
          placeholder="************"
          value={settings.apiKey}
          onChange={(e) => handleChange("apiKey", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* WEBHOOK */}
      <div>
        <label className="text-sm">Webhook URL</label>
        <input
          className="w-full border p-2 rounded mt-1"
          placeholder="https://example.com/webhook"
          value={settings.webhookUrl}
          onChange={(e) => handleChange("webhookUrl", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* ENABLE API */}
      <div className="flex items-center justify-between">
        <label>Enable API Access</label>
        <input
          type="checkbox"
          checked={settings.apiEnabled}
          onChange={(e) => handleChange("apiEnabled", e.target.checked)}
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