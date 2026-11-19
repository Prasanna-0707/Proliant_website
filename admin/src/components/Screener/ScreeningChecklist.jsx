import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

// Calls onContinue({ skillsMatch, experienceMatch, educationMatch,
// requirementsMatch, additionalNotes }) which the page saves with
// PUT /api/screenings/applications/:id/checklist.
const ScreeningChecklist = ({ application, onContinue, saving = false, error = "" }) => {
  const [checked, setChecked] = useState({
    skillsMatch: application?.checklist?.skillsMatch === true,
    experienceMatch: application?.checklist?.experienceMatch === true,
    educationMatch: application?.checklist?.educationMatch === true,
    requirementsMatch: application?.checklist?.requirementsMatch === true,
  });
  const [notes, setNotes] = useState(application?.checklist?.additionalNotes || "");

  if (!application) return null;

  const criteria = [
    {
      key: "skillsMatch",
      title: "Required Skills",
      description: `Area of interest: ${application.areaOfInterest || application.jobTitle || "Not provided"}`,
    },
    {
      key: "experienceMatch",
      title: "Relevant Experience",
      description: `Candidate experience: ${application.experience || "Not provided"}`,
    },
    {
      key: "educationMatch",
      title: "Education Qualification",
      description: `Candidate education: ${application.education || "Not provided"}`,
    },
    {
      key: "requirementsMatch",
      title: "Job Requirements",
      description: `Applied position: ${application.jobTitle}`,
    },
  ];

  const completedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Screening Checklist
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Review each criterion before submitting your recommendation.
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${(completedCount / criteria.length) * 100}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {completedCount} of {criteria.length} criteria reviewed
      </p>

      <div className="space-y-3">
        {criteria.map((criterion) => (
          <button
            type="button"
            key={criterion.key}
            onClick={() =>
              setChecked((previous) => ({
                ...previous,
                [criterion.key]: !previous[criterion.key],
              }))
            }
            className="flex w-full items-start gap-3 rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
          >
            {checked[criterion.key] ? (
              <CheckCircle2 className="mt-0.5 text-green-600" size={20} />
            ) : (
              <Circle className="mt-0.5 text-gray-400" size={20} />
            )}

            <span>
              <span className="block text-sm font-semibold text-gray-800">
                {criterion.title}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                {criterion.description}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="checklist-notes"
          className="mb-2 block text-xs font-semibold uppercase text-gray-500"
        >
          Additional notes
        </label>
        <textarea
          id="checklist-notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={completedCount !== criteria.length || saving}
        onClick={() => onContinue({ ...checked, additionalNotes: notes.trim() })}
        className="w-full rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {saving ? "Saving..." : "Continue to Screening Decision"}
      </button>
    </div>
  );
};

export default ScreeningChecklist;