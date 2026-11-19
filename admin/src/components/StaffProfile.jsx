import { useState } from "react";

import DataState from "./StateMessage.jsx";
import useApi from "../services/useApi.js";
import { apiRequest, getToken, saveSession } from "../services/http.js";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 disabled:bg-gray-50 disabled:text-gray-500";

// Profile page shared by the staff portals.
//   GET   /api/auth/me
//   PATCH /api/auth/profile   (name, phone, designation only)
export default function StaffProfile({ title = "My Profile" }) {
  const { data, loading, error, reload } = useApi(
    (signal) => apiRequest("/auth/me", { signal }),
    []
  );

  const profile = data?.user;

  const [form, setForm] = useState(null);
  const [state, setState] = useState({ busy: false, error: "", saved: false });

  const values = form || {
    name: profile?.name || "",
    phone: profile?.phone || "",
    designation: profile?.designation || "",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "", saved: false });

    try {
      const response = await apiRequest("/auth/profile", {
        method: "PATCH",
        body: {
          name: values.name,
          phone: values.phone,
          designation: values.designation,
        },
      });

      // Keep the name/designation shown in the header current.
      saveSession("staff", getToken("staff"), response.admin || response.user);

      setState({ busy: false, error: "", saved: true });
      setForm(null);
      reload();
    } catch (requestError) {
      setState({ busy: false, error: requestError.message, saved: false });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and update your account details.
        </p>
      </div>

      <DataState loading={loading} error={error} onRetry={reload}>
        {profile && (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            {[
              ["name", "Full Name", false],
              ["phone", "Phone", false],
              ["designation", "Designation", false],
            ].map(([name, label]) => (
              <div key={name}>
                <label htmlFor={`profile-${name}`} className="block text-sm font-medium">
                  {label}
                </label>
                <input
                  id={`profile-${name}`}
                  value={values[name]}
                  onChange={(event) =>
                    setForm({ ...values, [name]: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
            ))}

            {[
              ["Email", profile.email],
              ["Role", profile.role],
              ["Department", profile.department],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="block text-sm font-medium">{label}</label>
                <input value={value || "—"} disabled className={inputClass} />
              </div>
            ))}

            {state.error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </p>
            )}

            {state.saved && (
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Profile updated successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={state.busy || !form}
              className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
            >
              {state.busy ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </DataState>
    </div>
  );
}
