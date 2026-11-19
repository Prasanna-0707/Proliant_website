import useApi from "../../services/useApi.js";
import { listHrReviewRequests } from "../../services/screening.js";
import { formatDateTime } from "../../services/format.js";

import DataState, { EmptyState } from "../../components/StateMessage";

// GET /api/screenings/hr-review-requests: applications this screener put on
// hold or escalated to HR.
const HRReviewRequests = () => {
  const { data, loading, error, reload } = useApi(
    (signal) => listHrReviewRequests(signal),
    []
  );

  const requests = data?.requests || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Review Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Applications escalated to HR for exception-based review.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {requests.length === 0 ? (
            <EmptyState text="No HR review requests." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    {["Candidate", "Position", "Decision", "Reason", "Requested"].map(
                      (heading) => (
                        <th key={heading} className="px-5 py-4 font-semibold">
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((request) => (
                    <tr key={request.screeningId} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {request.application?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.application?.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {request.application?.position || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {String(request.decision || "").replace("_", " ")}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {request.requestReason || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {formatDateTime(request.requestedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
};

export default HRReviewRequests;
