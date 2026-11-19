import { useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Video, Search } from "lucide-react";

const initialInterviews = [
  {
    id: "INT-1001",
    candidate: "Rahul Sharma",
    position: "Frontend Developer",
    stage: "L1 Interview",
    interviewer: "Ananya Reddy",
    date: "2026-11-12",
    time: "10:00 AM",
    mode: "Online",
    status: "Scheduled",
  },
  {
    id: "INT-1002",
    candidate: "Priya Kumar",
    position: "Backend Developer",
    stage: "L2 Interview",
    interviewer: "Kiran Rao",
    date: "2026-11-12",
    time: "11:30 AM",
    mode: "Online",
    status: "Scheduled",
  },
  {
    id: "INT-1003",
    candidate: "Arjun Reddy",
    position: "Full Stack Developer",
    stage: "L1 Interview",
    interviewer: "Sneha Patel",
    date: "2026-11-13",
    time: "02:00 PM",
    mode: "Onsite",
    status: "Rescheduled",
  },
  {
    id: "INT-1004",
    candidate: "Sneha Verma",
    position: "UI/UX Designer",
    stage: "L3 Interview",
    interviewer: "Vikram Singh",
    date: "2026-11-14",
    time: "03:30 PM",
    mode: "Online",
    status: "Scheduled",
  },
];

export default function InterviewSchedule() {
  const [interviews] = useState(initialInterviews);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredInterviews = useMemo(
    () =>
      interviews.filter((interview) => {
        const matchesSearch = [
          interview.candidate,
          interview.position,
          interview.interviewer,
          interview.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        return matchesSearch && (!dateFilter || interview.date === dateFilter);
      }),
    [interviews, search, dateFilter]
  );

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Schedule</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View upcoming interviews and coordinate interview schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <CalendarDays className="text-blue-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Total Scheduled</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{interviews.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Clock className="text-amber-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Online Interviews</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {interviews.filter((item) => item.mode === "Online").length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <MapPin className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Onsite Interviews</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {interviews.filter((item) => item.mode === "Onsite").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Scheduled Interviews</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search interviews..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 sm:w-52 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredInterviews.map((interview) => (
            <div key={interview.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30">
                  <CalendarDays size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{interview.candidate}</h3>
                  <p className="text-sm text-gray-500">{interview.position} · {interview.stage}</p>
                  <p className="mt-1 text-xs text-gray-400">{interview.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:min-w-120">
                <div>
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">{formatDate(interview.date)}</p>
                  <p className="text-gray-500">{interview.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Interviewer</p>
                  <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">{interview.interviewer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mode</p>
                  <p className="mt-1 flex items-center gap-1 font-medium text-gray-700 dark:text-gray-200">
                    {interview.mode === "Online" ? <Video size={15} /> : <MapPin size={15} />}
                    {interview.mode}
                  </p>
                  <span className="mt-1 inline-block text-xs text-green-600">{interview.status}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredInterviews.length === 0 && (
            <p className="p-10 text-center text-sm text-gray-500">No interviews match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}