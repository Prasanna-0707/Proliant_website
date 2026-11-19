import { useMemo, useState } from "react";
import { History } from "lucide-react";

import ScreeningHistoryModal from "../../components/Screener/ScreeningHistory";
import useApi from "../../services/useApi.js";
import { getScreeningHistory } from "../../services/screening.js";
import { formatDate } from "../../services/format.js";

// GET /api/screenings/history: every screening this screener has worked on.
const ScreeningHistoryPage = () => {
  const [selected, setSelected] = useState(null);

  const { data, loading, error, reload } = useApi(
    (signal) => getScreeningHistory(undefined, signal),
    []
  );

  const records = useMemo(() => data?.records || [], [data]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
          <History size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Screening History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View your previous screening activities and decisions.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500" role="status">
            Loading history...
          </p>
        ) : error ? (
          <div className="px-5 py-12 text-center" role="alert">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 text-sm font-medium text-red-500 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Candidate</th>
                  <th className="px-5 py-4 font-semibold">Decision</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Assigned</th>
                  <th className="px-5 py-4 font-semibold">Submitted</th>
                  <th className="px-5 py-4 text-center font-semibold">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length ? (
                  records.map((record) => (
                    <tr key={record.screeningId} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {record.history?.[0]?.candidateName || "Candidate"}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {record.applicationId}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {record.decision || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {record.screeningStatus}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(record.assignedAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(record.submittedAt)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelected({
                              id: record.applicationId,
                              candidateName:
                                record.history?.[0]?.candidateName || "Candidate",
                            })
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                      No screening history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ScreeningHistoryModal
          application={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default ScreeningHistoryPage;