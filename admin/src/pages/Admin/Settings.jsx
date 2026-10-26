
import { useState } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    companyName: "Proliant",
    companyEmail: "hr@proliant.com",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    interviewReminders: true,
    applicationNotifications: true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    // Temporary UI only. Backend integration will be added later.
    alert("Settings saved temporarily!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage organization and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 font-semibold text-gray-800">
            Organization Settings
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Company Name
              </label>

              <input
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Company Email
              </label>

              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Timezone
              </label>

              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-400"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">
                  America/New_York
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 font-semibold text-gray-800">
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {[
              {
                name: "emailNotifications",
                label: "Email Notifications",
                description: "Receive important updates through email.",
              },
              {
                name: "interviewReminders",
                label: "Interview Reminders",
                description: "Receive reminders for upcoming interviews.",
              },
              {
                name: "applicationNotifications",
                label: "Application Notifications",
                description: "Receive updates about candidate applications.",
              },
            ].map((item) => (
              <label
                key={item.name}
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={settings[item.name]}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-red-500"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    {item.label}
                  </span>

                  <span className="mt-1 block text-sm text-gray-500">
                    {item.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
