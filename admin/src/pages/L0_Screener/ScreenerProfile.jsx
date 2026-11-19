import { useState } from "react";
import { UserRound, Mail, ShieldCheck, Briefcase, Phone } from "lucide-react";

import useApi from "../../services/useApi.js";
import {
  getScreenerProfile,
  updateScreenerProfile,
} from "../../services/screening.js";

// GET /api/screenings/profile, PATCH /api/screenings/profile (name, phone)
const ScreenerProfile = () => {
  const { data, loading, error, reload } = useApi(
    (signal) => getScreenerProfile(signal),
    []
  );

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const profile = data?.profile;

  const startEditing = () => {
    setMessage({ type: "", text: "" });
    setForm({ name: profile.name || "", phone: profile.phone || "" });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await updateScreenerProfile({
        name: form.name,
        phone: form.phone,
      });

      setForm(null);
      setMessage({ type: "success", text: "Profile updated." });
      reload();
    } catch (requestError) {
      setMessage({ type: "error", text: requestError.message });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and update your screener account information.
        </p>
      </div>

      {message.text && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`max-w-3xl rounded-lg px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500" role="status">
          Loading profile...
        </p>
      ) : error ? (
        <div role="alert">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-2 text-sm font-medium text-red-500 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
              <UserRound size={36} />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">
                {profile.name || "L0 Screener"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {profile.designation || "L0 Screener"}
              </p>
            </div>

            {!form && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:ml-auto"
              >
                Edit profile
              </button>
            )}
          </div>

          {form ? (
            <form onSubmit={save} className="grid gap-5 pt-6 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Full name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>

              <p className="text-xs text-gray-500 sm:col-span-2">
                Email, role and department are managed by an administrator.
              </p>

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 pt-6 sm:grid-cols-2">
              {[
                ["Full Name", UserRound, profile.name],
                ["Email Address", Mail, profile.email],
                ["Phone", Phone, profile.phone],
                ["Portal Role", ShieldCheck, profile.role],
                ["Department", Briefcase, profile.department],
              ].map(([label, Icon, value]) => (
                <div key={label}>
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                    {label}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Icon size={17} className="text-gray-400" />
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenerProfile;
