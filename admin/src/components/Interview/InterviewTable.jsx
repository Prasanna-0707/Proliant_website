import { useMemo, useState } from "react";
import {
    Search,
    Eye,
    CalendarDays,
    ClipboardList,
    History,
} from "lucide-react";

const statusStyles = {
  Scheduled: "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const decisionStyles = {
  Pending: "bg-gray-100 text-gray-700",
  Selected: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  "On Hold": "bg-amber-50 text-amber-700",
};

const InterviewTable = ({
  interviews = [],
  onView,
  onSchedule,
  onFeedback,
  onHistory,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const searchText = [
        item.candidateName,
        item.email,
        item.jobTitle,
        item.interviewer,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, search, statusFilter]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Interview Candidates
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage candidate interviews and evaluations.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-red-400 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-250 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Candidate</th>
              <th className="px-5 py-4 font-semibold">Job Position</th>
              <th className="px-5 py-4 font-semibold">Interviewer</th>
              <th className="px-5 py-4 font-semibold">Interview Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Decision</th>
              <th className="px-5 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredInterviews.length > 0 ? (
              filteredInterviews.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900">
                      {item.candidateName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {item.jobTitle}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {item.interviewer || "Not assigned"}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {item.interviewDate
                      ? `${item.interviewDate} ${item.interviewTime || ""}`
                      : "Not scheduled"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        decisionStyles[item.decision] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.decision}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(item)}
                        title="View details"
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSchedule(item)}
                        title="Schedule interview"
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <CalendarDays size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onFeedback(item)}
                        title="Add feedback"
                        className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                      >
                        <ClipboardList size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onHistory(item)}
                        title="View interview history"
                        className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"
                        >
                        <History size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-12 text-center text-gray-500"
                >
                  No interview records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
        Showing {filteredInterviews.length} of {interviews.length} interviews
      </div>
    </div>
  );
};

export default InterviewTable;