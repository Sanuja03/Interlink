import { useState } from "react";
import { toast } from "react-hot-toast";

// ─── Bounds ──────────────────────────────────────────────────────────────────
const MAX_PRICE        = 10000;
const MAX_JOBS         = 10000;
const MAX_INTERVIEWERS = 10000;
const MAX_AI_LIMIT     = 100000;

/**
 * PlanModal
 * Edit dialog for a subscription plan's pricing and feature limits.
 * - Changed fields highlighted in yellow
 * - Inline per-field errors shown on blur and on submit attempt
 * - Security: numeric bounds enforced, negative values rejected
 * - Empty required fields caught before submission
 *
 * Props:
 *  - plan    {object}    the plan object being edited
 *  - onClose {function}  closes the modal without saving
 *  - onSave  {function}  called with the updated plan payload
 */
export default function PlanModal({ plan, onClose, onSave }) {

  const initialData = {
    price:           String(plan.price          ?? ""),
    activeJobs:      String(plan.activeJobs     ?? ""),
    interviewers:    String(plan.interviewers   ?? ""),
    aiCvLimit:       String(plan.aiCvLimit      ?? ""),
    aiQuestionLimit: String(plan.aiQuestionLimit ?? ""),
    isUnlimited:     plan.isUnlimited || false,
  };

  const [formData, setFormData] = useState(initialData);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  // ── Validation ────────────────────────────────────────────────────────────

  const validateField = (name, value, isUnlimited) => {
    const num = Number(value);
    switch (name) {
      case "price":
        if (value === "")           return "Price is required.";
        if (isNaN(num))             return "Price must be a number.";
        if (num < 0)                return "Price cannot be negative.";
        if (num > MAX_PRICE)        return `Price cannot exceed $${MAX_PRICE.toLocaleString()}.`;
        return "";
      case "activeJobs":
        if (value === "")           return "Active jobs limit is required.";
        if (isNaN(num))             return "Must be a number.";
        if (num < 0)                return "Cannot be negative.";
        if (!Number.isInteger(num)) return "Must be a whole number.";
        if (num > MAX_JOBS)         return `Cannot exceed ${MAX_JOBS.toLocaleString()}.`;
        return "";
      case "interviewers":
        if (value === "")           return "Interviewer limit is required.";
        if (isNaN(num))             return "Must be a number.";
        if (num < 0)                return "Cannot be negative.";
        if (!Number.isInteger(num)) return "Must be a whole number.";
        if (num > MAX_INTERVIEWERS) return `Cannot exceed ${MAX_INTERVIEWERS.toLocaleString()}.`;
        return "";
      case "aiCvLimit":
        if (isUnlimited)            return "";
        if (value === "")           return "AI CV limit is required.";
        if (isNaN(num))             return "Must be a number.";
        if (num < 0)                return "Cannot be negative.";
        if (!Number.isInteger(num)) return "Must be a whole number.";
        if (num > MAX_AI_LIMIT)     return `Cannot exceed ${MAX_AI_LIMIT.toLocaleString()}.`;
        return "";
      case "aiQuestionLimit":
        if (isUnlimited)            return "";
        if (value === "")           return "AI Question limit is required.";
        if (isNaN(num))             return "Must be a number.";
        if (num < 0)                return "Cannot be negative.";
        if (!Number.isInteger(num)) return "Must be a whole number.";
        if (num > MAX_AI_LIMIT)     return `Cannot exceed ${MAX_AI_LIMIT.toLocaleString()}.`;
        return "";
      default: return "";
    }
  };

  const validateAll = () => {
    const fields = ["price", "activeJobs", "interviewers", "aiCvLimit", "aiQuestionLimit"];
    const newErrors = {};
    fields.forEach((name) => {
      newErrors[name] = validateField(name, formData[name], formData.isUnlimited);
    });
    setErrors(newErrors);
    setTouched({ price: true, activeJobs: true, interviewers: true, aiCvLimit: true, aiQuestionLimit: true });
    return !Object.values(newErrors).some(Boolean);
  };

  // ── Change / Blur handlers ────────────────────────────────────────────────

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, formData.isUnlimited),
      }));
    }
  };

  const handleUnlimitedChange = (checked) => {
    setFormData((prev) => ({ ...prev, isUnlimited: checked }));
    if (touched.aiCvLimit || touched.aiQuestionLimit) {
      setErrors((prev) => ({
        ...prev,
        aiCvLimit:       validateField("aiCvLimit",       formData.aiCvLimit,       checked),
        aiQuestionLimit: validateField("aiQuestionLimit", formData.aiQuestionLimit, checked),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name], formData.isUnlimited),
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validateAll()) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    const payload = {
      name:            plan.name,
      price:           Number(formData.price),
      activeJobs:      formData.activeJobs      === "" ? null : Number(formData.activeJobs),
      interviewers:    formData.interviewers    === "" ? null : Number(formData.interviewers),
      aiCvLimit:       formData.isUnlimited     ? null : Number(formData.aiCvLimit),
      aiQuestionLimit: formData.isUnlimited     ? null : Number(formData.aiQuestionLimit),
      isUnlimited:     formData.isUnlimited,
    };
    onSave(payload);
    onClose();
  };

  // ── Style helpers ─────────────────────────────────────────────────────────

  const inputBase = "border p-2 w-full rounded-lg transition outline-none text-sm";

  const fieldClass = (name, original) => {
    if (touched[name] && errors[name])     return `${inputBase} border-red-400 bg-red-50`;
    if (touched[name] && !errors[name] && formData[name] !== String(original ?? ""))
                                           return `${inputBase} border-yellow-400 bg-yellow-50`;
    if (touched[name] && !errors[name])    return `${inputBase} border-emerald-400`;
    if (formData[name] !== String(original ?? "")) return `${inputBase} border-yellow-400 bg-yellow-50`;
    return `${inputBase} border-gray-300`;
  };

  const FieldError = ({ name }) =>
    touched[name] && errors[name]
      ? <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
      : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-2xl w-[440px] shadow-2xl max-h-[90vh] overflow-y-auto">

        <h3 className="text-xl font-semibold text-[#24698B] mb-6 text-center">
          Edit {plan.name} Plan
        </h3>

        <div className="space-y-4 text-sm">

          <div>
            <label className="block mb-1 font-medium">Price ($ / month) <span className="text-red-500">*</span></label>
            <input type="number" min="0" max={MAX_PRICE}
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleBlur("price")}
              className={fieldClass("price", plan.price)} />
            <FieldError name="price" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Active Job Posts <span className="text-red-500">*</span></label>
            <input type="number" min="0" max={MAX_JOBS}
              value={formData.activeJobs}
              onChange={(e) => handleChange("activeJobs", e.target.value)}
              onBlur={() => handleBlur("activeJobs")}
              className={fieldClass("activeJobs", plan.activeJobs)} />
            <FieldError name="activeJobs" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Interviewer Accounts <span className="text-red-500">*</span></label>
            <input type="number" min="0" max={MAX_INTERVIEWERS}
              value={formData.interviewers}
              onChange={(e) => handleChange("interviewers", e.target.value)}
              onBlur={() => handleBlur("interviewers")}
              className={fieldClass("interviewers", plan.interviewers)} />
            <FieldError name="interviewers" />
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-medium">AI Features</span>
            <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
              <input type="checkbox" checked={formData.isUnlimited}
                onChange={(e) => handleUnlimitedChange(e.target.checked)}
                className="w-4 h-4 accent-[#24698B]" />
              <span className="text-sm">Unlimited</span>
            </label>
          </div>

          <div>
            <label className={`block mb-1 font-medium ${formData.isUnlimited ? "text-gray-400" : ""}`}>
              AI CV Screening Limit {!formData.isUnlimited && <span className="text-red-500">*</span>}
            </label>
            <input type="number" min="0" max={MAX_AI_LIMIT}
              value={formData.aiCvLimit}
              disabled={formData.isUnlimited}
              onChange={(e) => handleChange("aiCvLimit", e.target.value)}
              onBlur={() => handleBlur("aiCvLimit")}
              className={`${fieldClass("aiCvLimit", plan.aiCvLimit)} disabled:opacity-50 disabled:cursor-not-allowed`} />
            <FieldError name="aiCvLimit" />
          </div>

          <div>
            <label className={`block mb-1 font-medium ${formData.isUnlimited ? "text-gray-400" : ""}`}>
              AI Question Generation Limit {!formData.isUnlimited && <span className="text-red-500">*</span>}
            </label>
            <input type="number" min="0" max={MAX_AI_LIMIT}
              value={formData.aiQuestionLimit}
              disabled={formData.isUnlimited}
              onChange={(e) => handleChange("aiQuestionLimit", e.target.value)}
              onBlur={() => handleBlur("aiQuestionLimit")}
              className={`${fieldClass("aiQuestionLimit", plan.aiQuestionLimit)} disabled:opacity-50 disabled:cursor-not-allowed`} />
            <FieldError name="aiQuestionLimit" />
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-4 py-2 bg-[#24698B] text-white rounded-lg hover:opacity-90 transition text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}