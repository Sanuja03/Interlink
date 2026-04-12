export default function PlanCard({ plan, onChange }) {
  return (
    <div className="bg-[#F5F7F9] rounded-2xl shadow-md p-8 hover:shadow-lg transition">
      {/* PLAN HEADER */}

      <div className="bg-[#0C3E56] text-white rounded-xl p-8 text-center mb-6">
        <div className="text-3xl mb-3">{plan.icon}</div>

        <h3 className="text-lg font-semibold">{plan.name} Plan</h3>

        <p className="text-sm opacity-90">{plan.price}</p>
      </div>

      {/* FEATURE LIST */}

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6 text-sm space-y-2">
        <p>✔ Active job posts: {plan.activeJobs}</p>
        <p>✔ Applications: {plan.applications}</p>
        <p>✔ Interviewer Accounts: {plan.interviewers}</p>
        <p>✔ AI CV Screening: {plan.aiCV}</p>
        <p>✔ AI Question Generation: {plan.aiQuestions}</p>
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
