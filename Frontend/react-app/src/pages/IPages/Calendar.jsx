import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import CalendarWidget from "../../components/CandidatePages/CandidateCalendar/CalendarWidget";

/* ─── Interview data for the interviewer view ─────────────────── */
const INTERVIEWS = {
  '2025-09-18': {
    title: 'Software Engineer – Amara Silva',
    time: '10:00 AM – 11:00 AM',
    mode: 'Online Interview',
    candidate: { name: 'Amara Silva', role: 'Software Engineer' },
  },
  '2025-09-24': {
    title: 'UI/UX Designer – Kasun Fernando',
    time: '02:00 PM – 03:00 PM',
    mode: 'Online Interview',
    candidate: { name: 'Kasun Fernando', role: 'UI/UX Designer' },
  },
  '2026-03-19': {
    title: 'Project Manager – Dilini Rajapaksa',
    time: '09:00 AM – 09:30 AM',
    mode: 'Online Interview',
    candidate: { name: 'Dilini Rajapaksa', role: 'Project Manager' },
  },
  '2026-03-23': {
    title: 'Backend Developer – Ruchira Mendis',
    time: '11:00 AM – 12:00 PM',
    mode: 'Online Interview',
    candidate: { name: 'Ruchira Mendis', role: 'Backend Developer' },
  },
  '2026-04-25': {
    title: 'Data Analyst – Nisha Perera',
    time: '03:00 PM – 03:45 PM',
    mode: 'Online Interview',
    candidate: { name: 'Nisha Perera', role: 'Data Analyst' },
  },
};

const pageStyles = `
  .ical-page-body { padding: 28px 32px 40px; max-width: 960px; width: 100%; margin: 0 auto; }

  @media(max-width: 768px) {
    .ical-page-body { padding: 16px 12px 28px; }
  }
`;

const Calendar = () => {
  return (
    <DashboardLayout>
      <style>{pageStyles}</style>
      <div className="ical-page-body">
        <CalendarWidget
          interviews={INTERVIEWS}
          showJoinButton={true}
          showGenerateButton={false}
          onJoinInterview={(iv) => {
            /* TODO: open meeting link or modal */
            console.log('Join interview:', iv.title);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Calendar;