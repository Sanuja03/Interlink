import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../../../api/SAdminSettingsApi";
import { showSuccess, showError } from "../../SAToast";

export default function CommunicationForm() {

  const [settings, setSettings] = useState({
    smtpServer: "",
    smtpPort: "",
    senderEmail: "",
    emailNotifications: false,
    smsNotifications: false
  });

  const [loading, setLoading] = useState(false);

  // 🔹 LOAD SETTINGS
  useEffect(() => {
    getSettings("COMMUNICATION")
      .then(res => {
        const obj = {};

        res.data.forEach(item => {
          if (item.keyName === "emailNotifications" || item.keyName === "smsNotifications") {
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
      { keyName: "smtpServer", value: settings.smtpServer },
      { keyName: "smtpPort", value: settings.smtpPort },
      { keyName: "senderEmail", value: settings.senderEmail },
      { keyName: "emailNotifications", value: settings.emailNotifications.toString() },
      { keyName: "smsNotifications", value: settings.smsNotifications.toString() }
    ];

    try {
      await saveSettings("COMMUNICATION", payload);
      showSuccess("Communication settings saved ✅");
    } catch (err) {
      console.error(err);
      showError("Failed to save ❌");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">

      {/* SMTP SERVER */}
      <div>
        <label className="text-sm">SMTP Server</label>
        <input
          className="w-full border p-2 rounded mt-1"
          value={settings.smtpServer}
          onChange={(e) => handleChange("smtpServer", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* SMTP PORT */}
      <div>
        <label className="text-sm">SMTP Port</label>
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={settings.smtpPort}
          onChange={(e) => handleChange("smtpPort", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="text-sm">Sender Email Address</label>
        <input
          className="w-full border p-2 rounded mt-1"
          value={settings.senderEmail}
          onChange={(e) => handleChange("senderEmail", e.target.value)}
          disabled={loading}
        />
      </div>

      {/* EMAIL TOGGLE */}
      <div className="flex items-center justify-between">
        <label>Email Notifications</label>
        <input
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={(e) => handleChange("emailNotifications", e.target.checked)}
          disabled={loading}
        />
      </div>

      {/* SMS TOGGLE */}
      <div className="flex items-center justify-between">
        <label>SMS Notifications</label>
        <input
          type="checkbox"
          checked={settings.smsNotifications}
          onChange={(e) => handleChange("smsNotifications", e.target.checked)}
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