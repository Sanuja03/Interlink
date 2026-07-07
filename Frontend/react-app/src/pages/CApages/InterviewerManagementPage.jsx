import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import InterviewerManagementModal from "./InterviewerManagementModal";
import "./InterviewerManagementPage.css";

// Reuses the existing InterviewerManagementModal component exactly as-is —
// no logic duplicated here. It's just always "open" and there's nothing
// to close back to, since this is a page, not a popup. The .im-embed
// wrapper + InterviewerManagementPage.css turn off the fixed-overlay
// look so it renders as normal page content instead of a full-screen
// modal — without touching InterviewerManagementModal.css, which still
// needs to work as a real modal wherever else it's used.
//
// The modal's own internal title (.interviewer-modal-header) is hidden
// via the scoped CSS below, and this title floats outside the card
// instead — same pattern as CompanyDashboard's cd-title.
export default function InterviewerManagementPage() {
  return (
    <DashboardLayout>
      <h1 className="im-title">Interviewer Management</h1>
      <p className="im-subtitle">
        Create interviewer profiles, save their details, and manage
        existing interviewer accounts.
      </p>

      <div className="im-embed">
        <InterviewerManagementModal open={true} onClose={() => {}} />
      </div>
    </DashboardLayout>
  );
}