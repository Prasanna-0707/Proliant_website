import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  status: "Active",
};

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");

  /*
   * Get JWT token for protected API requests.
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /*
   * Handle expired / invalid token.
   */
  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    window.location.href = "/login";
  };

  /*
   * ---------------------------------------------------------
   * FETCH EMPLOYEES
   * ---------------------------------------------------------
   */
  const fetchEmployees = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load employees."
        );
      }

      /*
       * Backend currently returns employees array.
       * This also safely handles a data wrapper if present.
       */
      const employeeData =
        result.employees ||
        result.data ||
        [];

      setEmployees(employeeData);
    } catch (error) {
      console.error(
        "Failed to fetch employees:",
        error
      );

      setPageError(
        error.message ||
          "Unable to load employees. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Load employees when page opens.
   */
  useEffect(() => {
    fetchEmployees();
  }, []);

  /*
   * ---------------------------------------------------------
   * SEARCH + STATUS FILTER
   * ---------------------------------------------------------
   */
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        employee.name
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.email
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.role
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.department
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  /*
   * ---------------------------------------------------------
   * FORM HANDLING
   * ---------------------------------------------------------
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department =
        "Department is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * ---------------------------------------------------------
   * ADD EMPLOYEE
   * ---------------------------------------------------------
   */
  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * EDIT EMPLOYEE
   * ---------------------------------------------------------
   */
  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      role: employee.role || "",
      department: employee.department || "",
      status: employee.status || "Active",
    });

    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * ADD / UPDATE EMPLOYEE
   * ---------------------------------------------------------
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsSubmitting(true);

    try {
      const isEditing = Boolean(
        editingEmployee
      );

      const employeeId = editingEmployee
        ? editingEmployee._id ||
          editingEmployee.id
        : null;

      const url = isEditing
        ? `${API_BASE_URL}/employees/${employeeId}`
        : `${API_BASE_URL}/employees`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role.trim(),
          department: formData.department.trim(),
          status: formData.status,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${
              isEditing ? "update" : "add"
            } employee.`
        );
      }

      /*
       * Refresh data from MongoDB after successful
       * add/update so the UI always reflects backend data.
       */
      await fetchEmployees();

      setFormData(emptyForm);
      setErrors({});
      setEditingEmployee(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Employee save failed:",
        error
      );

      setErrors({
        submit:
          error.message ||
          "Unable to save employee. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------
   */
  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
    setErrors({});
  };

  /*
   * ---------------------------------------------------------
   * TOGGLE EMPLOYEE STATUS
   * ---------------------------------------------------------
   */
  const handleToggleStatus = async (
    employee
  ) => {
    const token = localStorage.getItem(
      "adminToken"
    );

    if (!token) {
      handleUnauthorized();
      return;
    }

    const employeeId =
      employee._id || employee.id;

    const newStatus =
      employee.status === "Active"
        ? "Inactive"
        : "Active";

    setOpenMenuId(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/employees/${employeeId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            status: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update employee status."
        );
      }

      /*
       * Reload from backend.
       */
      await fetchEmployees();
    } catch (error) {
      console.error(
        "Employee status update failed:",
        error
      );

      setPageError(
        error.message ||
          "Unable to update employee status."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE EMPLOYEE
   * ---------------------------------------------------------
   */
  const handleDelete = async () => {
    if (!deleteEmployee) {
      return;
    }

    const token = localStorage.getItem(
      "adminToken"
    );

    if (!token) {
      handleUnauthorized();
      return;
    }

    const employeeId =
      deleteEmployee._id ||
      deleteEmployee.id;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to delete employee."
        );
      }

      /*
       * Remove deleted employee from UI immediately.
       */
      setEmployees((previous) =>
        previous.filter(
          (employee) =>
            (employee._id || employee.id) !==
            employeeId
        )
      );

      setDeleteEmployee(null);
    } catch (error) {
      console.error(
        "Employee deletion failed:",
        error
      );

      setPageError(
        error.message ||
          "Unable to delete employee. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * TABLE COLUMNS
   * ---------------------------------------------------------
   */
  const employeeColumns = [
    {
      key: "name",
      label: "Employee",
      render: (employee) => (
        <div>
          <p className="font-semibold text-gray-900">
            {employee.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {employee.email}
          </p>
        </div>
      ),
    },

    {
      key: "role",
      label: "Role",
      render: (employee) => (
        <span className="text-gray-700 dark:text-gray-200">
          {employee.role || "N/A"}
        </span>
      ),
    },

    {
      key: "department",
      label: "Department",
      render: (employee) => (
        <span className="text-gray-700 dark:text-gray-200">
          {employee.department || "N/A"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (employee) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            employee.status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {employee.status}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (employee) => {
        const employeeId =
          employee._id || employee.id;

        return (
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setOpenMenuId(
                  (previous) =>
                    previous === employeeId
                      ? null
                      : employeeId
                );
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Employee actions"
            >
              <MoreVertical size={18} />
            </button>

            {openMenuId === employeeId && (
              <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() =>
                    openEditModal(employee)
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Pencil size={16} />
                  <span>Edit Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleToggleStatus(
                      employee
                    )
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {employee.status ===
                  "Active" ? (
                    <UserX size={16} />
                  ) : (
                    <UserCheck size={16} />
                  )}

                  <span>
                    {employee.status ===
                    "Active"
                      ? "Set Inactive"
                      : "Set Active"}
                  </span>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  type="button"
                  onClick={() => {
                    setDeleteEmployee(
                      employee
                    );
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={16} />
                  <span>Delete Employee</span>
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative p-5 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your Proliant employees and their status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Page Error */}
      {pageError && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {pageError}
          </p>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search employees..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-950/40 sm:w-40 max-[767px]:min-w-0 max-[767px]:flex-1"
        >
          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>
      </div>

      {/* Employee Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Employee List
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Loading employees..."
              : `${filteredEmployees.length} employee${
                  filteredEmployees.length !==
                  1
                    ? "s"
                    : ""
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading employees...
            </p>
          </div>
        ) : (
          <DataTable
            columns={employeeColumns}
            data={filteredEmployees}
            emptyMessage="No employees found."
          />
        )}
      </section>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingEmployee
                    ? "Update employee information."
                    : "Add a new employee to your organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter employee name"
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="employee@proliant.com"
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Role & Department */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Role
                    </label>

                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Developer"
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                        errors.role
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                      }`}
                    />

                    {errors.role && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="department"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Department
                    </label>

                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering"
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                        errors.department
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                      }`}
                    />

                    {errors.department && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.submit}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {isSubmitting
                    ? editingEmployee
                      ? "Saving..."
                      : "Adding..."
                    : editingEmployee
                    ? "Save Changes"
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEmployee && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!isDeleting) {
              setDeleteEmployee(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Employee?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteEmployee.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteEmployee(null)
                }
                disabled={isDeleting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;