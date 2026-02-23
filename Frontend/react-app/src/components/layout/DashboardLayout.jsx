import "./DashboardLayout.css";
import Sidebar from "./Sidebar";
import notificationicon from "../../assets/icons/notificationicon.png";
import defaultAvatar from "../../assets/images/default-avatar.png";

const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({ children }) {
  return (
    <div className="dl-root">
      {/* Sidebar */}
      <aside className="dl-sidebar" style={{ width: SIDEBAR_WIDTH }}>
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="dl-main" style={{ marginLeft: SIDEBAR_WIDTH }}>
        {/* Top right row */}
        <div className="dl-top">
          <img className="dl-noti" src={notificationicon} alt="Notifications" />

          <div className="dl-company">
            <img className="dl-avatar" src={defaultAvatar} alt="Avatar" />
            <span className="dl-companyName">Horizon Global</span>
          </div>
        </div>

        {/* Page content */}
        <div className="dl-content">{children}</div>
      </main>
    </div>
  );
}