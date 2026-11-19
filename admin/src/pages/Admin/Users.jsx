import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import {
  createAdminUser,
  deleteTeamMember,
  listAdminUsers,
  setTeamMemberStatus,
  updateAdminUser,
  updateAdminUserRole,
} from "../../services/adminConsole.js";
import { ADMIN_ROLE, ALL_ROLE_OPTIONS, roleLabel } from "../../services/roles.js";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    {children}
  </label>
);

// User management.
//   GET   /api/admin/users              list (Admin + User collections)
//   POST  /api/admin/users              create (temporary password is e-mailed)
//   PATCH /api/admin/users/:id          name, phone, department, designation
//   PATCH /api/admin/users/:id/role     role / adminScope / department
//   PATCH /api/auth/team-members/:id/status, DELETE /api/auth/team-members/:id
export default function Users() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type, user? }
  const [form, setForm] = useState({});
  const [action, setAction] = useState({ busy: false, error: "", notice: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useApi(
    (signal) =>
      listAdminUsers({ page, limit: 20, search: debounced, status, role }, signal),
    [page, debounced, status, role]
  );

  const users = data?.users || [];
  const pagination = data?.pagination;

  const open = (type, user) => {
    setAction({ busy: false, error: "", notice: "" });
    setForm(
      type === "create"
        ? { email: "", name: "", phone: "", role: "HR", department: "", adminScope: "DEPARTMENT" }
        : { name: user.name, phone: user.phone, department: user.department, designation: user.designation, role: user.role, adminScope: user.adminScope || "DEPARTMENT", reason: "" }
    );
    setModal({ type, user });
  };

  const run = async (work, notice) => {
    setAction({ busy: true, error: "", notice: "" });

    try {
      await work();
      setModal(null);
      setAction({ busy: false, error: "", notice });
      reload();
    } catch (requestError) {
      setAction({ busy: false, error: requestError.message, notice: "" });
    }
  };

  const submit = (event) => {
    event.preventDefault();

    if (modal.type === "create") {
      const body = {
        email: form.email.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        department: form.department.trim(),
      };

      if (form.role === ADMIN_ROLE) body.adminScope = form.adminScope;

      run(() => createAdminUser(body), "Account created. A temporary password was e-mailed.");
    } else if (modal.type === "edit") {
      run(
        () =>
          updateAdminUser(modal.user._id, {
            name: form.name.trim(),
            phone: form.phone.trim(),
            department: form.department.trim(),
            designation: form.designation?.trim(),
          }),
        "User updated."
      );
    } else if (modal.type === "role") {
      const body = { role: form.role, reason: form.reason };

      if (form.role === ADMIN_ROLE) {
        body.adminScope = form.adminScope;
        body.department = form.department.trim();
      }

      run(() => updateAdminUserRole(modal.user._id, body), "Role updated.");
    }
  };

  const toggleStatus = (user) =>
    run(
      () => setTeamMemberStatus(user._id, user.status === "Active" ? "Inactive" : "Active"),
      `Account ${user.status === "Active" ? "deactivated" : "activated"}.`
    );

  const remove = (user) => {
    if (!window.confirm(`Remove ${user.name || user.email}? The record is kept for audit.`)) return;

    run(() => deleteTeamMember(user._id), "Account removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Administrators and staff accounts.</p>
        </div>

        <button type="button" onClick={() => open("create")} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
          <Plus size={17} /> Add User
        </button>
      </div>

      {action.notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{action.notice}</p>
      )}
      {action.error && !modal && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{action.error}</p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone or role..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-500"
          />
        </div>
        <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter by role" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm">
          <option value="">All roles</option>
          {ALL_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by status" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {users.length === 0 ? (
            <EmptyState text="No users found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-220 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{user.name || "—"} {user.isMe && <span className="text-xs text-gray-400">(you)</span>}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {roleLabel(user.role)}
                        {user.adminScope && <span className="ml-1 text-xs text-gray-400">({user.adminScope})</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{user.department || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {user.canManage ? (
                          <div className="flex flex-wrap justify-end gap-2 text-xs font-semibold">
                            <button type="button" onClick={() => open("edit", user)} className="rounded border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50">Edit</button>
                            <button type="button" onClick={() => open("role", user)} className="rounded border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50">Role</button>
                            <button type="button" onClick={() => toggleStatus(user)} className="rounded border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50">
                              {user.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                            <button type="button" onClick={() => remove(user)} className="rounded border border-red-200 px-2.5 py-1.5 text-red-600 hover:bg-red-50">Remove</button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No access</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} user(s)</span>
              <div className="flex gap-2">
                <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((value) => value - 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
                <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} className="rounded border border-gray-200 px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </DataState>
      </div>

      {modal && (
        <Modal
          title={modal.type === "create" ? "Add User" : modal.type === "edit" ? "Edit User" : "Change Role"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={submit} className="space-y-4">
            {modal.type === "create" && (
              <Field label="Email">
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} />
              </Field>
            )}

            {modal.type !== "role" && (
              <>
                <Field label="Name">
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClass} />
                </Field>
              </>
            )}

            {modal.type === "edit" && (
              <Field label="Designation">
                <input value={form.designation || ""} onChange={(event) => setForm({ ...form, designation: event.target.value })} className={inputClass} />
              </Field>
            )}

            {modal.type !== "edit" && (
              <Field label="Role">
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass}>
                  {ALL_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
            )}

            {modal.type !== "edit" && form.role === ADMIN_ROLE && (
              <Field label="Administrator scope">
                <select value={form.adminScope} onChange={(event) => setForm({ ...form, adminScope: event.target.value })} className={inputClass}>
                  <option value="DEPARTMENT">Department Administrator</option>
                  <option value="GLOBAL">Global Administrator (approved accounts only)</option>
                </select>
              </Field>
            )}

            <Field label="Department">
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className={inputClass} />
            </Field>

            {modal.type === "role" && (
              <Field label="Reason">
                <input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className={inputClass} />
              </Field>
            )}

            {action.error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{action.error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={action.busy} className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {action.busy ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
