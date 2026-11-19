import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  CircleX,
  Clock3,
  FileText,
  GitBranch,
} from "lucide-react";

import CandidateLayout, {
  PageState,
} from "../../components/Candidate/CandidateLayout.jsx";
import { formatDate } from "../../services/format.js";
import useApi from "../../services/useApi.js";
import {
  getMyApplication,
  listMyApplications,
} from "../../services/candidatePortal.js";

const FILTERS = [
  "All",
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Rejected",
  "Withdrawn",
];

const statusBadge = {
  Applied: "bg-slate-100 text-slate-700",
  Screening: "bg-blue-50 text-blue-700",
  Interview: "bg-amber-50 text-amber-700",
  Selected: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Withdrawn: "bg-slate-100 text-slate-500",
};

function StageIcon({ status }) {
  if (status === "Completed") {
    return <CheckCircle2 size={20} className="text-emerald-500" />;
  }

  if (status === "Failed") {
    return <CircleX size={20} className="text-red-500" />;
  }

  if (status === "In Progress") {
    return <Clock3 size={20} className="text-[#f2383d]" />;
  }

  return <Circle size={20} className="text-slate-300" />;
}

export default function MyApplications() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [details, setDetails] = useState({});

  const { data, loading, error, reload } = useApi(
    (signal) => listMyApplications(signal),
    []
  );

  const applications = useMemo(() => data?.applications || [], [data]);

  // Opening an application loads its latest record from
  // GET /candidate/applications/:id.
  const toggleDetails = async (application, open) => {
    setExpanded(open ? null : application._id);

    if (open) return;

    try {
      const result = await getMyApplication(application.applicationId);

      if (result.data) {
        setDetails((previous) => ({
          ...previous,
          [application._id]: result.data,
        }));
      }
    } catch {
      /* the list data is enough to show the progress */
    }
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesFilter = filter === "All" || application.status === filter;

      const matchesSearch =
        !query ||
        [
          application.job?.title,
          application.job?.department,
          application.job?.location,
          application.applicationId,
        ].some((value) => String(value || "").toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [applications, filter, search]);

  return (
    <CandidateLayout
      active="My Applications"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search your applications..."
    >
      {({ darkMode }) => {
        const card = darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white";

        return (
          <>
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
                My Applications
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                My Applications
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Follow every application and its hiring stages.
              </p>
            </section>

            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "border-[#f2383d] bg-[#f2383d] text-white"
                      : darkMode
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-red-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <PageState loading={loading} error={error} onRetry={reload}>
              {visible.length === 0 ? (
                <div className={`rounded-xl border p-10 text-center shadow-sm ${card}`}>
                  <p className="text-sm text-slate-500">
                    {applications.length === 0
                      ? "You have not applied for any job yet."
                      : "No applications match your search or filter."}
                  </p>

                  {applications.length === 0 && (
                    <button
                      type="button"
                      onClick={() => navigate("/candidate-all-jobs")}
                      className="mt-4 rounded-lg bg-[#f2383d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                    >
                      Browse jobs
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {visible.map((application) => {
                    const open = expanded === application._id;
                    const stages =
                      details[application._id]?.hiringStages ||
                      application.hiringStages ||
                      [];

                    return (
                      <article
                        key={application._id}
                        className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                              <BriefcaseBusiness size={24} />
                            </div>

                            <div>
                              <h2 className="text-base font-bold">
                                {application.job?.title}
                              </h2>
                              <p className="text-xs text-slate-500">
                                {application.job?.department} ·{" "}
                                {application.applicationId}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={14} />
                                  {application.job?.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <BriefcaseBusiness size={14} />
                                  {application.job?.experience}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays size={14} />
                                  Applied {formatDate(application.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                statusBadge[application.status] ||
                                "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {application.status}
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleDetails(application, open)}
                              aria-expanded={open}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900"
                            >
                              <GitBranch size={14} />
                              {open ? "Hide progress" : "View progress"}
                              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {open && (
                          <div className="mt-5 border-t border-slate-100 pt-5">
                            <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <FileText size={14} />
                                Resume: {application.resume?.fileName || "—"}
                              </span>
                              <span>
                                Screening: {application.screening?.result || "Pending"}
                              </span>
                              {application.reapplyEligibleAt && (
                                <span>
                                  Can reapply from{" "}
                                  {formatDate(application.reapplyEligibleAt)}
                                </span>
                              )}
                            </div>

                            <ol className="space-y-4">
                              {stages.map((stage) => (
                                <li
                                  key={stage._id || stage.stageKey}
                                  className="flex items-start gap-3"
                                >
                                  <StageIcon status={stage.status} />
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {stage.stageName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {stage.status} ·{" "}
                                      {formatDate(
                                        stage.completedAt ||
                                          stage.interview?.scheduledAt ||
                                          stage.scheduledAt
                                      )}
                                    </p>
                                    {stage.feedback && (
                                      <p className="mt-1 text-xs text-slate-600">
                                        {stage.feedback}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}

                              {stages.length === 0 && (
                                <li className="text-sm text-slate-500">
                                  No hiring stages have started yet.
                                </li>
                              )}
                            </ol>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </PageState>
          </>
        );
      }}
    </CandidateLayout>
  );
}
