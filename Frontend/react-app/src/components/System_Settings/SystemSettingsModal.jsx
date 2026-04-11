import AuthForm from "./Forms/AuthenticationForm";
//import CommunicationForm from "./Forms/CommunicationForm";
//import StorageForm from "./Forms/StorageForm";
//import ApiForm from "./Forms/ApiForm";
//import SystemForm from "./Forms/SystemForm";

export default function SystemSettingsModal({ type, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">

        <h2 className="text-[#24698B] font-semibold mb-4">
          {getTitle(type)}
        </h2>

        {renderForm(type)}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancel
          </button>

          <button className="px-4 py-2 bg-[#24698B] text-white rounded-lg">
            Save Changes
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

function renderForm(type) {
  switch (type) {
    case "auth": return <AuthForm />;
    case "communication": return <CommunicationForm />;
    case "storage": return <StorageForm />;
    case "api": return <ApiForm />;
    case "system": return <SystemForm />;
    default: return null;
  }
}