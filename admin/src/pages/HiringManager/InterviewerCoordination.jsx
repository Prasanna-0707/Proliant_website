import { useMemo, useState } from "react";
import { Search, Users, CalendarCheck, BriefcaseBusiness, UserPlus } from "lucide-react";

const initialInterviewers = [
  {
    id: "EMP-101",
    name: "Ananya Reddy",
    role: "Senior Frontend Developer",
    department: "Engineering",
    assigned: 4,
    capacity: 6,
    availability: "Available",
    skills: ["React", "JavaScript", "UI"],
  },
  {
    id: "EMP-102",
    name: "Kiran Rao",
    role: "Backend Lead",
    department: "Engineering",
    assigned: 6,
    capacity: 6,
    availability: "Fully Booked",
    skills: ["Node.js", "Java", "APIs"],
  },
  {
    id: "EMP-103",
    name: "Sneha Patel",
    role: "Technical Lead",
    department: "Engineering",
    assigned: 2,
    capacity: 5,
    availability: "Available",
    skills: ["System Design", "Java", "Cloud"],
  },
  {
    id: "EMP-104",
    name: "Vikram Singh",
    role: "Design Lead",
    department: "Design",
    assigned: 3,
    capacity: 5,
    availability: "Available",
    skills: ["Figma", "UX", "Design Systems"],
  },
];

const initialAssignments = [
  { id: "ASG-001", candidate: "Rahul Sharma", stage: "L1 Interview", interviewer: "Ananya Reddy", date: "Nov 12, 2026" },
  { id: "ASG-002", candidate: "Priya Kumar", stage: "L2 Interview", interviewer: "Kiran Rao", date: "Nov 12, 2026" },
  { id: "ASG-003", candidate: "Arjun Reddy", stage: "L1 Interview", interviewer: "Sneha Patel", date: "Nov 13, 2026" },
];

export default function InterviewerCoordination() {
  const [interviewers] = useState(initialInterviewers);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    candidate: "",
    stage: "L1 Interview",
    interviewer: "",
    date: "",
  });

  const filteredInterviewers = useMemo(
    () =>
      interviewers.filter((person) =>
        `${person.name} ${person.role} ${person.department}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [interviewers, search]
  );

  const handleAssign = (event) => {
    event.preventDefault();

    if (!form.candidate.trim() || !form.interviewer || !form.date) {
      window.alert("Please complete all assignment fields.");
      return;
    }

    const newAssignment = {
      id: `ASG-${String(assignments.length + 1).padStart(3, "0")}`,
      candidate: form.candidate.trim(),
      stage: form.stage,
      interviewer: form.interviewer,
      date: new Date(`${form.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setAssignments((current) => [newAssignment, ...current]);
    setForm({ candidate: "", stage: "L1 Interview", interviewer: "", date: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interviewer Coordination</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage interviewer availability, workload, and candidate assignments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          <UserPlus size={17} /> Assign Interviewer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Candidate Name</label>
            <input
              value={form.candidate}
              onChange={(event) => setForm({ ...form, candidate: event.target.value })}
              placeholder="Enter candidate name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Interview Stage</label>
            <select
              value={form.stage}
              onChange={(event) => setForm({ ...form, stage: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option>L1 Interview</option>
              <option>L2 Interview</option>
              <option>L3 Interview</option>
              <option>Final Review</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Interviewer</label>
            <select
              value={form.interviewer}
              onChange={(event) => setForm({ ...form, interviewer: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Select interviewer</option>
              {interviewers.filter((person) => person.availability === "Available").map((person) => (
                <option key={person.id} value={person.name}>{person.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Interview Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Save Assignment</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Users className="text-blue-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Total Interviewers</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{interviewers.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <CalendarCheck className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Available</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{interviewers.filter((person) => person.availability === "Available").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <BriefcaseBusiness className="text-purple-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Active Assignments</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Interviewer Workload</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search interviewers..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          {filteredInterviewers.map((person) => (
            <div key={person.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.role} · {person.department}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${person.availability === "Available" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {person.availability}
                </span>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-500">Assigned interviews</span>
                <span className="font-medium text-gray-900 dark:text-white">{person.assigned}/{person.capacity}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${(person.assigned / person.capacity) * 100}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {person.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Current Interview Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60">
              <tr>
                <th className="px-5 py-3">Assignment ID</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Interviewer</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {assignments.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 text-gray-500">{item.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{item.candidate}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.stage}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.interviewer}</td>
                  <td className="px-5 py-4 text-gray-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}