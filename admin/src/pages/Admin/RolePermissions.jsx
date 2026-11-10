
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  Eye,
  Pencil,
  Save,
  X,
  Check,
  LockKeyhole,
  Search,
  RotateCcw,
  LayoutDashboard,
  BriefcaseBusiness,
  UserRoundSearch,
  ClipboardList,
  CalendarDays,
  Settings2,
  FileClock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "proliantRolePermissions";

const roles = [
  {
    id: "Admin",
    name: "Admin",
    description: "Full access to portal administration and oversight.",
    users: 1,
  },
  {
    id: "HR",
    name: "HR",
    description: "Manage recruitment operations, jobs and applications.",
    users: 3,
  },
  {
    id: "L0 Screener",
    name: "L0 Screener",
    description: "Review applications and perform initial screening.",
    users: 2,
  },
  {
    id: "Interviewer",
    name: "Interviewer",
    description: "Access assigned interviews and submit evaluations.",
    users: 5,
  },
  {
    id: "Hiring Lead",
    name: "Hiring Lead",
    description: "Review interview outcomes and make hiring decisions.",
    users: 2,
  },
  {
    id: "Candidate",
    name: "Candidate",
    description: "Manage own profile and track personal applications.",
    users: 25,
  },
];

const permissionGroups = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    permissions: [
      { id: "dashboard.view", label: "View Dashboard" },
    ],
  },
  {
    name: "Job Management",
    icon: BriefcaseBusiness,
    permissions: [
      { id: "jobs.view", label: "View Jobs" },
      { id: "jobs.create", label: "Create Jobs" },
      { id: "jobs.edit", label: "Edit Jobs" },
      { id: "jobs.delete", label: "Delete Jobs" },
    ],
  },
  {
    name: "Candidate Management",
    icon: UserRoundSearch,
    permissions: [
      { id: "candidates.view", label: "View Candidates" },
      { id: "candidates.screen", label: "Screen Candidates" },
      { id: "candidates.edit", label: "Edit Candidate Details" },
      { id: "candidates.resume", label: "View Resumes" },
    ],
  },
  {
    name: "Application Management",
    icon: ClipboardList,
    permissions: [
      { id: "applications.view", label: "View Applications" },
      { id: "applications.manage", label: "Manage Applications" },
      { id: "applications.decide", label: "Make Stage Decisions" },
      { id: "applications.history", label: "View Decision History" },
    ],
  },
  {
    name: "Interview Management",
    icon: CalendarDays,
    permissions: [
      { id: "interviews.view", label: "View Interviews" },
      { id: "interviews.schedule", label: "Schedule Interviews" },
      { id: "interviews.evaluate", label: "Submit Evaluations" },
      { id: "interviews.decide", label: "Approve Interview Outcomes" },
    ],
  },
  {
    name: "User Management",
    icon: Users,
    permissions: [
      { id: "users.view", label: "View Users" },
      { id: "users.create", label: "Create Users" },
      { id: "users.edit", label: "Edit Users" },
      { id: "users.disable", label: "Activate / Disable Users" },
    ],
  },
  {
    name: "Roles & Permissions",
    icon: ShieldCheck,
    permissions: [
      { id: "roles.view", label: "View Roles & Permissions" },
      { id: "roles.edit", label: "Edit Permissions" },
    ],
  },
  {
    name: "System & Audit",
    icon: Settings2,
    permissions: [
      { id: "settings.view", label: "View Settings" },
      { id: "settings.edit", label: "Manage Settings" },
      { id: "audit.view", label: "View Audit Logs" },
    ],
  },
];

const allPermissionIds = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => permission.id)
);

const defaultPermissions = {
  Admin: allPermissionIds,
  HR: [
    "dashboard.view",
    "jobs.view",
    "jobs.create",
    "jobs.edit",
    "candidates.view",
    "candidates.screen",
    "candidates.edit",
    "candidates.resume",
    "applications.view",
    "applications.manage",
    "applications.decide",
    "applications.history",
    "interviews.view",
    "interviews.schedule",
    "interviews.evaluate",
    "interviews.decide",
  ],
  "L0 Screener": [
    "dashboard.view",
    "jobs.view",
    "candidates.view",
    "candidates.screen",
    "candidates.resume",
    "applications.view",
    "applications.history",
  ],
  Interviewer: [
    "dashboard.view",
    "candidates.view",
    "candidates.resume",
    "applications.view",
    "applications.history",
    "interviews.view",
    "interviews.evaluate",
  ],
  "Hiring Lead": [
    "dashboard.view",
    "jobs.view",
    "candidates.view",
    "candidates.resume",
    "applications.view",
    "applications.manage",
    "applications.decide",
    "applications.history",
    "interviews.view",
    "interviews.evaluate",
    "interviews.decide",
  ],
  Candidate: [
    "dashboard.view",
  ],
};

const cloneDefaults = () =>
  Object.fromEntries(
    roles.map((role) => [
      role.id,
      [...(defaultPermissions[role.id] || [])],
    ])
  );

