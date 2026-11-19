import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listMyInterviews } from "../../services/interviews.js";

// Candidates you are assigned to interview (GET /api/interviews/my).
export default function CandidateReview() {
  const { data, loading, error, reload } = useApi(
    (signal) => listMyInterviews(undefined, signal),
    []
  );

  // One card per candidate, listing their interview stages.
  const candidates = new Map();

  for (const interview of data?.interviews || []) {
    const key = interview.application?._id;

    if (!key) continue;

    if (!candidates.has(key)) {
      candidates.set(key, { ...interview.application, interviews: [] });
    }

    candidates.get(key).interviews.push(interview);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Candidates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Candidates you are assigned to interview.
        </p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {candidates.size === 0 ? (
          <EmptyState text="You have no assigned candidates." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...candidates.values()].map((candidate) => (
              <article key={candidate._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-gray-900">{candidate.name}</h2>
                <p className="text-xs text-gray-500">{candidate.email}</p>
                <p className="mt-1 text-xs text-gray-500">{candidate.phone}</p>
                <p className="mt-3 text-sm text-gray-700">{candidate.position}</p>

                <ul className="mt-4 space-y-2">
                  {candidate.interviews.map((interview) => (
                    <li key={interview._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{interview.stageName} · {interview.status}</span>
                      <Link to={`/interviewer/interview/${interview._id}`} className="font-medium text-red-500 hover:underline">
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </DataState>
    </div>
  );
}
