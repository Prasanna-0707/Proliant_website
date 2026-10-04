import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  email: "",
  role: "HR",
};

const inputClass =
  "w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/30";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200";

function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  };

  // FETCH TEAM MEMBERS
  const fetchTeamMembers = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/team-members`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load team members."
        );
      }

      setTeamMembers(result.teamMembers || result.data || []);
    } catch (error) {
      console.error("Failed to fetch team members:", error);

      setPageError(
        error.message || "Unable to load team members. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // SEARCH AND STATUS FILTER
  const filteredTeamMembers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return teamMembers.filter((member) => {
      const matchesSearch =
        !searchValue ||
        member.name?.toLowerCase().includes(searchValue) ||
        member.email?.toLowerCase().includes(searchValue) ||
        member.role?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teamMembers, search, statusFilter]);

  // FORM HANDLING
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.role) {
      newErrors.role = "Role is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ADD TEAM MEMBER
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingMember(null);
    setFormData(emptyForm);
    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  // EDIT TEAM MEMBER
  const openEditModal = (member) => {
    setIsEditMode(true);
    setEditingMember(member);

    setFormData({
      name: member.name || "",
      email: member.email || "",
      role: member.role || "HR",
    });

    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  // CREATE / UPDATE TEAM MEMBER
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const memberId = editingMember?._id || editingMember?.id;

      const response = await fetch(
        isEditMode
          ? `${API_BASE_URL}/auth/team-members/${memberId}`
          : `${API_BASE_URL}/auth/team-members`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            (isEditMode
              ? "Failed to update team member."
              : "Failed to create team member.")
        );
      }

      await fetchTeamMembers();

      setFormData(emptyForm);
      setErrors({});
      setEditingMember(null);
      setIsEditMode(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Team member save failed:", error);

      setErrors({
        submit:
          error.message ||
          (isEditMode
            ? "Unable to update team member."
            : "Unable to create team member."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // CLOSE FORM MODAL
  const handleCloseModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setFormData(emptyForm);
    setErrors({});
    setEditingMember(null);
    setIsEditMode(false);
  };

  // ACTIVATE / DEACTIVATE TEAM MEMBER
  const handleToggleStatus = async (member) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const memberId = member._id || member.id;
    const newStatus =
      member.status === "Active" ? "Inactive" : "Active";

    setOpenMenuId(null);
    setPageError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/team-members/${memberId}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update team member status."
        );
      }

      await fetchTeamMembers();
    } catch (error) {
      console.error("Team member status update failed:", error);

      setPageError(
        error.message || "Unable to update team member status."
      );
    }
  };

  // DELETE TEAM MEMBER
  const handleDelete = async () => {
    if (!deleteMember) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const memberId = deleteMember._id || deleteMember.id;

    setIsDeleting(true);
    setPageError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/team-members/${memberId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete team member."
        );
      }

      setTeamMembers((previous) =>
        previous.filter(
          (member) => (member._id || member.id) !== memberId
        )
      );

      setDeleteMember(null);
    } catch (error) {
      console.error("Team member deletion failed:", error);

      setPageError(
        error.message ||
          "Unable to delete team member. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // TABLE COLUMNS
  const teamMemberColumns = [
    {
      key: "name",
      label: "Team Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/50 dark:text-red-400">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {member.name || member.email}
            </p>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {member.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (member) => (
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {member.role || "HR"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (member) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            member.status === "Active"
              ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {member.status || "Active"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (member) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {member.createdAt
            ? new Date(member.createdAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (member) => {
        const memberId = member._id || member.id;

        return (
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setOpenMenuId((previous) =>
                  previous === memberId ? null : memberId
                );
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Team member actions"
            >
              <MoreVertical size={18} />
            </button>

            {openMenuId === memberId && (
              <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Pencil size={16} />
                  <span>Edit Team Member</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(member)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {member.status === "Active" ? (
                    <UserX size={16} />
                  ) : (
                    <UserCheck size={16} />
                  )}

                  <span>
                    {member.status === "Active"
                      ? "Set Inactive"
                      : "Set Active"}
                  </span>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  type="button"
                  onClick={() => {
                    setDeleteMember(member);
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={16} />
                  <span>Delete Team Member</span>
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative min-h-screen bg-gray-100 p-5 transition-colors dark:bg-gray-950 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Team Members
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your internal admin and HR team members.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
        >
          <Plus size={18} />
          Add Team Member
        </button>
      </div>

      {/* Error Message */}
      {pageError && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {pageError}
          </p>

          <button
            type="button"
            onClick={() => setPageError("")}
            className="text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-300"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search team members..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-red-950/30 sm:w-40"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Team Members Table */}
      <section
        className="
          overflow-hidden rounded-xl border border-gray-200 bg-white
          transition-colors
          dark:border-gray-800 dark:bg-gray-900
          dark:[&_thead_tr]:border-gray-700
          dark:[&_thead_tr]:bg-gray-800
          dark:[&_thead_tr_th]:text-gray-300
          dark:[&_tbody_tr]:border-gray-700
          dark:[&_tbody_tr]:bg-gray-900
          dark:[&_tbody_tr:hover]:bg-gray-800
          dark:[&_tbody_tr_td]:text-gray-200
        "
      >
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Team Member List
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Loading team members..."
              : `${filteredTeamMembers.length} team member${
                  filteredTeamMembers.length !== 1 ? "s" : ""
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading team members...
            </p>
          </div>
        ) : (
          <DataTable
            columns={teamMemberColumns}
            data={filteredTeamMembers}
            emptyMessage="No team members found."
          />
        )}
      </section>

      {/* Add / Edit Team Member Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEditMode ? "Edit Team Member" : "Add Team Member"}
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isEditMode
                    ? "Update the team member details."
                    : "Add a new admin or HR team member."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter team member name"
                    className={`${inputClass} ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  />

                  {errors.name && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="member@proliant.com"
                    className={`${inputClass} ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className={labelClass}>
                    Role
                  </label>

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`${inputClass} ${
                      errors.role
                        ? "border-red-300 focus:border-red-400 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <option value="Admin">Admin</option>
                    <option value="HR">HR</option>
                  </select>

                  {errors.role && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Information */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {isEditMode
                      ? "Updating the team member details will not change the existing password."
                      : "A temporary password will be generated automatically and sent to this email address. The team member will be required to change it after their first login."}
                  </p>
                </div>

                {/* Form Error */}
                {errors.submit && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errors.submit}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                      ? "Save Changes"
                      : "Add Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMember && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => !isDeleting && setDeleteMember(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/50 dark:text-red-400">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Team Member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteMember.name || deleteMember.email}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteMember(null)}
                disabled={isDeleting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isDeleting ? "Deleting..." : "Delete Team Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;
