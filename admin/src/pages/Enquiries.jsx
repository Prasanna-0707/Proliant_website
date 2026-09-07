import { useMemo, useState } from "react";
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

const initialEnquiries = [
  {
    id: 1,
    name: "Suresh Kumar",
    email: "suresh.kumar@gmail.com",
    phone: "+91 98765 43210",
    company: "ABC Technologies",
    subject: "SAP Implementation Services",
    message:
      "We are looking for SAP implementation support for our organization. Please contact us to discuss our requirements.",
    status: "Unread",
    submittedDate: "2026-09-05",
  },
  {
    id: 2,
    name: "Anita Sharma",
    email: "anita.sharma@xyz.com",
    phone: "+91 91234 56789",
    company: "XYZ Solutions",
    subject: "Business Enquiry",
    message:
      "I would like to know more about the services offered by Proliant and discuss a potential business partnership.",
    status: "Read",
    submittedDate: "2026-09-04",
  },
  {
    id: 3,
    name: "Rajesh Reddy",
    email: "rajesh.reddy@techcorp.com",
    phone: "+91 99887 66554",
    company: "TechCorp India",
    subject: "Recruitment Services",
    message:
      "We have several open positions and would like to understand how Proliant can support our recruitment requirements.",
    status: "Unread",
    submittedDate: "2026-09-03",
  },
  {
    id: 4,
    name: "Meghana Rao",
    email: "meghana.rao@gmail.com",
    phone: "+91 90000 11223",
    company: "",
    subject: "General Enquiry",
    message:
      "I would like to get more information about your consulting services.",
    status: "Read",
    submittedDate: "2026-09-01",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@global.com",
    phone: "+91 98765 12345",
    company: "Global Industries",
    subject: "IT Consulting",
    message:
      "Please share more information about your IT consulting capabilities and available engagement models.",
    status: "Read",
    submittedDate: "2026-08-29",
  },
];

function Enquiries() {
  const [enquiries, setEnquiries] = useState(initialEnquiries);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [viewEnquiry, setViewEnquiry] = useState(null);
  const [deleteEnquiry, setDeleteEnquiry] = useState(null);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        enquiry.name.toLowerCase().includes(searchValue) ||
        enquiry.email.toLowerCase().includes(searchValue) ||
        enquiry.subject.toLowerCase().includes(searchValue) ||
        enquiry.company.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        enquiry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, search, statusFilter]);

  const unreadCount = useMemo(() => {
    return enquiries.filter(
      (enquiry) => enquiry.status === "Unread"
    ).length;
  }, [enquiries]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleToggleStatus = (enquiry) => {
    setEnquiries((previous) =>
      previous.map((item) =>
        item.id === enquiry.id
          ? {
              ...item,
              status:
                item.status === "Unread" ? "Read" : "Unread",
            }
          : item
      )
    );

    setOpenMenuId(null);
  };

  const handleViewEnquiry = (enquiry) => {
    setViewEnquiry(enquiry);
    setOpenMenuId(null);

    // Automatically mark enquiry as read when opened.
    if (enquiry.status === "Unread") {
      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === enquiry.id
            ? {
                ...item,
                status: "Read",
              }
            : item
        )
      );
    }
  };

  const handleDelete = () => {
    if (!deleteEnquiry) {
      return;
    }

    setEnquiries((previous) =>
      previous.filter(
        (enquiry) => enquiry.id !== deleteEnquiry.id
      )
    );

    setDeleteEnquiry(null);
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
            {enquiry.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              {enquiry.status === "Unread" && (
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

              setOpenMenuId((previous) =>
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
                onClick={() => handleViewEnquiry(enquiry)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Eye size={16} />
                <span>View Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleStatus(enquiry)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                {enquiry.status === "Unread" ? (
                  <MailOpen size={16} />
                ) : (
                  <Mail size={16} />
                )}

                <span>
                  {enquiry.status === "Unread"
                    ? "Mark as Read"
                    : "Mark as Unread"}
                </span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  setDeleteEnquiry(enquiry);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
              Manage enquiries and messages received from your website.
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search enquiries..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40"
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
            {filteredEnquiries.length} enquir
            {filteredEnquiries.length !== 1 ? "ies" : "y"} found
          </p>
        </div>

        <DataTable
          columns={enquiryColumns}
          data={filteredEnquiries}
          emptyMessage="No enquiries found."
        />
      </section>

      {/* View Enquiry Modal */}
      {viewEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setViewEnquiry(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
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
                onClick={() => setViewEnquiry(null)}
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
                  {viewEnquiry.name.charAt(0).toUpperCase()}
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
                      {viewEnquiry.phone}
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
                      {viewEnquiry.company || "Not provided"}
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
                      {formatDate(viewEnquiry.submittedDate)}
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
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDeleteEnquiry(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Enquiry?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete the enquiry from{" "}
              <span className="font-semibold text-gray-700">
                {deleteEnquiry.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteEnquiry(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 sm:w-auto"
              >
                Delete Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Enquiries;