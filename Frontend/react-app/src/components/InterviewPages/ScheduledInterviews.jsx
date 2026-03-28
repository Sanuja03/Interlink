import DashboardLayout from "../DashboardCom/DashboardLayout";
import ScheduledInterviewCard from "../ScheduledInterviewCom/ScheduledInterviewCard";
import "./ScheduledInterviews.css";

const ScheduledInterviews = () => {
  const scheduledInterviews = [
    {
      interviewId: "IM5690",
      date: "2026-03-06",
      time: "10:30 AM",
      jobTitle: "UI/UX Designer",
      meetingStatus: "ONGOING",
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      panelMembers: [
        { emNo: "IM5690", name: "Amal Dassanayaka", position: "UI/UX Designer", mobile: "0773456289" },
        { emNo: "IM5691", name: "Sumudu Perera", position: "Software Engineer", mobile: "0789247289" },
      ],
      adminNote: "Join 10 minutes early.",
    },
    {
      interviewId: "INT-1024",
      date: "2026-03-08",
      time: "02:00 PM",
      jobTitle: "Frontend Developer Intern",
      meetingStatus: "SCHEDULED",
      mode: "PHYSICAL",
      meetingLink: "https://meet.google.com/xyz-wxyz-123",
      panelMembers: [
        { emNo: "IM5701", name: "Nadeesha Silva", position: "Senior Engineer", mobile: "0712345678" },
      ],
      adminNote: "",
    },
    {
      interviewId: "INT-1025",
      date: "2026-03-10",
      time: "09:00 AM",
      jobTitle: "QA Engineer",
      meetingStatus: "SCHEDULED",
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/qwe-rtyu-567",
      panelMembers: [
        { emNo: "IM5705", name: "Ravindu Jayasinghe", position: "QA Lead", mobile: "0779988776" },
      ],
      adminNote: "Bring testing project examples.",
    },
    {
      interviewId: "INT-1026",
      date: "2026-03-11",
      time: "01:30 PM",
      jobTitle: "Backend Developer",
      meetingStatus: "SCHEDULED",
      mode: "ONLINE",
      meetingLink: "https://meet.google.com/aaa-bbbb-999",
      panelMembers: [
        { emNo: "IM5710", name: "Kasun Fernando", position: "Backend Lead", mobile: "0773456721" },
        { emNo: "IM5711", name: "Nishan Perera", position: "Software Architect", mobile: "0712348899" },
      ],
      adminNote: "Expect system design questions.",
    },
    {
      interviewId: "INT-1027",
      date: "2026-03-12",
      time: "03:15 PM",
      jobTitle: "Product Designer",
      meetingStatus: "SCHEDULED",
      mode: "PHYSICAL",
      meetingLink: "https://meet.google.com/design-meet-222",
      panelMembers: [
        { emNo: "IM5720", name: "Dilani Perera", position: "Design Lead", mobile: "0771234567" },
      ],
      adminNote: "Bring design portfolio presentation.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="scheduled-page">
        <div className="scheduled-header">
          <h1 className="scheduled-title">Scheduled Interviews</h1>
        </div>

        <div className="scheduled-container">
          <div className="scheduled-grid">
            {scheduledInterviews.map((item) => (
              <ScheduledInterviewCard
                key={item.interviewId}
                interview={item}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScheduledInterviews;