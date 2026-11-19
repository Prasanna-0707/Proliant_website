import { useMemo, useState } from "react";
import { Search, History, CheckCircle2, UserPlus, ClipboardCheck, XCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    action: "Interview decision approved",
    description: "Approved Priya Kumar for the next interview stage.",
    user: "Hiring Manager",
    candidate: "Priya Kumar",
    category: "Decision",
    date: "Nov 10, 2026",
    time: "10:30 AM",
  },
  {
    id: 2,
    action: "Interviewer assigned",
    description: "Ananya Reddy assigned to Rahul Sharma for L1 Interview.",
    user: "Hiring Manager",
    candidate: "Rahul Sharma",
    category: "Assignment",
    date: "Nov 10, 2026",
    time: "09:45 AM",
  },
  {
    id: 3,
    action: "Evaluation reviewed",
    description: "Reviewed technical evaluation submitted by Kiran Rao.",
    user: "Hiring Manager",
    candidate: "Priya Kumar",
    category: "Evaluation",
    date: "Nov 09, 2026",
    time: "04:15 PM",
  },
  {
    id: 4,
    action: "Candidate put on hold",
    description: "Candidate moved to hold for further discussion.",
    user: "Hiring Manager",
    candidate: "Arjun Reddy",
    category: "Decision",
    date: "Nov 09, 2026",
    time: "02:00 PM",
  },
  {
    id: 5,
    action: "Final review completed",
    description: "Completed final review for a candidate.",
    user: "Hiring Manager",
    candidate: "Meera Nair",
    category: "Final Review",
    date: "Nov 08, 2026",
    time: "11:20 AM",
  },
];

const categoryStyles = {
  Decision: "bg-green-50 text-green-700",
  Assignment: "bg-blue-50 text-blue-700",
  Evaluation: "bg-purple-50 text-purple-700",
  "Final Review": "bg-amber-50 text-amber-700",
};

const categoryIcons = {
  Decision: CheckCircle2,
  Assignment: UserPlus,
  Evaluation: ClipboardCheck,
  "Final Review": XCircle,
};

export default function ActivityHistory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesSearch = `${activity.action} ${activity.description} ${activity.candidate}`
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesSearch && (category === "All" || activity.category === category);
      }),
    [search, category]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track hiring decisions, interviewer assignments, and review activities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <History className="text-blue-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Total Activities</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{activities.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <CheckCircle2 className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Decision Activities</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{activities.filter((item) => item.category === "Decision").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <UserPlus className="text-purple-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Assignments</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{activities.filter((item) => item.category === "Assignment").length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Hiring Activity Log</h2>
            <p className="text-sm text-gray-500">{filteredActivities.length} activities found</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56" />
            </div>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option>All</option>
              <option>Decision</option>
              <option>Assignment</option>
              <option>Evaluation</option>
              <option>Final Review</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredActivities.map((activity) => {
            const Icon = categoryIcons[activity.category];

            return (
              <div key={activity.id} className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">{activity.action}</h3>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${categoryStyles[activity.category]}`}>
                      {activity.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>Candidate: {activity.candidate}</span>
                    <span>By: {activity.user}</span>
                    <span>{activity.date} · {activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredActivities.length === 0 && (
            <p className="p-10 text-center text-sm text-gray-500">No activities match your filters.</p>
          )}
        </div>
      </section>
    </div>
  );
}