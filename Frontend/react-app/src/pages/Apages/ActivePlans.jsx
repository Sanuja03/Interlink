import { useEffect, useState } from "react";
import ActivePlanTable from "../../components/TicketSubsPages/ActivePlanTable";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";
import api from "../../lib/api";

export default function ActivePlans() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await api.get("/active-subscriptions");
    setData(res.data);
  };

  const handleUndo = async (id) => {
    try {
      await api.put(`/active-subscriptions/${id}/revert`);
  
      fetchData(); // refresh table
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-8 py-4">
          <img src={logo} className="h-10" />
          <h1 className="text-xl font-semibold text-gray-700">
            Active Subscription Details
          </h1>
        </div>
      </header>

      <main className="flex-grow px-8 py-12">
        <div className="max-w-7xl mx-auto">
        <ActivePlanTable 
  data={data} 
  refresh={fetchData} 
  onUndo={handleUndo}
/>
        </div>
      </main>

      <Footer />
    </div>
  );
}