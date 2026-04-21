import { useState } from "react";
import { toast } from "react-hot-toast";

export default function PlanModal({ plan, onClose, onSave }) {

  const initialData = {
    price: String(plan.price ?? ""),
    activeJobs: String(plan.activeJobs ?? ""),
    applications: plan.applications ?? "Unlimited",
    interviewers: String(plan.interviewers ?? ""),
    aiCvLimit: String(plan.aiCvLimit ?? ""),
    aiQuestionLimit: String(plan.aiQuestionLimit ?? ""),
    isUnlimited: plan.isUnlimited || false,
  };

  const [formData, setFormData] = useState(initialData);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔥 validation
  const validate = () => {
    if (formData.price < 0) return "Price cannot be negative";
    if (formData.activeJobs < 0) return "Active jobs cannot be negative";
    if (formData.interviewers < 0) return "Interviewers cannot be negative";

    if (!formData.isUnlimited) {
      if (formData.aiCvLimit < 0) return "AI CV limit cannot be negative";
      if (formData.aiQuestionLimit < 0) return "AI Question limit cannot be negative";
    }

    return null;
  };

  const handleSubmit = () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      price: Number(formData.price),
      name: plan.name,
      activeJobs: formData.activeJobs === "" ? null : Number(formData.activeJobs),
      applications: formData.applications,
      interviewers: formData.interviewers === "" ? null : Number(formData.interviewers),
      aiCvLimit: formData.isUnlimited ? null : Number(formData.aiCvLimit),
      aiQuestionLimit: formData.isUnlimited ? null : Number(formData.aiQuestionLimit),
      isUnlimited: formData.isUnlimited,
    };

    onSave(payload);
    onClose();
  };

  const inputStyle = "border p-2 w-full rounded-lg transition outline-none";

  const highlight = (field, original) =>
    formData[field] !== String(original ?? "") ? "border-yellow-400 bg-yellow-50" : "border-gray-300";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl w-[440px] shadow-2xl">

        <h3 className="text-xl font-semibold text-[#24698B] mb-6 text-center">
          Edit {plan.name} Plan
        </h3>

        <div className="space-y-4 text-sm">

          <div>
            <label className="block mb-1 font-medium">Price ($ / month)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={`${inputStyle} ${highlight("price", plan.price)}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Active Job Posts</label>
            <input
              type="number"
              value={formData.activeJobs}
              onChange={(e) => handleChange("activeJobs", e.target.value)}
              className={`${inputStyle} ${highlight("activeJobs", plan.activeJobs)}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Applications Limit</label>
            <input
              type="text"
              value={formData.applications}
              onChange={(e) => handleChange("applications", e.target.value)}
              className={`${inputStyle} ${highlight("applications", plan.applications)}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Interviewer Accounts</label>
            <input
              type="number"
              value={formData.interviewers}
              onChange={(e) => handleChange("interviewers", e.target.value)}
              className={`${inputStyle} ${highlight("interviewers", plan.interviewers)}`}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">AI Features</span>
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={formData.isUnlimited}
                onChange={(e) => handleChange("isUnlimited", e.target.checked)}
              />
              Unlimited
            </label>
          </div>

          <div>
            <label className="block mb-1 font-medium">AI CV Screening Limit</label>
            <input
              type="number"
              value={formData.aiCvLimit}
              disabled={formData.isUnlimited}
              onChange={(e) => handleChange("aiCvLimit", e.target.value)}
              className={`${inputStyle} ${highlight("aiCvLimit", plan.aiCvLimit)}`}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">AI Question Generation Limit</label>
            <input
              type="number"
              value={formData.aiQuestionLimit}
              disabled={formData.isUnlimited}
              onChange={(e) => handleChange("aiQuestionLimit", e.target.value)}
              className={`${inputStyle} ${highlight("aiQuestionLimit", plan.aiQuestionLimit)}`}
            />
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#24698B] text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}