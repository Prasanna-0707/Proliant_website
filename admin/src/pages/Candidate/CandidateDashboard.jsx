
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
  Clock3,
  Check,
  CircleCheck,
  Circle,
  Bookmark,
  Sparkles,
  GitBranch,
  Menu,
  X,
  ArrowRight,
  Database,
  ChartNoAxesColumn,
  FileText,
} from "lucide-react";

const candidate = {
  name: localStorage.getItem("candidateName") || "Candidate",
  currentJob: "SAP SD Consultant",
  location: "Bangalore, India",
  experience: "3–6 years",
  appliedDate: "12 Apr 2025",
};

const jobs = [
  {
    title: "SAP Data Analyst",
    location: "Bangalore, India",
    experience: "2–4 years",
    match: 92,
    skills: ["SAP", "Data Analysis", "Excel"],
    icon: BriefcaseBusiness,
  },
  {
    title: "SAP S/4HANA Consultant",
    location: "Pune, India",
    experience: "3–6 years",
    match: 88,
    skills: ["SAP S/4HANA", "Migration", "Problem Solving"],
    icon: Database,
  },
  {
    title: "Business Intelligence Analyst",
    location: "Hyderabad, India",
    experience: "2–5 years",
    match: 85,
    skills: ["Power BI", "SQL", "Data Visualization"],
    icon: ChartNoAxesColumn,
  },
];

