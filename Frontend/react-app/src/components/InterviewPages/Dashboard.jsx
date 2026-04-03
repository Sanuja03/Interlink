import "./Dashboard.css";

import interviewscheduled from "../../assets/interviewscheduled.png";
import pendingrequests from "../../assets/pendingrequests.png";
import completedinterviews from "../../assets/completedinterviews.png";
import defaultAvatar from "../../assets/default-avatar.png";

import DashboardLayout from "../DashboardCom/DashboardLayout";
import Card from "../DashboardCom/Card";
import TodaySchedule from "../DashboardCom/TodaySchedule";
import NextInterviewCard from "../DashboardCom/NextInterviewCard";

import { Link } from "react-router-dom";

const Dashboard = () => {
  
  /* dummy data */
  const stats = {
    scheduled: 15,
    pending: 15,
    completed: 15,
  };

  const nextInterview = {
    interviewId: "IN5690",
    date: "2026-02-20",
    time: "10:30 AM",
    jobTitle: "UI/UX Designer",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    meetingStatus: "CONFIRMED",
    candidate: {
      image: defaultAvatar,
      id: "C1023",
      name: "Amal Dissanayaka",
      cvName: "Amal_Dissanayaka_CV.pdf",
      profileLink: "https://linkedin.com/in/amal-dissanayaka",
      note: "History: 2 internships • Strong UI portfolio • Good communication",
    },
  };

  return (
    <DashboardLayout>
      <div className="dash-page">
        <h1 className="dash-title">Dashboard</h1>

        <div className="dash-card">
          <div className="dash-stats-row">
            <Card
              title="Scheduled Interviews"
              value={stats.scheduled}
              icon={interviewscheduled}
            />

            <Link to = "/interviewer/pending-requests" className = "pending-link" >
            <Card
              title="Pending Requests"
              value={stats.pending}
              icon={pendingrequests}
              variant="danger"
            />

            </Link>

            <Card
              title="Completed Interviews"
              value={stats.completed}
              icon={completedinterviews}
            />
          </div>

          <div className="dash-main-row">
            <div className="dash-left">
              <TodaySchedule />
            </div>

            <div className="dash-right">
              <NextInterviewCard interview={nextInterview} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
