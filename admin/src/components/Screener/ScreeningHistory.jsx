import { X, History, User } from "lucide-react";

const ScreeningHistory = ({ application, onClose }) => {
  if (!application) return null;

  const history = [...(application.history || [])].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Screening History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {application.candidateName} · {application.id}
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

        <div className="space-y-5 p-5">
          {history.length ? (
            history.map((entry, index) => (
              <div key={`${entry.action}-${index}`} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <History size={17} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {entry.action}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <User size={12} />
                      {entry.by}
                    </span>
                    <span>
                      {entry.date
                        ? new Date(entry.date).toLocaleString()
                        : "Date unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningHistory;