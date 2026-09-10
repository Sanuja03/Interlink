import Sidebar from "../../components/CandidatePages/CandidateDashboard/Sidebar";
import Footer from "../../components/CandidatePages/CandidateDashboard/Footer";
import ChatBot from "../../components/SuperAdminComponents/RagChatbot/ChatBot";

export default function CandidateChatBot() {
  return (
    <div className="min-h-screen flex bg-gray-50 gap-3 sm:gap-6 lg:gap-10">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <ChatBot />
        <Footer />
      </main>
    </div>
  );
}