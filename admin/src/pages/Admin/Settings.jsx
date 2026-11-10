
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  BriefcaseBusiness,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Mail,
  CalendarDays,
  FileText,
  LockKeyhole,
  Info,
  Users,
} from "lucide-react";

const STORAGE_KEY = "proliantAdminSettings";

const defaultSettings = {
  portalName: "Proliant Hiring Portal",
  supportEmail: "hr@proliant.com",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  emailNotifications: true,
  interviewReminders: true,
  applicationNotifications: true,
  candidateStatusNotifications: true,
  reminderHours: "24",
  reapplicationMonths: "6",
  resumeRequired: true,
  allowCandidateRegistration: true,
  sessionTimeout: "30",
  maxLoginAttempts: "5",
  passwordMinLength: "8",
};

const notificationOptions = [
  {
    name: "emailNotifications",
    title: "Email Notifications",
    description: "Enable portal email notifications for configured workflows.",
    icon: Mail,
  },
  {
    name: "interviewReminders",
    title: "Interview Reminders",
    description: "Send reminders for upcoming scheduled interviews.",
    icon: CalendarDays,
  },
  {
    name: "applicationNotifications",
    title: "Application Notifications",
    description: "Notify authorized recruitment team members about applications.",
    icon: BriefcaseBusiness,
  },
  {
    name: "candidateStatusNotifications",
    title: "Candidate Status Updates",
    description: "Enable notifications when application stages change.",
    icon: Bell,
  },
];

function readSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return { ...defaultSettings };

    return {
      ...defaultSettings,
      ...JSON.parse(saved),
    };
  } catch {
    return { ...defaultSettings };
  }
}

function Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [savedSettings, setSavedSettings] = useState(readSettings);
  const [activeSection, setActiveSection] = useState("general");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  useEffect(() => {
    const stored = readSettings();
    setSettings(stored);
    setSavedSettings(stored);
  }, []);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const updateSetting = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setNotice("");
  };

  const saveSettings = (event) => {
    event.preventDefault();

    if (
      !settings.portalName.trim() ||
      !settings.supportEmail.trim()
    ) {
      setNoticeType("error");
      setNotice("Portal name and support email are required.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)
    ) {
      setNoticeType("error");
      setNotice("Please enter a valid support email address.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSettings({ ...settings });
      setNoticeType("success");
      setNotice("Settings saved in this browser successfully.");
    } catch {
      setNoticeType("error");
      setNotice("Unable to save settings in browser storage.");
    }
  };

  const resetSettings = () => {
    setSettings({ ...savedSettings });
    setNotice("");
  };

  const restoreDefaults = () => {
    const confirmed = window.confirm(
      "Restore all settings to their default values? Save Settings to apply them."
    );

    if (!confirmed) return;

    setSettings({ ...defaultSettings });
    setNoticeType("success");
    setNotice("Default values restored in the form. Save to keep these changes.");
  };

  const sections = [
    {
      id: "general",
      label: "General",
      description: "Portal information",
      icon: Building2,
    },
    {
      id: "recruitment",
      label: "Recruitment",
      description: "Hiring workflow preferences",
      icon: BriefcaseBusiness,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Email and reminders",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      description: "Session and login policy",
      icon: ShieldCheck,
    },
  ];

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#EF3B3A] focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-red-950";

  const labelClass =
    "text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <div className="min-h-full bg-slate-50 px-3 py-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-5 sm:py-5 xl:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#EF3B3A]">
            <SettingsIcon size={15} />
            Portal Configuration
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#071737] dark:text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage hiring portal preferences, recruitment workflows and
            notification settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <RotateCcw size={16} />
            Restore Defaults
          </button>

          <button
            type="submit"
            form="admin-settings-form"
            disabled={!hasChanges}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            noticeType === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
          }`}
        >
          {noticeType === "error" ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Settings Menu
          </p>

          <div className="flex gap-2 overflow-x-auto lg:flex-col">
            {sections.map((section) => {
              const Icon = section.icon;
              const selected = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left transition lg:w-full ${
                    selected
                      ? "bg-red-50 text-[#EF3B3A] dark:bg-red-950/30"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-white text-[#EF3B3A] dark:bg-slate-900"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span>
                    <span className="block text-sm font-semibold">
                      {section.label}
                    </span>
                    <span className="mt-0.5 hidden text-xs text-slate-400 lg:block">
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 hidden rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 lg:block">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Info size={15} />
              Configuration status
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {hasChanges
                ? "You have unsaved changes."
                : "No unsaved changes."}
            </p>
          </div>
        </aside>

        <form
          id="admin-settings-form"
          onSubmit={saveSettings}
          className="min-w-0 space-y-5"
        >
          {activeSection === "general" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <Building2 size={21} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    General Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Configure the portal identity and regional preferences.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Portal Name</label>
                  <input
                    name="portalName"
                    value={settings.portalName}
                    onChange={updateSetting}
                    className={inputClass}
                    placeholder="Hiring Portal"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={updateSetting}
                    className={inputClass}
                    placeholder="hr@company.com"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Timezone</label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={updateSetting}
                    className={inputClass}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">
                      America/New_York
                    </option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Date Format</label>
                  <select
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={updateSetting}
                    className={inputClass}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {activeSection === "recruitment" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                  <BriefcaseBusiness size={21} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Recruitment Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Configure candidate application and hiring workflow preferences.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Same-Position Reapplication Waiting Period
                    </label>
                    <select
                      name="reapplicationMonths"
                      value={settings.reapplicationMonths}
                      onChange={updateSetting}
                      className={inputClass}
                    >
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="9">9 months</option>
                      <option value="12">12 months</option>
                    </select>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Default is 6 months. Backend application validation
                      must enforce this rule.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Interview Reminder Lead Time
                    </label>
                    <select
                      name="reminderHours"
                      value={settings.reminderHours}
                      onChange={updateSetting}
                      className={inputClass}
                    >
                      <option value="1">1 hour before</option>
                      <option value="24">24 hours before</option>
                      <option value="48">48 hours before</option>
                      <option value="72">72 hours before</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <SettingToggle
                    icon={FileText}
                    title="Require Resume Upload"
                    description="Require candidates to provide a resume when applying, if this policy is enabled."
                    name="resumeRequired"
                    checked={settings.resumeRequired}
                    onChange={updateSetting}
                  />

                  <SettingToggle
                    icon={Users}
                    title="Candidate Registration"
                    description="Allow candidates to create portal accounts."
                    name="allowCandidateRegistration"
                    checked={settings.allowCandidateRegistration}
                    onChange={updateSetting}
                  />
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-2.5">
                    <Info
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Interview stages
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-300">
                        Interview stages and stage-specific decisions should
                        be configured through the recruitment workflow and
                        permissions modules. This page does not create or
                        change interview stages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                  <Bell size={21} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Notification Preferences
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Choose which notification categories are enabled in the portal.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notificationOptions.map((option) => (
                  <SettingToggle
                    key={option.name}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    name={option.name}
                    checked={settings[option.name]}
                    onChange={updateSetting}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <p className="text-xs leading-5 text-amber-800 dark:text-amber-300">
                  These switches save preference values only. Actual email
                  delivery depends on backend notification services and email
                  provider configuration.
                </p>
              </div>
            </section>
          )}

          {activeSection === "security" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Security Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Review the intended session and authentication policies.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Session Timeout</label>
                  <select
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={updateSetting}
                    className={inputClass}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Intended inactivity timeout for authenticated sessions.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Maximum Login Attempts</label>
                  <select
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={updateSetting}
                    className={inputClass}
                  >
                    <option value="3">3 attempts</option>
                    <option value="5">5 attempts</option>
                    <option value="10">10 attempts</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Intended failed-login limit before protective action.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Minimum Password Length</label>
                  <select
                    name="passwordMinLength"
                    value={settings.passwordMinLength}
                    onChange={updateSetting}
                    className={inputClass}
                  >
                    <option value="8">8 characters</option>
                    <option value="10">10 characters</option>
                    <option value="12">12 characters</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Intended minimum length for new or changed passwords.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-2.5">
                  <LockKeyhole
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Backend enforcement required
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
                      Saving these values does not change actual authentication
                      behavior. The backend must enforce session expiry,
                      failed-login limits, and password policies. Do not rely
                      on browser storage for security controls.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock3 size={15} />
              {hasChanges
                ? "You have unsaved changes."
                : "All displayed settings are saved."}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetSettings}
                disabled={!hasChanges}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={!hasChanges}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  name,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={17} />
        </span>

        <span>
          <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </span>
        </span>
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#EF3B3A]"
      />
    </label>
  );
}

export default Settings;
