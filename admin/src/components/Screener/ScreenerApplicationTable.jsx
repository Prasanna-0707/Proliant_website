import {
  Eye,
  FileText,
  Clock3,
} from "lucide-react";

const statusConfig = {
  ASSIGNED_TO_L0: {
    label: "Assigned",
    style: "bg-blue-50 text-blue-700",
  },
  L0_IN_PROGRESS: {
    label: "In Progress",
    style: "bg-amber-50 text-amber-700",
  },
  L0_SHORTLISTED: {
    label: "Shortlisted",
    style: "bg-green-50 text-green-700",
  },
  L0_REJECTED: {
    label: "Rejected",
    style: "bg-red-50 text-red-700",
  },
  L0_ON_HOLD: {
    label: "On Hold",
    style: "bg-orange-50 text-orange-700",
  },
  HR_REVIEW_REQUIRED: {
    label: "HR Review",
    style: "bg-purple-50 text-purple-700",
  },
  L1_PENDING: {
    label: "Moved to L1",
    style: "bg-teal-50 text-teal-700",
  },
};

const ScreenerApplicationTable = ({
  applications = [],
  onOpen,
  onHistory,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-212.5 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Candidate</th>
              <th className="px-5 py-4 font-semibold">Job Position</th>
              <th className="px-5 py-4 font-semibold">Experience</th>
              <th className="px-5 py-4 font-semibold">Applied Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {applications.length ? (
              applications.map((application) => {
                const status = statusConfig[application.status] || {
                  label: application.status,
                  style: "bg-gray-100 text-gray-700",
                };

                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {application.candidateName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {application.email}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {application.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {application.jobTitle}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {application.experience}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {application.appliedDate || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status.style}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpen(application)}
                          title="Open application"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onHistory(application)}
                          title="View history"
                          className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"
                        >
                          <Clock3 size={17} />
                        </button>

                        {application.resumeUrl && (
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open resume"
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <FileText size={17} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-12 text-center text-gray-500"
                >
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t px-5 py-3 text-xs text-gray-500">
        Showing {applications.length} application(s)
      </div>
    </div>
  );
};

export default ScreenerApplicationTable;