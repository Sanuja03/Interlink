import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";
import Footer from "../../components/CandidatePages/CandidateDashboard/Footer";
import ChatBot from "../../components/SuperAdminComponents/RagChatbot/ChatBot";

export default function CandidateChatBot() {
  return (
    <div className="min-h-screen flex bg-gray-50" style={{ gap: "2.5rem" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <ChatBot />
        <Footer />
      </main>
    </div>
  );
}