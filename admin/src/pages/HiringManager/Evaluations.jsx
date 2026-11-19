import { useMemo, useState } from "react";
import { Search, ClipboardCheck, Star, Eye, X } from "lucide-react";

const initialEvaluations = [
  {
    id: "EVAL-1001",
    candidate: "Priya Kumar",
    applicationId: "APP-1002",
    position: "Backend Developer",
    stage: "L2 Interview",
    interviewer: "Kiran Rao",
    submittedOn: "Nov 09, 2026",
    rating: 4,
    recommendation: "Strong Hire",
    strengths: "Good knowledge of Node.js, API design, and database concepts.",
    concerns: "Needs more exposure to cloud deployment.",
    feedback: "Candidate demonstrated strong technical fundamentals and problem-solving skills.",
    status: "Pending Review",
  },
  {
    id: "EVAL-1002",
    candidate: "Sneha Verma",
    applicationId: "APP-1004",
    position: "UI/UX Designer",
    stage: "L3 Interview",
    interviewer: "Vikram Singh",
    submittedOn: "Nov 10, 2026",
    rating: 3,
    recommendation: "Hire",
    strengths: "Good design thinking and Figma skills.",
    concerns: "Needs improvement in design system architecture.",
    feedback: "Candidate has a good design foundation and communicates ideas clearly.",
    status: "Pending Review",
  },
  {
    id: "EVAL-1003",
    candidate: "Arjun Reddy",
    applicationId: "APP-1003",
    position: "Full Stack Developer",
    stage: "L1 Interview",
    interviewer: "Sneha Patel",
    submittedOn: "Nov 10, 2026",
    rating: 4,
    recommendation: "Strong Hire",
    strengths: "Strong JavaScript and React fundamentals.",
    concerns: "Minor gaps in system design.",
    feedback: "Candidate performed well in the technical round.",
    status: "Reviewed",
  },
];

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filteredEvaluations = useMemo(
    () =>
      evaluations.filter((item) => {
        const matchesSearch = `${item.candidate} ${item.position} ${item.interviewer} ${item.applicationId}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesFilter =
          filter === "All" ||
          (filter === "Pending" && item.status === "Pending Review") ||
          (filter === "Reviewed" && item.status === "Reviewed");

        return matchesSearch && matchesFilter;
      }),
    [evaluations, search, filter]
  );

  const markReviewed = (id) => {
    setEvaluations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Reviewed" } : item
      )
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Evaluations</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review interviewer feedback and recommendations before making hiring decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <ClipboardCheck className="text-blue-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Total Evaluations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{evaluations.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Eye className="text-amber-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{evaluations.filter((item) => item.status === "Pending Review").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Star className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Reviewed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{evaluations.filter((item) => item.status === "Reviewed").length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Submitted Evaluations</h2>
            <p className="text-sm text-gray-500">{filteredEvaluations.length} records</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search evaluations..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56" />
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option>All</option>
              <option>Pending</option>
              <option>Reviewed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Interview Stage</th>
                <th className="px-5 py-3">Interviewer</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Recommendation</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredEvaluations.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{item.candidate}</p>
                    <p className="text-xs text-gray-500">{item.applicationId} · {item.position}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.stage}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.interviewer}</td>
                  <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-200">{item.rating}/5</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.recommendation}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Reviewed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setSelected(item)} className="font-medium text-red-600 hover:text-red-700">Review</button>
                  </td>
                </tr>
              ))}
              {filteredEvaluations.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-500">No evaluations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Evaluation Details</h2>
                <p className="mt-1 text-sm text-gray-500">{selected.id} · {selected.applicationId}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} /></button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-gray-500">Candidate</p><p className="mt-1 font-medium text-gray-900 dark:text-white">{selected.candidate}</p></div>
              <div><p className="text-xs text-gray-500">Position</p><p className="mt-1 font-medium text-gray-900 dark:text-white">{selected.position}</p></div>
              <div><p className="text-xs text-gray-500">Interview Stage</p><p className="mt-1 font-medium text-gray-900 dark:text-white">{selected.stage}</p></div>
              <div><p className="text-xs text-gray-500">Interviewer</p><p className="mt-1 font-medium text-gray-900 dark:text-white">{selected.interviewer}</p></div>
              <div><p className="text-xs text-gray-500">Rating</p><p className="mt-1 font-semibold text-gray-900 dark:text-white">{selected.rating}/5</p></div>
              <div><p className="text-xs text-gray-500">Recommendation</p><p className="mt-1 font-semibold text-gray-900 dark:text-white">{selected.recommendation}</p></div>
            </div>

            <div className="mt-5 space-y-4">
              <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Strengths</h3><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selected.strengths}</p></div>
              <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Areas of Improvement</h3><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selected.concerns}</p></div>
              <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Interviewer Feedback</h3><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{selected.feedback}</p></div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">Close</button>
              {selected.status !== "Reviewed" && (
                <button type="button" onClick={() => markReviewed(selected.id)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Mark as Reviewed</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}