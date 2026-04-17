import { useState } from "react";
import PlanCard from "../../components/TicketSubsPages/PlanCard";
import PlanModal from "../../components/TicketSubsPages/PlanModal";
import { Link } from "react-router-dom";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([
    {
      name: "Free",
      price: "$0 / month",
      icon: "📦",
      activeJobs: 2,
      applications: "Unlimited",
      interviewers: 2,
      aiCV: "Limited (~50)",
      aiQuestions: "Limited (~50)",
    },
    {
      name: "Growth",
      price: "$5 / month",
      icon: "🎁",
      activeJobs: 10,
      applications: "Unlimited",
      interviewers: 5,
      aiCV: "Limited (~300)",
      aiQuestions: "Limited (~300)",
    },
    {
      name: "Enterprise",
      price: "$Custom",
      icon: "💳",
      activeJobs: "Unlimited",
      applications: "Unlimited",
      interviewers: "Unlimited",
      aiCV: "Unlimited",
      aiQuestions: "Unlimited",
    },
  ]);

  const [selectedPlan, setSelectedPlan] = useState(null);

  const updatePlan = (updatedPlan) => {
    const updatedPlans = plans.map((p) =>
      p.name === updatedPlan.name ? updatedPlan : p
    );
    setPlans(updatedPlans);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-8 py-4">
          <img src={logo} alt="Interlink Logo" className="h-10" />
          <h1 className="text-xl font-semibold text-gray-700">
            Subscription Plans
          </h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-8 py-12">
        <div className="max-w-7xl mx-auto bg-white p-12 rounded-2xl shadow-md">
          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-12">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                onChange={() => setSelectedPlan(plan)}
              />
            ))}
          </div>

          {/* Active plans link */}
          <div className="mt-12 text-center">
            <Link
              to="/admin/active-plans"
              className="text-[#24698B] font-semibold underline hover:text-[#1c516a]"
            >
              View Active Subscription Plans
            </Link>
          </div>
        </div>

        {selectedPlan && (
          <PlanModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onSave={updatePlan}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
