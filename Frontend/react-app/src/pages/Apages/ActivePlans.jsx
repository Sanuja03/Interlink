import { useEffect, useState } from "react";
import ActivePlanTable from "../../components/TicketSubsPages/ActivePlanTable";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

export default function ActivePlans() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/active-subscriptions");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (id) => {
    try {
      await api.put(`/active-subscriptions/${id}/revert`);
      toast.success("Renewal undone");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data || "Failed to undo renewal");
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Active Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage company subscriptions. Confirm payment to schedule renewal at cycle end, or change plans immediately.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Loading subscriptions...
        </div>
      ) : (
        <ActivePlanTable data={data} refresh={fetchData} onUndo={handleUndo} />
      )}
    </div>
  );
}