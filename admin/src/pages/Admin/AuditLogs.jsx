import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listAuditLogs } from "../../services/adminConsole.js";
import { formatDateTime } from "../../services/format.js";

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

// GET /api/admin/audit-logs
export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useApi(
    (signal) => listAuditLogs({ page, limit: 25, search: debounced }, signal),
    [page, debounced]
  );

  const logs = data?.auditLogs || [];
  const pagination = data?.pagination;

  const exportCsv = () => {
    const header = ["Time", "Actor", "Role", "Action", "Target", "Department", "Reason"];
    const rows = logs.map((log) => [
      formatDateTime(log.createdAt),
      log.actorName || log.actorEmail,
      log.roleUsed,
      log.action,
      log.targetLabel,
      log.department,
      log.reason,
    ]);

    const blob = new Blob(
      [[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "audit-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Who did what, and when.</p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={logs.length === 0}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download size={16} /> Export this page (CSV)
        </button>
      </div>

      <div className="relative rounded-xl border border-gray-200 bg-white p-4">
        <Search size={17} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search actor, action or target..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {logs.length === 0 ? (
            <EmptyState text="No audit records found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-230 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Time</th>
                    <th className="px-5 py-4 font-semibold">Actor</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                    <th className="px-5 py-4 font-semibold">Target</th>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">{formatDateTime(log.createdAt)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{log.actorName || log.actorEmail}</p>
                        <p className="text-xs text-gray-500">{log.roleUsed}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{String(log.action).replaceAll("_", " ")}</td>
                      <td className="px-5 py-4 text-gray-700">{log.targetLabel || log.targetType}</td>
                      <td className="px-5 py-4 text-gray-700">{log.department || "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{log.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((value) => value - 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
                <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}
