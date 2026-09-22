import { useEffect, useMemo, useState } from "react";

import {
  Search,
  MoreVertical,
  X,
  Eye,
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Building2,
  MessageSquareText,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const normalizeEnquiry = (enquiry) => {
  return {
    ...enquiry,
    id: enquiry._id,
    submittedDate: enquiry.createdAt,
    company: enquiry.company || "",
  };
};

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [viewEnquiry, setViewEnquiry] = useState(null);

  const [deleteEnquiry, setDeleteEnquiry] = useState(null);

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

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Enquiries API failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (
        result?.success !== true ||
        !Array.isArray(result?.contacts)
      ) {
        throw new Error(
          "Invalid enquiries response from backend"
        );
      }

      const normalizedEnquiries = result.contacts
        .map(normalizeEnquiry)
        .sort(
          (a, b) =>
            new Date(b.submittedDate) -
            new Date(a.submittedDate)
        );

      setEnquiries(normalizedEnquiries);
    } catch (error) {
      console.error("Failed to load enquiries:", error);

      setPageError("Unable to load website enquiries.");

      setEnquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        (enquiry.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (enquiry.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        (enquiry.subject || "")
          .toLowerCase()
          .includes(searchValue) ||
        (enquiry.company || "")
          .toLowerCase()
          .includes(searchValue) ||
        (enquiry.phone || "")
          .toLowerCase()
          .includes(searchValue) ||
        (enquiry.message || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        enquiry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  const unreadCount = useMemo(() => {
    return enquiries.filter(
      (enquiry) =>
        enquiry.status === "Unread"
    ).length;
  }, [enquiries]);

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleToggleStatus = async (enquiry) => {
    const newStatus =
      enquiry.status === "Unread"
        ? "Read"
        : "Unread";

    try {
      setIsSubmitting(true);
      setActionError("");

      const response = await fetch(
        `${API_BASE_URL}/contacts/${enquiry.id}/status`,
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

      if (!response.ok) {
        throw new Error(
          `Enquiry status update failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to update enquiry status"
        );
      }

      const updatedEnquiry = result.contact
        ? normalizeEnquiry(result.contact)
        : null;

      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === enquiry.id
            ? updatedEnquiry || {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      if (viewEnquiry?.id === enquiry.id) {
        setViewEnquiry(
          updatedEnquiry || {
            ...enquiry,
            status: newStatus,
          }
        );
      }

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to update enquiry status:",
        error
      );

      setActionError(
        error.message ||
          "Unable to update enquiry status."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEnquiry = async (enquiry) => {
    setViewEnquiry(enquiry);
    setOpenMenuId(null);

    if (enquiry.status !== "Unread") {
      return;
    }

    try {
      setActionError("");

      const response = await fetch(
        `${API_BASE_URL}/contacts/${enquiry.id}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            status: "Read",
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to mark enquiry as read (${response.status})`
        );
      }

      const result = await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to mark enquiry as read"
        );
      }

      const updatedEnquiry = result.contact
        ? normalizeEnquiry(result.contact)
        : {
            ...enquiry,
            status: "Read",
          };

      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === enquiry.id
            ? updatedEnquiry
            : item
        )
      );

      setViewEnquiry(updatedEnquiry);
    } catch (error) {
      console.error(
        "Failed to mark enquiry as read:",
        error
      );

      setActionError(
        "Unable to update enquiry status."
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteEnquiry) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");

      const response = await fetch(
        `${API_BASE_URL}/contacts/${deleteEnquiry.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Enquiry delete failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to delete enquiry"
        );
      }

      setEnquiries((previous) =>
        previous.filter(
          (enquiry) =>
            enquiry.id !== deleteEnquiry.id
        )
      );

      setDeleteEnquiry(null);
    } catch (error) {
      console.error(
        "Failed to delete enquiry:",
        error
      );

      setActionError(
        error.message ||
          "Unable to delete enquiry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const enquiryColumns = [
    {
      key: "name",
      label: "Contact",
      render: (enquiry) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              enquiry.status === "Unread"
                ? "bg-red-50 text-[#EF3B3A]"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {(enquiry.name || "?")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              {enquiry.status ===
                "Unread" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#EF3B3A]" />
              )}

              <p className="font-semibold text-gray-900">
                {enquiry.name}
              </p>
            </div>

            <p className="mt-0.5 text-xs text-gray-500">
              {enquiry.email}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "subject",
      label: "Subject",
      render: (enquiry) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-800">
            {enquiry.subject}
          </p>

          <p className="mt-1 truncate text-xs text-gray-500">
            {enquiry.message}
          </p>
        </div>
      ),
    },

    {
      key: "company",
      label: "Company",
      render: (enquiry) => (
        <span className="text-sm text-gray-700">
          {enquiry.company || "—"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (enquiry) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            enquiry.status === "Unread"
              ? "bg-red-50 text-[#EF3B3A]"
              : "bg-green-50 text-green-600"
          }`}
        >
          {enquiry.status}
        </span>
      ),
    },

    {
      key: "submittedDate",
      label: "Received",
      render: (enquiry) => (
        <span className="text-sm text-gray-600">
          {formatDate(enquiry.submittedDate)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (enquiry) => (
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setOpenMenuId(
                (previous) =>
                  previous === enquiry.id
                    ? null
                    : enquiry.id
              );
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Enquiry actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === enquiry.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() =>
                  handleViewEnquiry(enquiry)
                }
                disabled={isSubmitting}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <Eye size={16} />

                <span>View Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleToggleStatus(enquiry)
                }
                disabled={isSubmitting}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {enquiry.status ===
                "Unread" ? (
                  <MailOpen size={16} />
                ) : (
                  <Mail size={16} />
                )}

                <span>
                  {enquiry.status ===
                  "Unread"
                    ? "Mark as Read"
                    : "Mark as Unread"}
                </span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  setDeleteEnquiry(enquiry);
                  setActionError("");
                  setOpenMenuId(null);
                }}
                disabled={isSubmitting}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={16} />

                <span>Delete Enquiry</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="relative p-5 sm:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Enquiries
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage enquiries and messages received from
              your website.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-[#EF3B3A]">
              <MessageSquareText size={17} />

              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Search enquiries..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:min-w-0 max-[767px]:flex-1"
        >
          <option value="All">All Status</option>

          <option value="Unread">Unread</option>

          <option value="Read">Read</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Website Enquiries
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {isLoading
              ? "Loading enquiries..."
              : `${filteredEnquiries.length} enquir${
                  filteredEnquiries.length !== 1
                    ? "ies"
                    : "y"
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500">
              Loading website enquiries...
            </p>
          </div>
        ) : pageError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-red-500">
              {pageError}
            </p>
          </div>
        ) : (
          <DataTable
            columns={enquiryColumns}
            data={filteredEnquiries}
            emptyMessage="No enquiries found."
          />
        )}
      </section>

      {/* View Enquiry Modal */}
      {viewEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setViewEnquiry(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Enquiry Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Message received from the website.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewEnquiry(null)
                }
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Enquiry Details */}
            <div className="space-y-6 px-6 py-6">
              {/* Contact */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-[#EF3B3A]">
                  {(viewEnquiry.name || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    {viewEnquiry.name}
                  </h3>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {viewEnquiry.email}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700">
                      {viewEnquiry.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {viewEnquiry.phone ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Company
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {viewEnquiry.company ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MailOpen
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Received
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(
                        viewEnquiry.submittedDate
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-400">
                  Subject
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {viewEnquiry.subject}
                </p>
              </div>

              {/* Message */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400">
                  Message
                </p>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                    {viewEnquiry.message}
                  </p>
                </div>
              </div>

              {/* Email Action */}
              <a
                href={`mailto:${viewEnquiry.email}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                <Mail size={17} />

                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEnquiry && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSubmitting) {
              setDeleteEnquiry(null);
            }
          }}
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
              Delete Enquiry?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete the
              enquiry from{" "}
              <span className="font-semibold text-gray-700">
                {deleteEnquiry.name}
              </span>
              ? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteEnquiry(null)
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting
                  ? "Deleting..."
                  : "Delete Enquiry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Enquiries;
