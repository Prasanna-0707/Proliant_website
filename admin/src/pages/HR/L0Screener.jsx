import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Users,
  AlertCircle,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

import ScreenerStats from "../../components/HR/ScreenerStats";
import ScreenerTable from "../../components/HR/ScreenerTable";
import AssignScreenerModal from "../../components/HR/AssignScreenerModal";

import {
  getEmployeeId,
  getEmployeeName,
  getEmployeeEmail,
  getEmployeeDepartment,
  getEmployeeDesignation,
  isEmployeeActive,
  isAlreadyScreener,
} from "../../data/screenerData";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function L0Screener() {
  const [employees, setEmployees] = useState([]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [screenerStatuses, setScreenerStatuses] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchEmployees = async (showRefresh = false) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setError("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/employees`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please login again.");
        setEmployees([]);
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch employees."
        );
      }

      const employeeList = Array.isArray(result)
        ? result
        : result.employees || result.data || [];

      setEmployees(employeeList);
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const screeners = useMemo(() => {
    return employees
      .filter((employee) => {
        const id = getEmployeeId(employee);

        return (
          assignedIds.includes(id) ||
          isAlreadyScreener(employee)
        );
      })
      .map((employee) => {
        const id = getEmployeeId(employee);

        return {
          id,
          name: getEmployeeName(employee),
          email: getEmployeeEmail(employee),
          department: getEmployeeDepartment(employee),
          designation: getEmployeeDesignation(employee),
          isActive:
            screenerStatuses[id] !== undefined
              ? screenerStatuses[id]
              : isEmployeeActive(employee),
          assignedApplications: 0,
        };
      });
  }, [employees, assignedIds, screenerStatuses]);

  const handleAssign = (employeeId) => {
    setAssignedIds((previous) => {
      if (previous.includes(employeeId)) {
        return previous;
      }

      return [...previous, employeeId];
    });

    setScreenerStatuses((previous) => ({
      ...previous,
      [employeeId]: true,
    }));

    setShowAssignModal(false);
    setSearch("");
    setStatusFilter("All");
  };

  const handleToggleStatus = (employeeId) => {
    const screener = screeners.find(
      (item) => item.id === employeeId
    );

    if (!screener) {
      return;
    }

    setScreenerStatuses((previous) => ({
      ...previous,
      [employeeId]: !screener.isActive,
    }));

    setOpenMenuId(null);
  };

  const handleRemove = (employeeId) => {
    const screener = screeners.find(
      (item) => item.id === employeeId
    );

    const confirmed = window.confirm(
      `Remove ${screener?.name || "this employee"} from L0 Screener assignment?`
    );

    if (!confirmed) {
      return;
    }

    setAssignedIds((previous) =>
      previous.filter((id) => id !== employeeId)
    );

    setScreenerStatuses((previous) => {
      const updated = { ...previous };
      delete updated[employeeId];
      return updated;
    });

    setOpenMenuId(null);
  };

  const assignedIdsForModal = useMemo(() => {
    return [
      ...new Set([
        ...assignedIds,
        ...employees
          .filter(isAlreadyScreener)
          .map(getEmployeeId),
      ]),
    ];
  }, [assignedIds, employees]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Loading employees...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck
              size={23}
              className="text-red-600"
            />

            <h1 className="text-2xl font-semibold tracking-tight">
              L0 Screener Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage employees assigned to initial candidate screening.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => fetchEmployees(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus size={18} />
            Assign Screener
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => fetchEmployees(true)}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      <ScreenerStats screeners={screeners} />

      <ScreenerTable
        screeners={screeners}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        onToggleStatus={handleToggleStatus}
        onRemove={handleRemove}
      />

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/20">
        <Users
          size={18}
          className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
        />

        <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
          Assignments are currently maintained in frontend state only.
          They will not be saved to the employee records until backend
          integration is completed.
        </p>
      </div>

      <AssignScreenerModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        employees={employees}
        assignedIds={assignedIdsForModal}
        onAssign={handleAssign}
      />
    </section>
  );
}

export default L0Screener;