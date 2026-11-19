import { useMemo, useState } from "react";
import { Search, Award, CheckCircle2, XCircle, Clock3 } from "lucide-react";

const initialCandidates = [
  {
    id: "APP-1005",
    name: "Rohit Kumar",
    position: "Frontend Developer",
    experience: "3 Years",
    completedStages: "L1, L2, L3",
    rating: 4.5,
    recommendation: "Strong Hire",
    status: "Awaiting Final Review",
  },
  {
    id: "APP-1006",
    name: "Meera Nair",
    position: "Backend Developer",
    experience: "4 Years",
    completedStages: "L1, L2",
    rating: 4,
    recommendation: "Hire",
    status: "Awaiting Final Review",
  },
  {
    id: "APP-1007",
    name: "Sandeep Rao",
    position: "Full Stack Developer",
    experience: "5 Years",
    completedStages: "L1, L2, L3",
    rating: 3.5,
    recommendation: "Hold",
    status: "Awaiting Final Review",
  },
];

export default function FinalReview() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [finalStatus, setFinalStatus] = useState("Selected");
  const [comments, setComments] = useState("");

  const filtered = useMemo(
    () =>
      candidates.filter((candidate) =>
        `${candidate.name} ${candidate.position} ${candidate.id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [candidates, search]
  );

  const submitFinalDecision = (event) => {
    event.preventDefault();

    if (!comments.trim()) {
      window.alert("Please provide final review comments.");
      return;
    }

    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === selected.id
          ? {
              ...candidate,
              status: finalStatus,
              finalComments: comments.trim(),
            }
          : candidate
      )
    );

    setSelected(null);
    setComments("");
    setFinalStatus("Selected");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Final Review</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review candidates who have completed the required interview stages and record the final outcome.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <Clock3 className="text-amber-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Awaiting Final Review</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{candidates.filter((item) => item.status === "Awaiting Final Review").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <CheckCircle2 className="text-green-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Selected</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{candidates.filter((item) => item.status === "Selected").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <XCircle className="text-red-600" size={21} />
          <p className="mt-3 text-sm text-gray-500">Not Selected</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{candidates.filter((item) => item.status === "Not Selected").length}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Candidates for Final Review</h2>
            <p className="text-sm text-gray-500">{filtered.length} candidates</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          {filtered.map((candidate) => (
            <div key={candidate.id} className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{candidate.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.position}</p>
                  <p className="mt-1 text-xs text-gray-400">{candidate.id}</p>
                </div>
                <Award className="text-amber-500" size={23} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{candidate.experience}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Overall Rating</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{candidate.rating}/5</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed Stages</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{candidate.completedStages}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recommendation</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{candidate.recommendation}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${candidate.status === "Selected" ? "bg-green-50 text-green-700" : candidate.status === "Not Selected" ? "bg-red-50 text-red-700" : candidate.status === "On Hold" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                  {candidate.status}
                </span>
                <button
                  type="button"
                  disabled={candidate.status !== "Awaiting Final Review"}
                  onClick={() => setSelected(candidate)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Complete Final Review
                </button>
              </div>

              {candidate.finalComments && (
                <p className="mt-3 text-sm text-gray-500">Final comment: {candidate.finalComments}</p>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-gray-500 lg:col-span-2">No candidates found.</p>}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitFinalDecision} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Final Review</h2>
            <p className="mt-1 text-sm text-gray-500">{selected.name} · {selected.position}</p>

            <label className="mt-5 block text-sm font-medium text-gray-700 dark:text-gray-300">Final Outcome</label>
            <select value={finalStatus} onChange={(event) => setFinalStatus(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option>Selected</option>
              <option>Not Selected</option>
              <option>On Hold</option>
            </select>

            <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Final Review Comments <span className="text-red-500">*</span></label>
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows="4" placeholder="Enter final review comments..." className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Save Final Outcome</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}