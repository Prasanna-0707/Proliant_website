import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, Check } from "lucide-react";

import useApi from "../../services/useApi.js";
import { getToken } from "../../services/http.js";
import {
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
import { PageState } from "../../components/Candidate/CandidateLayout.jsx";

export default function CandidateNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useApi(
    (signal) => listNotifications(signal),
    []
  );

  // Reload when the bell (or another tab of the portal) changes something.
  useEffect(() => {
    window.addEventListener("candidate-notifications-updated", reload);

    return () =>
      window.removeEventListener("candidate-notifications-updated", reload);
  }, [reload]);

  if (!getToken("candidate")) {
    return <Navigate to="/candidate/login" replace />;
  }

  const notifications = data?.notifications || [];
  const unread = notifications.filter((item) => !item.isRead);

  const markAllRead = async () => {
    setActionError("");

    try {
      await markAllNotificationsRead();
      notifyUpdated();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const openNotification = async (item) => {
    setActionError("");

    try {
      if (!item.isRead) {
        await markNotificationRead(item._id);
        notifyUpdated();
      }

      navigate("/candidate-applications");
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const visible = notifications.filter(
    (item) => filter === "All" || !item.isRead
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
              Stay up to date with your applications.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unread.length === 0}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            <Check size={16} />
            Mark all as read
          </button>
        </div>

        {actionError && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Bell size={21} />
              </span>
              <div>
                <h2 className="font-bold">Your activity</h2>
                <p className="text-xs text-slate-500">
                  {unread.length} unread
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

          <PageState loading={loading} error={error} onRetry={reload}>
            {visible.length ? (
              <div className="divide-y divide-slate-100">
                {visible.map((item) => {
                  const Icon = notificationIcons[item.type] || Bell;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => openNotification(item)}
                      className={`flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6 ${
                        item.isRead ? "" : "bg-red-50/20"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          notificationStyles[item.type] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={22} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {item.title}
                          </span>
                          {!item.isRead && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                              New
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">
                          {item.message}
                        </span>
                        <span className="mt-2 block text-xs text-slate-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>

                      {!item.isRead && (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-6 py-14 text-center text-sm text-slate-500">
                {filter === "Unread"
                  ? "You're all caught up."
                  : "You have no notifications yet."}
              </p>
            )}
          </PageState>
        </section>
      </main>
    </div>
  );
}
