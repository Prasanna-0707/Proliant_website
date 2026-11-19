import {
  MoreVertical,
  UserRound,
  UserX,
  UserCheck,
} from "lucide-react";

function ScreenerTable({
  screeners,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  openMenuId,
  setOpenMenuId,
  onToggleStatus,
  onRemove,
}) {
  const filteredScreeners = screeners.filter((screener) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      screener.name.toLowerCase().includes(searchValue) ||
      screener.email.toLowerCase().includes(searchValue) ||
      screener.department.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && screener.isActive) ||
      (statusFilter === "Inactive" && !screener.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Assigned L0 Screeners
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filteredScreeners.length} screeners found
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <UserRound
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search screeners..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-187.5 text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              {[
                "Employee",
                "Department",
                "Designation",
                "Assigned Applications",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredScreeners.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No screeners found.
                </td>
              </tr>
            ) : (
              filteredScreeners.map((screener) => (
                <tr
                  key={screener.id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {screener.name}
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {screener.email}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {screener.department}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {screener.designation}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {screener.assignedApplications}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        screener.isActive
                          ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {screener.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="relative px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === screener.id
                            ? null
                            : screener.id
                        )
                      }
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === screener.id && (
                      <div className="absolute right-8 top-12 z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(screener.id)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          {screener.isActive ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}

                          {screener.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemove(screener.id)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <UserX size={16} />
                          Remove Screener Role
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScreenerTable;