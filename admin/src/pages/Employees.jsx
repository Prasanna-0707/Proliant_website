import { useMemo, useState } from "react";
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

const initialEmployees = [
  {
    id: 1,
    name: "Rahul Kumar",
    email: "rahul.kumar@proliant.com",
    role: "ABAP Developer",
    department: "SAP ABAP",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@proliant.com",
    role: "HR Executive",
    department: "Human Resources",
    status: "Active",
  },
  {
    id: 3,
    name: "Arjun Reddy",
    email: "arjun.reddy@proliant.com",
    role: "SAP Consultant",
    department: "SAP",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Sneha Rao",
    email: "sneha.rao@proliant.com",
    role: "Basis Administrator",
    department: "SAP",
    status: "Active",
  },
  {
    id: 5,
    name: "Kiran Kumar",
    email: "kiran.kumar@proliant.com",
    role: "SD Consultant",
    department: "Funcional",
    status: "Active",
  },
  {
    id: 6,
    name: "Anjali Reddy",
    email: "anjali.reddy@proliant.com",
    role: "Business Analyst",
    department: "Business",
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  status: "Active",
};

function Employees() {
  const [employees, setEmployees] = useState(initialEmployees);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue) ||
        employee.role.toLowerCase().includes(searchValue) ||
        employee.department.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status,
    });

    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                ...formData,
              }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        ...formData,
      };

      setEmployees((previous) => [...previous, newEmployee]);
    }

    setFormData(emptyForm);
    setErrors({});
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleToggleStatus = (employee) => {
    setEmployees((previous) =>
      previous.map((item) =>
        item.id === employee.id
          ? {
              ...item,
              status:
                item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );

    setOpenMenuId(null);
  };

  const handleDelete = () => {
    if (!deleteEmployee) {
      return;
    }

    setEmployees((previous) =>
      previous.filter(
        (employee) => employee.id !== deleteEmployee.id
      )
    );

    setDeleteEmployee(null);
  };

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
    },
    {
      key: "department",
      label: "Department",
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
      render: (employee) => (
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setOpenMenuId((previous) =>
                previous === employee.id ? null : employee.id
              );
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Employee actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === employee.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => openEditModal(employee)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil size={16} />
                <span>Edit Employee</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(employee)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                {employee.status === "Active" ? (
                  <UserX size={16} />
                ) : (
                  <UserCheck size={16} />
                )}

                <span>
                  {employee.status === "Active"
                    ? "Set Inactive"
                    : "Set Active"}
                </span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  setDeleteEmployee(employee);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={16} />
                <span>Delete Employee</span>
              </button>
            </div>
          )}
        </div>
      ),
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

      {/* Search & Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-[767px]:flex-row max-[767px]:items-center">
        <div className="relative w-full sm:max-w-sm max-[767px]:min-w-0 max-[767px]:flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employees..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:min-w-0 max-[767px]:flex-1"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Employee List
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          emptyMessage="No employees found."
        />
      </section>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
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
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
                >
                  {editingEmployee
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
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDeleteEmployee(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
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
                onClick={() => setDeleteEmployee(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;