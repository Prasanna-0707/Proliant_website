import { useState } from "react";
import { UserRound, Mail, Phone, BriefcaseBusiness, Building2, Save, Camera } from "lucide-react";

const initialProfile = {
  name: "Prasanna Kumar",
  email: "hiring.manager@proliant.com",
  phone: "+91 98765 43210",
  employeeId: "EMP-HM-001",
  designation: "Hiring Manager",
  department: "Talent Acquisition",
  location: "Hyderabad, India",
  bio: "Responsible for interview coordination, evaluation reviews, and hiring decisions.",
};

export default function HiringManagerProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setEditing(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage your Hiring Manager profile information.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="h-32 bg-linear-to-r from-red-600 to-rose-400" />

        <div className="px-5 pb-5 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 text-gray-500 shadow-sm dark:border-gray-900 dark:bg-gray-800">
                <UserRound size={42} />
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.designation}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing((current) => !current);
                setSaved(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Camera size={16} /> {editing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/30"><Mail size={18} /></div>
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white">{profile.email}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2.5 text-green-600 dark:bg-green-950/30"><Phone size={18} /></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{profile.phone}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/30"><BriefcaseBusiness size={18} /></div>
              <div><p className="text-xs text-gray-500">Employee ID</p><p className="text-sm font-medium text-gray-900 dark:text-white">{profile.employeeId}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/30"><Building2 size={18} /></div>
              <div><p className="text-xs text-gray-500">Department</p><p className="text-sm font-medium text-gray-900 dark:text-white">{profile.department}</p></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <p className="mt-1 text-sm text-gray-500">Your basic profile and work details.</p>
          </div>
          {saved && <span className="text-sm font-medium text-green-600">Profile updated successfully.</span>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            { label: "Full Name", name: "name", type: "text" },
            { label: "Email Address", name: "email", type: "email" },
            { label: "Phone Number", name: "phone", type: "tel" },
            { label: "Employee ID", name: "employeeId", type: "text" },
            { label: "Designation", name: "designation", type: "text" },
            { label: "Department", name: "department", type: "text" },
            { label: "Location", name: "location", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={profile[field.name]}
                onChange={handleChange}
                disabled={!editing}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-400 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">About</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              disabled={!editing}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-400 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
            />
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700">
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}