import AuthForm from "./Forms/AuthenticationForm";
import CommunicationForm from "./Forms/CommunicationForm";
import StorageForm from "./Forms/StorageForm";
import ApiForm from "./Forms/ApiForm";
import SystemForm from "./Forms/SystemForm";
import { useState } from "react";

export default function SystemSettingsModal({ type, onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget}>

      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">

        <h2 className="text-[#24698B] font-semibold mb-4">
          {getTitle(type)}
        </h2>

        {renderForm(type, { loading, setLoading, onClose })}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded w-full"
          disabled={loading}
          className={`px-4 py-2 rounded w-full ${
            loading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200"
          }`}
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}

// Helpers
function getTitle(type) {
  switch (type) {
    case "auth": return "Authentication Settings";
    case "communication": return "Communication Settings";
    case "storage": return "Storage Settings";
    case "api": return "API Settings";
    case "system": return "System Settings";
    default: return "";
  }
}

function renderForm(type, props) {
  switch (type) {
    case "auth": return <AuthForm {...props} />;
    case "communication": return <CommunicationForm {...props} />;
    case "storage": return <StorageForm {...props} />;
    case "api": return <ApiForm {...props} />;
    case "system": return <SystemForm {...props} />;
    default: return null;
  }
}