import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/CandidatePages/CandidateDashboard/Sidebar';
import Footer from '../../components/CandidatePages/CandidateDashboard/Footer';
import CalendarWidget from '../../components/CandidatePages/CandidateCalendar/CalendarWidget';

/* ─── Interview data for the job-seeker view ─────────────────── */
const INTERVIEWS = {
  '2025-09-18': {
    title: 'Software Engineer – CodeWave Solutions',
    time: '10:00 AM – 11:00 AM',
    mode: 'Online Interview',
    job: { title: 'Software Engineer', company: 'CodeWave Solutions', techStack: 'React' },
  },
  '2025-09-24': {
    title: 'UI/UX Designer – PixelCraft Studio',
    time: '02:00 PM – 03:00 PM',
    mode: 'Online Interview',
    job: { title: 'UI/UX Designer', company: 'PixelCraft Studio', techStack: 'Figma' },
  },
  '2026-03-19': {
    title: 'Project Manager – Inova',
    time: '09:00 AM – 09:30 AM',
    mode: 'Online Interview',
    job: { title: 'Project Manager', company: 'Inova', techStack: 'Agile' },
  },
  '2026-03-23': {
    title: 'Software Engineer – Alpha Tech',
    time: '11:00 AM – 12:00 PM',
    mode: 'Online Interview',
    job: { title: 'Software Engineer', company: 'Alpha Tech', techStack: 'Node.js' },
  },
};

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

  return (
    <>
      <style>{pageStyles}</style>
      <div className="cal-page-root">
        <Sidebar />
        <div className="cal-page-main">
          <div className="cal-page-body">
            <CalendarWidget
              interviews={INTERVIEWS}
              showJoinButton={true}
              showGenerateButton={true}
              onJoinInterview={(iv) => {
                /* TODO: open meeting link or modal */
                console.log('Join interview:', iv.title);
              }}
              onGenerateQuestions={(iv) => {
                navigate('/Candidate/aiquestions', { state: { job: iv.job } });
              }}
            />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
