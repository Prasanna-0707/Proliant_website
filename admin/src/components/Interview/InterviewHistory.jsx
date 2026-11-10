import { X, History } from "lucide-react";

const InterviewHistory = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Interview History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {candidate.candidateName}
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

        <div className="p-5">
          {candidate.history?.length ? (
            <div className="space-y-4">
              {candidate.history.map((entry, index) => (
                <div key={`${entry}-${index}`} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <History size={16} />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-gray-800">{entry}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No interview history available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewHistory;