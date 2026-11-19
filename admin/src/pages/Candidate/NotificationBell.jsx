import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, ArrowRight } from "lucide-react";

import {
  getUnreadCount,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/candidatePortal.js";
import { timeAgo } from "../../services/format.js";
import {
  notificationIcons,
  notificationStyles,
  notifyUpdated,
} from "../../components/Candidate/notificationUi.js";

export default function NotificationBell() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [serverUnread, setServerUnread] = useState(null);

  const load = useCallback(async () => {
    try {
      // The badge uses the server's unread count (GET /candidate/notifications/unread-count).
      const [data, count] = await Promise.all([
        listNotifications(),
        getUnreadCount(),
      ]);

      setServerUnread(count.unreadCount ?? null);
      setNotifications(data.notifications || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  // Initial load and reload whenever another part of the portal changes
  // notifications.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    window.addEventListener("candidate-notifications-updated", load);

    return () =>
      window.removeEventListener("candidate-notifications-updated", load);
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

  const unreadCount =
    serverUnread ?? notifications.filter((item) => !item.isRead).length;

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      notifyUpdated();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification._id);
        notifyUpdated();
      }
    } catch (requestError) {
      setError(requestError.message);
    }

    setOpen(false);
    navigate("/candidate-applications");
  };

  const visibleNotifications = notifications.filter(
    (item) => filter === "All" || !item.isRead
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="fixed right-6 top-[82px] z-[9999] w-[min(430px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
          <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  {unreadCount} New
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:cursor-default disabled:text-slate-400"
            >
              Mark all as read
            </button>
          </div>

          <div className="flex border-b border-slate-100 px-5">
            {["All", "Unread"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                  filter === item
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="px-5 py-3 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="max-h-[390px] overflow-y-auto">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((item) => {
                const Icon = notificationIcons[item.type] || Bell;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                      item.isRead ? "bg-white" : "bg-red-50/20"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notificationStyles[item.type] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={21} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>

                      <span className="mt-1 block text-sm leading-5 text-slate-600">
                        {item.message}
                      </span>
                    </span>

                    {!item.isRead && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="mx-auto text-emerald-500" size={30} />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  You're all caught up
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  No unread notifications right now.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/candidate-notifications");
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-4 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            View All Notifications
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
