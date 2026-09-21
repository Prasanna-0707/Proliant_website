import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyForm = {
  email: "",
};

function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editingMember, setEditingMember] = useState(null);

  const [errors, setErrors] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState("");

  /*
   * ---------------------------------------------------------
   * AUTH HELPERS
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * FETCH TEAM MEMBERS
   * ---------------------------------------------------------
   */

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

      const memberData = result.teamMembers || [];

      setTeamMembers(memberData);
    } catch (error) {
      console.error("Failed to fetch team members:", error);

      setPageError(
        error.message ||
          "Unable to load team members. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const filteredTeamMembers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return teamMembers;
    }

    return teamMembers.filter((member) => {
      const email = member.email?.toLowerCase() || "";

      return email.includes(searchValue);
    });
  }, [teamMembers, search]);

  /*
   * ---------------------------------------------------------
   * FORM HANDLING
   * ---------------------------------------------------------
   */

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

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * ---------------------------------------------------------
   * OPEN ADD MODAL
   * ---------------------------------------------------------
   */

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingMember(null);
    setFormData(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * OPEN EDIT MODAL
   * ---------------------------------------------------------
   */

  const openEditModal = (member) => {
    setIsEditMode(true);
    setEditingMember(member);

    setFormData({
      email: member.email || "",
    });

    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * CREATE / UPDATE TEAM MEMBER
   * ---------------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let response;

      /*
       * CREATE
       */

      if (!isEditMode) {
        response = await fetch(
          `${API_BASE_URL}/auth/team-members`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              email: formData.email.trim(),
            }),
          }
        );
      }

      /*
       * UPDATE
       */

      else {
        const memberId =
          editingMember?._id || editingMember?.id;

        response = await fetch(
          `${API_BASE_URL}/auth/team-members/${memberId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              email: formData.email.trim(),
            }),
          }
        );
      }

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

      /*
       * Refresh list
       */

      await fetchTeamMembers();

      /*
       * Close modal
       */

      setFormData(emptyForm);
      setErrors({});
      setEditingMember(null);
      setIsEditMode(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        isEditMode
          ? "Team member update failed:"
          : "Team member creation failed:",
        error
      );

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

  /*
   * ---------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------
   */

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setFormData(emptyForm);
    setErrors({});
    setEditingMember(null);
    setIsEditMode(false);
  };

  /*
   * ---------------------------------------------------------
   * DELETE TEAM MEMBER
   * ---------------------------------------------------------
   */

  const handleDelete = async () => {
    if (!deleteMember) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    if (!token) {
      handleUnauthorized();
      return;
    }

    const memberId =
      deleteMember._id || deleteMember.id;

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
          result.message ||
            "Failed to delete team member."
        );
      }

      setTeamMembers((previous) =>
        previous.filter(
          (member) =>
            (member._id || member.id) !== memberId
        )
      );

      setDeleteMember(null);
    } catch (error) {
      console.error(
        "Team member deletion failed:",
        error
      );

      setPageError(
        error.message ||
          "Unable to delete team member. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * TABLE COLUMNS
   * ---------------------------------------------------------
   */

  const teamMemberColumns = [
    {
      key: "email",
      label: "Team Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {member.email}
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              Admin / HR Team Member
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "role",
      label: "Role",
      render: () => (
        <span className="font-medium text-gray-700">
          Admin
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created",
      render: (member) => (
        <span className="text-sm text-gray-500">
          {member.createdAt
            ? new Date(
                member.createdAt
              ).toLocaleDateString()
            : "—"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (member) => {
        const memberId =
          member._id || member.id;

        return (
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                setOpenMenuId((previous) =>
                  previous === memberId
                    ? null
                    : memberId
                );
              }}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Team member actions"
            >
              <MoreVertical size={18} />
            </button>

            {openMenuId === memberId && (
              <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    openEditModal(member)
                  }
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Pencil size={16} />

                  <span>
                    Edit Team Member
                  </span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() => {
                    setDeleteMember(member);
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={16} />

                  <span>
                    Delete Team Member
                  </span>
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="relative p-5 sm:p-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Team Members
          </h1>

          <p className="mt-1 text-sm text-gray-500">
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


      {/* =====================================================
          PAGE ERROR
      ===================================================== */}

      {pageError && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {pageError}
          </p>

          <button
            type="button"
            onClick={() => setPageError("")}
            className="text-red-500 hover:text-red-700"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-5">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by email..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
          />
        </div>
      </div>


      {/* =====================================================
          TEAM MEMBERS TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Team Member List
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {isLoading
              ? "Loading team members..."
              : `${filteredTeamMembers.length} team member${
                  filteredTeamMembers.length !== 1
                    ? "s"
                    : ""
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500">
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


      {/* =====================================================
          ADD / EDIT TEAM MEMBER MODAL
      ===================================================== */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditMode
                    ? "Edit Team Member"
                    : "Add Team Member"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {isEditMode
                    ? "Update the team member email address."
                    : "Add a new admin or HR team member."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>


            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="member@proliant.com"
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>


                {/* CREATE INFORMATION */}

                {!isEditMode && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs leading-5 text-gray-500">
                      A temporary password will be generated
                      automatically and sent to this email
                      address. The team member will be required
                      to change the password after their first
                      login.
                    </p>
                  </div>
                )}


                {/* EDIT INFORMATION */}

                {isEditMode && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs leading-5 text-gray-500">
                      Updating the email address will not change
                      the existing password.
                    </p>
                  </div>
                )}


                {/* SUBMIT ERROR */}

                {errors.submit && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">
                      {errors.submit}
                    </p>
                  </div>
                )}
              </div>


              {/* MODAL FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() =>
            !isDeleting &&
            setDeleteMember(null)
          }
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Team Member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteMember.email}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setDeleteMember(null)
                }
                disabled={isDeleting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Team Member"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;

// import { useEffect, useMemo, useState } from "react";
// import {
//   Plus,
//   Search,
//   MoreVertical,
//   X,
//   UserCheck,
//   UserX,
//   Trash2,
// } from "lucide-react";

// import DataTable from "../components/DataTable";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// const emptyForm = {
//   name: "",
//   email: "",
//   role: "HR",
// };

// function TeamMembers() {
//   const [teamMembers, setTeamMembers] = useState([]);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [formData, setFormData] = useState(emptyForm);
//   const [errors, setErrors] = useState({});

//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [deleteMember, setDeleteMember] = useState(null);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const [pageError, setPageError] = useState("");

//   /*
//    * ---------------------------------------------------------
//    * AUTH HELPERS
//    * ---------------------------------------------------------
//    */

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("adminToken");

//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   };

//   const handleUnauthorized = () => {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("adminUser");

//     window.location.href = "/login";
//   };

//   /*
//    * ---------------------------------------------------------
//    * FETCH TEAM MEMBERS
//    * ---------------------------------------------------------
//    */

//   const fetchTeamMembers = async () => {
//     const token = localStorage.getItem("adminToken");

//     if (!token) {
//       handleUnauthorized();
//       return;
//     }

//     setIsLoading(true);
//     setPageError("");

//     try {
//       /*
//        * This endpoint will be added with the Team Members backend.
//        */
//       const response = await fetch(
//         `${API_BASE_URL}/auth/team-members`,
//         {
//           method: "GET",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message || "Failed to load team members."
//         );
//       }

//       const memberData =
//         result.teamMembers ||
//         result.data ||
//         [];

//       setTeamMembers(memberData);
//     } catch (error) {
//       console.error(
//         "Failed to fetch team members:",
//         error
//       );

//       setPageError(
//         error.message ||
//           "Unable to load team members. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTeamMembers();
//   }, []);

//   /*
//    * ---------------------------------------------------------
//    * SEARCH + STATUS FILTER
//    * ---------------------------------------------------------
//    */

//   const filteredTeamMembers = useMemo(() => {
//     return teamMembers.filter((member) => {
//       const searchValue = search.toLowerCase().trim();

//       const matchesSearch =
//         member.name
//           ?.toLowerCase()
//           .includes(searchValue) ||
//         member.email
//           ?.toLowerCase()
//           .includes(searchValue) ||
//         member.role
//           ?.toLowerCase()
//           .includes(searchValue);

//       const matchesStatus =
//         statusFilter === "All" ||
//         member.status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [teamMembers, search, statusFilter]);

//   /*
//    * ---------------------------------------------------------
//    * FORM HANDLING
//    * ---------------------------------------------------------
//    */

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setErrors((previous) => ({
//       ...previous,
//       [name]: "",
//       submit: "",
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Full name is required.";
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email address is required.";
//     } else if (
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//         formData.email
//       )
//     ) {
//       newErrors.email =
//         "Enter a valid email address.";
//     }

//     if (!formData.role) {
//       newErrors.role = "Role is required.";
//     }

//     setErrors(newErrors);

//     return Object.keys(newErrors).length === 0;
//   };

//   /*
//    * ---------------------------------------------------------
//    * OPEN ADD MODAL
//    * ---------------------------------------------------------
//    */

//   const openAddModal = () => {
//     setFormData(emptyForm);
//     setErrors({});
//     setIsModalOpen(true);
//   };

//   /*
//    * ---------------------------------------------------------
//    * ADD TEAM MEMBER
//    * ---------------------------------------------------------
//    */

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     const token = localStorage.getItem("adminToken");

//     if (!token) {
//       handleUnauthorized();
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/auth/team-members`,
//         {
//           method: "POST",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             name: formData.name.trim(),
//             email: formData.email.trim(),
//             role: formData.role,
//           }),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message ||
//             "Failed to add team member."
//         );
//       }

//       /*
//        * Refresh from backend after successful creation.
//        */
//       await fetchTeamMembers();

//       setFormData(emptyForm);
//       setErrors({});
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error(
//         "Team member creation failed:",
//         error
//       );

//       setErrors({
//         submit:
//           error.message ||
//           "Unable to add team member. Please try again.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /*
//    * ---------------------------------------------------------
//    * CLOSE MODAL
//    * ---------------------------------------------------------
//    */

//   const handleCloseModal = () => {
//     if (isSubmitting) {
//       return;
//     }

//     setIsModalOpen(false);
//     setFormData(emptyForm);
//     setErrors({});
//   };

//   /*
//    * ---------------------------------------------------------
//    * TOGGLE STATUS
//    * ---------------------------------------------------------
//    */

//   const handleToggleStatus = async (member) => {
//     const token = localStorage.getItem("adminToken");

//     if (!token) {
//       handleUnauthorized();
//       return;
//     }

//     const memberId =
//       member._id || member.id;

//     const newStatus =
//       member.status === "Active"
//         ? "Inactive"
//         : "Active";

//     setOpenMenuId(null);

//     try {
//       /*
//        * Backend status endpoint will be finalized
//        * when the Team Members API is implemented.
//        */
//       const response = await fetch(
//         `${API_BASE_URL}/auth/team-members/${memberId}`,
//         {
//           method: "PATCH",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             status: newStatus,
//           }),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message ||
//             "Failed to update team member status."
//         );
//       }

//       await fetchTeamMembers();
//     } catch (error) {
//       console.error(
//         "Team member status update failed:",
//         error
//       );

//       setPageError(
//         error.message ||
//           "Unable to update team member status."
//       );
//     }
//   };

//   /*
//    * ---------------------------------------------------------
//    * DELETE TEAM MEMBER
//    * ---------------------------------------------------------
//    */

//   const handleDelete = async () => {
//     if (!deleteMember) {
//       return;
//     }

//     const token = localStorage.getItem("adminToken");

//     if (!token) {
//       handleUnauthorized();
//       return;
//     }

//     const memberId =
//       deleteMember._id || deleteMember.id;

//     setIsDeleting(true);

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/auth/team-members/${memberId}`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message ||
//             "Failed to delete team member."
//         );
//       }

//       setTeamMembers((previous) =>
//         previous.filter(
//           (member) =>
//             (member._id || member.id) !== memberId
//         )
//       );

//       setDeleteMember(null);
//     } catch (error) {
//       console.error(
//         "Team member deletion failed:",
//         error
//       );

//       setPageError(
//         error.message ||
//           "Unable to delete team member. Please try again."
//       );
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   /*
//    * ---------------------------------------------------------
//    * TABLE COLUMNS
//    * ---------------------------------------------------------
//    */

//   const teamMemberColumns = [
//     {
//       key: "name",
//       label: "Team Member",
//       render: (member) => (
//         <div>
//           <p className="font-semibold text-gray-900">
//             {member.name}
//           </p>

//           <p className="mt-0.5 text-xs text-gray-500">
//             {member.email}
//           </p>
//         </div>
//       ),
//     },

//     {
//       key: "role",
//       label: "Role",
//       render: (member) => (
//         <span className="font-medium text-gray-700">
//           {member.role}
//         </span>
//       ),
//     },

//     {
//       key: "status",
//       label: "Status",
//       render: (member) => (
//         <span
//           className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
//             member.status === "Active"
//               ? "bg-green-50 text-green-600"
//               : "bg-gray-100 text-gray-500"
//           }`}
//         >
//           {member.status}
//         </span>
//       ),
//     },

//     {
//       key: "actions",
//       label: "Actions",
//       render: (member) => {
//         const memberId =
//           member._id || member.id;

//         return (
//           <div className="relative">
//             <button
//               type="button"
//               onClick={(event) => {
//                 event.stopPropagation();

//                 setOpenMenuId((previous) =>
//                   previous === memberId
//                     ? null
//                     : memberId
//                 );
//               }}
//               className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
//               aria-label="Team member actions"
//             >
//               <MoreVertical size={18} />
//             </button>

//             {openMenuId === memberId && (
//               <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     handleToggleStatus(member)
//                   }
//                   className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
//                 >
//                   {member.status === "Active" ? (
//                     <UserX size={16} />
//                   ) : (
//                     <UserCheck size={16} />
//                   )}

//                   <span>
//                     {member.status === "Active"
//                       ? "Set Inactive"
//                       : "Set Active"}
//                   </span>
//                 </button>

//                 <div className="my-1 border-t border-gray-100" />

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setDeleteMember(member);
//                     setOpenMenuId(null);
//                   }}
//                   className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
//                 >
//                   <Trash2 size={16} />

//                   <span>
//                     Delete Team Member
//                   </span>
//                 </button>
//               </div>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   /*
//    * ---------------------------------------------------------
//    * RENDER
//    * ---------------------------------------------------------
//    */

//   return (
//     <div className="relative p-5 sm:p-6">
//       {/* Page Header */}

//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-gray-900">
//             Team Members
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             Manage your internal admin and HR team members.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={openAddModal}
//           className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
//         >
//           <Plus size={18} />
//           Add Team Member
//         </button>
//       </div>

//       {/* Page Error */}

//       {pageError && (
//         <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
//           <p className="text-sm font-medium text-red-600">
//             {pageError}
//           </p>

//           <button
//             type="button"
//             onClick={() => setPageError("")}
//             className="text-red-500 hover:text-red-700"
//             aria-label="Close error"
//           >
//             <X size={17} />
//           </button>
//         </div>
//       )}

//       {/* Search & Filter */}

//       <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="relative w-full sm:max-w-sm">
//           <Search
//             size={18}
//             className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//           />

//           <input
//             type="search"
//             value={search}
//             onChange={(event) =>
//               setSearch(event.target.value)
//             }
//             placeholder="Search team members..."
//             className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
//           />
//         </div>

//         <select
//           value={statusFilter}
//           onChange={(event) =>
//             setStatusFilter(event.target.value)
//           }
//           className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40"
//         >
//           <option value="All">All Status</option>
//           <option value="Active">Active</option>
//           <option value="Inactive">Inactive</option>
//         </select>
//       </div>

//       {/* Team Members Table */}

//       <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
//         <div className="border-b border-gray-100 px-5 py-4">
//           <h2 className="text-base font-semibold text-gray-900">
//             Team Member List
//           </h2>

//           <p className="mt-1 text-xs text-gray-500">
//             {isLoading
//               ? "Loading team members..."
//               : `${filteredTeamMembers.length} team member${
//                   filteredTeamMembers.length !== 1
//                     ? "s"
//                     : ""
//                 } found`}
//           </p>
//         </div>

//         {isLoading ? (
//           <div className="px-5 py-12 text-center">
//             <p className="text-sm text-gray-500">
//               Loading team members...
//             </p>
//           </div>
//         ) : (
//           <DataTable
//             columns={teamMemberColumns}
//             data={filteredTeamMembers}
//             emptyMessage="No team members found."
//           />
//         )}
//       </section>

//       {/* Add Team Member Modal */}

//       {isModalOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
//           onClick={handleCloseModal}
//         >
//           <div
//             className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             {/* Modal Header */}

//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Add Team Member
//                 </h2>

//                 <p className="mt-1 text-xs text-gray-500">
//                   Add a new admin or HR team member.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleCloseModal}
//                 disabled={isSubmitting}
//                 className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
//                 aria-label="Close modal"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Form */}

//             <form onSubmit={handleSubmit}>
//               <div className="space-y-5 px-6 py-6">
//                 {/* Full Name */}

//                 <div>
//                   <label
//                     htmlFor="name"
//                     className="mb-2 block text-sm font-semibold text-gray-800"
//                   >
//                     Full Name
//                   </label>

//                   <input
//                     id="name"
//                     name="name"
//                     type="text"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Enter team member name"
//                     className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
//                       errors.name
//                         ? "border-red-300 focus:border-red-400 focus:ring-red-50"
//                         : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
//                     }`}
//                   />

//                   {errors.name && (
//                     <p className="mt-1.5 text-xs font-medium text-red-500">
//                       {errors.name}
//                     </p>
//                   )}
//                 </div>

//                 {/* Email */}

//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="mb-2 block text-sm font-semibold text-gray-800"
//                   >
//                     Email Address
//                   </label>

//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="member@proliant.com"
//                     className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
//                       errors.email
//                         ? "border-red-300 focus:border-red-400 focus:ring-red-50"
//                         : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
//                     }`}
//                   />

//                   {errors.email && (
//                     <p className="mt-1.5 text-xs font-medium text-red-500">
//                       {errors.email}
//                     </p>
//                   )}
//                 </div>

//                 {/* Role */}

//                 <div>
//                   <label
//                     htmlFor="role"
//                     className="mb-2 block text-sm font-semibold text-gray-800"
//                   >
//                     Role
//                   </label>

//                   <select
//                     id="role"
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
//                   >
//                     <option value="Admin">
//                       Admin
//                     </option>

//                     <option value="HR">
//                       HR
//                     </option>
//                   </select>

//                   {errors.role && (
//                     <p className="mt-1.5 text-xs font-medium text-red-500">
//                       {errors.role}
//                     </p>
//                   )}
//                 </div>

//                 {/* Information */}

//                 <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
//                   <p className="text-xs leading-5 text-gray-500">
//                     A temporary password will be generated
//                     and provided by the backend. The team
//                     member will be required to change it
//                     after their first login.
//                   </p>
//                 </div>

//                 {/* Submit Error */}

//                 {errors.submit && (
//                   <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
//                     <p className="text-sm font-medium text-red-600">
//                       {errors.submit}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Modal Footer */}

//               <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={handleCloseModal}
//                   disabled={isSubmitting}
//                   className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
//                 >
//                   {isSubmitting
//                     ? "Adding..."
//                     : "Add Team Member"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}

//       {deleteMember && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
//           onClick={() =>
//             !isDeleting &&
//             setDeleteMember(null)
//           }
//         >
//           <div
//             className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
//               <Trash2 size={20} />
//             </div>

//             <h2 className="mt-4 text-lg font-semibold text-gray-900">
//               Delete Team Member?
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-gray-500">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold text-gray-700">
//                 {deleteMember.name}
//               </span>
//               ? This action cannot be undone.
//             </p>

//             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setDeleteMember(null)
//                 }
//                 disabled={isDeleting}
//                 className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleDelete}
//                 disabled={isDeleting}
//                 className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
//               >
//                 {isDeleting
//                   ? "Deleting..."
//                   : "Delete Team Member"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default TeamMembers;