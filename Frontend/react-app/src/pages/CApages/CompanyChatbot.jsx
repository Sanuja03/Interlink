import DashboardLayout from "../../components/CompanyPages/layout/DashboardLayout";
import ChatBot from "../../components/SuperAdminComponents/RagChatbot/ChatBot";

export default function CompanyChatBot() {
  return (
    <DashboardLayout>
      <ChatBot />
    </DashboardLayout>
  );
}