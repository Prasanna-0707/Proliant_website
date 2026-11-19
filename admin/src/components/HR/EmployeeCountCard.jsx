import { useEffect, useState } from "react";

import { getEmployeeCount, saveEmployeeCount } from "../../services/employees.js";

// GET/PUT /api/settings/employee-count: the headcount shown on the public
// "Proliant in Numbers" section of the careers site.
export default function EmployeeCountCard() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getEmployeeCount()
      .then((data) => {
        if (active) setValue(String(data.employeeCount ?? data.setting?.employeeCount ?? ""));
      })
      .catch((requestError) => {
        if (active) setMessage({ type: "error", text: requestError.message });
      });

    return () => {
      active = false;
    };
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await saveEmployeeCount(Number(value));
      setMessage({ type: "success", text: "Public employee count updated." });
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={save}
      className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-end"
    >
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
          Employee count shown on the careers site
        </span>
        <input
          required
          type="number"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Update"}
      </button>

      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
