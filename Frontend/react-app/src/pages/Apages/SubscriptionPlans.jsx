import { useState, useEffect } from "react";
import PlanCard from "../../components/TicketSubsPages/PlanCard";
import PlanModal from "../../components/TicketSubsPages/PlanModal";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../lib/api";

const planIcons = { Free: "📦", Growth: "🎁", Enterprise: "💳" };
const planOrder = ["Free", "Growth", "Enterprise"];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/subscriptions");
      const plansWithIcons = res.data.map(plan => ({
        ...plan,
        icon: planIcons[plan.name] || "📄",
      }));
      setPlans(plansWithIcons.sort((a, b) => planOrder.indexOf(a.name) - planOrder.indexOf(b.name)));
    } catch (err) {
      toast.error("Failed to load plans");
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const updatePlan = async (updatedPlan) => {
    try {
      await api.put(`/subscriptions/${updatedPlan.name}`, updatedPlan);
      toast.success("Plan updated successfully!");
      fetchPlans();
    } catch (err) {
      toast.error("Update failed!");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and update your platform's subscription tiers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-10">
        <div className="grid md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} onChange={() => setSelectedPlan(plan)} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/admin/active-plans"
            className="text-[#24698B] font-semibold underline hover:text-[#1c516a] text-sm"
          >
            View Active Subscription Plans →
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
    </div>
  );
}