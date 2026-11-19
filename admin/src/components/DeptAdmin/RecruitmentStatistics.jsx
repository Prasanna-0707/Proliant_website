import { useMemo, useState } from "react";
import { CalendarDays, UserCheck, Award, Filter, RotateCcw } from "lucide-react";

import DataState from "../StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { getDepartmentStatistics } from "../../services/departmentAdmin.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_OPTIONS = [
  ["ALL", "All statuses"],
  ["IN_INTERVIEW", "In Interview Process"],
  ["SELECTED", "Selected"],
  ["JOINED", "Recruited / Joined"],
];

const PERIODS = [
  ["all", "All time"],
  ["month", "Month"],
  ["quarter", "Quarter"],
  ["year", "Year"],
  ["range", "Date range"],
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f2383d]";

const currentYear = new Date().getFullYear();

const initialFilters = {
  department: "",
  status: "ALL",
  period: "all",
  year: String(currentYear),
  month: String(new Date().getMonth() + 1),
  quarter: "1",
  from: "",
  to: "",
};

// Turns the form values into the query parameters of
// GET /api/department-admin/dashboard/statistics.
const toParams = (filters) => {
  const params = { status: filters.status };

  if (filters.department) params.department = filters.department;

  if (filters.period === "year") params.year = filters.year;

  if (filters.period === "month") {
    params.year = filters.year;
    params.month = filters.month;
  }

  if (filters.period === "quarter") {
    params.year = filters.year;
    params.quarter = filters.quarter;
  }

  if (filters.period === "range") {
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
  }

  return params;
};

const Metric = ({ label, value, icon: Icon, tone, hint }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {value === null || value === undefined ? "—" : value}
        </p>
      </div>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={22} />
      </span>
    </div>
    <p className="mt-3 text-xs leading-5 text-slate-500">{hint}</p>
  </article>
);

const cell = (value) => (value === null || value === undefined ? "—" : value);

