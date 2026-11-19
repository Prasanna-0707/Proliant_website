import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  LogOut,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { clearSession, getStoredUser } from "../../services/http.js";
import RecruitmentStatistics from "../../components/DeptAdmin/RecruitmentStatistics.jsx";
import { downloadApplicationResume } from "../../services/registrations.js";
import { formatDate, formatDateTime } from "../../services/format.js";
import {
  getDepartmentCandidate,
  getDepartmentCandidateHistory,
  getDepartmentCandidateInterviews,
  getRecruitmentReport,
  listDepartmentCandidates,
} from "../../services/departmentAdmin.js";

const navigation = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "applicants", label: "Applicants", icon: Users },
  { key: "shortlisted", label: "Shortlisted", icon: UserCheck },
  { key: "interviews", label: "Interview Management", icon: CalendarDays },
  { key: "jobs", label: "Department Jobs", icon: BriefcaseBusiness },
  { key: "analytics", label: "Recruitment Analytics", icon: ChartNoAxesColumn },
];

const STATUS_LABELS = {
  New: "New",
  ASSIGNED_TO_L0: "Assigned to L0",
  L0_SHORTLISTED: "Shortlisted (L0)",
  L0_REJECTED: "Rejected (L0)",
  L0_ON_HOLD: "On Hold (L0)",
  HR_REVIEW_REQUIRED: "HR Review",
  Shortlisted: "Shortlisted",
  Interview: "Interview",
  Selected: "Selected",
  Rejected: "Rejected",
  "On Hold": "On Hold",
};

const statusLabel = (value) => STATUS_LABELS[value] || value;

const statusBadge = (value) =>
  /REJECT/i.test(value)
    ? "bg-red-50 text-red-700"
    : /SHORTLIST|Selected/i.test(value)
      ? "bg-emerald-50 text-emerald-700"
      : /HOLD|REVIEW/i.test(value)
        ? "bg-amber-50 text-amber-700"
        : "bg-blue-50 text-blue-700";

