
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Clock3,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings,
  CheckCircle2,
  Circle,
  CircleX,
  LayoutDashboard,
  ClipboardList,
  UserRound,
  Bell,
  Moon,
  Building2,
  Wallet,
  GitBranch,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";

const applicationsData = [
  {
    id: 1,
    title: "SAP SD Consultant",
    location: "Bangalore, India",
    experience: "3–6 years",
    type: "Full-time",
    appliedDate: "12 Apr 2025",
    sortDate: "2025-04-12",
    status: "In Progress",
    department: "SAP Consulting",
    description:
      "Configure and support SAP Sales and Distribution (SD) processes, including order management, delivery, billing, and integration with other SAP modules. Work on requirement gathering, design, development, testing, and support activities.",
    skills: [
      "SAP SD",
      "Order Management",
      "SAP ERP",
      "ABAP (Basic)",
      "Business Processes",
    ],
    timeline: [
      { title: "Resume Screening", status: "Completed", date: "12 Apr 2025" },
      {
        title: "Technical Interview (Round 1)",
        status: "Completed",
        date: "15 Apr 2025",
      },
      {
        title: "Technical Interview (Round 2)",
        status: "In Progress",
        date: "—",
      },
      { title: "HR Interview", status: "Upcoming", date: "—" },
      { title: "Final Decision", status: "Upcoming", date: "—" },
    ],
  },
  {
    id: 2,
    title: "Data Analyst",
    location: "Hyderabad, India",
    experience: "2–4 years",
    type: "Full-time",
    appliedDate: "28 Mar 2025",
    sortDate: "2025-03-28",
    status: "Interview",
    department: "Data & Analytics",
    description:
      "Analyze business data, build reports and dashboards, identify trends, and communicate actionable insights to stakeholders. Work with structured datasets to support data-driven decisions.",
    skills: ["SQL", "Python", "Excel", "Power BI", "Data Visualization"],
    timeline: [
      { title: "Resume Screening", status: "Completed", date: "28 Mar 2025" },
      { title: "Technical Interview", status: "Completed", date: "02 Apr 2025" },
      { title: "Manager Interview", status: "In Progress", date: "—" },
      { title: "Final Decision", status: "Upcoming", date: "—" },
    ],
  },
  {
    id: 3,
    title: "Machine Learning Engineer",
    location: "Remote",
    experience: "3–5 years",
    type: "Full-time",
    appliedDate: "10 Mar 2025",
    sortDate: "2025-03-10",
    status: "Shortlisted",
    department: "AI & Machine Learning",
    description:
      "Develop, evaluate, and deploy machine learning models. Collaborate with engineering teams to build reliable ML pipelines and improve model performance using data-driven experiments.",
    skills: ["Python", "Machine Learning", "PyTorch", "SQL", "MLOps"],
    timeline: [
      { title: "Resume Screening", status: "Completed", date: "10 Mar 2025" },
      { title: "Technical Assessment", status: "Completed", date: "14 Mar 2025" },
      { title: "Shortlisting", status: "Completed", date: "18 Mar 2025" },
      { title: "Interview Scheduling", status: "Upcoming", date: "—" },
    ],
  },
  {
    id: 4,
    title: "Frontend Developer",
    location: "Chennai, India",
    experience: "1–3 years",
    type: "Full-time",
    appliedDate: "05 Mar 2025",
    sortDate: "2025-03-05",
    status: "Rejected",
    department: "Engineering",
    description:
      "Build responsive and accessible web interfaces using React. Collaborate with designers and backend engineers to deliver maintainable, high-quality user experiences.",
    skills: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    timeline: [
      { title: "Resume Screening", status: "Completed", date: "05 Mar 2025" },
      { title: "Application Review", status: "Completed", date: "08 Mar 2025" },
      { title: "Final Decision", status: "Rejected", date: "12 Mar 2025" },
    ],
  },
  {
    id: 5,
    title: "Python Developer",
    location: "Visakhapatnam, India",
    experience: "1–3 years",
    type: "Full-time",
    appliedDate: "20 Feb 2025",
    sortDate: "2025-02-20",
    status: "In Progress",
    department: "Engineering",
    description:
      "Develop and maintain Python applications, write reusable modules, integrate APIs, and collaborate with the team to troubleshoot and improve application performance.",
    skills: ["Python", "REST APIs", "SQL", "Git", "Debugging"],
    timeline: [
      { title: "Resume Screening", status: "Completed", date: "20 Feb 2025" },
      { title: "Technical Assessment", status: "In Progress", date: "—" },
      { title: "Interview", status: "Upcoming", date: "—" },
      { title: "Final Decision", status: "Upcoming", date: "—" },
    ],
  },
];

