import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";

import DataState from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listMyInterviews } from "../../services/interviews.js";
import { formatDateTime } from "../../services/format.js";
import { getStoredUser } from "../../services/http.js";

const UPCOMING = ["Scheduled", "Confirmed", "Rescheduled"];

// GET /api/interviews/my
export default function InterviewerDashboard() {
  const { data, loading, error, reload } = useApi(
    (signal) => listMyInterviews(undefined, signal),
    []
  );

  const interviews = data?.interviews || [];
  const upcoming = interviews
    .filter((item) => UPCOMING.includes(item.status))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const completed = interviews.filter((item) => item.status === "Completed");
  const pendingEvaluation = interviews.filter(
    (item) => item.evaluation?.status !== "Submitted" && item.status !== "Cancelled"
  );

  const stats = [
    { label: "Assigned Interviews", value: interviews.length, icon: ClipboardList, style: "bg-blue-50 text-blue-600" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays, style: "bg-amber-50 text-amber-600" },
    { label: "Evaluations Pending", value: pendingEvaluation.length, icon: Clock3, style: "bg-orange-50 text-orange-600" },
    { label: "Completed", value: completed.length, icon: CheckCircle2, style: "bg-green-50 text-green-600" },
  ];

  const name = getStoredUser("staff")?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviewer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {name ? `Welcome back, ${name}. ` : ""}
          Your assigned interviews and pending evaluations.
        </p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, style }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-lg p-3 ${style}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Interviews</h2>
            <Link to="/interviewer/my-interviews" className="text-sm font-medium text-red-500 hover:underline">
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              You have no upcoming interviews.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.slice(0, 5).map((interview) => (
                <li key={interview._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{interview.application?.name}</p>
                    <p className="text-xs text-gray-500">
                      {interview.job?.title} · {interview.stageName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{formatDateTime(interview.scheduledAt)}</span>
                    <Link
                      to={`/interviewer/interview/${interview._id}`}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DataState>
    </div>
  );
}
