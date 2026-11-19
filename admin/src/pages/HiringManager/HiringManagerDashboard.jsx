import { Link } from "react-router-dom";
import { Users, Briefcase, ClipboardCheck, MessageSquareText } from "lucide-react";

import DataState from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getFeedbackHistory, getHiringPipeline } from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";
import { getStoredUser } from "../../services/http.js";

const BAR_COLORS = ["bg-slate-400", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];

// GET /api/hiring/pipeline and GET /api/hiring/feedback-history
export default function HiringManagerDashboard() {
  const pipeline = useApi((signal) => getHiringPipeline(undefined, signal), []);
  const feedback = useApi((signal) => getFeedbackHistory(undefined, signal), []);

  const jobs = pipeline.data?.jobs || [];
  const history = feedback.data?.feedbackHistory || [];

  const pendingDecisions = history.filter((item) => item.isCurrent && item.evaluation?.status === "Submitted");

  const stats = [
    { label: "Jobs Assigned", value: pipeline.data?.summary?.jobs ?? 0, icon: Briefcase, style: "bg-blue-50 text-blue-600" },
    { label: "Active Candidates", value: pipeline.data?.summary?.applications ?? 0, icon: Users, style: "bg-amber-50 text-amber-600" },
    { label: "Evaluations Received", value: history.length, icon: MessageSquareText, style: "bg-violet-50 text-violet-600" },
    { label: "Awaiting Your Decision", value: pendingDecisions.length, icon: ClipboardCheck, style: "bg-green-50 text-green-600" },
  ];

  const name = getStoredUser("staff")?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Manager Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {name ? `Welcome back, ${name}. ` : ""}Candidates in the hiring pipeline for your jobs.
        </p>
      </div>

      <DataState
        loading={pipeline.loading || feedback.loading}
        error={pipeline.error || feedback.error}
        onRetry={() => {
          pipeline.reload();
          feedback.reload();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, style }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-lg p-3 ${style}`}><Icon size={22} /></div>
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Hiring Pipeline</h2>
            <Link to="/hiring-manager/interview-pipeline" className="text-sm font-medium text-red-500 hover:underline">
              Open pipeline
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No jobs have been assigned to you yet.
            </p>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => {
                const max = Math.max(1, ...job.stages.map((stage) => stage.count));

                return (
                  <div key={job.jobId}>
                    <p className="mb-3 text-sm font-semibold text-gray-800">
                      {job.jobTitle} · {job.totalApplications} candidate(s)
                    </p>
                    <div className="space-y-2">
                      {job.stages.map((stage, index) => (
                        <div key={stage.stageCode} className="flex items-center gap-3 text-xs">
                          <span className="w-28 shrink-0 text-gray-600">{stage.stageName}</span>
                          <div className="h-2 flex-1 rounded-full bg-gray-100">
                            <div
                              className={`h-2 rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                              style={{ width: `${(stage.count / max) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-gray-600">{stage.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Recent Interview Feedback</h2>

          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No interview feedback has been submitted yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.slice(0, 6).map((item) => (
                <li key={item.interviewId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.candidate?.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.stageName} · interviewer {item.interviewer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {item.evaluation?.recommendation} · {item.evaluation?.overallRating}/5
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(item.evaluation?.submittedAt)}</span>
                    <Link
                      to={`/hiring-manager/final-review?application=${item.applicationId}`}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Review
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
