import { useMemo, useState } from "react";

import DataState from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listRoles, updateRolePermissions } from "../../services/adminConsole.js";

// Accepts the catalog as strings or { key, description } objects.
const normalizeCatalog = (available = []) =>
  available.flatMap((item) =>
    Array.isArray(item?.permissions)
      ? item.permissions.map((permission) => ({
          key: permission.key || permission,
          description: permission.description || "",
          group: item.group || item.title || item.label || "",
        }))
      : [
          {
            key: item?.key || item,
            description: item?.description || "",
            group: item?.group || "",
          },
        ]
  );

// Roles and their permissions.
//   GET /api/admin/roles
//   PUT /api/admin/roles/:id/permissions   (Global Administrators only)
export default function RolePermissions() {
  const { data, loading, error, reload } = useApi(
    (signal) => listRoles({ includeInactive: "true" }, signal),
    []
  );

  const roles = useMemo(() => data?.roles || [], [data]);
  const catalog = useMemo(() => normalizeCatalog(data?.availablePermissions), [data]);
  const canModify = Boolean(data?.canModifyPermissions);

  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(null);
  const [reason, setReason] = useState("");
  const [state, setState] = useState({ busy: false, error: "", saved: false });

  const role = roles.find((item) => item._id === selectedId) || roles[0];
  const current = draft ?? role?.permissions ?? [];

  const groups = useMemo(() => {
    const map = new Map();

    for (const permission of catalog) {
      const group = permission.group || permission.key.split(".")[0];

      if (!map.has(group)) map.set(group, []);

      map.get(group).push(permission);
    }

    return [...map.entries()];
  }, [catalog]);

  const toggle = (key) =>
    setDraft(
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );

  const dirty =
    draft !== null &&
    [...draft].sort().join("|") !== [...(role?.permissions || [])].sort().join("|");

  const save = async () => {
    setState({ busy: true, error: "", saved: false });

    try {
      await updateRolePermissions(role._id, { permissions: current, reason: reason.trim() });

      setState({ busy: false, error: "", saved: true });
      setDraft(null);
      setReason("");
      reload();
    } catch (requestError) {
      setState({ busy: false, error: requestError.message, saved: false });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles &amp; Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          {canModify
            ? "Choose which actions each role may perform."
            : "You can view role permissions. Only Global Administrators can change them."}
        </p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Roles" className="space-y-2">
            {roles.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  setSelectedId(item._id);
                  setDraft(null);
                  setState({ busy: false, error: "", saved: false });
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  role?._id === item._id
                    ? "border-red-500 bg-red-50 font-semibold text-red-600"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.name}
                <span className="block text-xs font-normal text-gray-500">
                  {item.permissions.length} permission(s){item.isActive ? "" : " · inactive"}
                </span>
              </button>
            ))}
          </nav>

          {role && (
            <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{role.name}</h2>
                <p className="text-sm text-gray-500">{role.description}</p>
                <p className="mt-1 text-xs text-gray-400">Data scope: {role.dataScope}</p>
              </div>

              {groups.map(([group, permissions]) => (
                <fieldset key={group}>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{group}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {permissions.map((permission) => (
                      <label key={permission.key} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 text-sm">
                        <input
                          type="checkbox"
                          checked={current.includes(permission.key)}
                          disabled={!canModify}
                          onChange={() => toggle(permission.key)}
                          className="mt-1 h-4 w-4 accent-red-500"
                        />
                        <span>
                          <span className="block font-medium text-gray-800">{permission.key}</span>
                          {permission.description && (
                            <span className="block text-xs text-gray-500">{permission.description}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {canModify && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for change
                    <input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                    />
                  </label>

                  {state.error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
                  )}
                  {state.saved && (
                    <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Permissions updated.</p>
                  )}

                  <button
                    type="button"
                    onClick={save}
                    disabled={!dirty || state.busy}
                    className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {state.busy ? "Saving..." : "Save permissions"}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </DataState>
    </div>
  );
}
