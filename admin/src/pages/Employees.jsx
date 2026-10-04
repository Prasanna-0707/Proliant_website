import { useMemo, useState, useRef } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Upload,
  FileSpreadsheet,
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
    department: "Functional",
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
  const [importMessage, setImportMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase().trim();

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

    if (!validateForm()) return;

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? { ...employee, ...formData }
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
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );

    setOpenMenuId(null);
  };

  const handleDelete = () => {
    if (!deleteEmployee) return;

    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== deleteEmployee.id)
    );

    setDeleteEmployee(null);
  };

  // Open File Explorer when Add Multiple is clicked.
  const handleAddMultipleClick = () => {
    setImportMessage("");
    fileInputRef.current?.click();
  };

  // Read CSV files and import employee records.
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xls", "xlsx"].includes(extension)) {
      setImportMessage("Please select a CSV, XLS, or XLSX file.");
      event.target.value = "";
      return;
    }

    if (extension !== "csv") {
      setImportMessage(
        "Excel files require the xlsx package. Please upload a CSV file, or install xlsx to enable Excel imports."
      );
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    setImportMessage("");

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setImportMessage(
          "The CSV file has no employee records. Please add data below the header row."
        );
        return;
      }

      const headers = rows[0].map((header) =>
        header.trim().toLowerCase().replace(/[\s_-]+/g, "")
      );

      const getIndex = (...names) =>
        headers.findIndex((header) => names.includes(header));

      const nameIndex = getIndex("name", "fullname", "employeename");
      const emailIndex = getIndex("email", "emailaddress");
      const roleIndex = getIndex("role", "jobrole", "designation");
      const departmentIndex = getIndex("department", "dept");
      const statusIndex = getIndex("status", "employeestatus");

      if (
        nameIndex === -1 ||
        emailIndex === -1 ||
        roleIndex === -1 ||
        departmentIndex === -1
      ) {
        setImportMessage(
          "Required columns: Name, Email, Role, Department. Status is optional."
        );
        return;
      }

      const importedEmployees = [];
      const existingEmails = new Set(
        employees.map((employee) => employee.email.toLowerCase())
      );

      let skipped = 0;

      rows.slice(1).forEach((row, index) => {
        const name = (row[nameIndex] || "").trim();
        const email = (row[emailIndex] || "").trim();
        const role = (row[roleIndex] || "").trim();
        const department = (row[departmentIndex] || "").trim();

        if (!name && !email && !role && !department) return;

        if (
          !name ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          !role ||
          !department ||
          existingEmails.has(email.toLowerCase())
        ) {
          skipped++;
          return;
        }

        const rawStatus =
          statusIndex === -1 ? "Active" : (row[statusIndex] || "").trim();

        const status =
          rawStatus.toLowerCase() === "inactive" ? "Inactive" : "Active";

        importedEmployees.push({
          id: Date.now() + index + Math.random(),
          name,
          email,
          role,
          department,
          status,
        });

        existingEmails.add(email.toLowerCase());
      });

      if (importedEmployees.length > 0) {
        setEmployees((previous) => [...previous, ...importedEmployees]);
      }

      if (importedEmployees.length === 0) {
        setImportMessage(
          `No new valid employees imported. ${skipped} row(s) skipped.`
        );
      } else {
        setImportMessage(
          `${importedEmployees.length} employee(s) imported successfully.${
            skipped ? ` ${skipped} invalid or duplicate row(s) skipped.` : ""
          }`
        );
      }
    } catch {
      setImportMessage("Unable to read the file. Please check the CSV format.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  // CSV parser that supports quoted values and commas inside fields.
  const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let insideQuotes = false;

    const content = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (char === '"' && insideQuotes && nextChar === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") i++;

        row.push(field);

        if (row.some((value) => value.trim() !== "")) {
          rows.push(row);
        }

        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field);

    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }

    return rows;
  };

  const employeeColumns = [
    {
      key: "name",
      label: "Employee",
      render: (employee) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {employee.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
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
              ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300"
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
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Employee actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === employee.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => openEditModal(employee)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Pencil size={16} />
                <span>Edit Employee</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(employee)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {employee.status === "Active" ? (
                  <UserX size={16} />
                ) : (
                  <UserCheck size={16} />
                )}
                <span>
                  {employee.status === "Active" ? "Set Inactive" : "Set Active"}
                </span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

              <button
                type="button"
                onClick={() => {
                  setDeleteEmployee(employee);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
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

  const inputClass = (field) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-4 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:border-red-800 dark:focus:ring-red-950/30"
        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50 dark:border-gray-700 dark:focus:ring-red-950/30"
    }`;

  return (
    <div className="relative p-5 text-gray-900 transition-colors dark:text-gray-100 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Employees
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your Proliant employees and their status.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={handleAddMultipleClick}
            disabled={isImporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Upload size={18} />
            {isImporting ? "Importing..." : "Add Multiple"}
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
          >
            <Plus size={18} />
            Add Employee
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload employee file"
          />
        </div>
      </div>

      {importMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <FileSpreadsheet size={18} className="mt-0.5 shrink-0" />
          <span>{importMessage}</span>
          <button
            type="button"
            onClick={() => setImportMessage("")}
            className="ml-auto rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
            aria-label="Dismiss import message"
          >
            <X size={16} />
          </button>
        </div>
      )}

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
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-red-950/30 sm:w-40 max-[767px]:min-w-0 max-[767px]:flex-1"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900 [&_tbody_tr]:dark:bg-gray-900 [&_tbody_tr]:dark:text-gray-200 [&_tbody_tr:hover]:dark:bg-gray-800 [&_td]:dark:border-gray-700 [&_th]:dark:border-gray-700">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Employee List
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingEmployee ? "Edit Employee" : "Add Employee"}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {editingEmployee
                    ? "Update employee information."
                    : "Add a new employee to your organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
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
                    className={inputClass("name")}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
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
                    className={inputClass("email")}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
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
                      className={inputClass("role")}
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
                      className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
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
                      className={inputClass("department")}
                    />
                    {errors.department && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.department}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-red-950/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
                >
                  {editingEmployee ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEmployee && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDeleteEmployee(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Employee?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteEmployee.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteEmployee(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
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
