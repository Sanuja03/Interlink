import ActivePlanTable from "../../components/TicketSubsPages/ActivePlanTable";
import Footer from "../../components/TicketSubsPages/Footer";
import logo from "../../assets/interlink-logo.png";

export default function ActivePlans() {
  const companyPlans = [
    {
      id: 1,
      name: "Horizon Global",
      plan: "Professional",
      start: "Dec 24, 2025",
      end: "Dec 24, 2026",
      status: "Active",
      amount: "$5/month",
    },
    {
      id: 2,
      name: "TechNova",
      plan: "Professional",
      start: "Jan 10, 2025",
      end: "Jan 10, 2026",
      status: "Pending",
      amount: "$5/month",
    },
    {
      id: 3,
      name: "NextWave",
      plan: "Professional",
      start: "Feb 02, 2025",
      end: "Feb 02, 2026",
      status: "Expired",
      amount: "$5/month",
    },
  ];

  const candidatePlans = [
    {
      id: 4,
      name: "John Smith",
      plan: "Professional",
      start: "Dec 24, 2025",
      end: "Dec 24, 2026",
      status: "Active",
      amount: "$5/month",
    },
    {
      id: 5,
      name: "Emily Carter",
      plan: "Professional",
      start: "Jan 15, 2025",
      end: "Jan 15, 2026",
      status: "Pending",
      amount: "$5/month",
    },
    {
      id: 6,
      name: "Michael Lee",
      plan: "Professional",
      start: "Mar 01, 2025",
      end: "Mar 01, 2026",
      status: "Expired",
      amount: "$5/month",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-8 py-4">
          <img src={logo} alt="Interlink Logo" className="h-10" />
          <h1 className="text-xl font-semibold text-gray-700">
            Active Subscription Details
          </h1>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-grow px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Companies Table */}
          <ActivePlanTable data={companyPlans} />

          {/* Candidates Table */}
          <ActivePlanTable data={candidatePlans} />
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
