
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Mail,
  ChevronDown,
  RefreshCw,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const STORAGE_KEY = "proliantAdminUsers";

const initialUsers = [
  {
    id: 1,
    name: "Prasanna Kumar",
    email: "prasanna@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2026-10-01",
    lastLogin: null,
  },
  {
    id: 2,
    name: "HR Manager",
    email: "hr@example.com",
    role: "HR",
    status: "Active",
    createdAt: "2026-10-02",
    lastLogin: null,
  },
  {
    id: 3,
    name: "Interview Lead",
    email: "lead@example.com",
    role: "Interviewer",
    status: "Inactive",
    createdAt: "2026-10-03",
    lastLogin: null,
  },
];

const roleOptions = [
  "Admin",
  "HR",
  "Recruiter",
  "L0 Screener",
  "Interviewer",
  "Hiring Lead",
];

const emptyForm = {
  name: "",
  email: "",
  role: "HR",
  status: "Active",
};

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : initialUsers;
    }
  } catch {
    return initialUsers;
  }

  return initialUsers;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const getRoleStyle = (role) => {
  const styles = {
    Admin: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300",
    HR: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300",
    Recruiter:
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-300",
    "L0 Screener":
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300",
    Interviewer:
      "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-950/40 dark:text-cyan-300",
    "Hiring Lead":
      "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-950/40 dark:text-pink-300",
  };

  return (
    styles[role] ||
    "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300"
  );
};

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState(getStoredUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [showInactive, setShowInactive] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const activeCount = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveCount = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch =
          !query ||
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query);

        const matchesRole =
          roleFilter === "All Roles" || user.role === roleFilter;

        const matchesStatus =
          statusFilter === "All Statuses" ||
          user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .filter((user) => showInactive || user.status !== "Inactive")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, search, roleFilter, statusFilter, showInactive]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "HR",
      status: user.status || "Active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.role || !form.status) {
      setFormError("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const duplicate = users.some(
      (user) =>
        user.email?.toLowerCase() === email &&
        String(user.id) !== String(editingUser?.id)
    );

    if (duplicate) {
      setFormError("A user with this email address already exists.");
      return;
    }

    if (editingUser) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          String(user.id) === String(editingUser.id)
            ? {
                ...user,
                name,
                email,
                role: form.role,
                status: form.status,
              }
            : user
        )
      );

      setNotice("User details updated successfully.");
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: form.role,
        status: form.status,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      setUsers((currentUsers) => [...currentUsers, newUser]);
      setNotice("User added successfully.");
    }

    closeModal();
  };

  const toggleStatus = (user) => {
    if (
      user.role === "Admin" &&
      user.status === "Active" &&
      users.filter(
        (item) => item.role === "Admin" && item.status === "Active"
      ).length === 1
    ) {
      setNotice("The last active Admin account cannot be disabled.");
      return;
    }

    const nextStatus =
      user.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `${nextStatus === "Inactive" ? "Disable" : "Activate"} ${user.name}'s account?`
    );

    if (!confirmed) return;

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        String(item.id) === String(user.id)
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setNotice(
      `${user.name}'s account is now ${nextStatus.toLowerCase()}.`
    );
  };

  const deleteUser = (user) => {
    if (
      user.role === "Admin" &&
      user.status === "Active" &&
      users.filter(
        (item) => item.role === "Admin" && item.status === "Active"
      ).length === 1
    ) {
      setNotice("The last active Admin account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setUsers((currentUsers) =>
      currentUsers.filter(
        (item) => String(item.id) !== String(user.id)
      )
    );

    setNotice("User deleted successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("All Roles");
    setStatusFilter("All Statuses");
    setShowInactive(true);
  };

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-5 sm:py-5 xl:px-6">
      <div className="w-full">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#071737] dark:text-white sm:text-3xl">
              User Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage internal portal accounts, roles and account access.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {notice && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={users.length}
            description="All portal accounts"
            icon={UsersIcon}
            color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
          />
          <StatCard
            title="Active Users"
            value={activeCount}
            description="Accounts marked active"
            icon={UserCheck}
            color="bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300"
          />
          <StatCard
            title="Inactive Users"
            value={inactiveCount}
            description="Accounts with access disabled"
            icon={UserX}
            color="bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Portal Users
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {filteredUsers.length} of {users.length} accounts
                </p>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-auto"
              >
                <RefreshCw size={14} />
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative md:col-span-2 xl:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or role..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#EF3B3A] focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-red-950"
                />
              </div>

              <div className="relative">
                <ShieldCheck
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-[#EF3B3A] dark:border-slate-700 dark:bg-slate-950"
                >
                  <option>All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-[#EF3B3A] dark:border-slate-700 dark:bg-slate-950"
                >
                  <option>All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="h-4 w-4 rounded accent-[#EF3B3A]"
              />
              Include inactive accounts
            </label>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <UsersIcon size={27} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                No users found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Try changing your search or filters, or add a new portal user.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-[#EF3B3A] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Account Status</th>
                    <th className="px-5 py-4">Created</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-[#EF3B3A] dark:bg-red-950/40">
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {user.name}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Mail size={13} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getRoleStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "Active"
                                ? "bg-green-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                            aria-label={`Edit ${user.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/30"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(user)}
                            title={
                              user.status === "Active"
                                ? "Disable account"
                                : "Activate account"
                            }
                            aria-label={
                              user.status === "Active"
                                ? `Disable ${user.name}`
                                : `Activate ${user.name}`
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                              user.status === "Active"
                                ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:hover:bg-amber-950/30"
                                : "border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-950/30"
                            }`}
                          >
                            {user.status === "Active" ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            title="Delete user"
                            aria-label={`Delete ${user.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""}
            </p>
            <p>Proliant Data · User Management</p>
          </div>
        </section>

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-modal-title"
              className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
                <div>
                  <h2
                    id="user-modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    {editingUser ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {editingUser
                      ? "Update the account details and access role."
                      : "Create an internal portal user account."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5 px-5 py-5 sm:px-6">
                  {formError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="user-name"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserRound
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="user-name"
                        type="text"
                        required
                        maxLength={100}
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Enter full name"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#EF3B3A] focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-red-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="user-email"
                      className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="user-email"
                        type="email"
                        required
                        maxLength={254}
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#EF3B3A] focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-red-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="user-role"
                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Portal Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="user-role"
                        required
                        value={form.role}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#EF3B3A] dark:border-slate-700 dark:bg-slate-950"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="user-status"
                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Account Status
                      </label>
                      <select
                        id="user-status"
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#EF3B3A] dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-[#EF3B3A]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Role-based access
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          The selected role should determine the pages and actions available to this user. Enforce these permissions in the backend as well.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF3B3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    <CheckCircle2 size={17} />
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;