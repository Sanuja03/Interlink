import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../../../api/SAdminSettingsApi";
import { showSuccess, showError } from "../../SAToast";

export default function SystemForm() {

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    timezone: "",
    logLevel: "",
    cacheExpiration: "",
    maintenanceMode: false
  });

  // 🔹 LOAD DATA FROM BACKEND
  useEffect(() => {
    getSettings("SYSTEM")
      .then(res => {
        const obj = {};

        res.data.forEach(item => {
          if (item.keyName === "maintenanceMode") {
            obj[item.keyName] = item.value === "true";
          } else {
            obj[item.keyName] = item.value;
          }
        });

        setSettings(prev => ({ ...prev, ...obj }));
      })
      .catch(err => console.error(err));
  }, []);

  // 🔹 HANDLE INPUT CHANGE
  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 🔹 SAVE
  const handleSave = async () => {
    setLoading(true);
    const payload = [
      { keyName: "timezone", value: settings.timezone },
      { keyName: "logLevel", value: settings.logLevel },
      { keyName: "cacheExpiration", value: settings.cacheExpiration },
      { keyName: "maintenanceMode", value: settings.maintenanceMode.toString() }
    ];

    try {
      await saveSettings("SYSTEM", payload);
      showSuccess("Settings saved successfully ✅");
    } catch (err) {
      console.error(err);
      showError("Failed to save settings ❌");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">

      {/* TIMEZONE */}
      <div>
        <label className="text-sm">System Time Zone</label>
        <select
          className="w-full border p-2 rounded mt-1"
          value={settings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
        >
          <option value="">Select</option>
          <option value="GMT+5:30">GMT +5:30 (Sri Lanka)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      {/* LOG LEVEL */}
      <div>
        <label className="text-sm">Log Level</label>
        <select
          className="w-full border p-2 rounded mt-1"
          value={settings.logLevel}
          onChange={(e) => handleChange("logLevel", e.target.value)}
        >
          <option value="">Select</option>
          <option value="INFO">Info</option>
          <option value="DEBUG">Debug</option>
          <option value="ERROR">Error</option>
        </select>
      </div>

      {/* CACHE */}
      <div>
        <label className="text-sm">Cache Expiration (hours)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          placeholder="e.g. 24"
          value={settings.cacheExpiration}
          onChange={(e) => handleChange("cacheExpiration", e.target.value)}
        />
      </div>

      {/* MAINTENANCE */}
      <div className="flex items-center justify-between">
        <label>Maintenance Mode</label>
        <input
          type="checkbox"
          checked={settings.maintenanceMode}
          onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
        />
      </div>

      {/* SAVE BUTTON */}
        <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-2 rounded text-white transition ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
        {loading ? "Saving..." : "Save Changes"}
        </button>

    </div>
  );
}