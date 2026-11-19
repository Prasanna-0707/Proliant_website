
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardCheck,
  UserRound,
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock3,
  CheckCircle2,
  CircleAlert,
  FileText,
  Video,
  BriefcaseBusiness,
  Menu,
  X,
  ArrowRight,
  Star,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

const interviewer = {
  name: localStorage.getItem("interviewerName") || "Interviewer",
  role: localStorage.getItem("interviewerRole") || "Technical Interviewer",
};

const initialInterviews = [
  {
    id: 1,
    candidate: "Rahul Sharma",
    position: "SAP SD Consultant",
    round: "Technical Interview - L1",
    date: "23 Oct 2026",
    time: "10:30 AM",
    duration: "45 min",
    mode: "Video Interview",
    status: "Upcoming",
  },
  {
    id: 2,
    candidate: "Priya Reddy",
    position: "SAP ABAP Developer",
    round: "Technical Interview - L2",
    date: "23 Oct 2026",
    time: "02:00 PM",
    duration: "60 min",
    mode: "Video Interview",
    status: "Upcoming",
  },
  {
    id: 3,
    candidate: "Arjun Kumar",
    position: "Data Analyst",
    round: "Technical Interview - L1",
    date: "22 Oct 2026",
    time: "11:00 AM",
    duration: "45 min",
    mode: "Video Interview",
    status: "Completed",
  },
];

const initialCandidates = [
  {
    id: 101,
    name: "Rahul Sharma",
    position: "SAP SD Consultant",
    round: "L1 Technical",
    date: "23 Oct 2026",
    status: "Interview Scheduled",
  },
  {
    id: 102,
    name: "Priya Reddy",
    position: "SAP ABAP Developer",
    round: "L2 Technical",
    date: "23 Oct 2026",
    status: "Interview Scheduled",
  },
  {
    id: 103,
    name: "Arjun Kumar",
    position: "Data Analyst",
    round: "L1 Technical",
    date: "22 Oct 2026",
    status: "Feedback Pending",
  },
];

