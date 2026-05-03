import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../../../api/SAdminSettingsApi";
import { showSuccess, showError } from "../../SAToast";
import { createActivityLog } from "../../../../api/ActivityLogsApi";
import {useAuth} from "../../../../context/Authcontext"

export default function StorageForm({ loading, setLoading, onClose }) {
    
  const { appUser } = useAuth();

  const [settings, setSettings] = useState({
    provider: "",
    maxUploadSize: "",
    allowedTypes: "",
    retentionPeriod: ""
  });


  // LOAD
  useEffect(() => {
  getSettings("STORAGE")
    .then(res => {
      const items = Array.isArray(res) ? res : [];
      const obj = {};
      items.forEach(item => {
        obj[item.keyName] = item.value;
      });
      setSettings(prev => ({ ...prev, ...obj }));
    })
    .catch(err => console.error(err));
}, []);

  // HANDLE CHANGE
  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // SAVE
  const handleSave = async () => {
    if (settings.maxUploadSize <= 0 || settings.retentionPeriod <= 0) {
      showError("Invalid max upload size or retention period");
      return;
    }
    setLoading(true);

    const payload = [
      { keyName: "provider", value: settings.provider },
      { keyName: "maxUploadSize", value: settings.maxUploadSize },
      { keyName: "allowedTypes", value: settings.allowedTypes },
      { keyName: "retentionPeriod", value: settings.retentionPeriod }
    ];

    try {
      await saveSettings("STORAGE", payload);
      showSuccess("Storage settings saved ✅");

      await createActivityLog({
        userId: appUser?.userId ?? null,
        userRole: appUser?.role ?? "UNKNOWN",
        action: "UPDATE",
        entityType: "STORAGE_SETTINGS",
        description: "Updated Storage Settings"
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

      {/* PROVIDER */}
      <div>
        <label className="text-sm">Storage Provider</label>
        <select
          className="w-full border p-2 rounded mt-1"
          value={settings.provider}
          onChange={(e) => handleChange("provider", e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>Select</option>
          <option value="AWS">AWS S3</option>
          <option value="GCP">Google Cloud</option>
          <option value="LOCAL">Local Storage</option>
        </select>
      </div>

      {/* MAX SIZE */}
      <div>
        <label className="text-sm">Max File Upload Size (MB)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={settings.maxUploadSize}
          onChange={(e) => handleChange("maxUploadSize", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* TYPES */}
      <div>
        <label className="text-sm">Allowed File Types</label>
        <input
          className="w-full border p-2 rounded mt-1"
          value={settings.allowedTypes}
          onChange={(e) => handleChange("allowedTypes", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* RETENTION */}
      <div>
        <label className="text-sm">Retention Period (days)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={settings.retentionPeriod}
          onChange={(e) => handleChange("retentionPeriod", e.target.value)}
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