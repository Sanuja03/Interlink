import { useState } from "react";
import Sidebar from "./Sidebar";
import Footer from "../layout/Footer";

import notificationicon from "../../assets/notificationicon.png";
import availabilityicon from "../../assets/availability.png"; 
import defaultAvatar from "../../assets/default-avatar.png";

import { Link } from "react-router-dom";
import AvailabilityPopup from "./AvailabilityPopup";

const SIDEBAR_WIDTH = 240;

const DashboardLayout = ({ children }) => {

  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-50">

      {/* sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </aside>

      {/* main content */}
      <div
        className="min-h-screen flex flex-col"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >

        {/* top bar */}
        <div className="flex justify-end items-center gap-6 px-6 py-4 bg-gray-50 sticky top-0 z-40">

          {/* Availability Icon */}
          <img
          src={availabilityicon}
          alt="Availability"
          onClick={() => setShowAvailability(true)}
          className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
        />

        {/* Notification */}
        <img
          src={notificationicon}
          alt="Notifications"
          className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100"
        />

    
    

          <span className="text-sm font-semibold text-red-800">
            Logout
          </span>

        </div>

        {/* page specific content */}
        <main className="flex-1">
          {children}
        </main>

        {/* footer */}
        <Footer />

      </div>

      {/* Availability Popup */}
      {showAvailability && (
        <AvailabilityPopup
          onClose={() => setShowAvailability(false)}
        />
      )}

    </div>
  );
};

export default DashboardLayout;