
import { useState } from "react";

const initialLogs = [
  {
    id: 1,
    user: "Admin",
    action: "Created a new job",
    module: "Jobs",
    date: "2026-10-24 10:30 AM",
    status: "Success",
  },
  {
    id: 2,
    user: "HR Manager",
    action: "Updated candidate application status",
    module: "Candidates",
    date: "2026-10-24 10:15 AM",
    status: "Success",
  },
  {
    id: 3,
    user: "Interview Lead",
    action: "Submitted interview evaluation",
    module: "Interviews",
    date: "2026-10-24 09:45 AM",
    status: "Success",
  },
  {
    id: 4,
    user: "Admin",
    action: "Updated user permissions",
    module: "Access Control",
    date: "2026-10-23 04:20 PM",
    status: "Success",
  },
];

function AuditLogs() {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) =>
    `${log.user} ${log.action} ${log.module}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Audit Logs
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review user activities and system events.
        </p>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search user, action, or module..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-red-400 md:max-w-md"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-200 text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Action</th>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Date & Time</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-t text-sm">
                  <td className="px-5 py-4 font-medium text-gray-800">
                    {log.user}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {log.action}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {log.module}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {log.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;
