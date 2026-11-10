import { useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, Clock3, MessageSquareText } from "lucide-react";

const initialDecisions = [
  {
    id: "DEC-1001",
    candidate: "Priya Kumar",
    applicationId: "APP-1002",
    position: "Backend Developer",
    stage: "L2 Interview",
    interviewer: "Kiran Rao",
    rating: 4,
    recommendation: "Strong Hire",
    feedback: "Strong backend fundamentals and good problem-solving ability.",
    status: "Pending Decision",
  },
  {
    id: "DEC-1002",
    candidate: "Sneha Verma",
    applicationId: "APP-1004",
    position: "UI/UX Designer",
    stage: "L3 Interview",
    interviewer: "Vikram Singh",
    rating: 3,
    recommendation: "Hire",
    feedback: "Good design skills. Needs improvement in design systems.",
    status: "Pending Decision",
  },
  {
    id: "DEC-1003",
    candidate: "Rahul Sharma",
    applicationId: "APP-1001",
    position: "Frontend Developer",
    stage: "L1 Interview",
    interviewer: "Ananya Reddy",
    rating: 2,
    recommendation: "No Hire",
    feedback: "Candidate needs stronger JavaScript fundamentals.",
    status: "Pending Decision",
  },
];

export default function HiringDecisions() {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("Approve Next Stage");
  const [comments, setComments] = useState("");

  const filtered = useMemo(
    () =>
      decisions.filter((item) =>
        `${item.candidate} ${item.position} ${item.applicationId}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [decisions, search]
  );

  const submitDecision = (event) => {
    event.preventDefault();

    if (!selected) return;

    if (!comments.trim()) {
      window.alert("Please enter a decision comment.");
      return;
    }

    setDecisions((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status:
                decision === "Approve Next Stage"
                  ? "Approved"
                  : decision === "Reject Candidate"
                    ? "Rejected"
                    : "On Hold",
              managerComment: comments.trim(),
            }
          : item
      )
    );

    setSelected(null);
    setComments("");
    setDecision("Approve Next Stage");
  };

  const pendingCount = decisions.filter((item) => item.status === "Pending Decision").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hiring Decisions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review interviewer recommendations and decide the candidate's next step.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Clock3 className="text-amber-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Pending Decisions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <CheckCircle2 className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Approved</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{decisions.filter((item) => item.status === "Approved").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <XCircle className="text-red-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{decisions.filter((item) => item.status === "Rejected").length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Candidates Awaiting Decision</h2>
            <p className="text-sm text-gray-500">{filtered.length} candidates</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56" />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.candidate}</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{item.applicationId}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.position} · {item.stage}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Interviewer: {item.interviewer} · Rating: {item.rating}/5 · Recommendation: {item.recommendation}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{item.feedback}</p>
                {item.managerComment && <p className="mt-2 text-xs text-gray-500">Manager comment: {item.managerComment}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Approved" ? "bg-green-50 text-green-700" : item.status === "Rejected" ? "bg-red-50 text-red-700" : item.status === "On Hold" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                  {item.status}
                </span>
                <button type="button" disabled={item.status !== "Pending Decision"} onClick={() => setSelected(item)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300">
                  Make Decision
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="p-10 text-center text-sm text-gray-500">No candidates found.</p>}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitDecision} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hiring Decision</h2>
            <p className="mt-1 text-sm text-gray-500">{selected.candidate} · {selected.position}</p>

            <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-xs text-gray-500">Interviewer Recommendation</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">{selected.recommendation} · {selected.rating}/5</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selected.feedback}</p>
            </div>

            <label className="mt-5 block text-sm font-medium text-gray-700 dark:text-gray-300">Your Decision</label>
            <select value={decision} onChange={(event) => setDecision(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option>Approve Next Stage</option>
              <option>Reject Candidate</option>
              <option>Put On Hold</option>
            </select>

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Decision Comments <span className="text-red-500">*</span>
            </label>
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows="4" placeholder="Explain the reason for your decision..." className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Submit Decision</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}