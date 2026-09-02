import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../../api/SAdminSettingsApi";
import { createActivityLog } from "../../api/ActivityLogsApi";
import { useAuth } from "../../context/Authcontext";
import { showSuccess, showError } from "../../components/SuperAdminComponents/SAToast";

export default function SystemSettings() {
  const { appUser } = useAuth();

  const [dailyLimit,       setDailyLimit]       = useState("");
  const [warningThreshold, setWarningThreshold] = useState("");
  // NEW: max characters allowed per chatbot message
  const [maxMessageLength, setMaxMessageLength] = useState("");
  const [loading,          setLoading]          = useState(false);
  const [fetching,         setFetching]         = useState(true);

  // Load chatbot settings from DB on mount
  useEffect(() => {
    getSettings("CHATBOT")
      .then(res => {
        const items = Array.isArray(res) ? res : [];
        const limitItem     = items.find(i => i.keyName === "dailyLimit");
        const warningItem   = items.find(i => i.keyName === "warningThreshold");
        const maxLengthItem = items.find(i => i.keyName === "maxMessageLength");
        if (limitItem)     setDailyLimit(limitItem.value);
        if (warningItem)   setWarningThreshold(warningItem.value);
        // Falls back to 1000 if not yet configured in the DB — matches the
        // backend default in AIChatMessageService.getMaxMessageLength().
        setMaxMessageLength(maxLengthItem ? maxLengthItem.value : "1000");
      })
      .catch(err => console.error("[SystemSettings] Failed to load settings:", err))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    const parsedLimit     = parseInt(dailyLimit, 10);
    const parsedWarning   = parseInt(warningThreshold, 10);
    const parsedMaxLength = parseInt(maxMessageLength, 10);

    // Validate daily limit
    if (!dailyLimit || isNaN(parsedLimit) || parsedLimit <= 0) {
      showError("Please enter a valid daily message limit.");
      return;
    }

    // Validate warning threshold — must be positive and less than daily limit
    if (!warningThreshold || isNaN(parsedWarning) || parsedWarning <= 0) {
      showError("Please enter a valid warning threshold.");
      return;
    }
    if (parsedWarning >= parsedLimit) {
      showError("Warning threshold must be less than the daily message limit.");
      return;
    }

    // NEW: validate max message length — keep it in a sane range so the
    // form can't set something that breaks the UI or blows up OpenAI cost.
    if (!maxMessageLength || isNaN(parsedMaxLength) || parsedMaxLength <= 0) {
      showError("Please enter a valid max message length.");
      return;
    }
    if (parsedMaxLength < 50) {
      showError("Max message length should be at least 50 characters.");
      return;
    }
    if (parsedMaxLength > 5000) {
      showError("Max message length should not exceed 5000 characters.");
      return;
    }

    setLoading(true);
    try {
      // NOTE: saveSettings replaces ALL settings under "CHATBOT" with exactly
      // what's sent here — all three keys must always be included together,
      // or the omitted one gets deleted and silently falls back to its
      // backend default.
      await saveSettings("CHATBOT", [
        { keyName: "dailyLimit",        value: String(parsedLimit)     },
        { keyName: "warningThreshold",  value: String(parsedWarning)   },
        { keyName: "maxMessageLength",  value: String(parsedMaxLength) },
      ]);

      // Log the settings change — non-fatal
      try {
        await createActivityLog({
          userId:      appUser?.userId ?? null,
          userRole:    appUser?.role   ?? "UNKNOWN",
          action:      "UPDATE",
          entityType:  "SYSTEM_SETTINGS",
          description: `Updated chatbot settings — daily limit: ${parsedLimit}, warning threshold: ${parsedWarning}, max message length: ${parsedMaxLength}`,
        });
      } catch (err) {
        console.error("[SystemSettings] Failed to log activity:", err);
      }

      showSuccess("Settings saved successfully.");
    } catch (err) {
      console.error("[SystemSettings] Failed to save settings:", err);
      showError("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-outfit">
      <h2 className="text-xl font-semibold text-[#24698B]">System Settings</h2>

      {/* CHATBOT SETTINGS */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[#24698B] rounded-full" />
          <h3 className="text-[#0C3E56] font-semibold text-sm uppercase tracking-wide">
            Chatbot Settings
          </h3>
        </div>

        {/* DAILY LIMIT */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Daily Message Limit per User
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Maximum number of messages a user can send to the AI chatbot per day.
          </p>
          <input
            type="number"
            min="1"
            value={fetching ? "" : dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            placeholder={fetching ? "Loading..." : "e.g. 15"}
            disabled={loading || fetching}
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2
                       text-sm focus:outline-none focus:border-[#24698B]
                       focus:ring-2 focus:ring-[#24698B]/10 disabled:opacity-50"
          />
        </div>

        {/* WARNING THRESHOLD */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Warning Threshold
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Users will be warned when they reach this many messages used.
            Must be less than the daily limit.
          </p>
          <input
            type="number"
            min="1"
            value={fetching ? "" : warningThreshold}
            onChange={(e) => setWarningThreshold(e.target.value)}
            placeholder={fetching ? "Loading..." : "e.g. 13"}
            disabled={loading || fetching}
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2
                       text-sm focus:outline-none focus:border-[#24698B]
                       focus:ring-2 focus:ring-[#24698B]/10 disabled:opacity-50"
          />
        </div>

        {/* NEW: MAX MESSAGE LENGTH */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Max Message Length (characters)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Maximum number of characters allowed in a single chatbot message.
            Messages longer than this are rejected before reaching the AI.
          </p>
          <input
            type="number"
            min="50"
            max="5000"
            value={fetching ? "" : maxMessageLength}
            onChange={(e) => setMaxMessageLength(e.target.value)}
            placeholder={fetching ? "Loading..." : "e.g. 1000"}
            disabled={loading || fetching}
            className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2
                       text-sm focus:outline-none focus:border-[#24698B]
                       focus:ring-2 focus:ring-[#24698B]/10 disabled:opacity-50"
          />
        </div>

        {/* HELPER TEXT */}
        {!fetching && dailyLimit && warningThreshold && maxMessageLength && (
          <p className="text-xs text-[#24698B]">
            Users will be warned after {warningThreshold} messages and blocked after {dailyLimit} messages per day.
            Each message is capped at {maxMessageLength} characters.
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || fetching}
          className="px-6 py-2 bg-[#24698B] text-white text-sm font-medium
                     rounded-lg hover:bg-[#1e5873] disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* PLATFORM INFO — read only */}
      <div className="bg-white border border-[#DADEE0] rounded-2xl shadow-sm p-6 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-4 bg-[#24698B] rounded-full" />
          <h3 className="text-[#0C3E56] font-semibold text-sm uppercase tracking-wide">
            Platform Info
          </h3>
        </div>

        {[
          { label: "Platform",    value: "Interlink" },
          { label: "Version",     value: "1.0.0"     },
          { label: "Environment", value: "Development" },
          { label: "Frontend",    value: "React + Vite + Tailwind" },
          { label: "Backend",     value: "Spring Boot" },
          { label: "Database",    value: "PostgreSQL (Supabase)" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between text-sm py-2.5 border-b border-gray-100 last:border-0"
          >
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}