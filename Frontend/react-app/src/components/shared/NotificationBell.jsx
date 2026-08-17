import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getNotifications, getUnreadCount, markAllAsRead } from "../../api/NotificationApi";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);

  const load = async () => {
    try {
      const [list, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setItems(list);
      setUnread(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedBell = wrapRef.current && wrapRef.current.contains(e.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!clickedBell && !clickedDropdown) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const next = !open;

    if (next && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const dropdownWidth = 320;
      // keep dropdown inside the viewport horizontally
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 12) {
        left = window.innerWidth - dropdownWidth - 12;
      }
      setCoords({ top: rect.bottom + 8, left });
    }

    setOpen(next);
    if (!next) setShowAll(false);

    if (next && unread > 0) {
      try {
        await markAllAsRead();
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <button className="nb-btn" onClick={handleToggle} aria-label="Notifications" title="Notifications">
        <svg
          className="nb-icon-svg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && <span className="nb-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open &&
        createPortal(
          <div
            className="nb-dropdown"
            ref={dropdownRef}
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="nb-header">Notifications</div>
            <div className="nb-list">
              {items.length === 0 && <p className="nb-empty">No notifications yet</p>}
              {visibleItems.map((n) => (
                <div key={n.id} className={`nb-item ${n.read ? "" : "nb-unread"}`}>
                  <p className="nb-title">{n.title}</p>
                  <p className="nb-message">{n.message}</p>
                  <span className="nb-time">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {items.length > 5 && (
              <button className="nb-showmore" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show less" : `Show ${items.length - 5} more`}
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}