// =====================================================
// Candidate detail drawer
//   GET /api/department-admin/candidates/:id
//   GET /api/department-admin/candidates/:id/history
//   GET /api/department-admin/candidates/:id/interviews
// =====================================================
function CandidateDrawer({ candidateId, onClose }) {
  const detail = useApi(
    async (signal) => {
      const [profile, history, interviews] = await Promise.all([
        getDepartmentCandidate(candidateId, signal),
        getDepartmentCandidateHistory(candidateId, signal),
        getDepartmentCandidateInterviews(candidateId, signal),
      ]);

      return { profile, history, interviews };
    },
    [candidateId]
  );

  const candidate = detail.data?.profile?.candidate;
  const timeline = detail.data?.history?.data?.timeline || [];
  const stages = detail.data?.interviews?.data?.stages || [];
  const screeningEvents = timeline.filter((event) => event.category === "SCREENING");
  const [resumeError, setResumeError] = useState("");

  // GET /api/applications/:id/resume (allowed for the own department only)
  const openResume = async () => {
    setResumeError("");

    try {
      const blob = await downloadApplicationResume(candidateId);
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (requestError) {
      setResumeError(requestError.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Candidate details"
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-xl font-bold text-slate-900">Candidate Details</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <DataState loading={detail.loading} error={detail.error} onRetry={detail.reload}>
          {candidate && (
            <div className="space-y-6 text-slate-900">
              <section>
                <p className="text-lg font-semibold">{candidate.name}</p>
                <p className="text-sm text-slate-500">{candidate.position} · {candidate.department}</p>

                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Email", candidate.email],
                    ["Phone", candidate.phone],
                    ["Experience", candidate.isFresher ? "Fresher" : `${candidate.yearsOfExperience ?? 0} year(s)`],
                    ["Qualification", candidate.highestQualification],
                    ["Notice period", candidate.noticePeriod],
                    ["Status", statusLabel(candidate.status)],
                    ["Current stage", candidate.currentStage],
                    ["Applied", formatDate(candidate.appliedAt)],
                    ["Applied job", candidate.job?.title || candidate.position],
                    [
                      "Final selection",
                      candidate.status === "Selected" || candidate.joiningStatus === "JOINED"
                        ? "Selected"
                        : candidate.status === "Rejected"
                          ? "Rejected"
                          : "Not decided",
                    ],
                    [
                      "Joining status",
                      candidate.joiningStatus === "JOINED"
                        ? `Joined on ${formatDate(candidate.joinedAt)}`
                        : "Not joined",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs uppercase text-slate-500">{label}</dt>
                      <dd className="mt-1">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={openResume}
                    disabled={!candidate.hasResume}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {candidate.hasResume ? "View resume" : "No resume on file"}
                  </button>
                  {resumeError && (
                    <p role="alert" className="mt-2 text-xs text-red-600">
                      {resumeError}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold">Screening (L0)</h3>
                {screeningEvents.length === 0 ? (
                  <p className="text-sm text-slate-500">No screening activity yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {screeningEvents.map((event) => (
                      <li key={event.eventId} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(event.occurredAt)}
                          {event.actor?.name ? ` · ${event.actor.name}` : ""}
                        </p>
                        {event.details?.decision && (
                          <p className="mt-1">Decision: {event.details.decision}</p>
                        )}
                        {(event.details?.feedback || event.details?.remarks) && (
                          <p className="mt-1 text-slate-600">
                            {event.details.feedback || event.details.remarks}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="mb-3 font-semibold">Interview Rounds</h3>
                {stages.length === 0 ? (
                  <p className="text-sm text-slate-500">No interview rounds are configured.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {stages.map((stage) => (
                      <li key={stage.stageCode} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium">{stage.stageName}</p>
                        <p className="text-xs text-slate-500">
                          {String(stage.status || "Not scheduled").replaceAll("_", " ")}
                        </p>

                        {(stage.interviews || []).map((interview) => (
                          <div key={interview._id} className="mt-3 border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-500">
                              Interviewer: <strong>{interview.interviewer?.name || "—"}</strong>
                              {interview.interviewer?.email ? ` (${interview.interviewer.email})` : ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              {interview.status}
                              {interview.schedule?.scheduledAt
                                ? ` · ${formatDateTime(interview.schedule.scheduledAt)}`
                                : ""}
                            </p>

                            {interview.evaluation ? (
                              <div className="mt-2 space-y-1 text-sm">
                                <p>
                                  Score: <strong>{interview.evaluation.overallRating ?? "—"}</strong> / 5 ·
                                  Decision: <strong>{interview.evaluation.recommendation || "—"}</strong>
                                  {interview.evaluation.status !== "Submitted"
                                    ? ` (${interview.evaluation.status})`
                                    : ""}
                                </p>
                                {interview.evaluation.feedback && (
                                  <p><span className="text-slate-500">Feedback:</span> {interview.evaluation.feedback}</p>
                                )}
                                {interview.evaluation.strengths && (
                                  <p><span className="text-slate-500">Strengths:</span> {interview.evaluation.strengths}</p>
                                )}
                                {interview.evaluation.concerns && (
                                  <p><span className="text-slate-500">Concerns:</span> {interview.evaluation.concerns}</p>
                                )}
                                {(interview.evaluation.criteria || []).length > 0 && (
                                  <ul className="mt-1 space-y-1 text-xs text-slate-600">
                                    {interview.evaluation.criteria.map((criterion) => (
                                      <li key={criterion.questionCode}>
                                        {criterion.questionText}: <strong>{criterion.rating ?? "—"}</strong>
                                        {criterion.comments ? ` — ${criterion.comments}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">No evaluation submitted yet.</p>
                            )}
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="mb-3 font-semibold">Recruitment History</h3>
                {timeline.length === 0 ? (
                  <p className="text-sm text-slate-500">No history yet.</p>
                ) : (
                  <ol className="space-y-3 border-l border-slate-200 pl-4 text-sm">
                    {timeline.map((event) => (
                      <li key={event.eventId}>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          {event.category} · {formatDateTime(event.occurredAt)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          )}
        </DataState>
      </aside>
    </div>
  );
}

// =====================================================
// Applicants / Shortlisted / Interview management
// =====================================================
function CandidateList({ fixedStatus, mode }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useApi(
    (signal) =>
      listDepartmentCandidates(
        { page, limit, search: debounced, status: fixedStatus },
        signal
      ),
    [page, limit, debounced, fixedStatus]
  );

  const candidates = data?.candidates || [];
  const pagination = data?.pagination;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-[42px] min-w-[240px] flex-1 items-center gap-3 rounded-full bg-[#f3f5f9] px-4">
          <Search size={18} className="text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or position..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
          aria-label="Rows per page"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        >
          {[10, 20, 50].map((value) => (
            <option key={value} value={value}>{value} per page</option>
          ))}
        </select>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {candidates.length === 0 ? (
          <EmptyState text="No candidates found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="rounded-l-lg px-3 py-3">Candidate</th>
                  <th className="px-3 py-3">Applied Role</th>
                  <th className="px-3 py-3">Experience</th>
                  <th className="px-3 py-3">Applied</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="rounded-r-lg px-3 py-3 text-right">{mode === "interviews" ? "Interviews" : "Details"}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3">
                      <p className="text-sm font-bold text-slate-900">{candidate.name}</p>
                      <p className="text-xs text-slate-500">{candidate.email}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{candidate.jobDetails?.title || candidate.position}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {candidate.isFresher ? "Fresher" : `${candidate.yearsOfExperience ?? 0} year(s)`}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{formatDate(candidate.appliedAt)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge(candidate.status)}`}>
                        {statusLabel(candidate.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(candidate._id)}
                        className="rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d] transition hover:bg-[#f2383d] hover:text-white"
                      >
                        {mode === "interviews" ? "View rounds" : "View details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCandidates} candidate(s)
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((value) => value - 1)} aria-label="Previous page" className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} aria-label="Next page" className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </DataState>

      {selected && <CandidateDrawer candidateId={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

const Bar = ({ label, value, max, color = "bg-[#f2383d]" }) => (
  <div className="flex items-center gap-3 text-xs">
    <span className="w-40 shrink-0 truncate text-slate-600">{label}</span>
    <div className="h-2 flex-1 rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
    <span className="w-8 text-right text-slate-600">{value}</span>
  </div>
);

const StatCard = ({ label, value, icon: Icon, tone }) => (
  <article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </article>
);

export default function DeptAdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");

  const user = getStoredUser("staff");
  const department = user?.department || "Department";

  // GET /api/department-admin/reports/recruitment (analytics and jobs tabs)
  const report = useApi((signal) => getRecruitmentReport(undefined, signal), []);

  const summary = report.data?.data?.summary;
  const departmentWise = report.data?.data?.departmentWise || [];
  const jobWise = (report.data?.data?.jobWise || []).filter(
    (job) => !job.department || job.department === user?.department
  );

  const signOut = () => {
    clearSession("staff");
    navigate(user?.adminAccessLevel === "DEPARTMENT" ? "/department-admin/login" : "/login", { replace: true });
  };

  const titles = {
    overview: ["Recruitment Overview", `Organization-wide statistics. You can open candidate records for ${department} only.`],
    applicants: ["Applicants", "Everyone who applied to your department."],
    shortlisted: ["Shortlisted Candidates", "Candidates shortlisted at L0 screening."],
    interviews: ["Interview Management", "Interview rounds and evaluation progress per candidate."],
    jobs: ["Department Jobs", "Your department's job postings and their applications (read-only; jobs are managed by HR)."],
    analytics: ["Recruitment Analytics", "Applications by status and department."],
  }[section];

  const maxDept = Math.max(1, ...departmentWise.map((item) => item.totalApplications));

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#101c30]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-gray-200 bg-white lg:static">
          <div className="flex h-[70px] shrink-0 items-center border-b border-gray-100 px-6">
            <div>
              <div className="mb-1 h-[6px] w-[44px] bg-[#f2383d]" />
              <span className="text-[23px] font-extrabold tracking-tight text-black">Proliant Data</span>
            </div>
          </div>

          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Department Admin</p>
            <nav className="space-y-1.5">
              {navigation.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors ${
                    section === key ? "bg-[#f2383d] text-white shadow-sm" : "text-slate-700 hover:bg-red-50 hover:text-[#f2383d]"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-gray-100 p-3">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-[#f2383d]">
              <LogOut size={19} /> Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-[70px] items-center justify-end gap-4 border-b border-gray-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">
                {(user?.name || "D").charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[160px] truncate text-sm font-semibold">{user?.name || "Department Admin"}</span>
                <span className="block text-xs text-slate-500">{department}</span>
              </span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-6 sm:px-8 sm:py-7">
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">{navigation.find((item) => item.key === section)?.label}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">{titles[0]}</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">{titles[1]}</p>
            </section>

            {section === "overview" && (
              <RecruitmentStatistics ownDepartment={user?.department} />
            )}

            {section === "applicants" && <CandidateList />}
            {section === "shortlisted" && <CandidateList fixedStatus="L0_SHORTLISTED" />}
            {section === "interviews" && <CandidateList mode="interviews" />}

            {section === "jobs" && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <DataState loading={report.loading} error={report.error} onRetry={report.reload}>
                  {jobWise.length === 0 ? (
                    <EmptyState text="No job postings found for your department." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-semibold text-slate-600">
                            <th className="rounded-l-lg px-3 py-3">Job Title</th>
                            <th className="px-3 py-3">Type</th>
                            <th className="px-3 py-3">Location</th>
                            <th className="px-3 py-3">Vacancies</th>
                            <th className="px-3 py-3">Applications</th>
                            <th className="rounded-r-lg px-3 py-3">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobWise.map((job, index) => (
                            <tr key={`${job.title}-${index}`} className="border-b border-slate-100 last:border-b-0">
                              <td className="px-3 py-3 text-sm font-bold">{job.title}</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{job.employmentType}</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{job.location}</td>
                              <td className="px-3 py-3 text-sm">{job.vacancies}</td>
                              <td className="px-3 py-3 text-sm font-semibold">{job.totalApplications}</td>
                              <td className="px-3 py-3 text-sm">{job.joinedCandidates}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </DataState>
              </section>
            )}

            {section === "analytics" && (
              <DataState loading={report.loading} error={report.error} onRetry={report.reload}>
                {summary && (
                  <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard label="Total applications" value={summary.totalApplications} icon={Users} tone="bg-blue-50 text-blue-500" />
                    <StatCard label="Joined" value={summary.joinedCandidates} icon={Award} tone="bg-emerald-50 text-emerald-600" />
                    <StatCard label="Joining rate" value={`${summary.joiningRatePercentage}%`} icon={ChartNoAxesColumn} tone="bg-amber-50 text-amber-600" />
                  </section>
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-bold sm:text-lg">Applications by department</h2>
                  <div className="space-y-3">
                    {departmentWise.map((item) => (
                      <Bar key={item.department} label={item.department} value={item.totalApplications} max={maxDept} color="bg-blue-500" />
                    ))}
                  </div>
                </section>
              </DataState>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
