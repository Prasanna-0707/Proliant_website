import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ClipboardList,
  MapPin,
  CalendarDays,
  Clock3,
  Check,
  CircleCheck,
  CircleX,
  GitBranch,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import CandidateLayout, {
  PageState,
} from "../../components/Candidate/CandidateLayout.jsx";
import { formatDate } from "../../services/format.js";
import useApi from "../../services/useApi.js";
import {
  getCandidateDashboard,
  getCandidateUser,
  listJobs,
} from "../../services/candidatePortal.js";

const stageStyle = (status) => {
  switch (status) {
    case "Completed":
      return { dot: "bg-emerald-500 text-white", text: "text-emerald-600" };
    case "In Progress":
      return { dot: "bg-[#f2383d] text-white", text: "text-[#f2383d]" };
    case "Failed":
      return { dot: "bg-red-600 text-white", text: "text-red-600" };
    default:
      return { dot: "bg-slate-200 text-slate-500", text: "text-slate-400" };
  }
};

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const dashboard = useApi((signal) => getCandidateDashboard(signal), []);
  const jobs = useApi((signal) => listJobs({ limit: 3 }, signal), []);

  const summary = dashboard.data?.data?.applicationSummary;
  const current = dashboard.data?.data?.currentApplication;
  const name =
    dashboard.data?.data?.candidate?.name ||
    getCandidateUser()?.name ||
    "Candidate";

  const stats = [
    { label: "Total Applications", value: summary?.totalApplications ?? 0, icon: ClipboardList, tone: "bg-red-50 text-[#f2383d]" },
    { label: "In Screening", value: summary?.screening ?? 0, icon: Clock3, tone: "bg-blue-50 text-blue-500" },
    { label: "Interview", value: summary?.interview ?? 0, icon: GitBranch, tone: "bg-amber-50 text-amber-600" },
    { label: "Selected", value: summary?.selected ?? 0, icon: CircleCheck, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Rejected", value: summary?.rejected ?? 0, icon: CircleX, tone: "bg-slate-100 text-slate-600" },
  ];

  return (
    <CandidateLayout active="Dashboard">
      {({ darkMode }) => {
        const card = darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white";

        return (
          <>
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Dashboard
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                Welcome back, {name}
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Track your applications and discover new opportunities.
              </p>
            </section>

            <PageState
              loading={dashboard.loading}
              error={dashboard.error}
              onRetry={dashboard.reload}
            >
              <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {stats.map(({ label, value, icon: Icon, tone }) => (
                  <article
                    key={label}
                    className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${card}`}
                  >
                    <div
                      className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl ${tone}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  </article>
                ))}
              </section>

              {/* CURRENT APPLICATION */}
              <section className={`mb-5 rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                      <GitBranch size={24} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold sm:text-lg">
                        Current Application
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Your most recent application and its hiring stages.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/candidate-applications")}
                    className="flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
                  >
                    All applications
                    <ArrowRight size={17} />
                  </button>
                </div>

                {current ? (
                  <>
                    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <h3 className="text-lg font-bold">
                        {current.job?.title}
                      </h3>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} />
                        {current.job?.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <CalendarDays size={15} />
                        Applied {formatDate(current.appliedAt)}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {current.status}
                      </span>
                    </div>

                    <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      {(current.hiringStages || []).map((stage) => {
                        const style = stageStyle(stage.status);

                        return (
                          <li key={stage._id || stage.stageKey} className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.dot}`}
                            >
                              {stage.status === "Completed" ? (
                                <Check size={15} />
                              ) : (
                                stage.stageOrder
                              )}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold">
                                {stage.stageName}
                              </span>
                              <span className={`block text-xs font-medium ${style.text}`}>
                                {stage.status}
                              </span>
                              <span className="block text-xs text-slate-400">
                                {formatDate(stage.completedAt || stage.scheduledAt)}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">
                      You have not applied for any job yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/candidate-all-jobs")}
                      className="mt-4 rounded-lg bg-[#f2383d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                    >
                      Browse jobs
                    </button>
                  </div>
                )}
              </section>
            </PageState>

            {/* LATEST JOBS */}
            <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold sm:text-lg">
                      Latest Openings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Newly posted roles at Proliant.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/candidate-all-jobs")}
                  className="flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
                >
                  View all jobs
                  <ArrowRight size={17} />
                </button>
              </div>

              <PageState
                loading={jobs.loading}
                error={jobs.error}
                onRetry={jobs.reload}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {(jobs.data?.jobs || []).map((job) => (
                    <article
                      key={job._id}
                      className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <BriefcaseBusiness size={24} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold leading-5">{job.title}</h3>
                          <p className="text-xs text-slate-500">{job.department}</p>
                        </div>
                      </div>
                      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={14} />
                        {job.location}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <BriefcaseBusiness size={14} />
                        {job.experience}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/candidate-all-jobs")}
                        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#f2383d] hover:underline"
                      >
                        View & apply
                        <ArrowRight size={14} />
                      </button>
                    </article>
                  ))}

                  {(jobs.data?.jobs || []).length === 0 && (
                    <p className="col-span-full py-6 text-center text-sm text-slate-500">
                      There are no open positions right now.
                    </p>
                  )}
                </div>
              </PageState>
            </section>
          </>
        );
      }}
    </CandidateLayout>
  );
}
