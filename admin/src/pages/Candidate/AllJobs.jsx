
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  UserRound,
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  ChevronDown,
  ChevronRight,
  MapPin,
  CalendarDays,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Database,
  ChartNoAxesColumn,
  X,
} from "lucide-react";

const recommendedJobs = [
  {
    id: 1,
    title: "SAP Data Analyst",
    location: "Bangalore, India",
    experience: "2–4 years",
    match: 92,
    skills: ["SAP", "Data Analysis", "Excel"],
    icon: BriefcaseBusiness,
  },
  {
    id: 2,
    title: "SAP S/4HANA Consultant",
    location: "Pune, India",
    experience: "3–6 years",
    match: 88,
    skills: ["SAP S/4HANA", "Migration", "Problem Solving"],
    icon: Database,
  },
  {
    id: 3,
    title: "Business Intelligence Analyst",
    location: "Hyderabad, India",
    experience: "2–5 years",
    match: 85,
    skills: ["Power BI", "SQL", "Data Visualization"],
    icon: ChartNoAxesColumn,
  },
];

const allJobs = [
  {
    id: 101,
    title: "SAP SD Consultant",
    location: "Bangalore, India",
    experience: "3–6 years",
    date: "12 Apr 2025",
    type: "Full Time",
    skills: ["SAP SD", "S/4HANA", "Consulting"],
  },
  {
    id: 102,
    title: "SAP MM Consultant",
    location: "Hyderabad, India",
    experience: "2–5 years",
    date: "10 Apr 2025",
    type: "Full Time",
    skills: ["SAP MM", "Procurement", "Configuration"],
  },
  {
    id: 103,
    title: "SAP FICO Consultant",
    location: "Pune, India",
    experience: "3–7 years",
    date: "08 Apr 2025",
    type: "Contract",
    skills: ["FICO", "Financials", "Reporting"],
  },
  {
    id: 104,
    title: "SAP ABAP Developer",
    location: "Bangalore, India",
    experience: "2–5 years",
    date: "05 Apr 2025",
    type: "Full Time",
    skills: ["ABAP", "Enhancement", "S/4HANA"],
  },
  {
    id: 105,
    title: "SAP Basis Administrator",
    location: "Chennai, India",
    experience: "3–6 years",
    date: "03 Apr 2025",
    type: "Full Time",
    skills: ["SAP Basis", "System Admin", "HANA"],
  },
];