const loadPermissions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return cloneDefaults();

    const parsed = JSON.parse(saved);
    const defaults = cloneDefaults();

    for (const role of roles) {
      if (Array.isArray(parsed[role.id])) {
        defaults[role.id] =
          role.id === "Admin"
            ? [...allPermissionIds]
            : parsed[role.id].filter((id) =>
                allPermissionIds.includes(id)
              );
      }
    }

    return defaults;
  } catch {
    return cloneDefaults();
  }
};

function RolePermissions() {
  const [savedPermissions, setSavedPermissions] = useState(loadPermissions);
  const [draftPermissions, setDraftPermissions] = useState(loadPermissions);
  const [selectedRole, setSelectedRole] = useState("HR");
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedPermissions)
    );
  }, [savedPermissions]);

  const activeRole = roles.find((role) => role.id === selectedRole);
  const isAdminRole = selectedRole === "Admin";

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return permissionGroups;

    return permissionGroups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.label.toLowerCase().includes(query) ||
            group.name.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [search]);

  const selectedPermissions =
    draftPermissions[selectedRole] || [];

  const grantedCount = selectedPermissions.length;

  const totalPermissions = allPermissionIds.length;

  const rolePermissionCount = (roleId) =>
    (savedPermissions[roleId] || []).length;

  const hasChanges = roles.some((role) => {
    const saved = [...(savedPermissions[role.id] || [])].sort();
    const draft = [...(draftPermissions[role.id] || [])].sort();

    return JSON.stringify(saved) !== JSON.stringify(draft);
  });

  const startEditing = () => {
    if (isAdminRole) {
      setNotice("Admin permissions are protected from changes in this screen.");
      setNoticeType("error");
      return;
    }

    setDraftPermissions(
      Object.fromEntries(
        Object.entries(savedPermissions).map(([roleId, ids]) => [
          roleId,
          [...ids],
        ])
      )
    );

    setEditing(true);
    setNotice("");
  };

  const togglePermission = (permissionId) => {
    if (!editing || isAdminRole) return;

    setDraftPermissions((current) => {
      const currentIds = current[selectedRole] || [];
      const nextIds = currentIds.includes(permissionId)
        ? currentIds.filter((id) => id !== permissionId)
        : [...currentIds, permissionId];

      return {
        ...current,
        [selectedRole]: nextIds,
      };
    });

    setNotice("");
  };

  const toggleGroup = (group) => {
    if (!editing || isAdminRole) return;

    const groupIds = group.permissions.map(
      (permission) => permission.id
    );

    const allSelected = groupIds.every((id) =>
      selectedPermissions.includes(id)
    );

    setDraftPermissions((current) => {
      const currentIds = current[selectedRole] || [];

      const nextIds = allSelected
        ? currentIds.filter((id) => !groupIds.includes(id))
        : [...new Set([...currentIds, ...groupIds])];

      return {
        ...current,
        [selectedRole]: nextIds,
      };
    });

    setNotice("");
  };

  const saveChanges = () => {
    if (!editing) return;

    const nextPermissions = {
      ...draftPermissions,
      Admin: [...allPermissionIds],
    };

    setSavedPermissions(nextPermissions);
    setDraftPermissions(nextPermissions);
    setEditing(false);
    setNoticeType("success");
    setNotice(
      "Permission changes saved in this browser. Backend enforcement still needs to be configured."
    );
  };

  const cancelChanges = () => {
    setDraftPermissions(
      Object.fromEntries(
        Object.entries(savedPermissions).map(([roleId, ids]) => [
          roleId,
          [...ids],
        ])
      )
    );

    setEditing(false);
    setNotice("");
  };

  const resetSelectedRole = () => {
    if (!editing || isAdminRole) return;

    const confirmed = window.confirm(
      `Restore default permissions for ${selectedRole}?`
    );

    if (!confirmed) return;

    setDraftPermissions((current) => ({
      ...current,
      [selectedRole]: [
        ...(defaultPermissions[selectedRole] || []),
      ],
    }));

    setNotice("");
  };

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-5 sm:py-5 xl:px-6">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#EF3B3A]">
              <ShieldCheck size={15} />
              Access Control
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#071737] dark:text-white sm:text-3xl">
              Roles & Permissions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Control which areas and actions each role can access across
              the hiring portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={startEditing}
                disabled={isAdminRole}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil size={16} />
                Edit Permissions
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancelChanges}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={!hasChanges}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {notice && (
          <div
            className={`mb-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              noticeType === "error"
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                : "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
            }`}
          >
            <div className="flex items-start gap-2">
              {noticeType === "error" ? (
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              )}
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

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Total Roles
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                <ShieldCheck size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold">{roles.length}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configured portal roles
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Available Permissions
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <LockKeyhole size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold">{totalPermissions}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Across all permission groups
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Selected Role Access
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                <CheckCircle2 size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold">{grantedCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Permissions granted to {selectedRole}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Assigned Accounts
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                <Users size={20} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold">
              {activeRole?.users ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Accounts assigned to {selectedRole}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Portal Roles
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select a role to inspect or configure its permissions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {roles.map((role) => {
              const selected = selectedRole === role.id;
              const count = rolePermissionCount(role.id);
              const RoleIcon =
                role.id === "Admin"
                  ? ShieldCheck
                  : role.id === "Candidate"
                    ? UserRoundSearch
                    : Users;

              return (
                <button
                  type="button"
                  key={role.id}
                  onClick={() => {
                    if (editing && hasChanges) {
                      const confirmed = window.confirm(
                        "Discard unsaved permission changes and switch roles?"
                      );

                      if (!confirmed) return;

                      setDraftPermissions(
                        Object.fromEntries(
                          Object.entries(savedPermissions).map(
                            ([roleId, ids]) => [roleId, [...ids]]
                          )
                        )
                      );
                    }

                    setSelectedRole(role.id);
                    setEditing(false);
                    setNotice("");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-[#EF3B3A] bg-red-50/60 ring-1 ring-[#EF3B3A]/20 dark:bg-red-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-[#EF3B3A] text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <RoleIcon size={20} />
                    </span>

                    {selected && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        SELECTED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {role.name}
                  </h3>

                  <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {role.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {count}/{totalPermissions}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Permissions
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-semibold text-[#EF3B3A]">
                      Configure <ChevronRight size={15} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Permission Matrix
                </h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    editing
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {editing ? "Edit mode" : "View mode"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedRole}: {grantedCount} of {totalPermissions} permissions enabled
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Find permission..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#EF3B3A] dark:border-slate-700 dark:bg-slate-950 sm:w-56"
                />
              </div>

              {editing && !isAdminRole && (
                <button
                  type="button"
                  onClick={resetSelectedRole}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <RotateCcw size={14} />
                  Reset defaults
                </button>
              )}
            </div>
          </div>

          {isAdminRole && (
            <div className="flex items-start gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 sm:px-5">
              <LockKeyhole size={16} className="mt-0.5 shrink-0" />
              Admin has full access in this prototype and cannot be modified
              from this page. Backend authorization must independently enforce
              administrator access.
            </div>
          )}

          {editing && (
            <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 sm:px-5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              Changes are drafts until you select Save Changes. Saving here
              updates browser storage only, not the backend.
            </div>
          )}

          <div className="overflow-x-auto">
            {visibleGroups.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                No matching permissions found.
              </div>
            ) : (
              <table className="w-full min-w-162.5 text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Permission
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Access
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {editing ? "Change" : "Mode"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const groupIds = group.permissions.map(
                      (permission) => permission.id
                    );

                    const allSelected = groupIds.every((id) =>
                      selectedPermissions.includes(id)
                    );

                    return (
                      <FragmentGroup
                        key={group.name}
                        group={group}
                        GroupIcon={GroupIcon}
                        allSelected={allSelected}
                        editing={editing}
                        isAdminRole={isAdminRole}
                        selectedPermissions={selectedPermissions}
                        toggleGroup={toggleGroup}
                        togglePermission={togglePermission}
                      />
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-green-600" />
                Granted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole size={14} />
                Restricted
              </span>
              <span>
                {grantedCount} granted · {totalPermissions - grantedCount} restricted
              </span>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelChanges}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveChanges}
                    disabled={!hasChanges}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEditing}
                  disabled={isAdminRole}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil size={16} />
                  Edit Permissions
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
            <LockKeyhole size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Server-side enforcement required
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              These settings currently control the permission matrix UI only.
              The backend must load the saved permissions, verify the
              authenticated user's role for every protected API request, and
              deny unauthorized operations. Do not rely on frontend checks
              alone to protect recruitment data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentGroup({
  group,
  GroupIcon,
  allSelected,
  editing,
  isAdminRole,
  selectedPermissions,
  toggleGroup,
  togglePermission,
}) {
  return (
    <>
      <tr className="border-t border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30">
        <td colSpan={3} className="px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <GroupIcon
                size={17}
                className="text-slate-500 dark:text-slate-400"
              />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {group.name}
              </span>
              <span className="text-xs text-slate-400">
                {group.permissions.length}
              </span>
            </div>

            {editing && !isAdminRole && (
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="text-xs font-semibold text-[#EF3B3A] hover:underline"
              >
                {allSelected ? "Clear group" : "Select group"}
              </button>
            )}
          </div>
        </td>
      </tr>

      {group.permissions.map((permission) => {
        const allowed = selectedPermissions.includes(permission.id);

        return (
          <tr
            key={permission.id}
            className="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/20"
          >
            <td className="px-5 py-4">
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {permission.label}
              </span>
            </td>

            <td className="px-5 py-4 text-center">
              {allowed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  <Check size={14} />
                  Allowed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <X size={13} />
                  Denied
                </span>
              )}
            </td>

            <td className="px-5 py-4 text-right">
              {editing && !isAdminRole ? (
                <label className="inline-flex cursor-pointer items-center justify-end gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {allowed ? "On" : "Off"}
                  </span>
                  <input
                    type="checkbox"
                    checked={allowed}
                    onChange={() => togglePermission(permission.id)}
                    aria-label={`${permission.label} permission`}
                    className="h-4 w-4 cursor-pointer rounded accent-[#EF3B3A]"
                  />
                </label>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Eye size={14} />
                  View
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default RolePermissions;