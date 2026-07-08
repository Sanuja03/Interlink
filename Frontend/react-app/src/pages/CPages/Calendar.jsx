import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import Footer from '../../components/CandidatePages/CandidateDashboard/Footer';
import CalendarWidget from '../../components/CandidatePages/CandidateCalendar/CalendarWidget';
import api from '../../lib/api';

const pageStyles = `
  .cal-page-root { display:flex; min-height:100vh; background:#f3f7fa; font-family:'Inter','Segoe UI',sans-serif; }
  .cal-page-main  { flex:1; display:flex; flex-direction:column; min-width:0; overflow-x:hidden; }
  .cal-page-body  { flex:1; padding:28px 32px 40px; max-width:960px; width:100%; margin:0 auto; }

  @media(max-width:768px){
    .cal-page-body { padding:16px 12px 28px; }
  }
`;

const CalendarPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Fetching 1 year range around today
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        const end = new Date();
        end.setMonth(end.getMonth() + 6);
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const response = await api.get(`/calendar/candidate/me?startDate=${startDate}&endDate=${endDate}`);
        if (response.status === 200) {
          const data = response.data;
          const map = {};
          data.forEach(ev => {
            if (!map[ev.date]) {
              map[ev.date] = [];
            }
            map[ev.date].push({
              title: `${ev.jobTitle} – ${ev.companyName}`,
              time: `${ev.time} – ${ev.endTime}`,
              mode: ev.mode,
              job: { title: ev.jobTitle, company: ev.companyName },
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
    <>
      <style>{pageStyles}</style>
      <div className="cal-page-root">
        <Sidebar />
        <div className="cal-page-main">
          <div className="cal-page-body">
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
          <Footer />
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
