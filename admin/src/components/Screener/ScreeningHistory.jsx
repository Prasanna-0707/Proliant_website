import { X, History, User } from "lucide-react";

import useApi from "../../services/useApi.js";
import { getApplicationHistory } from "../../services/screening.js";
import { toHistoryEntry } from "../../services/screenerAdapter.js";

// Loads the screening history of one application from
// GET /api/screenings/history/:applicationId.
const ScreeningHistory = ({ application, onClose }) => {
  const { data, loading, error, reload } = useApi(
    (signal) => getApplicationHistory(application.id, signal),
    [application?.id]
  );

  if (!application) return null;

  const history = (data?.history || data?.screening?.history || [])
    .map(toHistoryEntry)
    .reverse();

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
            aria-label="Close"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {loading && <p className="text-sm text-gray-500">Loading history...</p>}

          {error && (
            <div role="alert">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-2 text-sm font-medium text-red-500 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <p className="text-sm text-gray-500">No history available.</p>
          )}

          {history.map((entry, index) => (
            <div key={`${entry.action}-${index}`} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <History size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {String(entry.action || "").replaceAll("_", " ")}
                </p>
                {entry.remarks && (
                  <p className="mt-1 text-xs text-gray-600">{entry.remarks}</p>
                )}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreeningHistory;