import Candidate from "../../candidate/models/Candidate.js";
import Job from "../../hr/models/HRJob.js";
import ApplicationDecision from "../../hiring-manager/models/ApplicationDecision.js";

// =====================================================
// RECRUITMENT STATISTICS (aggregate only)
//
// Used by the Department Administrator dashboard and by the HR email
// report. It returns counts only, never candidate-level data.
//
// Metric definitions (Administrator Access & Recruitment Reporting,
// section 4):
//
//   In Interview Process  candidates currently progressing through the
//                         interview rounds: status "Interview" (an
//                         interview is scheduled) or "Shortlisted"
//                         (advanced and waiting for the next round).
//                         Not joined, not selected, not rejected.
//   Selected              candidates who cleared every interview round
//                         (status "Selected"). Joined candidates are
//                         selected candidates, so they are included.
//                         An offer alone does not make a candidate
//                         Selected.
//   Recruited / Joined    candidates with a confirmed joining date
//                         (Candidate.joinedAt). Selected-only and
//                         offer-only candidates are never counted.
//
// The department of a candidate is the department of the JOB applied for.
//
// Date filter: each metric is dated by its own event
//   In Interview Process -> application date (Candidate.createdAt)
//   Selected             -> selection date (latest "Select" decision,
//                           falling back to the last update)
//   Joined               -> joining date (Candidate.joinedAt)
// =====================================================

export const IN_INTERVIEW_STATUSES = ["Interview", "Shortlisted"];

export const STATUS_FILTERS = ["ALL", "IN_INTERVIEW", "SELECTED", "JOINED"];

const UNASSIGNED = "Unassigned department";

export class StatisticsFilterError extends Error {
  constructor(message) {
    super(message);
    this.name = "StatisticsFilterError";
  }
}

const isDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const asInt = (value, name, min, max) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min || number > max) {
    throw new StatisticsFilterError(`${name} must be a whole number from ${min} to ${max}.`);
  }

  return number;
};

// Turns the query parameters into { from, toExclusive, label }.
// Precedence: explicit from/to, then year (+ month or quarter).
export const parseStatisticsFilters = (query = {}) => {
  const text = (value) =>
    typeof value === "string"
      ? value.trim()
      : typeof value === "number"
        ? String(value)
        : "";

  const status = (text(query.status) || "ALL").toUpperCase();

  if (!STATUS_FILTERS.includes(status)) {
    throw new StatisticsFilterError(`status must be one of: ${STATUS_FILTERS.join(", ")}.`);
  }

  const department = text(query.department);
  const from = text(query.from);
  const to = text(query.to);
  const year = text(query.year);
  const month = text(query.month);
  const quarter = text(query.quarter);

  let range = null;

  if (from || to) {
    if (from && !isDateOnly(from)) throw new StatisticsFilterError("from must be YYYY-MM-DD.");
    if (to && !isDateOnly(to)) throw new StatisticsFilterError("to must be YYYY-MM-DD.");
    if (from && to && from > to) throw new StatisticsFilterError("from cannot be after to.");

    range = {
      type: "range",
      from: from ? new Date(`${from}T00:00:00.000Z`) : null,
      toExclusive: to ? new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86400000) : null,
      label: `${from || "…"} to ${to || "…"}`,
    };
  } else if (year || month || quarter) {
    if (!year) throw new StatisticsFilterError("year is required with month or quarter.");
    if (month && quarter) throw new StatisticsFilterError("Use either month or quarter, not both.");

    const y = asInt(year, "year", 2000, 2100);

    if (month) {
      const m = asInt(month, "month", 1, 12);

      range = {
        type: "month",
        from: new Date(Date.UTC(y, m - 1, 1)),
        toExclusive: new Date(Date.UTC(y, m, 1)),
        label: `${y}-${String(m).padStart(2, "0")}`,
      };
    } else if (quarter) {
      const q = asInt(quarter, "quarter", 1, 4);

      range = {
        type: "quarter",
        from: new Date(Date.UTC(y, (q - 1) * 3, 1)),
        toExclusive: new Date(Date.UTC(y, q * 3, 1)),
        label: `${y} Q${q}`,
      };
    } else {
      range = {
        type: "year",
        from: new Date(Date.UTC(y, 0, 1)),
        toExclusive: new Date(Date.UTC(y + 1, 0, 1)),
        label: String(y),
      };
    }
  }

  return {
    department,
    status,
    range,
  };
};

const inRange = (date, range) => {
  if (!range) return true;
  if (!date) return false;

  const time = new Date(date).getTime();

  if (range.from && time < range.from.getTime()) return false;
  if (range.toExclusive && time >= range.toExclusive.getTime()) return false;

  return true;
};