const filters = [
  "All",
  "In Progress",
  "Shortlisted",
  "Interview",
  "Offer",
  "Rejected",
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/candidate-dashboard" },
  { label: "My Applications", icon: ClipboardList, path: "/candidate-applications" },
  { label: "All Jobs", icon: BriefcaseBusiness, path: "/candidate-all-jobs" },
  { label: "Profile", icon: UserRound, path: "/candidate-profile" },
  { label: "Settings", icon: Settings, path: "/candidate-settings" },
];

function StatusBadge({ status }) {
  const styles = {
    "In Progress": "bg-emerald-50 text-emerald-700",
    Shortlisted: "bg-emerald-50 text-emerald-700",
    Interview: "bg-blue-50 text-blue-700",
    Offer: "bg-purple-50 text-purple-700",
    Rejected: "bg-red-50 text-red-600",
    Upcoming: "bg-slate-100 text-slate-600",
    Completed: "bg-emerald-50 text-emerald-700",
  };

  const StatusIcon =
    status === "Rejected"
      ? CircleX
      : status === "Completed" || status === "Shortlisted" || status === "Offer"
        ? CheckCircle2
        : status === "Interview"
          ? Clock3
          : status === "In Progress"
            ? CheckCircle2
            : Circle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <StatusIcon size={15} />
      {status}
    </span>
  );
}

