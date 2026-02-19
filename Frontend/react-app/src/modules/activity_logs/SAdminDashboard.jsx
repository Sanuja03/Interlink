import { useNavigate } from "react-router-dom";
import RecentActivities from "./RecentActivities";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const handleViewAll = () => {
    navigate("/SuperAdmin/AllActivities");
  };

  return (
    <div>
      {/* other dashboard cards */}


      <RecentActivities onViewAll={handleViewAll} />

    </div>
  );
}
