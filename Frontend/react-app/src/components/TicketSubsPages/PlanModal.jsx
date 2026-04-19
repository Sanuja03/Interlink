import { useState } from "react";

export default function PlanModal({ plan, onClose, onSave }) {
  const [formData, setFormData] = useState(plan);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    // FUTURE BACKEND API
    // axios.put("/api/plans", formData)

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl w-[420px] shadow-xl">
        <h3 className="text-xl font-semibold text-[#24698B] mb-6">
          Edit {plan.name} Plan
        </h3>

        <div className="space-y-4 text-sm">
          <input
            type="text"
            value={formData.activeJobs}
            onChange={(e) => handleChange("activeJobs", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Active job posts"
          />

          <input
            type="text"
            value={formData.applications}
            onChange={(e) => handleChange("applications", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Applications"
          />

          <input
            type="text"
            value={formData.interviewers}
            onChange={(e) => handleChange("interviewers", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Interviewer Accounts"
          />

          <input
            type="text"
            value={formData.aiCV}
            onChange={(e) => handleChange("aiCV", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="AI CV Screening"
          />

          <input
            type="text"
            value={formData.aiQuestions}
            onChange={(e) => handleChange("aiQuestions", e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="AI Question Generation"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#24698B] text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