export default function CandidateAllJobs() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [jobType, setJobType] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const candidateName =
    localStorage.getItem("candidateName") || "Candidate";

  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/candidate-dashboard" },
    { label: "My Applications", icon: ClipboardList, path: "/candidate-applications" },
    { label: "All Jobs", icon: BriefcaseBusiness, path: "/candidate-all-jobs" },
    { label: "Profile", icon: UserRound, path: "/candidate-profile" },
    { label: "Settings", icon: Settings, path: "/candidate-settings" },
  ];

  const matchesSearch = (job) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      job.title,
      job.location,
      job.experience,
      job.type || "",
      ...(job.skills || []),
    ].some((value) => value.toLowerCase().includes(query));
  };

  const filteredRecommended = recommendedJobs.filter(matchesSearch);

  const filteredJobs = allJobs.filter((job) => {
    const searchMatches = matchesSearch(job);
    const typeMatches = jobType === "All" || job.type === jobType;

    return searchMatches && typeMatches;
  });

  const toggleSaved = (id) => {
    setSavedJobs((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-[#f7f9fc] text-[#101c30]"
      }`}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r lg:static ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`flex h-[70px] shrink-0 items-center border-b px-6 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <div>
              <div className="mb-1 h-[6px] w-[44px] bg-[#f2383d]" />
              <span className="text-[23px] font-extrabold tracking-tight text-black">
                Proliant Data
              </span>
            </div>
          </div>

          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Candidate Portal
            </p>

            <nav className="space-y-1.5">
              {navigation.map(({ label, icon: Icon, path }) => {
                const active = label === "All Jobs";

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors ${
                      active
                        ? "bg-[#f2383d] text-white shadow-sm"
                        : darkMode
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-red-50 hover:text-[#f2383d]"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={`mt-auto border-t p-3 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <button
              type="button"
              onClick={() => navigate("/candidate-login")}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-[#f2383d]"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP BAR */}
          <header
            className={`sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b px-5 sm:px-8 ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`flex h-[42px] w-full max-w-[490px] items-center gap-3 rounded-full px-4 ${
                darkMode ? "bg-slate-800" : "bg-[#f3f5f9]"
              }`}
            >
              <Search size={18} className="shrink-0 text-slate-500" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs, skills, or locations..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-500 hover:bg-gray-100"
              >
                <Bell size={20} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f2383d]" />
              </button>

              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle dark mode"
                className="rounded-full p-2 text-slate-500 hover:bg-gray-100"
              >
                <Moon size={20} />
              </button>

              <div
                className={`hidden h-8 w-px sm:block ${
                  darkMode ? "bg-slate-700" : "bg-gray-200"
                }`}
              />

              <button
                type="button"
                onClick={() => navigate("/candidate-profile")}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">
                  {candidateName.charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-sm font-semibold">
                    {candidateName}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Candidate
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className="hidden text-slate-500 sm:block"
                />
              </button>
            </div>
          </header>

          {/* PAGE BODY */}
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-6 sm:px-8 sm:py-7">
            {/* PAGE HEADING */}
            <section className="relative mb-5 flex min-h-[90px] items-center justify-between gap-4 overflow-hidden">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">
                  All Jobs
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
                  Find Your Next Opportunity
                </h1>

                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Explore recommended roles based on your profile and browse
                  all job openings at Proliant.
                </p>
              </div>

              <div className="hidden h-[90px] w-[150px] shrink-0 items-center justify-center rounded-full bg-red-50 md:flex">
                <div className="relative">
                  <div className="flex h-[58px] w-[65px] flex-col gap-2 rounded-lg border border-red-100 bg-white p-3 shadow-sm">
                    <div className="h-2 w-5 rounded bg-red-200" />
                    <div className="h-1.5 w-9 rounded bg-slate-200" />
                    <div className="h-1.5 w-7 rounded bg-slate-200" />
                  </div>
                  <Search
                    size={34}
                    className="absolute -bottom-3 -right-5 text-[#f2383d]"
                  />
                </div>
              </div>
            </section>

            {/* RECOMMENDED JOBS */}
            <section
              className={`mb-5 rounded-xl border p-4 shadow-sm sm:p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <Sparkles size={24} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold sm:text-lg">
                      Recommended Jobs for You
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      Based on your skills, experience and the role you
                      recently applied for.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    document.getElementById("all-job-posts")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
                >
                  View All Recommended Jobs
                  <ArrowRight size={17} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredRecommended.map((job) => {
                  const JobIcon = job.icon;
                  const saved = savedJobs.includes(job.id);

                  return (
                    <article
                      key={job.id}
                      className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                        darkMode
                          ? "border-slate-700"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <JobIcon size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold leading-5">
                            {job.title}
                          </h3>
                          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            {job.match}% Match
                          </span>
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

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => alert(`Selected job: ${job.title}`)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#f2383d] hover:underline"
                        >
                          View Details
                          <ArrowRight size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSaved(job.id)}
                          aria-label={saved ? "Unsave job" : "Save job"}
                          className={`rounded-lg p-1.5 ${
                            saved ? "text-[#f2383d]" : "text-slate-500"
                          }`}
                        >
                          <Bookmark
                            size={18}
                            fill={saved ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </article>
                  );
                })}

                {filteredRecommended.length === 0 && (
                  <p className="col-span-full py-5 text-center text-sm text-slate-500">
                    No recommended jobs match your search.
                  </p>
                )}
              </div>
            </section>

            {/* ALL JOB POSTS */}
            <section
              id="all-job-posts"
              className={`rounded-xl border p-4 shadow-sm sm:p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
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
                      Explore all open positions at Proliant and find the right
                      opportunity for your career.
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

              {/* FILTERS */}
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
                    <option value="Contract">Contract</option>
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

              {/* TABLE HEADER — DESKTOP */}
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
                    {filteredJobs.map((job, index) => (
                      <tr
                        key={job.id}
                        className={`border-b last:border-b-0 ${
                          darkMode
                            ? "border-slate-800"
                            : "border-slate-100"
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
                            <span className="whitespace-nowrap text-sm font-bold">
                              {job.title}
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
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                              job.type === "Contract"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {job.type}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex max-w-[250px] flex-wrap gap-1.5">
                            {job.skills.map((skill) => (
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
                            onClick={() =>
                              alert(`Selected job: ${job.title}`)
                            }
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

              {/* MOBILE JOB CARDS */}
              <div className="space-y-3 lg:hidden">
                {filteredJobs.map((job) => (
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

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          job.type === "Contract"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {job.type}
                      </span>

                      <button
                        type="button"
                        onClick={() => alert(`Selected job: ${job.title}`)}
                        className="flex items-center gap-2 rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d]"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-500">
                  No jobs found. Try a different search or clear your filters.
                </p>
              )}

              <p className="mt-4 text-xs text-slate-400">
                Showing {filteredJobs.length} of {allJobs.length} job posts
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
