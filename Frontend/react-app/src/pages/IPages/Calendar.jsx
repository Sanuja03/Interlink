import { useState, useEffect } from "react";
import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import CalendarWidget from "../../components/CandidatePages/CandidateCalendar/CalendarWidget";
import api from "../../lib/api";

const pageStyles = `
  .ical-page-body { padding: 28px 32px 40px; max-width: 960px; width: 100%; margin: 0 auto; }

  @media(max-width: 768px) {
    .ical-page-body { padding: 16px 12px 28px; }
  }
`;

const Calendar = () => {
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Mock UUID for company/interviewer (replace with actual auth context later)
        const interviewerId = "0c97e983-ff86-48cb-95a4-96076da055c4";
        // Fetching 1 year range around today
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        const end = new Date();
        end.setMonth(end.getMonth() + 6);
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const response = await api.get(`/calendar/interviewer?interviewerId=${interviewerId}&startDate=${startDate}&endDate=${endDate}`);
        if (response.status === 200) {
          const data = response.data;
          const map = {};
          data.forEach(ev => {
            if (!map[ev.date]) {
              map[ev.date] = [];
            }
            map[ev.date].push({
              title: `${ev.jobTitle} – Candidate`, // Mock candidate name since it's not in the DTO
              time: `${ev.time} – ${ev.endTime}`,
              mode: ev.mode,
              candidate: { name: 'Candidate', role: ev.jobTitle },
              meetingLink: ev.meetingLink,
              ...ev
            });
          });
          setInterviews(map);
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  return (
    <DashboardLayout>
      <style>{pageStyles}</style>
      <div className="ical-page-body">
        {loading ? (
          <div>Loading Calendar...</div>
        ) : (
          <CalendarWidget
            interviews={interviews}
            showJoinButton={true}
            showGenerateButton={false}
            onJoinInterview={(iv) => {
              if (iv.meetingLink) {
                window.open(iv.meetingLink, '_blank');
              } else {
                console.log('Join interview:', iv.title);
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Calendar;