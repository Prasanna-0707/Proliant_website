import { useState } from "react";

import DataState, { EmptyState } from "../../components/StateMessage.jsx";
import useApi from "../../services/useApi.js";
import { listSettings, saveSetting } from "../../services/adminConsole.js";
import { formatDateTime } from "../../services/format.js";

const CATEGORIES = ["GENERAL", "SECURITY", "NOTIFICATIONS", "RECRUITMENT"];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";

// Administrator settings.
//   GET   /api/admin/settings
//   PATCH /api/admin/settings   (create or update one setting; Global Administrators)
export default function Settings() {
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({ key: "", value: "", category: "GENERAL", description: "", reason: "" });
  const [state, setState] = useState({ busy: false, error: "", saved: false });

  const { data, loading, error, reload } = useApi(
    (signal) => listSettings({ category }, signal),
    [category]
  );

  const settings = data?.settings || [];
  const canUpdate = Boolean(data?.permissions?.canUpdate);

  const edit = (setting) => {
    setForm({
      key: setting.key,
      value: typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value),
      category: setting.category,
      description: setting.description || "",
      reason: "",
    });
    setState({ busy: false, error: "", saved: false });
  };

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "", saved: false });

    // Numbers, booleans and JSON are sent as such; anything else as text.
    let value = form.value;

    try {
      value = JSON.parse(form.value);
    } catch {
      /* keep the text as entered */
    }

    try {
      await saveSetting({
        key: form.key.trim().toLowerCase(),
        value,
        category: form.category,
        description: form.description.trim(),
        reason: form.reason.trim(),
      });

      setState({ busy: false, error: "", saved: true });
      reload();
    } catch (requestError) {
      setState({ busy: false, error: requestError.message, saved: false });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administrator configuration values. Credentials and secrets cannot be stored here.
        </p>
      </div>

      <div className="flex gap-2">
        {["", ...CATEGORIES].map((item) => (
          <button
            key={item || "all"}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              category === item ? "border-red-500 bg-red-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-red-50"
            }`}
          >
            {item || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <DataState loading={loading} error={error} onRetry={reload}>
          {settings.length === 0 ? (
            <EmptyState text="No settings have been saved yet." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Key</th>
                  <th className="px-5 py-4 font-semibold">Value</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Updated</th>
                  {canUpdate && <th className="px-5 py-4" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.map((setting) => (
                  <tr key={setting._id || setting.key}>
                    <td className="px-5 py-4 font-medium text-gray-900">{setting.key}</td>
                    <td className="px-5 py-4 text-gray-700">{typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)}</td>
                    <td className="px-5 py-4 text-gray-600">{setting.category}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{formatDateTime(setting.updatedAt)}</td>
                    {canUpdate && (
                      <td className="px-5 py-4 text-right">
                        {setting.isEditable !== false && (
                          <button type="button" onClick={() => edit(setting)} className="text-xs font-semibold text-red-500 hover:underline">Edit</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataState>
      </div>

      {canUpdate && (
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Add or update a setting</h2>

          <label className="block text-sm font-medium text-gray-700">
            Key (lowercase letters, numbers, dots, dashes)
            <input required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Value
            <input required value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass}>
              {CATEGORIES.map((item) => (<option key={item}>{item}</option>))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Description
            <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Reason
            <input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className={inputClass} />
          </label>

          {state.error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
          )}
          {state.saved && (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Setting saved.</p>
          )}

          <button type="submit" disabled={state.busy} className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
            {state.busy ? "Saving..." : "Save setting"}
          </button>
        </form>
      )}
    </div>
  );
}
