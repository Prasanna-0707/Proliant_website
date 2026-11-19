
import { useMemo, useState } from "react";
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  FileSearch,
  Filter,
  CalendarDays,
} from "lucide-react";

const initialLogs = [
  {
    id: 1,
    user: "Admin",
    email: "admin@proliant.com",
    action: "Created a new job",
    module: "Jobs",
    date: "2026-10-24T10:30:00",
    status: "Success",
  },
  {
    id: 2,
    user: "HR Manager",
    email: "hr@proliant.com",
    action: "Updated candidate application status",
    module: "Candidates",
    date: "2026-10-24T10:15:00",
    status: "Success",
  },
  {
    id: 3,
    user: "Interview Lead",
    email: "lead@proliant.com",
    action: "Submitted interview evaluation",
    module: "Interviews",
    date: "2026-10-24T09:45:00",
    status: "Success",
  },
  {
    id: 4,
    user: "Admin",
    email: "admin@proliant.com",
    action: "Updated user permissions",
    module: "Access Control",
    date: "2026-10-23T16:20:00",
    status: "Success",
  },
  {
    id: 5,
    user: "HR Manager",
    email: "hr@proliant.com",
    action: "Updated job description",
    module: "Jobs",
    date: "2026-10-23T14:10:00",
    status: "Success",
  },
  {
    id: 6,
    user: "Interviewer",
    email: "interviewer@proliant.com",
    action: "Failed to submit evaluation",
    module: "Interviews",
    date: "2026-10-23T11:35:00",
    status: "Failed",
  },
];

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function AuditLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [notice, setNotice] = useState("");

  const modules = useMemo(
    () => [...new Set(logs.map((log) => log.module))],
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch = [
        log.user,
        log.email,
        log.action,
        log.module,
        log.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesModule =
        moduleFilter === "All" || log.module === moduleFilter;

      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter;

      const matchesDate =
        !dateFilter || log.date.slice(0, 10) === dateFilter;

      return (
        matchesSearch &&
        matchesModule &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [logs, search, moduleFilter, statusFilter, dateFilter]);

  const successCount = logs.filter(
    (log) => log.status === "Success"
  ).length;

  const failedCount = logs.filter(
    (log) => log.status === "Failed"
  ).length;

  const today = new Date().toISOString().slice(0, 10);

  const todayCount = logs.filter(
    (log) => log.date.slice(0, 10) === today
  ).length;

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("All");
    setStatusFilter("All");
    setDateFilter("");
    setNotice("");
  };

  const refreshLogs = () => {
    setLogs([...logs]);
    setNotice("Displayed sample audit logs refreshed.");
  };

  const exportCsv = () => {
    if (filteredLogs.length === 0) {
      setNotice("No records available to export.");
      return;
    }

    const columns = [
      "User",
      "Email",
      "Action",
      "Module",
      "Date & Time",
      "Status",
    ];

    const rows = filteredLogs.map((log) => [
      log.user,
      log.email,
      log.action,
      log.module,
      `${formatDate(log.date)} ${formatTime(log.date)}`,
      log.status,
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "proliant-audit-logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Audit log CSV exported successfully.");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-50";

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 sm:px-4 sm:py-4 xl:px-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#EF3B3A]">
            <ShieldCheck size={15} />
            Security & Monitoring
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#071737]">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor user activities and recruitment portal events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshLogs}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EF3B3A] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="font-medium text-slate-400 hover:text-slate-700"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          icon={Activity}
          label="Total Events"
          value={logs.length}
          color="blue"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Successful"
          value={successCount}
          color="green"
        />
        <SummaryCard
          icon={XCircle}
          label="Failed Events"
          value={failedCount}
          color="red"
        />
        <SummaryCard
          icon={Clock3}
          label="Today's Events"
          value={todayCount}
          color="purple"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#071737]">
                Activity History
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {filteredLogs.length} of {logs.length} events displayed
              </p>
            </div>

            <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              <Filter size={14} />
              Filter records
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_minmax(145px,0.9fr)_auto]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by module"
            >
              <option value="All">All modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>

            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className={`${inputClass} pl-9`}
                aria-label="Filter by date"
              />
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-50">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {log.user
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {log.user}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {log.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-75 px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">
                        {log.action}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                        {log.module}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-sm text-slate-700">
                        {formatDate(log.date)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatTime(log.date)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FileSearch size={21} />
                      </span>
                      <p className="text-sm font-semibold text-slate-700">
                        No audit logs found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try changing your search or filter settings.
                      </p>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 text-sm font-semibold text-[#EF3B3A] hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {filteredLogs.length} records
          </p>
          <p className="text-xs text-slate-400">
            Sample data · Backend integration pending
          </p>
        </div>
      </section>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-3 text-xs leading-5 text-blue-800">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <p>
          Production audit logs should be generated by the backend and include
          actor, action, timestamp, outcome and relevant resource identifiers.
          They should be protected from unauthorized modification.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles[color]}`}
        >
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#071737]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const successful = status === "Success";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        successful
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          successful ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status}
    </span>
  );
}

export default AuditLogs;