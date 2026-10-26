
import { useState } from "react";

const initialRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Full access to authorized administration features.",
    users: 1,
  },
  {
    id: 2,
    name: "HR",
    description: "Manage jobs, candidates, and recruitment activities.",
    users: 3,
  },
  {
    id: 3,
    name: "Interviewer",
    description: "Access assigned interviews and candidate evaluations.",
    users: 5,
  },
  {
    id: 4,
    name: "Candidate",
    description: "Manage profile and track own job applications.",
    users: 25,
  },
];

const permissions = [
  "View Dashboard",
  "Manage Jobs",
  "View Candidates",
  "Manage Applications",
  "Manage Interviews",
  "Manage Users",
  "Manage Roles",
  "View Audit Logs",
];

function RolePermissions() {
  const [roles] = useState(initialRoles);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Roles & Permissions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Configure role-based access for the recruitment portal.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{role.name}</h2>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {role.users} users
              </span>
            </div>

            <p className="text-sm text-gray-500">{role.description}</p>

            <button
              type="button"
              className="mt-4 text-sm font-medium text-red-500 hover:underline"
            >
              Configure Permissions
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold text-gray-800">
            Permission Overview
          </h2>
        </div>

        <table className="w-full min-w-175 text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-5 py-4">Permission</th>

              {roles.map((role) => (
                <th key={role.id} className="px-5 py-4">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {permissions.map((permission, index) => (
              <tr key={permission} className="border-t text-sm">
                <td className="px-5 py-4 text-gray-700">
                  {permission}
                </td>

                {roles.map((role) => {
                  const allowed =
                    role.name === "Admin" ||
                    (role.name === "HR" &&
                      index >= 0 &&
                      index <= 4) ||
                    (role.name === "Interviewer" &&
                      (index === 0 || index === 4)) ||
                    (role.name === "Candidate" && index === 0);

                  return (
                    <td key={role.id} className="px-5 py-4">
                      <span
                        className={
                          allowed
                            ? "font-semibold text-green-600"
                            : "text-gray-300"
                        }
                      >
                        {allowed ? "✓" : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RolePermissions;