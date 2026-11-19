import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listHiringInterviews } from "../../services/hiring.js";

// Interviewers working on your jobs, from GET /api/hiring/interviews.
export default function InterviewerCoordination() {
  const { data, loading, error, reload } = useApi(
    (signal) => listHiringInterviews(undefined, signal),
    []
  );

  const interviewers = new Map();

  for (const item of data?.interviews || []) {
    const key = item.assignedTo?._id;

    if (!key) continue;

    if (!interviewers.has(key)) {
      interviewers.set(key, {
        ...item.assignedTo,
        total: 0,
        upcoming: 0,
        completed: 0,
        stages: new Set(),
      });
    }

    const entry = interviewers.get(key);

    entry.total += 1;
    entry.stages.add(item.stageName);

    if (["Scheduled", "Confirmed", "Rescheduled"].includes(item.status)) {
      entry.upcoming += 1;
    }

    if (item.status === "Completed") entry.completed += 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviewer Coordination</h1>
        <p className="mt-1 text-sm text-gray-500">
          Interviewers working on your jobs and their interview load.
        </p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {interviewers.size === 0 ? (
          <EmptyState text="No interviewers are assigned to your jobs yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...interviewers.values()].map((interviewer) => (
              <article
                key={interviewer._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-gray-900">{interviewer.name}</h2>
                <p className="text-xs text-gray-500">{interviewer.email}</p>
                <p className="mt-3 text-sm text-gray-700">
                  {interviewer.upcoming} upcoming · {interviewer.completed} completed ·{" "}
                  {interviewer.total} total
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Stages: {[...interviewer.stages].join(", ")}
                </p>
              </article>
            ))}
          </div>
        )}
      </DataState>
    </div>
  );
}
