import { useState } from "react";
import SystemSettingsCard from "../components/System_Settings/SystemSettingsCard";
import SystemSettingsModal from "../components/System_Settings/SystemSettingsModal";

export default function SystemSettings() {
  const [activeModal, setActiveModal] = useState(null);

  const settings = [
    { id: "auth", title: "Authentication" },
    { id: "communication", title: "Communication" },
    { id: "storage", title: "Storage" },
    { id: "api", title: "API Settings" },
    { id: "system", title: "System Configurations" },
  ];

  return (
    <div className="space-y-6 font-outfit">

      <h1 className="text-xl font-semibold text-[#24698B]">
        System Settings
      </h1>

      <div className="space-y-4">
        {settings.map((item) => (
          <SystemSettingsCard
            key={item.id}
            title={item.title}
            onClick={() => setActiveModal(item.id)}
          />
        ))}
      </div>

      {activeModal && (
        <SystemSettingsModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}