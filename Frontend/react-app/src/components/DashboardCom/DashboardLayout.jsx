import Sidebar from "./Sidebar";
import Footer from "../layout/Footer";

import notificationicon from "../../assets/notificationicon.png";
import defaultAvatar from "../../assets/default-avatar.png";

import { Link } from "react-router-dom";

const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50"
        style={{ width: SIDEBAR_WIDTH }}/*size of teh sidebar*/
      >
        <Sidebar />
      </aside>

      {/* general content  */}
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: SIDEBAR_WIDTH }} /*space for sidebar*/
      >
        
        {/* top bar */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 sticky top-0 z-40">
          
          {/* Notification */}
          <img
            src={notificationicon}
            alt="Notifications"
            className="w-9 h-9 cursor-pointer opacity-80 hover:opacity-100"
          />

          {/* Profile */}
          <div> 
          <Link 
            to = "/InterviewerProfile"
            className="flex items-center gap-2">
            <img
              src={defaultAvatar}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
            />
            </Link>
            
          </div>
          <span className="text-sm font-semibold text-gray-800">
              K. Perera
          </span>
        </div>

        {/* page specific content */}
        <main className="flex-1">
          {children} {/* code inside dashbaordlayout in dahsboard.jsx*/} 
        </main>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
