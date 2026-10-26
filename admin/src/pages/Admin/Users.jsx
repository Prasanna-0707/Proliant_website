
import { useState } from "react";

const initialUsers = [
  {
    id: 1,
    name: "Prasanna Kumar",
    email: "prasanna@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "HR Manager",
    email: "hr@example.com",
    role: "HR",
    status: "Active",
  },
  {
    id: 3,
    name: "Interview Lead",
    email: "lead@example.com",
    role: "Interviewer",
    status: "Inactive",
  },
];

function Users() {
  const [users] = useState(initialUsers);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and their access to the recruitment portal.
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          + Add User
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="mt-2 text-2xl font-bold">{users.length}</h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Active Users</p>
          <h2 className="mt-2 text-2xl font-bold">
            {users.filter((user) => user.status === "Active").length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Inactive Users</p>
          <h2 className="mt-2 text-2xl font-bold">
            {users.filter((user) => user.status === "Inactive").length}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-175 text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t text-sm">
                <td className="px-5 py-4 font-medium text-gray-800">
                  {user.name}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {user.email}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {user.role}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      user.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="mr-3 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                  >
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
