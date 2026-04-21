import { useState, useEffect } from "react";
import PlanCard from "../../components/TicketSubsPages/PlanCard";
import PlanModal from "../../components/TicketSubsPages/PlanModal";
import { Link } from "react-router-dom";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";
import { toast } from "react-hot-toast";

const planIcons = {
  Free: "📦",
  Growth: "🎁",
  Enterprise: "💳",
};

const planOrder = ["Free", "Growth", "Enterprise"];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/subscriptions");
      const data = await res.json();

      const plansWithIcons = data.map(plan => ({
        ...plan,
        icon: planIcons[plan.name] || "📄",
      }));

      const sortedPlans = plansWithIcons.sort(
        (a, b) => planOrder.indexOf(a.name) - planOrder.indexOf(b.name)
      );

      setPlans(sortedPlans);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const updatePlan = async (updatedPlan) => {
    try {
      await fetch(`http://localhost:8080/api/subscriptions/${updatedPlan.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan),
      });

      toast.success("Plan updated successfully!");
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Update failed!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-8 py-4">
          <img src={logo} alt="Interlink Logo" className="h-10" />
          <h1 className="text-xl font-semibold text-gray-700">
            Subscription Plans
          </h1>
        </div>
      </header>

      <main className="flex-grow px-8 py-12">
        <div className="max-w-7xl mx-auto bg-white p-12 rounded-2xl shadow-md">
          
          <div className="grid md:grid-cols-3 gap-12">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                onChange={() => setSelectedPlan(plan)}
              />
            ))}
          </div>

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

      <Footer />
    </div>
  );
}