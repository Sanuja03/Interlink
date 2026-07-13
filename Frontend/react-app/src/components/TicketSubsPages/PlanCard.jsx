export default function PlanCard({ plan, onChange }) {

  // helper formatters (UI-safe)
  const formatValue = (value) => {
    if (value === null || value === undefined) return "Unlimited";
    return value;
  };

  const formatAI = (limit, isUnlimited) => {
    if (isUnlimited) return "Unlimited";
    if (limit === null || limit === undefined) return "Unlimited";
    return limit;
  };

  const formatPrice = (price) => {
    if (price === 0) return "$0 / month";
    if (!price) return "Custom";
    return `$${price} / month`;
  };

  return (
    <div className="bg-[#F5F7F9] rounded-2xl shadow-md p-8 hover:shadow-lg transition">
      
      {/* PLAN HEADER */}
      <div className="bg-[#0C3E56] text-white rounded-xl p-8 text-center mb-6">
        <div className="text-3xl mb-3">{plan.icon}</div>

        <h3 className="text-lg font-semibold">{plan.name} Plan</h3>

        {/* PRICE */}
        <p className="text-sm opacity-90">{formatPrice(plan.price)}</p>
      </div>

      {/* FEATURE LIST */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6 text-sm space-y-2">
        
        <p>✔ Active job posts: {formatValue(plan.activeJobs)}</p>
        
 
        
        <p>✔ Interviewer Accounts: {formatValue(plan.interviewers)}</p>
        
        {/* AI VALUES */}
        <p>✔ AI CV Screening: {formatAI(plan.aiCvLimit, plan.isUnlimited)}</p>
        
        <p className="whitespace-nowrap">
  ✔ AI Question Generation: {formatAI(plan.aiQuestionLimit, plan.isUnlimited)}
</p>
      </div>

      {/* BUTTON */}
      <div className="text-center">
        <div
          onClick={onChange}
          className="cursor-pointer bg-[#87AFC6] text-[#0C3E56] font-semibold px-6 py-3 rounded-lg shadow hover:opacity-90 inline-block"
        >
          Change Plan Data
        </div>
      </div>
    </div>
  );
}