// Organization-wide aggregate statistics with department-wise breakdown.
// Counts only: no candidate-level data is returned by this API.
//
// fetcher:      defaults to the Department Administrator API; the HR report
//               page passes GET /api/reports/recruitment-summary instead.
// renderFooter: optional (queryParams) => node, rendered under the table.
export default function RecruitmentStatistics({
  ownDepartment,
  fetcher = getDepartmentStatistics,
  renderFooter,
}) {
  const [draft, setDraft] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [formError, setFormError] = useState("");

  // Unfiltered request: provides the department list for the filter.
  const allDepartments = useApi((signal) => fetcher({}, signal), []);

  const stats = useApi(
    (signal) => fetcher(toParams(applied), signal),
    [JSON.stringify(applied)]
  );

  const departments = useMemo(
    () => (allDepartments.data?.data?.departmentWise || []).map((row) => row.department),
    [allDepartments.data]
  );

  const set = (key) => (event) =>
    setDraft((previous) => ({ ...previous, [key]: event.target.value }));

  const apply = (event) => {
    event.preventDefault();

    if (draft.period === "range" && draft.from && draft.to && draft.from > draft.to) {
      setFormError("The start date cannot be after the end date.");
      return;
    }

    if (["year", "month", "quarter"].includes(draft.period) && !/^\d{4}$/.test(draft.year)) {
      setFormError("Enter a four-digit year.");
      return;
    }

    setFormError("");
    setApplied(draft);
  };

  const reset = () => {
    setFormError("");
    setDraft(initialFilters);
    setApplied(initialFilters);
  };

  const data = stats.data?.data;
  const metrics = data?.metrics;
  const rows = data?.departmentWise || [];
  const total = data?.organizationTotal;
  const range = data?.filters?.dateRange?.label;
  const definitions = data?.meta?.definitions;

  return (
    <div className="space-y-5">
      <form
        onSubmit={apply}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        aria-label="Dashboard filters"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Department</span>
            <select value={draft.department} onChange={set("department")} className={inputClass}>
              <option value="">All departments</option>
              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Recruitment status</span>
            <select value={draft.status} onChange={set("status")} className={inputClass}>
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-500">Period</span>
            <select value={draft.period} onChange={set("period")} className={inputClass}>
              {PERIODS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {["year", "month", "quarter"].includes(draft.period) && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Year</span>
              <input
                inputMode="numeric"
                maxLength={4}
                value={draft.year}
                onChange={set("year")}
                className={inputClass}
              />
            </label>
          )}

          {draft.period === "month" && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Month</span>
              <select value={draft.month} onChange={set("month")} className={inputClass}>
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {draft.period === "quarter" && (
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Quarter</span>
              <select value={draft.quarter} onChange={set("quarter")} className={inputClass}>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Q{q} ({MONTHS[(q - 1) * 3].slice(0, 3)}–{MONTHS[q * 3 - 1].slice(0, 3)})
                  </option>
                ))}
              </select>
            </label>
          )}

          {draft.period === "range" && (
            <>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">From</span>
                <input type="date" value={draft.from} onChange={set("from")} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-slate-500">To</span>
                <input type="date" value={draft.to} onChange={set("to")} className={inputClass} />
              </label>
            </>
          )}
        </div>

        {formError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {formError}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[#f2383d] px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </form>

      <DataState loading={stats.loading} error={stats.error} onRetry={stats.reload}>
        {data && (
          <>
            <p className="text-sm text-slate-500">
              Showing {data.filters.department || "all departments"}
              {range ? ` · ${range}` : " · all time"}
              {data.filters.status !== "ALL"
                ? ` · ${STATUS_OPTIONS.find(([value]) => value === data.filters.status)?.[1]}`
                : ""}
            </p>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Metric
                label="In Interview Process"
                value={metrics.inInterviewProcess}
                icon={CalendarDays}
                tone="bg-blue-50 text-blue-600"
                hint="Candidates currently progressing through interview rounds."
              />
              <Metric
                label="Selected Candidates"
                value={metrics.selected}
                icon={UserCheck}
                tone="bg-amber-50 text-amber-600"
                hint="Cleared all required interview rounds. A selected candidate may not have joined yet."
              />
              <Metric
                label="Recruited / Joined"
                value={metrics.joined}
                icon={Award}
                tone="bg-emerald-50 text-emerald-600"
                hint="Selected candidates who actually joined. Offers and selections alone are not counted."
              />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold sm:text-lg">Department-wise statistics</h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="rounded-l-lg px-3 py-3">Department</th>
                      <th className="px-3 py-3 text-right">In Interview Process</th>
                      <th className="px-3 py-3 text-right">Selected</th>
                      <th className="rounded-r-lg px-3 py-3 text-right">Recruited / Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.department} className="border-b border-slate-100">
                        <td className="px-3 py-3 text-sm font-semibold">
                          {row.department}
                          {ownDepartment && row.department.toLowerCase() === ownDepartment.toLowerCase() && (
                            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-[#f2383d]">
                              Your department
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right text-sm">{cell(row.inInterviewProcess)}</td>
                        <td className="px-3 py-3 text-right text-sm">{cell(row.selected)}</td>
                        <td className="px-3 py-3 text-right text-sm">{cell(row.joined)}</td>
                      </tr>
                    ))}

                    <tr className="bg-slate-50 font-bold">
                      <td className="rounded-l-lg px-3 py-3 text-sm">
                        {data.filters.department ? "Total (filtered)" : "Organization Total"}
                      </td>
                      <td className="px-3 py-3 text-right text-sm">{cell(total.inInterviewProcess)}</td>
                      <td className="px-3 py-3 text-right text-sm">{cell(total.selected)}</td>
                      <td className="rounded-r-lg px-3 py-3 text-right text-sm">{cell(total.joined)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {definitions?.dateFilter && (
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Date filter: {definitions.dateFilter} Aggregate numbers cover all
                  departments. Individual candidate records are available only for your own
                  department.
                </p>
              )}
            </section>

            {renderFooter && renderFooter(toParams(applied))}
          </>
        )}
      </DataState>
    </div>
  );
}
