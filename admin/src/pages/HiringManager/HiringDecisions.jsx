import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getHiringPipeline, listDecisions } from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";

const badge = {
  Advance: "bg-emerald-50 text-emerald-700",
  Hold: "bg-amber-50 text-amber-700",
  Reject: "bg-red-50 text-red-700",
};

// Latest recorded decision per candidate (GET /api/applications/:id/decisions).
export default function HiringDecisions() {
  const { data, loading, error, reload } = useApi(async (signal) => {
    const pipeline = await getHiringPipeline(undefined, signal);

    const candidates = (pipeline.jobs || []).flatMap((job) =>
      job.stages.flatMap((stage) =>
        stage.candidates.map((candidate) => ({ ...candidate, jobTitle: job.jobTitle, stageName: stage.stageName }))
      )
    );

    return Promise.all(
      candidates.map(async (candidate) => {
        const result = await listDecisions(candidate._id, signal);
        const decisions = result.decisions || [];

        return { ...candidate, latest: decisions[decisions.length - 1] || null, total: decisions.length };
      })
    );
  }, []);

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Decisions</h1>
        <p className="mt-1 text-sm text-gray-500">The latest decision recorded for each candidate.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="There are no candidates in your pipeline." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Candidate</th>
                    <th className="px-5 py-4 font-semibold">Job</th>
                    <th className="px-5 py-4 font-semibold">Current Stage</th>
                    <th className="px-5 py-4 font-semibold">Latest Decision</th>
                    <th className="px-5 py-4 font-semibold">Decided</th>
                    <th className="px-5 py-4 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">{row.name}</td>
                      <td className="px-5 py-4 text-gray-700">{row.jobTitle}</td>
                      <td className="px-5 py-4 text-gray-700">{row.stageName}</td>
                      <td className="px-5 py-4">
                        {row.latest ? (
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[row.latest.decision] || "bg-gray-100"}`}>
                            {row.latest.decision} ({row.latest.stageName})
                          </span>
                        ) : (
                          <span className="text-gray-400">No decision yet</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatDateTime(row.latest?.decidedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/hiring-manager/final-review?application=${row._id}`} className="text-sm font-medium text-red-500 hover:underline">
                          {row.latest ? "View" : "Decide"}
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
