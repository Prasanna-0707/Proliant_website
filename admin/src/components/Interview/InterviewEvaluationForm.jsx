import { useEffect, useState } from "react";
import { X } from "lucide-react";

const InterviewEvaluationForm = ({
  candidate,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [decision, setDecision] = useState("Pending");

  useEffect(() => {
    if (candidate) {
      setFeedback(candidate.feedback || "");
      setScore(candidate.score || "");
      setDecision(candidate.decision || "Pending");
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      window.alert("Please enter interview feedback.");
      return;
    }

    onSubmit({
      ...candidate,
      feedback: feedback.trim(),
      score,
      decision,
      status: "Completed",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Interview Evaluation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {candidate.candidateName} · {candidate.round}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Interview Feedback
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter candidate interview feedback..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Score (Out of 10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Interview Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-400"
            >
              <option value="Pending">Pending</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewEvaluationForm;