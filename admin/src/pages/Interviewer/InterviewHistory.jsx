import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listMyInterviews } from "../../services/interviews.js";
import { formatDateTime } from "../../services/format.js";

// Completed interviews and submitted evaluations (GET /api/interviews/my).
export default function InterviewHistory() {
  const { data, loading, error, reload } = useApi(
    (signal) => listMyInterviews(undefined, signal),
    []
  );

  const rows = (data?.interviews || []).filter(
    (item) => item.status === "Completed" || item.evaluation?.status === "Submitted"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completed interviews and the evaluations you submitted.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="No completed interviews yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Candidate</th>
                    <th className="px-5 py-4 font-semibold">Stage</th>
                    <th className="px-5 py-4 font-semibold">Interview Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Recommendation</th>
                    <th className="px-5 py-4 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((interview) => (
                    <tr key={interview._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">{interview.application?.name}</td>
                      <td className="px-5 py-4 text-gray-700">{interview.stageName}</td>
                      <td className="px-5 py-4 text-gray-600">{formatDateTime(interview.scheduledAt)}</td>
                      <td className="px-5 py-4 text-gray-700">{interview.status}</td>
                      <td className="px-5 py-4 text-gray-700">{interview.evaluation?.recommendation || "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/interviewer/interview/${interview._id}`} className="text-sm font-medium text-red-500 hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}
