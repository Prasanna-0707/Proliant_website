import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getHiringPipeline, listDecisions } from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";

// Every decision you recorded, newest first.
export default function ActivityHistory() {
  const { data, loading, error, reload } = useApi(async (signal) => {
    const pipeline = await getHiringPipeline(undefined, signal);

    const candidates = (pipeline.jobs || []).flatMap((job) =>
      job.stages.flatMap((stage) => stage.candidates)
    );

    const unique = [...new Map(candidates.map((candidate) => [candidate._id, candidate])).values()];

    const results = await Promise.all(
      unique.map(async (candidate) => {
        const result = await listDecisions(candidate._id, signal);

        return (result.decisions || []).map((decision) => ({ ...decision, candidateName: candidate.name }));
      })
    );

    return results.flat().sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt));
  }, []);

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="mt-1 text-sm text-gray-500">Hiring decisions recorded for your jobs.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="No decisions have been recorded yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((row) => (
                <li key={row._id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <span>
                    <span className="font-medium text-gray-900">{row.candidateName}</span>
                    <span className="text-gray-600"> — {row.decision} at {row.stageName}</span>
                    {row.reason && <span className="text-gray-500"> ({row.reason})</span>}
                  </span>
                  <span className="text-xs text-gray-400">
                    {row.decidedBy?.name} · {formatDateTime(row.decidedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </div>
    </div>
  );
}
