import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getHiringPipeline } from "../../services/hiring.js";
import { formatDate } from "../../services/format.js";

// GET /api/hiring/pipeline: candidates per stage for each assigned job.
export default function InterviewPipeline() {
  const { data, loading, error, reload } = useApi(
    (signal) => getHiringPipeline(undefined, signal),
    []
  );

  const jobs = data?.jobs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">Where each candidate is in the hiring process.</p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {jobs.length === 0 ? (
          <EmptyState text="No jobs have been assigned to you yet." />
        ) : (
          jobs.map((job) => (
            <section key={job.jobId} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-900">
                {job.jobTitle} <span className="text-sm font-normal text-gray-500">· {job.totalApplications} candidate(s)</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {job.stages.map((stage) => (
                  <div key={stage.stageCode} className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-700">
                      {stage.stageName}
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs">{stage.count}</span>
                    </p>

                    <ul className="space-y-2">
                      {stage.candidates.map((candidate) => (
                        <li key={candidate._id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                          <p className="font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-xs text-gray-500">Applied {formatDate(candidate.appliedAt)}</p>
                          <Link
                            to={`/hiring-manager/final-review?application=${candidate._id}`}
                            className="mt-2 inline-block text-xs font-semibold text-red-500 hover:underline"
                          >
                            Review &amp; decide
                          </Link>
                        </li>
                      ))}

                      {stage.candidates.length === 0 && <li className="text-xs text-gray-400">No candidates</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </DataState>
    </div>
  );
}