const stages = [
  {
    title: "Resume Screening",
    status: "Completed",
    date: "12 Apr 2025",
    state: "completed",
  },
  {
    title: "Technical Interview",
    subtitle: "(Round 1)",
    status: "Completed",
    date: "15 Apr 2025",
    state: "completed",
  },
  {
    title: "Technical Interview",
    subtitle: "(Round 2)",
    status: "In Progress",
    date: "—",
    state: "progress",
  },
  {
    title: "HR Interview",
    status: "Upcoming",
    date: "—",
    state: "upcoming",
  },
  {
    title: "Final Decision",
    status: "Upcoming",
    date: "—",
    state: "upcoming",
  },
];

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const firstName = candidate.name.trim().split(/\s+/)[0];

  const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Applications", icon: ClipboardList },
  { label: "All Jobs", icon: BriefcaseBusiness },
  { label: "Profile", icon: UserRound },
  { label: "Settings", icon: Settings },
];

  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  const handleNavigation = (label) => {
    setActiveNav(label);
    setMobileMenu(false);

    if (label === "All Jobs") {
      navigate("/candidate-all-jobs");
      return;
    }

    // Keep the existing preview behavior for the other navigation items.
  };

  const handleLogout = () => {
    // UI preview only. Authentication/logout is not connected.
    window.location.href = "/candidate-login";
  };

  return (
    <div
      className={`min-h-screen font-sans ${
        darkMode ? "bg-slate-950 text-white" : "bg-[#f7f9fc] text-[#101c30]"
      }`}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r transition-transform duration-200 lg:static lg:translate-x-0 ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          } ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Brand */}
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

            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              className="ml-auto rounded-lg p-2 text-gray-500 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Candidate Portal
            </p>

            <nav className="space-y-1.5">
              {navigation.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleNavigation(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors ${
                    activeNav === label
                      ? "bg-[#f2383d] text-white shadow-sm"
                      : darkMode
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-red-50 hover:text-[#f2383d]"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <div
            className={`mt-auto border-t p-3 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-[#f2383d]"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenu && (
          <button
            type="button"
            aria-label="Close navigation backdrop"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        {/* MAIN */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP BAR */}
          <header
            className={`sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b px-5 sm:px-8 ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-gray-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            {/* Search */}
            <div
              className={`flex h-[42px] w-full max-w-[490px] items-center gap-3 rounded-full px-4 ${
                darkMode ? "bg-slate-800" : "bg-[#f3f5f9]"
              }`}
            >
              <Search size={18} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveNav("Recommended Jobs");
                }}
                placeholder="Search jobs, skills, or locations..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
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
                onClick={() => handleNavigation("Profile")}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">
                  {candidate.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block max-w-[150px] truncate text-sm font-semibold">
                    {candidate.name}
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

          {/* DASHBOARD CONTENT */}
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-7 sm:px-8 sm:py-9">
            {/* Greeting: name on the same line */}
            <section className="relative mb-6 flex min-h-[105px] items-center justify-between gap-5 overflow-hidden">
              <div className="relative z-10 min-w-0">
                <h1 className="text-[27px] font-bold leading-tight tracking-tight sm:text-[32px]">
                  Good morning,{" "}
                  <span className="text-[#f2383d]">{candidate.name}!</span>
                </h1>

                <p className="mt-2 max-w-[620px] text-sm leading-6 text-slate-500 sm:text-base">
                  Track your application progress and discover new opportunities
                  that match your skills and experience.
                </p>
              </div>

              {/* Illustration placeholder */}
              <div className="hidden h-[115px] w-[205px] shrink-0 items-center justify-center rounded-full bg-red-50/80 md:flex">
                <div className="relative flex h-[92px] w-[150px] items-end justify-center">
                  <div className="absolute bottom-0 left-1 h-12 w-8 rounded-t-full bg-blue-200/80" />
                  <div className="absolute bottom-0 right-1 h-14 w-7 rounded-t-full bg-emerald-200/80" />
                  <div className="relative z-10 flex h-16 w-16 flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-[#f6c7a7]" />
                    <div className="h-9 w-12 rounded-t-xl bg-[#f2383d]" />
                  </div>
                  <div className="absolute bottom-0 z-20 h-3 w-24 rounded-sm bg-slate-800" />
                </div>
              </div>
            </section>

            {/* CURRENT APPLICATION */}
            <section
              className={`mb-4 rounded-xl border p-5 shadow-sm sm:px-6 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#f2383d]">
                  <BriefcaseBusiness size={27} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm text-slate-500">
                    Your Current Application
                  </p>

                  <h2 className="text-lg font-bold">{candidate.currentJob}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BriefcaseBusiness size={15} />
                      {candidate.experience}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      Applied on {candidate.appliedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                    <CircleCheck size={17} />
                    Application in Progress
                  </span>

                  <button
                    type="button"
                    onClick={() => handleNavigation("My Applications")}
                    aria-label="View current application"
                    className="rounded-lg p-2 text-slate-500 hover:bg-gray-50"
                  >
                    <ChevronRight size={21} />
                  </button>
                </div>
              </div>
            </section>

            {/* HIRING JOURNEY */}
            <section
              className={`mb-4 rounded-xl border p-5 shadow-sm sm:p-6 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                  <GitBranch size={26} />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Your Hiring Journey</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Here's how your application is progressing through the
                    interview process.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-5">
                {stages.map((stage, index) => (
                  <div key={stage.title + index} className="relative text-center">
                    {/* Connecting line */}
                    {index < stages.length - 1 && (
                      <div
                        className={`absolute left-[62%] top-[22px] hidden h-[2px] w-[76%] md:block ${
                          index < 2 ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 mx-auto mb-3 flex h-[44px] w-[44px] items-center justify-center rounded-full border-[4px] ${
                        stage.state === "completed"
                          ? "border-emerald-100 bg-emerald-500 text-white"
                          : stage.state === "progress"
                            ? "border-orange-100 bg-white text-orange-500 ring-2 ring-orange-400"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {stage.state === "completed" ? (
                        <Check size={22} strokeWidth={3} />
                      ) : stage.state === "progress" ? (
                        <Clock3 size={21} />
                      ) : index === 4 ? (
                        <Bookmark size={20} />
                      ) : (
                        <Clock3 size={20} />
                      )}
                    </div>

                    <h3 className="text-[13px] font-bold leading-5 sm:text-sm">
                      {stage.title}
                      {stage.subtitle && (
                        <>
                          <br />
                          {stage.subtitle}
                        </>
                      )}
                    </h3>

                    <p
                      className={`mt-2 text-xs font-semibold sm:text-sm ${
                        stage.state === "completed"
                          ? "text-emerald-600"
                          : stage.state === "progress"
                            ? "text-orange-500"
                            : "text-slate-500"
                      }`}
                    >
                      {stage.status}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {stage.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* RECOMMENDED JOBS */}
            <section
              className={`mb-4 rounded-xl border p-4 shadow-sm sm:p-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <Sparkles size={24} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Recommended Jobs for You
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Based on your skills, experience and the role you recently
                      applied for.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigation("Recommended Jobs")}
                  className="flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
                >
                  View All Recommended Jobs
                  <ArrowRight size={17} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job) => {
                  const JobIcon = job.icon;
                  const saved = savedJobs.includes(job.title);

                  return (
                    <article
                      key={job.title}
                      className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                        darkMode
                          ? "border-slate-700"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                          <JobIcon size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold leading-5">
                            {job.title}
                          </h3>

                          <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
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
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700 sm:text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleNavigation("Recommended Jobs")}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#f2383d] hover:underline"
                        >
                          View Details
                          <ArrowRight size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSavedJobs((previous) =>
                              saved
                                ? previous.filter((title) => title !== job.title)
                                : [...previous, job.title]
                            )
                          }
                          aria-label={saved ? "Remove saved job" : "Save job"}
                          className={`rounded-lg p-1.5 ${
                            saved
                              ? "text-[#f2383d]"
                              : "text-slate-500 hover:text-[#f2383d]"
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

                {filteredJobs.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-slate-500">
                    No matching jobs found. Try another search.
                  </p>
                )}
              </div>
            </section>

            {/* EXPLORE ALL JOBS */}
            <section
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-sm sm:px-6 ${
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#101c30] text-white">
                  <Search size={23} />
                </div>

                <div>
                  <h2 className="font-bold">Explore All Jobs</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    Browse all active jobs posted by our team. Find the right
                    opportunity for your next career move.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavigation("All Jobs")}
                className="flex items-center gap-2 rounded-lg bg-[#f2383d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#df3438]"
              >
                View All Jobs
                <ArrowRight size={17} />
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