function ApplicationTimeline({ timeline }) {
  return (
    <div className="space-y-0">
      {timeline.map((step, index) => {
        const completed = step.status === "Completed";
        const inProgress = step.status === "In Progress";
        const rejected = step.status === "Rejected";

        return (
          <div key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
            {index !== timeline.length - 1 && (
              <div
                className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${
                  completed ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : inProgress
                    ? "border-orange-400 bg-orange-50 text-orange-500"
                    : rejected
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              {completed ? (
                <CheckCircle2 size={15} />
              ) : rejected ? (
                <CircleX size={15} />
              ) : inProgress ? (
                <Clock3 size={14} />
              ) : (
                <Circle size={11} />
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {step.title}
                </p>
                <p
                  className={`mt-0.5 text-sm ${
                    completed
                      ? "text-emerald-600"
                      : inProgress
                        ? "text-orange-600"
                        : rejected
                          ? "text-red-600"
                          : "text-slate-500"
                  }`}
                >
                  {step.status}
                </p>
              </div>
              <span className="shrink-0 pt-0.5 text-xs text-slate-500">
                {step.date}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApplicationCard({ application, expanded, onToggle }) {
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate("/candidate-all-jobs", {
      state: { selectedJobId: application.id, selectedJobTitle: application.title },
    });
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <BriefcaseBusiness size={27} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
            {application.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {application.location}
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness size={16} />
              {application.experience}
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <Clock3 size={16} />
              {application.type}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={16} />
              Applied on {application.appliedDate}
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 sm:block">
          <StatusBadge status={application.status} />
        </div>

        <span className="shrink-0 text-slate-500">
          {expanded ? <ChevronUp size={21} /> : <ChevronDown size={21} />}
        </span>
      </button>

      <div className="px-5 pb-3 sm:hidden">
        <StatusBadge status={application.status} />
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0">
              <section>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <FileText size={20} className="text-slate-600" />
                  Job Description
                </h3>
                <p className="mt-3 pl-7 text-sm leading-6 text-slate-600">
                  {application.description}
                </p>
              </section>

              <section className="mt-6">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Settings size={19} className="text-slate-600" />
                  Required Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 pl-7">
                  {application.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <BriefcaseBusiness size={19} className="text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500">Job Type</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {application.type}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <Wallet size={19} className="text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500">Experience</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {application.experience}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <MapPin size={19} className="text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500">Location</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {application.location}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <Building2 size={19} className="text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500">Department</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {application.department}
                  </p>
                </div>
              </section>
            </div>

            <section className="min-w-0 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                <GitBranch size={20} className="text-slate-600" />
                Application Progress
              </h3>

              <ApplicationTimeline timeline={application.timeline} />

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleViewJob}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View Job Details
                  <ArrowUpRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(`timeline-${application.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  View Application Timeline
                </button>
              </div>

              <div id={`timeline-${application.id}`} className="sr-only">
                Application timeline for {application.title}
              </div>
            </section>
          </div>
        </div>
      )}
    </article>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [expandedId, setExpandedId] = useState(1);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredApplications = useMemo(() => {
    let result = [...applicationsData];

    if (activeFilter !== "All") {
      result = result.filter((application) => application.status === activeFilter);
    }

    const query = searchTerm.trim().toLowerCase();

    if (query) {
      result = result.filter((application) =>
        [
          application.title,
          application.location,
          application.department,
          application.status,
          ...application.skills,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    result.sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.sortDate) - new Date(a.sortDate)
        : new Date(a.sortDate) - new Date(b.sortDate)
    );

    return result;
  }, [activeFilter, searchTerm, sortOrder]);

  const filterCount = (filter) => {
    if (filter === "All") return applicationsData.length;
    return applicationsData.filter((item) => item.status === filter).length;
  };

  const handleNavigation = (item) => {
    setMobileMenu(false);
    if (item.label !== "My Applications") {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {mobileMenu && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center border-b border-slate-200 px-6">
            <div>
              <div className="mb-2 h-1.5 w-11 bg-red-500" />
              <span className="text-[23px] font-extrabold tracking-tight text-black">
                Proliant Data
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-7">
            <p className="mb-5 px-3 text-xs font-bold tracking-[0.16em] text-slate-400">
              CANDIDATE PORTAL
            </p>
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.label === "My Applications";

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigation(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-7">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileMenu(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <SlidersHorizontal size={21} />
              </button>

              <div className="hidden w-full max-w-[510px] items-center gap-3 rounded-full bg-slate-100 px-4 py-3 sm:flex">
                <Search size={19} className="shrink-0 text-slate-500" />
                <input
                  aria-label="Search jobs"
                  placeholder="Search jobs, skills, or locations..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate("/candidate-all-jobs");
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <Bell size={21} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <button
                type="button"
                aria-label="Toggle appearance"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <Moon size={21} />
              </button>
              <div className="h-8 border-l border-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                  {(localStorage.getItem("candidateName") || "Candidate")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">
                    {localStorage.getItem("candidateName") || "Candidate"}
                  </p>
                  <p className="text-xs text-slate-500">Candidate</p>
                </div>
                <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 sm:py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                My Applications
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                View and track all the jobs you have applied for.
              </p>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        activeFilter === filter
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {filter} ({filterCount(filter)})
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 sm:w-[260px]">
                    <Search size={18} className="shrink-0 text-slate-500" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search applications..."
                      aria-label="Search applications"
                      className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    aria-label="Sort applications"
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-red-300"
                  >
                    <option value="latest">Latest Applied</option>
                    <option value="oldest">Oldest Applied</option>
                  </select>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Showing {filteredApplications.length} of {applicationsData.length} applications
              </p>
            </div>

            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  expanded={expandedId === application.id}
                  onToggle={() =>
                    setExpandedId((current) =>
                      current === application.id ? null : application.id
                    )
                  }
                />
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <BriefcaseBusiness size={25} />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  No applications found
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try another search term or select a different status filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearchTerm("");
                  }}
                  className="mt-5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50/60 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-slate-900">
                  Looking for your next opportunity?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Explore open positions that match your skills and interests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/candidate-all-jobs")}
                className="shrink-0 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Browse All Jobs
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