const initialFeedback = [
  {
    id: 103,
    candidate: "Arjun Kumar",
    position: "Data Analyst",
    round: "L1 Technical",
    date: "22 Oct 2026",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Interviews", icon: CalendarDays },
  { label: "Assigned Candidates", icon: Users },
  { label: "Interview Feedback", icon: ClipboardCheck },
  { label: "Profile", icon: UserRound },
  { label: "Settings", icon: Settings },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100";

export default function InterviewerDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [interviews, setInterviews] = useState(initialInterviews);
  const [candidates, setCandidates] = useState(initialCandidates);

  const firstName = interviewer.name.trim().split(/\s+/)[0];

  const pendingFeedback = initialFeedback.filter(
    (item) => !submittedFeedback[item.id]
  );

  const filteredInterviews = useMemo(() => {
    const query = search.toLowerCase();

    return interviews.filter((item) =>
      [
        item.candidate,
        item.position,
        item.round,
        item.status,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [interviews, search]);

  const filteredCandidates = useMemo(() => {
    const query = search.toLowerCase();

    return candidates.filter((item) =>
      [
        item.name,
        item.position,
        item.round,
        item.status,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [candidates, search]);

  const completedCount = interviews.filter(
    (item) => item.status === "Completed"
  ).length;

  const upcomingCount = interviews.filter(
    (item) => item.status === "Upcoming"
  ).length;

  const handleNavigation = (label) => {
    setActiveNav(label);
    setSearch("");
    setMobileMenu(false);
    setSelectedCandidate(null);
  };

  const handleLogout = () => {
    // Use your existing interviewer authentication logout
    // logic here if it uses a token.
    localStorage.removeItem("interviewerToken");
    localStorage.removeItem("interviewerName");
    localStorage.removeItem("interviewerRole");
    window.location.href = "/interviewer/login";
  };

  const openFeedback = (candidate) => {
    setSelectedCandidate(candidate);
    setActiveNav("Interview Feedback");
  };

  const updateFeedback = (id, field, value) => {
    setFeedback((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        [field]: value,
      },
    }));
  };

  const submitFeedback = (candidate) => {
    const evaluation = feedback[candidate.id] || {};

    if (
      !evaluation.rating ||
      !evaluation.recommendation ||
      !evaluation.comments?.trim()
    ) {
      window.alert(
        "Please provide a rating, recommendation, and feedback comments."
      );
      return;
    }

    // Demo-only state update. Connect this to your backend API
    // to persist the actual interview evaluation.
    setSubmittedFeedback((previous) => ({
      ...previous,
      [candidate.id]: true,
    }));

    setCandidates((previous) =>
      previous.map((item) =>
        item.id === candidate.id
          ? { ...item, status: "Feedback Submitted" }
          : item
      )
    );

    setInterviews((previous) =>
      previous.map((item) =>
        item.id === candidate.id
          ? { ...item, status: "Completed" }
          : item
      )
    );

    setSelectedCandidate(null);
    setActiveNav("Interview Feedback");
  };

  const isDark = darkMode;

  const pageBg = isDark ? "bg-slate-950 text-white" : "bg-[#f7f9fc] text-[#101c30]";
  const cardBg = isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white";
  const headerBg = isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  const StatusBadge = ({ status }) => {
    const styles = {
      Upcoming: "bg-blue-50 text-blue-700",
      Completed: "bg-emerald-50 text-emerald-700",
      "Feedback Pending": "bg-orange-50 text-orange-700",
      "Feedback Submitted": "bg-emerald-50 text-emerald-700",
      "Interview Scheduled": "bg-blue-50 text-blue-700",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
          styles[status] || "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const SectionTitle = ({ title, description, icon: Icon }) => (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className={`mt-1 text-sm ${mutedText}`}>{description}</p>
      </div>
    </div>
  );

  const Card = ({ children, className = "" }) => (
    <section
      className={`rounded-xl border p-5 shadow-sm sm:p-6 ${cardBg} ${className}`}
    >
      {children}
    </section>
  );

  const renderDashboard = () => (
    <>
      <section className="relative mb-6 flex min-h-[110px] items-center justify-between gap-5 overflow-hidden">
        <div className="relative z-10 min-w-0">
          <h1 className="text-[27px] font-bold leading-tight tracking-tight sm:text-[32px]">
            Good morning,{" "}
            <span className="text-[#f2383d]">{firstName}!</span>
          </h1>
          <p className={`mt-2 max-w-[650px] text-sm leading-6 sm:text-base ${mutedText}`}>
            Manage your interviews, review assigned candidates, and submit
            timely feedback to help your team make informed hiring decisions.
          </p>
        </div>

        <div className="hidden h-[115px] w-[205px] shrink-0 items-center justify-center rounded-full bg-red-50/80 md:flex">
          <div className="relative flex h-[85px] w-[145px] items-end justify-center">
            <div className="absolute bottom-0 left-2 h-12 w-8 rounded-t-full bg-blue-200" />
            <div className="absolute bottom-0 right-2 h-14 w-8 rounded-t-full bg-emerald-200" />
            <div className="relative z-10 flex h-16 w-16 flex-col items-center">
              <div className="h-7 w-7 rounded-full bg-[#f6c7a7]" />
              <div className="h-9 w-12 rounded-t-xl bg-[#f2383d]" />
            </div>
            <div className="absolute bottom-0 z-20 h-3 w-24 rounded-sm bg-slate-800" />
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Interviews",
            value: interviews.length,
            icon: CalendarDays,
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Upcoming Interviews",
            value: upcomingCount,
            icon: Clock3,
            color: "bg-orange-50 text-orange-600",
          },
          {
            title: "Completed Interviews",
            value: completedCount,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Pending Feedback",
            value: pendingFeedback.length,
            icon: CircleAlert,
            color: "bg-red-50 text-[#f2383d]",
          },
        ].map(({ title, value, icon: Icon, color }) => (
          <Card key={title} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-sm ${mutedText}`}>{title}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Upcoming Interviews"
            description="Review your scheduled candidate interviews."
            icon={CalendarCheck}
          />
          <button
            onClick={() => handleNavigation("My Interviews")}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {interviews
            .filter((item) => item.status === "Upcoming")
            .slice(0, 3)
            .map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#f2383d]">
                    <UserRound size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold">{item.candidate}</h3>
                    <p className={`mt-1 text-sm ${mutedText}`}>
                      {item.position} · {item.round}
                    </p>
                  </div>
                </div>

                <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${mutedText}`}>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={15} /> {item.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} /> {item.time}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card className="mb-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Pending Interview Feedback"
            description="Complete evaluations for interviews you have conducted."
            icon={ClipboardCheck}
          />
          <button
            onClick={() => handleNavigation("Interview Feedback")}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#f2383d] hover:underline"
          >
            Review Feedback <ArrowRight size={16} />
          </button>
        </div>

        {pendingFeedback.length ? (
          <div className="space-y-3">
            {pendingFeedback.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  isDark ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <div>
                  <h3 className="font-bold">{item.candidate}</h3>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    {item.position} · {item.round} · {item.date}
                  </p>
                </div>
                <button
                  onClick={() => openFeedback(item)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#f2383d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#df3438]"
                >
                  Submit Feedback <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={`py-5 text-center text-sm ${mutedText}`}>
            No pending feedback.
          </p>
        )}
      </Card>
    </>
  );

  const renderInterviews = () => (
    <Card>
      <SectionTitle
        title="My Interviews"
        description="View your scheduled and completed interviews."
        icon={CalendarDays}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              {["Candidate", "Position / Round", "Date & Time", "Duration", "Status", "Action"].map((label) => (
                <th key={label} className={`px-4 py-4 font-semibold ${mutedText}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInterviews.map((item) => (
              <tr key={item.id} className={`border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <td className="px-4 py-5 font-semibold">{item.candidate}</td>
                <td className="px-4 py-5">
                  <p className="font-medium">{item.position}</p>
                  <p className={`mt-1 text-xs ${mutedText}`}>{item.round}</p>
                </td>
                <td className="px-4 py-5">
                  <p>{item.date}</p>
                  <p className={`mt-1 text-xs ${mutedText}`}>{item.time}</p>
                </td>
                <td className="px-4 py-5">{item.duration}</td>
                <td className="px-4 py-5"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-5">
                  <button
                    onClick={() => openFeedback(item)}
                    className="font-semibold text-[#f2383d] hover:underline"
                  >
                    {item.status === "Completed" ? "Feedback" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInterviews.length === 0 && (
          <p className={`py-8 text-center ${mutedText}`}>No interviews found.</p>
        )}
      </div>
    </Card>
  );

  const renderCandidates = () => (
    <Card>
      <SectionTitle
        title="Assigned Candidates"
        description="Review candidates assigned to your interview stages."
        icon={Users}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredCandidates.map((candidate) => (
          <article key={candidate.id} className={`rounded-xl border p-5 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-[#f2383d]">
                {candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{candidate.name}</h3>
                <p className={`mt-1 text-sm ${mutedText}`}>{candidate.position}</p>
                <p className={`mt-2 text-xs ${mutedText}`}>Interview round: {candidate.round}</p>
              </div>
            </div>

            <div className={`my-4 flex flex-wrap items-center gap-2 text-sm ${mutedText}`}>
              <CalendarDays size={16} /> {candidate.date}
            </div>

            <StatusBadge status={candidate.status} />

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => openFeedback(candidate)}
                className="flex items-center gap-2 rounded-lg bg-[#f2383d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#df3438]"
              >
                <ClipboardCheck size={16} /> Evaluate
              </button>
              <button
                onClick={() => window.alert("Resume preview must be connected to your application/resume API.")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                <FileText size={16} /> View Resume
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <p className={`py-8 text-center ${mutedText}`}>No assigned candidates found.</p>
      )}
    </Card>
  );

  const renderFeedback = () => (
    <Card>
      {selectedCandidate ? (
        <>
          <button
            onClick={() => setSelectedCandidate(null)}
            className="mb-5 text-sm font-semibold text-[#f2383d] hover:underline"
          >
            ← Back to Feedback
          </button>

          <SectionTitle
            title="Interview Evaluation"
            description="Record your assessment and hiring recommendation."
            icon={ClipboardCheck}
          />

          <div className={`mb-6 rounded-xl p-4 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            <h3 className="font-bold">{selectedCandidate.candidate || selectedCandidate.name}</h3>
            <p className={`mt-1 text-sm ${mutedText}`}>{selectedCandidate.position}</p>
            <p className={`mt-1 text-sm ${mutedText}`}>{selectedCandidate.round}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Overall Rating
              <select
                value={feedback[selectedCandidate.id]?.rating || ""}
                onChange={(event) => updateFeedback(selectedCandidate.id, "rating", event.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option value="">Select rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Below expectations</option>
                <option value="3">3 - Meets expectations</option>
                <option value="4">4 - Very good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Recommendation
              <select
                value={feedback[selectedCandidate.id]?.recommendation || ""}
                onChange={(event) => updateFeedback(selectedCandidate.id, "recommendation", event.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option value="">Select recommendation</option>
                <option value="Advance">Advance</option>
                <option value="Reject">Reject</option>
                <option value="Hold">Hold</option>
              </select>
            </label>
          </div>

          <label className="mt-5 block text-sm font-semibold">
            Strengths
            <textarea
              rows={3}
              value={feedback[selectedCandidate.id]?.strengths || ""}
              onChange={(event) => updateFeedback(selectedCandidate.id, "strengths", event.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Describe the candidate's strengths..."
            />
          </label>

          <label className="mt-5 block text-sm font-semibold">
            Concerns / Areas to Improve
            <textarea
              rows={3}
              value={feedback[selectedCandidate.id]?.concerns || ""}
              onChange={(event) => updateFeedback(selectedCandidate.id, "concerns", event.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Describe any concerns..."
            />
          </label>

          <label className="mt-5 block text-sm font-semibold">
            Interview Feedback <span className="text-[#f2383d]">*</span>
            <textarea
              rows={4}
              required
              value={feedback[selectedCandidate.id]?.comments || ""}
              onChange={(event) => updateFeedback(selectedCandidate.id, "comments", event.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Enter your interview observations and supporting comments..."
            />
          </label>

          <p className={`mt-3 text-xs ${mutedText}`}>
            Your recommendation is separate from the final hiring decision.
            An authorized decision-maker must record the actual stage decision.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => submitFeedback(selectedCandidate)}
              className="rounded-lg bg-[#f2383d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#df3438]"
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setSelectedCandidate(null)}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <SectionTitle
            title="Interview Feedback"
            description="Review outstanding evaluations and submitted feedback."
            icon={ClipboardCheck}
          />

          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <div>
                  <h3 className="font-bold">{candidate.name}</h3>
                  <p className={`mt-1 text-sm ${mutedText}`}>{candidate.position} · {candidate.round}</p>
                  <div className="mt-2"><StatusBadge status={candidate.status} /></div>
                </div>
                <button
                  onClick={() => openFeedback(candidate)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#f2383d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#df3438]"
                >
                  <MessageSquare size={16} />
                  {candidate.status === "Feedback Submitted" ? "View / Edit Demo" : "Evaluate Candidate"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );

  const renderProfile = () => (
    <Card>
      <SectionTitle
        title="Interviewer Profile"
        description="Your interviewer account information."
        icon={UserRound}
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f2383d] text-2xl font-bold text-white">
          {interviewer.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-bold">{interviewer.name}</h3>
          <p className={`mt-1 ${mutedText}`}>{interviewer.role}</p>
          <p className={`mt-2 text-sm ${mutedText}`}>
            Interviewer account · Proliant Data
          </p>
        </div>
      </div>
      <div className={`mt-6 rounded-xl border p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <p className={`text-sm ${mutedText}`}>
          Additional profile details can be connected to your user account API.
        </p>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <SectionTitle
        title="Settings"
        description="Customize your interviewer dashboard preferences."
        icon={Settings}
      />
      <div className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <div>
          <h3 className="font-semibold">Dark Mode</h3>
          <p className={`mt-1 text-sm ${mutedText}`}>Switch between light and dark appearance.</p>
        </div>
        <button
          onClick={() => setDarkMode((value) => !value)}
          className="rounded-lg bg-[#f2383d] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <h3 className="font-semibold">Interview Notifications</h3>
        <p className={`mt-1 text-sm ${mutedText}`}>
          Notification preferences and reminders can be connected to your backend.
        </p>
      </div>
    </Card>
  );

  const pageRenderers = {
    Dashboard: renderDashboard,
    "My Interviews": renderInterviews,
    "Assigned Candidates": renderCandidates,
    "Interview Feedback": renderFeedback,
    Profile: renderProfile,
    Settings: renderSettings,
  };

  const renderCurrentPage = pageRenderers[activeNav] || renderDashboard;

  return (
    <div className={`min-h-screen font-sans ${pageBg}`}>
      <div className="flex min-h-screen">
        {mobileMenu && (
          <button
            type="button"
            aria-label="Close navigation backdrop"
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r transition-transform duration-200 lg:static lg:translate-x-0 ${
            isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white"
          } ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className={`flex h-[70px] shrink-0 items-center border-b px-6 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            <div>
              <div className="mb-1 h-[6px] w-[44px] bg-[#f2383d]" />
              <span className={`text-[23px] font-extrabold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
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

          <div className="px-3 pt-7">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Interviewer Portal
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
                      : isDark
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

          <div className={`mt-auto border-t p-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-[#f2383d]"
            >
              <LogOut size={19} /> Logout
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b px-4 sm:px-8 ${headerBg}`}>
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-gray-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className={`flex h-[42px] w-full max-w-[490px] items-center gap-3 rounded-full px-4 ${isDark ? "bg-slate-800" : "bg-[#f3f5f9]"}`}>
              <Search size={18} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidates, positions, interviews..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-5">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => handleNavigation("Interview Feedback")}
                className="relative rounded-full p-2 text-slate-500 hover:bg-gray-100"
              >
                <Bell size={20} />
                {pendingFeedback.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f2383d]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle dark mode"
                className="rounded-full p-2 text-slate-500 hover:bg-gray-100"
              >
                <Moon size={20} />
              </button>

              <div className={`hidden h-8 w-px sm:block ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />

              <button
                type="button"
                onClick={() => handleNavigation("Profile")}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2383d] text-sm font-bold text-white">
                  {interviewer.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[150px] truncate text-sm font-semibold">{interviewer.name}</span>
                  <span className="block text-xs text-slate-500">Interviewer</span>
                </span>
                <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-8 sm:py-9">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}
