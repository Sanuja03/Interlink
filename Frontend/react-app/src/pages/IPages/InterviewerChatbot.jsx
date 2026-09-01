import DashboardLayout from "../../components/InterviewerPages/Layout/DashboardLayout";
import ChatBot from "../../components/SuperAdminComponents/RagChatbot/ChatBot";

export default function InterviewerChatBot() {
  return (
    <DashboardLayout>
      <ChatBot />
    </DashboardLayout>
  );
}