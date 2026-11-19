import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";

import {
  listStaffNotifications,
  markStaffNotificationRead,
  markAllStaffNotificationsRead,
  notifyStaffUpdated,
} from "../services/notifications.js";
import { timeAgo } from "../services/format.js";

const POLL_MS = 60000;

// Header bell for every staff role: real notifications, unread count,
// read status and "mark all as read".
export default function StaffNotificationBell() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await listStaffNotifications({ limit: 30 });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    const timer = setInterval(load, POLL_MS);

    window.addEventListener("staff-notifications-updated", load);

    return () => {
      clearInterval(timer);
      window.removeEventListener("staff-notifications-updated", load);
    };
  }, [load]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await markAllStaffNotificationsRead();
      notifyStaffUpdated();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await markStaffNotificationRead(notification._id);
        notifyStaffUpdated();
      }
    } catch (requestError) {
      setError(requestError.message);
    }

    setOpen(false);

    if (notification.link) navigate(notification.link);
  };

  const visible = notifications.filter(
    (item) => filter === "All" || !item.isRead
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Bell size={20} strokeWidth={2} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-4 top-[72px] z-[9999] w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="text-base font-semibold">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  {unreadCount} new
                </span>
              )}
            </h2>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>

          <div className="flex gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            {["All", "Unread"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === tab
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <p className="px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <ul className="max-h-[420px] overflow-y-auto">
            {visible.length === 0 && !error && (
              <li className="px-4 py-10 text-center text-sm text-gray-500">
                {filter === "Unread"
                  ? "No unread notifications."
                  : "No notifications yet."}
              </li>
            )}

            {visible.map((item) => (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => openNotification(item)}
                  className={`flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                    item.isRead ? "" : "bg-red-50/50 dark:bg-red-500/5"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.isRead ? "bg-transparent" : "bg-red-500"
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600 dark:text-gray-300">
                      {item.message}
                    </span>
                    <span className="mt-1 block text-xs text-gray-400">
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
