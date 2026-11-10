import { useMemo, useState } from "react";
import { Search, Filter, Eye, ChevronRight } from "lucide-react";

const initialCandidates = [
  {
    id: "APP-1001",
    name: "Rahul Sharma",
    position: "Frontend Developer",
    email: "rahul@example.com",
    stage: "L1 Interview",
    interviewer: "Ananya Reddy",
    appliedOn: "Nov 02, 2026",
    status: "In Progress",
  },
  {
    id: "APP-1002",
    name: "Priya Kumar",
    position: "Backend Developer",
    email: "priya@example.com",
    stage: "L2 Interview",
    interviewer: "Kiran Rao",
    appliedOn: "Nov 03, 2026",
    status: "Evaluation Pending",
  },
  {
    id: "APP-1003",
    name: "Arjun Reddy",
    position: "Full Stack Developer",
    email: "arjun@example.com",
    stage: "L1 Interview",
    interviewer: "Sneha Patel",
    appliedOn: "Nov 04, 2026",
    status: "In Progress",
  },
  {
    id: "APP-1004",
    name: "Sneha Verma",
    position: "UI/UX Designer",
    email: "sneha@example.com",
    stage: "L3 Interview",
    interviewer: "Vikram Singh",
    appliedOn: "Nov 05, 2026",
    status: "Evaluation Submitted",
  },
  {
    id: "APP-1005",
    name: "Rohit Kumar",
    position: "Frontend Developer",
    email: "rohit@example.com",
    stage: "Final Review",
    interviewer: "Ananya Reddy",
    appliedOn: "Nov 06, 2026",
    status: "Decision Required",
  },
];

const stages = ["All Stages", "L1 Interview", "L2 Interview", "L3 Interview", "Final Review"];

const statusStyles = {
  "In Progress": "bg-blue-50 text-blue-700",
  "Evaluation Pending": "bg-amber-50 text-amber-700",
  "Evaluation Submitted": "bg-purple-50 text-purple-700",
  "Decision Required": "bg-rose-50 text-rose-700",
};

export default function InterviewPipeline() {
  const [candidates] = useState(initialCandidates);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = [
        candidate.name,
        candidate.id,
        candidate.position,
        candidate.interviewer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStage =
        selectedStage === "All Stages" || candidate.stage === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [candidates, search, selectedStage]);

  const stageCounts = stages.slice(1).map((stage) => ({
    name: stage,
    count: candidates.filter((candidate) => candidate.stage === stage).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Interview Pipeline
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track candidates across interview stages and monitor their progress.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stageCounts.map((stage) => (
          <div
            key={stage.name}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stage.name}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {stage.count}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Candidate Pipeline
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredCandidates.length} candidates found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search candidates..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 sm:w-56 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedStage}
                onChange={(event) => setSelectedStage(event.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 sm:w-48 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
              <tr>
                <th className="px-5 py-4">Candidate</th>
                <th className="px-5 py-4">Job Position</th>
                <th className="px-5 py-4">Current Stage</th>
                <th className="px-5 py-4">Interviewer</th>
                <th className="px-5 py-4">Applied On</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                    <p className="text-xs text-gray-500">{candidate.id}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                    {candidate.position}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {candidate.stage}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                    {candidate.interviewer}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{candidate.appliedOn}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[candidate.status]}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => window.alert(`Candidate: ${candidate.name}\nApplication: ${candidate.id}`)}
                      className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700"
                    >
                      <Eye size={15} /> View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}