import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  UserCog,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  LogOut,
  Search,
  Bell,
  Moon,
  ChevronDown,
  ArrowRight,
  Plus,
  X,
  FileText,
  Video,
  Clock,
  AlertCircle,
  Award,
  UserX,
  Mail,
} from "lucide-react";

/* ---------- mock data (replace with /api/department/* calls) ---------- */

const PIPELINE = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

const initialApplicants = [
  { id: 1, name: "Candidate A", email: "candidate.a@mail.com", role: "AI Engineer", experience: "3 yrs", status: "Shortlisted", selectedOn: "14 Nov 2026", interviewer: "Ravi Kumar" },
  { id: 2, name: "Candidate B", email: "candidate.b@mail.com", role: "Data Scientist", experience: "2 yrs", status: "Under Review", selectedOn: "", interviewer: "" },
  { id: 3, name: "Candidate C", email: "candidate.c@mail.com", role: "ML Engineer", experience: "4 yrs", status: "Interview", selectedOn: "12 Nov 2026", interviewer: "Priya Sharma" },
  { id: 4, name: "Candidate D", email: "candidate.d@mail.com", role: "AI Engineer", experience: "1 yr", status: "Applied", selectedOn: "", interviewer: "" },
  { id: 5, name: "Candidate E", email: "candidate.e@mail.com", role: "ML Engineer", experience: "5 yrs", status: "Selected", selectedOn: "08 Nov 2026", interviewer: "Ravi Kumar" },
  { id: 6, name: "Candidate F", email: "candidate.f@mail.com", role: "Data Scientist", experience: "Fresher", status: "Rejected", selectedOn: "", interviewer: "" },
  { id: 7, name: "Candidate G", email: "candidate.g@mail.com", role: "AI Engineer", experience: "6 yrs", status: "Shortlisted", selectedOn: "15 Nov 2026", interviewer: "" },
];

const interviewers = [
  { id: 1, name: "Ravi Kumar", role: "Technical Interviewer", expertise: ["Python", "Deep Learning", "MLOps"], availability: "Available" },
  { id: 2, name: "Priya Sharma", role: "HR Interviewer", expertise: ["Behavioural", "Culture Fit"], availability: "Available" },
  { id: 3, name: "Arjun Mehta", role: "Technical Interviewer", expertise: ["NLP", "Data Science", "SQL"], availability: "Busy" },
];

const initialInterviews = [
  { id: 1, candidate: "Candidate A", round: "Technical Round", date: "2026-11-20", time: "11:00", interviewer: "Ravi Kumar", link: "https://meet.example.com/a", status: "Scheduled" },
  { id: 2, candidate: "Candidate C", round: "HR Round", date: "2026-11-21", time: "15:30", interviewer: "Priya Sharma", link: "https://meet.example.com/c", status: "Scheduled" },
  { id: 3, candidate: "Candidate E", round: "Technical Round", date: "2026-11-10", time: "10:00", interviewer: "Ravi Kumar", link: "", status: "Completed" },
];

const jobs = [
  { id: 1, title: "AI Engineer", location: "Bangalore, India", experience: "3–6 years", type: "Full Time", applicants: 18, status: "Open" },
  { id: 2, title: "Data Scientist", location: "Hyderabad, India", experience: "2–5 years", type: "Full Time", applicants: 14, status: "Open" },
  { id: 3, title: "ML Engineer", location: "Pune, India", experience: "3–7 years", type: "Contract", applicants: 12, status: "Open" },
  { id: 4, title: "Computer Vision Engineer", location: "Chennai, India", experience: "2–4 years", type: "Full Time", applicants: 4, status: "Closed" },
];

const monthly = [
  { month: "Jul", applied: 22, shortlisted: 8, selected: 2 },
  { month: "Aug", applied: 30, shortlisted: 11, selected: 3 },
  { month: "Sep", applied: 26, shortlisted: 9, selected: 2 },
  { month: "Oct", applied: 35, shortlisted: 14, selected: 4 },
  { month: "Nov", applied: 48, shortlisted: 18, selected: 4 },
];

