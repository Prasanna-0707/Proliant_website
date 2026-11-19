import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

const ScreeningChecklist = ({ application, onContinue }) => {
  const [checked, setChecked] = useState({
    skills: false,
    experience: false,
    education: false,
    jobRequirements: false,
  });

  if (!application) return null;

  const criteria = [
    {
      key: "skills",
      title: "Required Skills",
      description: `Candidate skills: ${(application.skills || []).join(", ") || "Not provided"}`,
    },
    {
      key: "experience",
      title: "Relevant Experience",
      description: `Candidate experience: ${application.experience || "Not provided"}`,
    },
    {
      key: "education",
      title: "Education Qualification",
      description: `Candidate education: ${application.education || "Not provided"}`,
    },
    {
      key: "jobRequirements",
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

      <button
        type="button"
        disabled={completedCount !== criteria.length}
        onClick={() => onContinue(checked)}
        className="w-full rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Continue to Screening Decision
      </button>
    </div>
  );
};

export default ScreeningChecklist;