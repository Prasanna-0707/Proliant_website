
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Sparkles,
  UserRound,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { initialNotifications } from "./notificationData";

const icons = {
  application: BriefcaseBusiness,
  interview: CalendarDays,
  jobs: Sparkles,
  profile: UserRound,
};

const styles = {
  application: "bg-red-50 text-red-500",
  interview: "bg-blue-50 text-blue-600",
  jobs: "bg-indigo-50 text-indigo-500",
  profile: "bg-emerald-50 text-emerald-600",
};

function loadNotifications() {
  try {
    const saved = localStorage.getItem("candidateNotifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch {
    return initialNotifications;
  }
}

export default function CandidateNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(loadNotifications);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const syncNotifications = () => setNotifications(loadNotifications());

    window.addEventListener("candidate-notifications-updated", syncNotifications);
    window.addEventListener("storage", syncNotifications);

    return () => {
      window.removeEventListener("candidate-notifications-updated", syncNotifications);
      window.removeEventListener("storage", syncNotifications);
    };
  }, []);

  const save = (updated) => {
    setNotifications(updated);
    localStorage.setItem("candidateNotifications", JSON.stringify(updated));
    window.dispatchEvent(new Event("candidate-notifications-updated"));
  };

  const markAllRead = () => {
    save(notifications.map((item) => ({ ...item, unread: false })));
  };

  const openNotification = (item) => {
    save(
      notifications.map((notification) =>
        notification.id === item.id
          ? { ...notification, unread: false }
          : notification
      )
    );
    navigate(item.path);
  };

  const visible = notifications.filter(
    (item) => filter === "All" || item.unread
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div>
          <div className="mb-1 h-1.5 w-10 bg-red-500" />
          <p className="text-xl font-extrabold text-black">Proliant Data</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/candidate-dashboard")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Stay up to date with your applications and opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={!notifications.some((item) => item.unread)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            <Check size={16} />
            Mark all as read
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Bell size={21} />
              </span>
              <div>
                <h2 className="font-bold">Your activity</h2>
                <p className="text-xs text-slate-500">
                  {notifications.filter((item) => item.unread).length} unread
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 border-b border-slate-100 px-5">
            {["All", "Unread"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`border-b-2 py-3 text-sm font-semibold ${
                  filter === item
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-slate-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {visible.length ? (
            <div className="divide-y divide-slate-100">
              {visible.map((item) => {
                const Icon = icons[item.type] || Bell;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6 ${
                      item.unread ? "bg-red-50/20" : ""
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        styles[item.type] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon size={22} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {item.title}
                        </span>
                        {item.unread && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                            New
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        {item.message}
                      </span>
                      <span className="mt-2 block text-xs text-slate-400">
                        {item.time}
                      </span>
                    </span>

                    {item.unread && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <CheckCircle2 size={35} className="mx-auto text-emerald-500" />
              <p className="mt-3 font-semibold">You're all caught up</p>
              <p className="mt-1 text-sm text-slate-500">
                There are no unread notifications.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
