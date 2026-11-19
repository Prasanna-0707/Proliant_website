import { useMemo, useState } from "react";
import { Search, X, UserRound, Check } from "lucide-react";
import {
  getEmployeeId,
  getEmployeeName,
  getEmployeeEmail,
  getEmployeeDepartment,
  getEmployeeDesignation,
  isEmployeeActive,
  isAlreadyScreener,
} from "../../data/screenerData.js";

function AssignScreenerModal({
  isOpen,
  onClose,
  employees,
  assignedIds,
  onAssign,
}) {
  const [search, setSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const availableEmployees = useMemo(() => {
    const value = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const id = getEmployeeId(employee);

      const matchesSearch =
        getEmployeeName(employee).toLowerCase().includes(value) ||
        getEmployeeEmail(employee).toLowerCase().includes(value) ||
        getEmployeeDepartment(employee).toLowerCase().includes(value);

      return (
        isEmployeeActive(employee) &&
        !assignedIds.includes(id) &&
        !isAlreadyScreener(employee) &&
        matchesSearch
      );
    });
  }, [employees, assignedIds, search]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setSearch("");
    setSelectedEmployeeId("");
    onClose();
  };

  const handleAssign = () => {
    if (!selectedEmployeeId) {
      return;
    }

    onAssign(selectedEmployeeId);
    setSearch("");
    setSelectedEmployeeId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assign L0 Screener
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select an existing active employee.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or department..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {availableEmployees.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-700">
                <UserRound
                  size={28}
                  className="mx-auto mb-2 text-gray-400"
                />

                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  No eligible employees found
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Try another search or check employee status.
                </p>
              </div>
            ) : (
              availableEmployees.map((employee) => {
                const id = getEmployeeId(employee);
                const selected = selectedEmployeeId === id;

                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setSelectedEmployeeId(id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                      selected
                        ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        {getEmployeeName(employee)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {getEmployeeName(employee)}
                        </p>

                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {getEmployeeEmail(employee)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {getEmployeeDepartment(employee)} ·{" "}
                          {getEmployeeDesignation(employee)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {selected && <Check size={13} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedEmployeeId}
            onClick={handleAssign}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Assign as L0 Screener
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignScreenerModal;