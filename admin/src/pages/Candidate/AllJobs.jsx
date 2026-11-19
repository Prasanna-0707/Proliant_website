import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import CandidateLayout, {
  PageState,
} from "../../components/Candidate/CandidateLayout.jsx";
import { formatDate } from "../../services/format.js";
import useApi from "../../services/useApi.js";
import {
  applyForJob,
  getJob,
  getProfile,
  listJobs,
  listMyApplications,
} from "../../services/candidatePortal.js";
import { notifyUpdated } from "../../components/Candidate/notificationUi.js";

const PAGE_SIZE = 10;

// API job -> row shown in the UI
const toRow = (job) => ({
  id: job._id,
  title: job.title,
  department: job.department,
  description: job.jobDescription,
  requirements: job.requirements,
  location: job.location,
  experience: job.experience,
  date: formatDate(job.createdAt),
  type: job.employmentType,
  arrangement: job.workArrangement,
  skills: job.requiredSkills || [],
});

const typeBadge = (type) =>
  type === "Contract"
    ? "bg-amber-50 text-amber-700"
    : type === "Internship"
      ? "bg-blue-50 text-blue-700"
      : "bg-emerald-50 text-emerald-700";

export default function CandidateAllJobs() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [jobType, setJobType] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyState, setApplyState] = useState({
    submitting: false,
    error: "",
    done: false,
  });

  // Wait for the candidate to stop typing before searching the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useApi(
    (signal) =>
      listJobs({ search: debouncedSearch, page, limit: PAGE_SIZE }, signal),
    [debouncedSearch, page]
  );

  // Jobs the candidate already applied for, so they are not offered twice.
  const applications = useApi((signal) => listMyApplications(signal), []);
  const appliedJobIds = useMemo(
    () =>
      new Set(
        (applications.data?.applications || []).map(
          (application) => application.job?._id
        )
      ),
    [applications.data]
  );

  // Profile gives us the saved resume status for the apply dialog.
  const profile = useApi((signal) => getProfile(signal), []);

  const jobs = useMemo(() => (data?.jobs || []).map(toRow), [data]);
  const pagination = data?.pagination;

  const visibleJobs = jobs.filter(
    (job) => jobType === "All" || job.type === jobType
  );

  const latest = jobs.slice(0, 3);

  // Shows the job from the list at once, then refreshes it with the full
  // record from GET /candidate/jobs/:id.
  const openDetails = async (job) => {
    setSelectedJob(job);

    try {
      const detail = await getJob(job.id);

      setSelectedJob((current) =>
        current && current.id === job.id ? toRow(detail.job) : current
      );
    } catch {
      /* the list data is enough to show the job */
    }
  };

  const openApply = (job) => {
    setApplyState({ submitting: false, error: "", done: false });
    setApplyJob(job);
    setSelectedJob(null);
  };

  const submitApplication = async () => {
    setApplyState({ submitting: true, error: "", done: false });

    try {
      await applyForJob({ jobId: applyJob.id });

      setApplyState({ submitting: false, error: "", done: true });
      applications.reload();
      notifyUpdated();
    } catch (requestError) {
      setApplyState({
        submitting: false,
        error: requestError.message,
        done: false,
      });
    }
  };

  const resume = profile.data?.candidate?.resume;
  const hasResume = Boolean(resume?.fileUrl);

  return (
    <CandidateLayout
      active="All Jobs"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search jobs by title, department or location..."
    >
      {({ darkMode }) => {
        const card = darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white";

        return (
          <>
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
                All Jobs
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                Find Your Next Opportunity
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Browse all open positions at Proliant and apply in one click.
              </p>
            </section>

            {/* LATEST OPENINGS */}
            {!debouncedSearch && latest.length > 0 && page === 1 && (
              <section
                className={`mb-5 rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <Sparkles size={24} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold sm:text-lg">
                      Latest Openings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      The most recently posted roles.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {latest.map((job) => (
                    <article
                      key={job.id}
                      className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <BriefcaseBusiness size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold leading-5">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {job.department}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-slate-500">
                        <p className="flex items-center gap-2">
                          <MapPin size={14} />
                          {job.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <BriefcaseBusiness size={14} />
                          {job.experience}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openDetails(job)}
                        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#f2383d] hover:underline"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ALL JOB POSTS */}
            <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <BriefcaseBusiness size={24} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold sm:text-lg">
                      All Job Posts
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Explore all open positions at Proliant.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                    darkMode
                      ? "border-slate-700 hover:bg-slate-800"
                      : "border-slate-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={17} />
                  Filter
                </button>
              </div>

              {showFilters && (
                <div
                  className={`mb-5 flex flex-wrap items-center gap-3 rounded-lg p-4 ${
                    darkMode ? "bg-slate-800" : "bg-slate-50"
                  }`}
                >
                  <label htmlFor="job-type" className="text-sm font-semibold">
                    Job Type
                  </label>

                  <select
                    id="job-type"
                    value={jobType}
                    onChange={(event) => setJobType(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#f2383d]"
                  >
                    <option value="All">All job types</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setJobType("All");
                      setSearch("");
                    }}
                    className="text-sm font-medium text-[#f2383d] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              <PageState loading={loading} error={error} onRetry={reload}>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-600">
                        <th className="rounded-l-lg px-3 py-3">Job Title</th>
                        <th className="px-3 py-3">Location</th>
                        <th className="px-3 py-3">Experience</th>
                        <th className="px-3 py-3">Posted Date</th>
                        <th className="px-3 py-3">Job Type</th>
                        <th className="px-3 py-3">Skills</th>
                        <th className="rounded-r-lg px-3 py-3 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleJobs.map((job, index) => (
                        <tr
                          key={job.id}
                          className={`border-b last:border-b-0 ${
                            darkMode ? "border-slate-800" : "border-slate-100"
                          }`}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  index % 2 === 0
                                    ? "bg-red-50 text-[#f2383d]"
                                    : "bg-blue-50 text-blue-500"
                                }`}
                              >
                                <BriefcaseBusiness size={20} />
                              </span>
                              <span>
                                <span className="block whitespace-nowrap text-sm font-bold">
                                  {job.title}
                                </span>
                                <span className="block text-xs text-slate-500">
                                  {job.department}
                                </span>
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} />
                              {job.location}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                            {job.experience}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={14} />
                              {job.date}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${typeBadge(
                                job.type
                              )}`}
                            >
                              {job.type}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="flex max-w-[250px] flex-wrap gap-1.5">
                              {job.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-700"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => openDetails(job)}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d] transition hover:bg-[#f2383d] hover:text-white"
                            >
                              View Details
                              <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="space-y-3 lg:hidden">
                  {visibleJobs.map((job) => (
                    <article
                      key={job.id}
                      className={`rounded-xl border p-4 ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#f2383d]">
                          <BriefcaseBusiness size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{job.title}</h3>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={14} />
                            {job.location}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {job.experience} · {job.date}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${typeBadge(
                            job.type
                          )}`}
                        >
                          {job.type}
                        </span>

                        <button
                          type="button"
                          onClick={() => openDetails(job)}
                          className="flex items-center gap-2 rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d]"
                        >
                          View Details
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {visibleJobs.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No jobs found. Try a different search or clear your
                    filters.
                  </p>
                )}

                {pagination && pagination.totalPages > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      Page {pagination.currentPage} of {pagination.totalPages}{" "}
                      · {pagination.totalJobs} job post
                      {pagination.totalJobs === 1 ? "" : "s"}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((value) => value - 1)}
                        aria-label="Previous page"
                        className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((value) => value + 1)}
                        aria-label="Next page"
                        className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </PageState>
            </section>

            {/* JOB DETAILS MODAL */}
            {selectedJob && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                onClick={() => setSelectedJob(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="job-details-title"
                  className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8 ${
                    darkMode
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    aria-label="Close job details"
                    className="absolute right-5 top-5 rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>

                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f2383d]">
                    Job Details
                  </p>

                  <h2
                    id="job-details-title"
                    className="pr-10 text-2xl font-bold sm:text-3xl"
                  >
                    {selectedJob.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness size={16} />
                      {selectedJob.experience}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 ${typeBadge(
                        selectedJob.type
                      )}`}
                    >
                      {selectedJob.type}
                    </span>
                  </div>

                  <hr className="my-6 border-slate-200" />

                  <h3 className="mb-3 text-lg font-bold">Job Description</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    {selectedJob.description}
                  </p>

                  <h3 className="mb-3 mt-6 text-lg font-bold">Requirements</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    {selectedJob.requirements}
                  </p>

                  {selectedJob.skills.length > 0 && (
                    <>
                      <h3 className="mb-3 mt-6 text-lg font-bold">
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Close
                    </button>

                    {appliedJobIds.has(selectedJob.id) ? (
                      <span className="flex items-center justify-center rounded-lg bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                        Already applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openApply(selectedJob)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#f2383d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        Apply for this Job
                        <ArrowRight size={17} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPLY DIALOG */}
            {applyJob && (
              <div
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
                onClick={() => setApplyJob(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="apply-title"
                  className="relative w-full max-w-lg rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setApplyJob(null)}
                    aria-label="Close"
                    className="absolute right-5 top-5 rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100"
                  >
                    <X size={19} />
                  </button>

                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f2383d]">
                    Job Application
                  </p>

                  <h2
                    id="apply-title"
                    className="pr-10 text-2xl font-bold tracking-tight"
                  >
                    Apply for this role
                  </h2>

                  <p className="mt-2 text-gray-500">{applyJob.title}</p>

                  {applyState.done ? (
                    <div className="mt-6">
                      <p
                        role="status"
                        className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      >
                        Application submitted successfully. You can follow its
                        progress under My Applications.
                      </p>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setApplyJob(null)}
                          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/candidate-applications")}
                          className="rounded-xl bg-[#f2383d] px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          My Applications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 rounded-xl border border-gray-200 p-4 text-sm">
                        <p className="font-semibold">Your resume</p>

                        {profile.loading ? (
                          <p className="mt-1 text-gray-500">Checking...</p>
                        ) : hasResume ? (
                          <p className="mt-1 text-gray-600">
                            {resume.fileName} ({resume.fileType?.toUpperCase()})
                            from your profile will be submitted.
                          </p>
                        ) : (
                          <p className="mt-1 text-amber-700">
                            You have not added a resume yet. Add one on your
                            profile before applying.
                          </p>
                        )}
                      </div>

                      {applyState.error && (
                        <p
                          role="alert"
                          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          {applyState.error}
                        </p>
                      )}

                      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setApplyJob(null)}
                          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>

                        {!hasResume && !profile.loading ? (
                          <button
                            type="button"
                            onClick={() => navigate("/candidate-profile")}
                            className="rounded-xl bg-[#f2383d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                          >
                            Go to Profile
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={submitApplication}
                            disabled={applyState.submitting || profile.loading}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#f2383d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {applyState.submitting
                              ? "Submitting..."
                              : "Submit Application"}
                            <ArrowRight size={17} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }}
    </CandidateLayout>
  );
}
