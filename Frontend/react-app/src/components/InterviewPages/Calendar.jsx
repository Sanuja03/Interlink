import DashboardLayout from "../DashboardCom/DashboardLayout";
import "./Calendar.css";

const Calendar = () => {
  return (
    <DashboardLayout>
      <div className="calendar-page">
        <h1 className="calendar-title">Calendar</h1>

        <div className="calendar-card">
          <p className="calendar-text">content will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;