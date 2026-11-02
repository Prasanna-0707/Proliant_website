
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Sparkles,
  UserRound,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import { initialNotifications } from "./notificationData";


const iconMap = {
  application: BriefcaseBusiness,
  interview: CalendarDays,
  jobs: Sparkles,
  profile: UserRound,
};

const iconStyles = {
  application: "bg-red-50 text-red-500",
  interview: "bg-blue-50 text-blue-600",
  jobs: "bg-indigo-50 text-indigo-500",
  profile: "bg-emerald-50 text-emerald-600",
};

function getNotifications() {
  try {
    const saved = localStorage.getItem("candidateNotifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(getNotifications);

  const unreadCount = notifications.filter((item) => item.unread).length;

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

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem("candidateNotifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("candidate-notifications-updated"));
  };

  const markAllRead = () => {
    saveNotifications(notifications.map((item) => ({ ...item, unread: false })));
  };

  const openNotification = (notification) => {
    saveNotifications(
      notifications.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item
      )
    );

    setOpen(false);
    navigate(notification.path);
  };

  const visibleNotifications = notifications.filter(
    (item) => filter === "All" || item.unread
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          console.log("Bell clicked");
          setOpen((value) => !value);
        }}
        className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="fixed right-6 top-[82px] z-[9999] w-[min(430px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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

          <div className="max-h-[390px] overflow-y-auto">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((item) => {
                const Icon = iconMap[item.type] || Bell;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                      item.unread ? "bg-red-50/20" : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        iconStyles[item.type] || "bg-slate-100 text-slate-600"
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
                          {item.time}
                        </span>
                      </span>

                      <span className="mt-1 block text-sm leading-5 text-slate-600">
                        {item.message}
                      </span>
                    </span>

                    {item.unread && (
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
