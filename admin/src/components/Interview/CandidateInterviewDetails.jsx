import { X, User, Mail, Phone, Briefcase, CalendarDays } from "lucide-react";

const CandidateInterviewDetails = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const details = [
    { label: "Candidate Name", value: candidate.candidateName, icon: User },
    { label: "Email", value: candidate.email, icon: Mail },
    { label: "Phone", value: candidate.phone, icon: Phone },
    { label: "Job Position", value: candidate.jobTitle, icon: Briefcase },
    {
      label: "Interviewer",
      value: candidate.interviewer || "Not assigned",
      icon: User,
    },
    {
      label: "Interview Schedule",
      value: candidate.interviewDate
        ? `${candidate.interviewDate} ${candidate.interviewTime || ""}`
        : "Not scheduled",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Candidate Details
            </h2>
            <p className="text-sm text-gray-500">{candidate.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {details.map((detail) => {
            const Icon = detail.icon;

            return (
              <div key={detail.label}>
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                  {detail.label}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <Icon size={17} className="text-gray-400" />
                  <span>{detail.value || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-5">
          <h3 className="mb-3 font-semibold text-gray-900">Interview History</h3>

          {candidate.history?.length ? (
            <ul className="space-y-3">
              {candidate.history.map((entry, index) => (
                <li key={`${entry}-${index}`} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <span className="text-gray-700">{entry}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No history available.</p>
          )}
        </div>

        {candidate.feedback && (
          <div className="border-t p-5">
            <h3 className="mb-2 font-semibold text-gray-900">
              Interview Feedback
            </h3>
            <p className="text-sm text-gray-700">{candidate.feedback}</p>
            <p className="mt-2 text-sm text-gray-500">
              Score: {candidate.score || "Not provided"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInterviewDetails;