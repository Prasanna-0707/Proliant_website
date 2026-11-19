import { useMemo, useState } from "react";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listHiringInterviews } from "../../services/hiring.js";
import { formatDateTime } from "../../services/format.js";

const STATUS_STYLES = {
  Scheduled: "bg-blue-50 text-blue-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Rescheduled: "bg-amber-50 text-amber-700",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-50 text-red-700",
  "No-Show": "bg-red-50 text-red-700",
};

// Interviews scheduled for candidates on your jobs
// (GET /api/hiring/interviews). Scheduling is done by the L0 screener and HR.
export default function InterviewSchedule() {
  const [status, setStatus] = useState("");

  const { data, loading, error, reload } = useApi(
    (signal) => listHiringInterviews({ status }, signal),
    [status]
  );

  const rows = useMemo(() => data?.interviews || [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Interviews scheduled for candidates on your assigned jobs.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {rows.length === 0 ? (
            <EmptyState text="There are no interviews for your jobs yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    {["Candidate", "Position", "Round", "Interviewer", "When", "Mode", "Status"].map(
                      (heading) => (
                        <th key={heading} className="px-5 py-4 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {item.application?.name}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{item.job?.title}</td>
                      <td className="px-5 py-4 text-gray-700">{item.stageName}</td>
                      <td className="px-5 py-4 text-gray-700">{item.assignedTo?.name}</td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatDateTime(item.scheduledAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{item.mode}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[item.status] || "bg-gray-100"
                          }`}
                        >
                          {item.status}
                        </span>
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