/* ---------- style maps ---------- */

const statusBadge = {
  Applied: "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-50 text-blue-700",
  Shortlisted: "bg-violet-50 text-violet-700",
  Interview: "bg-amber-50 text-amber-700",
  Selected: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Open: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Available: "bg-emerald-50 text-emerald-700",
  Busy: "bg-amber-50 text-amber-700",
};

const tones = {
  red: "bg-red-50 text-[#f2383d]",
  blue: "bg-blue-50 text-blue-500",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};

const navigation = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "applicants", label: "Applicants", icon: Users },
  { key: "shortlisted", label: "Shortlisted", icon: UserCheck },
  { key: "interviews", label: "Interview Management", icon: CalendarDays },
  { key: "interviewers", label: "Interviewers", icon: UserCog },
  { key: "jobs", label: "Job Management", icon: BriefcaseBusiness },
  { key: "analytics", label: "Recruitment Analytics", icon: ChartNoAxesColumn },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export default function DeptAdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [applicants, setApplicants] = useState(initialApplicants);
  const [interviews, setInterviews] = useState(initialInterviews);
  const [assignFor, setAssignFor] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidate: "", round: "Technical Round", date: "", time: "", interviewer: "", link: "",
  });

  const adminName = localStorage.getItem("deptAdminName") || "Department Admin";
  const departmentName = localStorage.getItem("deptName") || "AI & Machine Learning";

  const card = darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white";
  const divider = darkMode ? "border-slate-800" : "border-slate-100";
  const theadCls = darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-600";
  const modalCls = darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900";
  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#f2383d] ${
    darkMode ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"
  }`;

  const count = (s) => applicants.filter((a) => a.status === s).length;

  const stats = [
    { label: "Total Applicants", value: applicants.length, icon: Users, tone: "blue" },
    { label: "Shortlisted", value: count("Shortlisted"), icon: UserCheck, tone: "violet" },
    { label: "Interviews Scheduled", value: interviews.filter((i) => i.status === "Scheduled").length, icon: CalendarDays, tone: "amber" },
    { label: "Offers Released", value: count("Selected"), icon: Award, tone: "green" },
    { label: "Rejected", value: count("Rejected"), icon: UserX, tone: "red" },
  ];

  const matches = (values) => {
    const q = search.trim().toLowerCase();
    return !q || values.some((v) => String(v).toLowerCase().includes(q));
  };

  const filteredApplicants = applicants.filter(
    (a) =>
      matches([a.name, a.email, a.role, a.experience]) &&
      (statusFilter === "All" || a.status === statusFilter)
  );

  const shortlisted = applicants.filter((a) => ["Shortlisted", "Interview", "Selected"].includes(a.status));
  const upcoming = interviews.filter((i) => i.status === "Scheduled");

  const pending = useMemo(
    () => [
      { label: "Applications awaiting review", value: count("Applied") + count("Under Review") },
      { label: "Shortlisted – interview to schedule", value: applicants.filter((a) => a.status === "Shortlisted" && !upcoming.some((i) => i.candidate === a.name)).length },
      { label: "Interview feedback pending", value: interviews.filter((i) => i.status === "Completed").length },
      { label: "Candidates without interviewer", value: applicants.filter((a) => ["Shortlisted", "Interview"].includes(a.status) && !a.interviewer).length },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicants, interviews]
  );

  const updateStatus = (id, status) =>
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const assignInterviewer = (name) => {
    setApplicants((prev) => prev.map((a) => (a.id === assignFor.id ? { ...a, interviewer: name } : a)));
    setAssignFor(null);
  };

  const submitSchedule = (e) => {
    e.preventDefault();
    setInterviews((prev) => [...prev, { id: Date.now(), ...scheduleForm, status: "Scheduled" }]);
    setApplicants((prev) =>
      prev.map((a) =>
        a.name === scheduleForm.candidate
          ? { ...a, status: "Interview", interviewer: scheduleForm.interviewer }
          : a
      )
    );
    setScheduleOpen(false);
    setScheduleForm({ candidate: "", round: "Technical Round", date: "", time: "", interviewer: "", link: "" });
  };

  const heading = {
    overview: ["Overview", `${departmentName} Overview`, "Recruitment activity for your department at a glance."],
    applicants: ["Applicants", "Department Applicants", "Review applicants and move them through the hiring pipeline."],
    shortlisted: ["Shortlisted", "Shortlisted Candidates", "Candidates shortlisted for your department."],
    interviews: ["Interview Management", "Interview Management", "Schedule rounds and track interview status."],
    interviewers: ["Interviewers", "Assigned Interviewers", "Interviewer roles, expertise and availability."],
    jobs: ["Job Management", "Department Job Posts", "Open and closed postings for your department."],
    analytics: ["Recruitment Analytics", "Recruitment Analytics", "Application-to-shortlist and shortlist-to-selection performance."],
  }[section];

  const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );

  const Badge = ({ value }) => (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge[value] || "bg-slate-100 text-slate-700"}`}>
      {value}
    </span>
  );

  const Empty = ({ text }) => <p className="py-10 text-center text-sm text-slate-500">{text}</p>;

  /* ---------- sections ---------- */

  const applicantsTable = (rows, { withActions }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className={`text-xs font-semibold ${theadCls}`}>
            <th className="rounded-l-lg px-3 py-3">Candidate</th>
            <th className="px-3 py-3">Applied Role</th>
            <th className="px-3 py-3">Experience</th>
            <th className="px-3 py-3">{withActions ? "Status" : "Selection Date"}</th>
            <th className="px-3 py-3">Interviewer</th>
            <th className="rounded-r-lg px-3 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a, i) => (
            <tr key={a.id} className={`border-b last:border-b-0 ${divider}`}>
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i % 2 ? "bg-blue-50 text-blue-500" : "bg-red-50 text-[#f2383d]"}`}>
                    {a.name.charAt(a.name.length - 1)}
                  </span>
                  <div>
                    <p className="whitespace-nowrap text-sm font-bold">{a.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500"><Mail size={11} />{a.email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{a.role}</td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{a.experience}</td>
              <td className="px-3 py-3">
                {withActions ? (
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    aria-label={`Status for ${a.name}`}
                    className={`rounded-full border-0 px-3 py-1.5 text-[11px] font-semibold outline-none ${statusBadge[a.status]}`}
                  >
                    {PIPELINE.map((s) => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className="whitespace-nowrap text-xs text-slate-500">{a.selectedOn || "—"}</span>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                {a.interviewer || <span className="text-amber-600">Not assigned</span>}
              </td>
              <td className="px-3 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Open resume for ${a.name}`)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900"
                  >
                    <FileText size={14} />
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignFor(a)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d] transition hover:bg-[#f2383d] hover:text-white"
                  >
                    Assign Interviewer
                    <ArrowRight size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty text="No candidates found." />}
    </div>
  );

  const interviewsList = (rows) => (
    <div className="space-y-3">
      {rows.map((i) => (
        <div key={i.id} className={`flex flex-wrap items-center gap-4 rounded-xl border p-4 transition-shadow hover:shadow-md ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{i.candidate} – {i.round}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Clock size={13} />{formatDate(i.date)}, {i.time}</span>
              <span className="flex items-center gap-1.5"><UserCog size={13} />{i.interviewer}</span>
            </p>
          </div>
          <Badge value={i.status} />
          {i.link && (
            <a
              href={i.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#f2383d] px-3 py-2 text-xs font-semibold text-[#f2383d] transition hover:bg-[#f2383d] hover:text-white"
            >
              <Video size={14} />
              Join
            </a>
          )}
        </div>
      ))}
      {rows.length === 0 && <Empty text="No interviews to show." />}
    </div>
  );

  const scheduleButton = (
    <button
      type="button"
      onClick={() => setScheduleOpen(true)}
      className="flex items-center gap-2 rounded-lg bg-[#f2383d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
    >
      <Plus size={17} />
      Schedule Interview
    </button>
  );

  const renderOverview = () => (
    <>
      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${card}`}>
            <div className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* pipeline */}
      <section className={`mb-5 rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
        <SectionHeader icon={ChartNoAxesColumn} title="Candidate Pipeline" subtitle="Applied → Under Review → Shortlisted → Interview → Selected / Rejected" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {PIPELINE.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => { setStatusFilter(stage); setSection("applicants"); }}
              className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-md ${darkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <p className="text-2xl font-bold">{count(stage)}</p>
              <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadge[stage]}`}>{stage}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className={`rounded-xl border p-4 shadow-sm sm:p-5 xl:col-span-2 ${card}`}>
          <SectionHeader
            icon={Users}
            title="Recent Applicants"
            subtitle="Latest applications to your department"
            action={
              <button type="button" onClick={() => setSection("applicants")} className="flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline">
                View All <ArrowRight size={17} />
              </button>
            }
          />
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className={`text-xs font-semibold ${theadCls}`}>
                <th className="rounded-l-lg px-3 py-3">Candidate</th>
                <th className="px-3 py-3">Applied Role</th>
                <th className="rounded-r-lg px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.slice(0, 4).map((a) => (
                <tr key={a.id} className={`border-b last:border-b-0 ${divider}`}>
                  <td className="px-3 py-3 text-sm font-bold">{a.name}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{a.role}</td>
                  <td className="px-3 py-3"><Badge value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
          <SectionHeader icon={AlertCircle} title="Pending Actions" subtitle="Needs your attention" />
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{p.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.value ? "bg-red-50 text-[#f2383d]" : "bg-emerald-50 text-emerald-700"}`}>
                  {p.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
          <SectionHeader icon={CalendarDays} title="Upcoming Interviews" subtitle="Next scheduled rounds" action={scheduleButton} />
          {interviewsList(upcoming)}
        </div>

        <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
          <SectionHeader icon={UserCog} title="Assigned Interviewers" subtitle="Your department's interview panel" />
          <div className="space-y-3">
            {interviewers.map((p) => (
              <div key={p.id} className={`flex items-center gap-3 rounded-xl border p-3 ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-[#f2383d]">{p.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.role}</p>
                </div>
                <Badge value={p.availability} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderApplicants = () => (
    <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
      <SectionHeader
        icon={Users}
        title="All Applicants"
        subtitle="Name, email, applied role, experience and resume"
        action={
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm font-semibold">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#f2383d] ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white text-slate-800"}`}
            >
              <option>All</option>
              {PIPELINE.map((s) => <option key={s}>{s}</option>)}
            </select>
            {statusFilter !== "All" && (
              <button type="button" onClick={() => setStatusFilter("All")} className="text-sm font-medium text-[#f2383d] hover:underline">
                Clear
              </button>
            )}
          </div>
        }
      />
      {applicantsTable(filteredApplicants, { withActions: true })}
      <p className="mt-4 text-xs text-slate-400">Showing {filteredApplicants.length} of {applicants.length} applicants</p>
    </section>
  );

  const renderShortlisted = () => (
    <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
      <SectionHeader icon={UserCheck} title="Shortlisted Candidates" subtitle="Shortlisted list with selection date" />
      {applicantsTable(shortlisted.filter((a) => matches([a.name, a.role])), { withActions: false })}
    </section>
  );

  const renderInterviews = () => (
    <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
      <SectionHeader icon={CalendarDays} title="Interview Schedule" subtitle="Rounds, dates, time and status" action={scheduleButton} />
      {interviewsList(interviews.filter((i) => matches([i.candidate, i.round, i.interviewer])))}
    </section>
  );

  const renderInterviewers = () => (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {interviewers.filter((p) => matches([p.name, p.role, ...p.expertise])).map((p) => (
        <article key={p.id} className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${card}`}>
          <div className="flex items-start gap-3">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-[#f2383d]">{p.name.charAt(0)}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{p.name}</h3>
              <p className="text-xs text-slate-500">{p.role}</p>
            </div>
            <Badge value={p.availability} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.expertise.map((s) => (
              <span key={s} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">{s}</span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {applicants.filter((a) => a.interviewer === p.name).length} candidates assigned
          </p>
        </article>
      ))}
    </section>
  );

  const renderJobs = () => (
    <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
      <SectionHeader icon={BriefcaseBusiness} title="Department Job Posts" subtitle="Open and closed postings" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className={`text-xs font-semibold ${theadCls}`}>
              <th className="rounded-l-lg px-3 py-3">Job Title</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Experience</th>
              <th className="px-3 py-3">Job Type</th>
              <th className="px-3 py-3">Applicants</th>
              <th className="rounded-r-lg px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.filter((j) => matches([j.title, j.location, j.type])).map((j, i) => (
              <tr key={j.id} className={`border-b last:border-b-0 ${divider}`}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${i % 2 ? "bg-blue-50 text-blue-500" : "bg-red-50 text-[#f2383d]"}`}>
                      <BriefcaseBusiness size={20} />
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold">{j.title}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{j.location}</td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{j.experience}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${j.type === "Contract" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{j.type}</span>
                </td>
                <td className="px-3 py-3 text-sm font-semibold">{j.applicants}</td>
                <td className="px-3 py-3"><Badge value={j.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAnalytics = () => {
    const total = monthly.reduce((s, m) => s + m.applied, 0);
    const sl = monthly.reduce((s, m) => s + m.shortlisted, 0);
    const sel = monthly.reduce((s, m) => s + m.selected, 0);
    const max = Math.max(...monthly.map((m) => m.applied));

    return (
      <>
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Application → Shortlist", value: `${Math.round((sl / total) * 100)}%`, tone: "violet", icon: UserCheck },
            { label: "Shortlist → Selection", value: `${Math.round((sel / sl) * 100)}%`, tone: "green", icon: Award },
            { label: "Application → Selection", value: `${Math.round((sel / total) * 100)}%`, tone: "blue", icon: ChartNoAxesColumn },
          ].map(({ label, value, tone, icon: Icon }) => (
            <article key={label} className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
              <div className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={24} /></div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={`rounded-xl border p-4 shadow-sm sm:p-5 ${card}`}>
          <SectionHeader icon={ChartNoAxesColumn} title="Month-wise Report" subtitle="Applications, shortlisted and selected candidates" />
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-400" />Applied</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-400" />Shortlisted</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Selected</span>
          </div>
          <div className="space-y-5">
            {monthly.map((m) => (
              <div key={m.month}>
                <p className="mb-2 text-xs font-semibold">{m.month}</p>
                {[
                  ["applied", "bg-blue-400"],
                  ["shortlisted", "bg-violet-400"],
                  ["selected", "bg-emerald-500"],
                ].map(([k, color]) => (
                  <div key={k} className="mb-1.5 flex items-center gap-3">
                    <div className={`h-2 flex-1 rounded-full ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${(m[k] / max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs text-slate-500">{m[k]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  const body = {
    overview: renderOverview,
    applicants: renderApplicants,
    shortlisted: renderShortlisted,
    interviews: renderInterviews,
    interviewers: renderInterviewers,
    jobs: renderJobs,
    analytics: renderAnalytics,
  }[section]();

  /* ---------- shell ---------- */

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950 text-white" : "bg-[#f7f9fc] text-[#101c30]"}`}>
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r lg:static ${darkMode ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white"}`}>
          <div className={`flex h-[70px] shrink-0 items-center border-b px-6 ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
            <div>
              <div className="mb-1 h-[6px] w-[44px] bg-[#f2383d]" />
              <span className={`text-[23px] font-extrabold tracking-tight ${darkMode ? "text-white" : "text-black"}`}>Proliant Data</span>
            </div>
          </div>

          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Department Admin</p>
            <nav className="space-y-1.5">
              {navigation.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setSection(key); setSearch(""); if (key !== "applicants") setStatusFilter("All"); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[14px] font-medium transition-colors ${
                    section === key
                      ? "bg-[#f2383d] text-white shadow-sm"
                      : darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-red-50 hover:text-[#f2383d]"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className={`mt-auto border-t p-3 ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
            <button type="button" onClick={() => navigate("/login")} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-[#f2383d]">
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b px-5 sm:px-8 ${darkMode ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white"}`}>
            <div className={`flex h-[42px] w-full max-w-[490px] items-center gap-3 rounded-full px-4 ${darkMode ? "bg-slate-800" : "bg-[#f3f5f9]"}`}>
              <Search size={18} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates, roles, interviewers..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={16} className="text-slate-500" />
                </button>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
              <button type="button" aria-label="Notifications" className="relative rounded-full p-2 text-slate-500 hover:bg-gray-100">
                <Bell size={20} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f2383d]" />
              </button>
              <button type="button" onClick={() => setDarkMode((v) => !v)} aria-label="Toggle dark mode" className="rounded-full p-2 text-slate-500 hover:bg-gray-100">
                <Moon size={20} />
              </button>
              <div className={`hidden h-8 w-px sm:block ${darkMode ? "bg-slate-700" : "bg-gray-200"}`} />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">{adminName.charAt(0).toUpperCase()}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-sm font-semibold">{adminName}</span>
                  <span className="block text-xs text-slate-500">{departmentName}</span>
                </span>
                <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-6 sm:px-8 sm:py-7">
            <section className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">{heading[0]}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">{heading[1]}</h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">{heading[2]}</p>
            </section>

            {body}
          </main>
        </div>
      </div>

      {/* ASSIGN INTERVIEWER MODAL */}
      {assignFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setAssignFor(null)}>
          <div role="dialog" aria-modal="true" className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${modalCls}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setAssignFor(null)} aria-label="Close" className="absolute right-5 top-5 rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <X size={20} />
            </button>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f2383d]">Assign Interviewer</p>
            <h2 className="pr-10 text-xl font-bold">{assignFor.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{assignFor.role}</p>
            <div className="mt-5 space-y-2">
              {interviewers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => assignInterviewer(p.name)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-[#f2383d] ${darkMode ? "border-slate-700" : "border-slate-200"}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-[#f2383d]">{p.name.charAt(0)}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{p.name}</span>
                    <span className="block text-xs text-slate-500">{p.role}</span>
                  </span>
                  <Badge value={p.availability} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setScheduleOpen(false)}>
          <div role="dialog" aria-modal="true" className={`relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8 ${modalCls}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setScheduleOpen(false)} aria-label="Close" className="absolute right-5 top-5 rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <X size={20} />
            </button>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f2383d]">Interview</p>
            <h2 className="pr-10 text-2xl font-bold">Schedule Interview</h2>
            <hr className={`my-5 ${darkMode ? "border-slate-800" : "border-gray-200"}`} />

            <form className="space-y-4" onSubmit={submitSchedule}>
              {[
                { id: "candidate", label: "Candidate", type: "select", options: applicants.filter((a) => !["Rejected", "Selected"].includes(a.status)).map((a) => a.name) },
                { id: "round", label: "Round", type: "select", options: ["Technical Round", "HR Round", "Managerial Round"], noPlaceholder: true },
                { id: "interviewer", label: "Interviewer", type: "select", options: interviewers.map((p) => p.name) },
              ].map(({ id, label, options, noPlaceholder }) => (
                <div key={id}>
                  <label htmlFor={`s-${id}`} className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</label>
                  <select id={`s-${id}`} required value={scheduleForm[id]} onChange={(e) => setScheduleForm({ ...scheduleForm, [id]: e.target.value })} className={inputCls}>
                    {!noPlaceholder && <option value="">Select {label.toLowerCase()}</option>}
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="s-date" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</label>
                  <input id="s-date" type="date" required value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="s-time" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Time</label>
                  <input id="s-time" type="time" required value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="s-link" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Meeting Link</label>
                <input id="s-link" type="url" value={scheduleForm.link} onChange={(e) => setScheduleForm({ ...scheduleForm, link: e.target.value })} placeholder="https://meet.example.com/..." className={inputCls} />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setScheduleOpen(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#f2383d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
                  Schedule
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