const norm = (value) => String(value || "").trim().toLowerCase();

const emptyRow = (department) => ({
  department,
  inInterviewProcess: 0,
  selected: 0,
  joined: 0,
});

// Returns aggregate counts for every department plus the organization
// total. Status filter: metrics that are not selected are returned as null.
export const getRecruitmentStatistics = async (filters) => {
  const { department, status, range } = filters;

  const [jobs, candidates, selectionDecisions] = await Promise.all([
    Job.find().select("department").lean(),
    Candidate.find()
      .select("status joinedAt createdAt updatedAt job")
      .lean(),
    ApplicationDecision.aggregate([
      { $match: { decision: "Select" } },
      { $group: { _id: "$application", selectedAt: { $max: "$decidedAt" } } },
    ]),
  ]);

  const jobDepartment = new Map(
    jobs.map((job) => [String(job._id), String(job.department || "").trim()])
  );

  const selectedAtByApplication = new Map(
    selectionDecisions.map((item) => [String(item._id), item.selectedAt])
  );

  // One row per department that has a job, so departments with no
  // activity still appear with zeros.
  const rows = new Map();

  for (const name of new Set(jobs.map((job) => String(job.department || "").trim()).filter(Boolean))) {
    rows.set(norm(name), emptyRow(name));
  }

  const rowFor = (name) => {
    const key = name ? norm(name) : "__unassigned__";

    if (!rows.has(key)) rows.set(key, emptyRow(name || UNASSIGNED));

    return rows.get(key);
  };

  for (const candidate of candidates) {
    const name = candidate.job ? jobDepartment.get(String(candidate.job)) || "" : "";

    if (department && norm(name) !== norm(department)) continue;

    const joined = candidate.joinedAt instanceof Date;
    const selected = candidate.status === "Selected" || joined;
    const inInterview =
      !joined && IN_INTERVIEW_STATUSES.includes(candidate.status);

    // Selection date: the recorded "Select" decision. A joined candidate
    // without a decision record is dated by the joining date; otherwise the
    // last update is the best available approximation.
    const selectedAt =
      selectedAtByApplication.get(String(candidate._id)) ||
      (joined ? candidate.joinedAt : candidate.updatedAt);

    const row = rowFor(name);

    if (inInterview && inRange(candidate.createdAt, range)) row.inInterviewProcess += 1;
    if (selected && inRange(selectedAt, range)) row.selected += 1;
    if (joined && inRange(candidate.joinedAt, range)) row.joined += 1;
  }

  // The selected department filter hides every other department's row.
  let departmentWise = [...rows.values()].filter(
    (row) => !department || norm(row.department) === norm(department)
  );

  // The unassigned row only appears when it holds data.
  departmentWise = departmentWise.filter(
    (row) =>
      row.department !== UNASSIGNED ||
      row.inInterviewProcess + row.selected + row.joined > 0
  );

  departmentWise.sort((a, b) => a.department.localeCompare(b.department));

  const total = departmentWise.reduce(
    (sum, row) => ({
      inInterviewProcess: sum.inInterviewProcess + row.inInterviewProcess,
      selected: sum.selected + row.selected,
      joined: sum.joined + row.joined,
    }),
    { inInterviewProcess: 0, selected: 0, joined: 0 }
  );

  // Recruitment status filter: keep only the chosen metric.
  const visible = {
    inInterviewProcess: status === "ALL" || status === "IN_INTERVIEW",
    selected: status === "ALL" || status === "SELECTED",
    joined: status === "ALL" || status === "JOINED",
  };

  const mask = (values) => ({
    inInterviewProcess: visible.inInterviewProcess ? values.inInterviewProcess : null,
    selected: visible.selected ? values.selected : null,
    joined: visible.joined ? values.joined : null,
  });

  return {
    filters: {
      department: department || null,
      status,
      dateRange: range
        ? {
            type: range.type,
            label: range.label,
            from: range.from,
            toExclusive: range.toExclusive,
          }
        : null,
    },
    metrics: mask(total),
    departmentWise: departmentWise.map((row) => ({
      department: row.department,
      ...mask(row),
    })),
    organizationTotal: mask(total),
    meta: {
      generatedAt: new Date(),
      definitions: {
        inInterviewProcess:
          "Candidates currently progressing through interview rounds (status Interview or Shortlisted), not selected or joined.",
        selected:
          "Candidates who cleared all required interview rounds. Includes candidates who have since joined.",
        joined:
          "Selected candidates who actually joined (confirmed joining date). Offers and selections alone are not counted.",
        dateFilter:
          "In interview: application date. Selected: selection date. Joined: joining date.",
      },
    },
  };
};
