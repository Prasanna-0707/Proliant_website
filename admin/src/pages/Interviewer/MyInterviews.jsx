import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listMyInterviews } from "../../services/interviews.js";
import { formatDateTime } from "../../services/format.js";

const STATUSES = ["All", "Scheduled", "Confirmed", "Rescheduled", "Completed", "Cancelled", "No-Show"];

const badge = {
  Scheduled: "bg-blue-50 text-blue-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Rescheduled: "bg-amber-50 text-amber-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
  "No-Show": "bg-slate-100 text-slate-600",
};

// GET /api/interviews/my
export default function MyInterviews() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const { data, loading, error, reload } = useApi(
    (signal) => listMyInterviews(undefined, signal),
    []
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (data?.interviews || []).filter(
      (item) =>
        (status === "All" || item.status === status) &&
        (!query ||
          [item.application?.name, item.application?.email, item.job?.title, item.stageName].some(
            (value) => String(value || "").toLowerCase().includes(query)
          ))
    );
  }, [data, status, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="mt-1 text-sm text-gray-500">Interviews assigned to you.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidate, job or stage..."
          className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-red-500"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
        >
          {STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="No interviews found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Candidate</th>
                    <th className="px-5 py-4 font-semibold">Job</th>
                    <th className="px-5 py-4 font-semibold">Stage</th>
                    <th className="px-5 py-4 font-semibold">Scheduled</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Evaluation</th>
                    <th className="px-5 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((interview) => (
                    <tr key={interview._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{interview.application?.name}</p>
                        <p className="text-xs text-gray-500">{interview.application?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{interview.job?.title}</td>
                      <td className="px-5 py-4 text-gray-700">{interview.stageName}</td>
                      <td className="px-5 py-4 text-gray-600">{formatDateTime(interview.scheduledAt)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[interview.status] || "bg-gray-100 text-gray-700"}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {interview.evaluation?.status || "Not started"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/interviewer/interview/${interview._id}`}
                          className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Open
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
