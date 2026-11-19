import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getFeedbackHistory } from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";

// GET /api/hiring/feedback-history: interviewer evaluations for your jobs.
export default function Evaluations() {
  const { data, loading, error, reload } = useApi(
    (signal) => getFeedbackHistory(undefined, signal),
    []
  );

  const rows = data?.feedbackHistory || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
        <p className="mt-1 text-sm text-gray-500">Interviewer feedback for candidates in your hiring pipeline.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="No evaluations have been submitted yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Candidate</th>
                    <th className="px-5 py-4 font-semibold">Stage</th>
                    <th className="px-5 py-4 font-semibold">Interviewer</th>
                    <th className="px-5 py-4 font-semibold">Rating</th>
                    <th className="px-5 py-4 font-semibold">Recommendation</th>
                    <th className="px-5 py-4 font-semibold">Submitted</th>
                    <th className="px-5 py-4 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item.interviewId} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{item.candidate?.name}</p>
                        <p className="text-xs text-gray-500">{item.candidate?.position}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {item.stageName}
                        {!item.isCurrent && <span className="ml-2 text-xs text-gray-400">(superseded)</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{item.interviewer?.name}</td>
                      <td className="px-5 py-4 text-gray-700">{item.evaluation?.overallRating ?? "—"}/5</td>
                      <td className="px-5 py-4 text-gray-700">{item.evaluation?.recommendation || "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{formatDateTime(item.evaluation?.submittedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/hiring-manager/final-review?application=${item.applicationId}`}
                          className="text-sm font-medium text-red-500 hover:underline"
                        >
                          Review
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
