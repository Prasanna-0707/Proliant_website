import { useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  X,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Download,
} from "lucide-react";

import DataTable from "../components/DataTable";

const initialCandidates = [
  {
    id: 1,
    name: "Ravi Kumar",
    email: "ravi.kumar@gmail.com",
    phone: "+91 98765 43210",
    location: "Hyderabad, India",
    job: "SAP ABAP Developer",
    experience: "4 Years",
    status: "New",
    appliedDate: "2026-09-04",
    resumeUrl: "#",
  },
  {
    id: 2,
    name: "Meghana Reddy",
    email: "meghana.reddy@gmail.com",
    phone: "+91 91234 56789",
    location: "Bangalore, India",
    job: "SAP SD Consultant",
    experience: "5 Years",
    status: "Shortlisted",
    appliedDate: "2026-09-03",
    resumeUrl: "#",
  },
  {
    id: 3,
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+91 99887 66554",
    location: "Chennai, India",
    job: "Business Analyst",
    experience: "3 Years",
    status: "Interview",
    appliedDate: "2026-09-02",
    resumeUrl: "#",
  },
  {
    id: 4,
    name: "Anusha Rao",
    email: "anusha.rao@gmail.com",
    phone: "+91 98765 12345",
    location: "Hyderabad, India",
    job: "HR Executive",
    experience: "2 Years",
    status: "Rejected",
    appliedDate: "2026-08-30",
    resumeUrl: "#",
  },
  {
    id: 5,
    name: "Karthik Reddy",
    email: "karthik.reddy@gmail.com",
    phone: "+91 90000 11223",
    location: "Pune, India",
    job: "SAP ABAP Developer",
    experience: "6 Years",
    status: "Shortlisted",
    appliedDate: "2026-08-28",
    resumeUrl: "#",
  },
];

const candidateStatuses = [
  "New",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

function Candidates() {
  const [candidates, setCandidates] = useState(initialCandidates);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [viewCandidate, setViewCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const [editStatus, setEditStatus] = useState("");

  const jobs = useMemo(() => {
    return [...new Set(candidates.map((candidate) => candidate.job))];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        candidate.name.toLowerCase().includes(searchValue) ||
        candidate.email.toLowerCase().includes(searchValue) ||
        candidate.job.toLowerCase().includes(searchValue) ||
        candidate.location.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status === statusFilter;

      const matchesJob =
        jobFilter === "All" ||
        candidate.job === jobFilter;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [candidates, search, statusFilter, jobFilter]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStatusUpdate = () => {
    if (!editingCandidate) {
      return;
    }

    setCandidates((previous) =>
      previous.map((candidate) =>
        candidate.id === editingCandidate.id
          ? {
              ...candidate,
              status: editStatus,
            }
          : candidate
      )
    );

    setEditingCandidate(null);
    setEditStatus("");
  };

  const handleDelete = () => {
    if (!deleteCandidate) {
      return;
    }

    setCandidates((previous) =>
      previous.filter(
        (candidate) => candidate.id !== deleteCandidate.id
      )
    );

    setDeleteCandidate(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-600";

      case "Shortlisted":
        return "bg-green-50 text-green-600";

      case "Interview":
        return "bg-yellow-50 text-yellow-600";

      case "Selected":
        return "bg-purple-50 text-purple-600";

      case "Rejected":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Temporary frontend Excel export.
  // Later this will call the backend export API.
  const handleDownloadExcel = () => {
    const headers = [
      "Candidate",
      "Email",
      "Phone",
      "Applied For",
      "Experience",
      "Location",
      "Status",
      "Applied Date",
      "Resume",
    ];

    const rows = filteredCandidates.map((candidate) => [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.job,
      candidate.experience,
      candidate.location,
      candidate.status,
      formatDate(candidate.appliedDate),
      candidate.resumeUrl === "#"
        ? ""
        : candidate.resumeUrl,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");

            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "proliant-candidates.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const candidateColumns = [
    {
      key: "name",
      label: "Candidate",
      render: (candidate) => (
        <div>
          <p className="font-semibold text-gray-900">
            {candidate.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {candidate.email}
          </p>
        </div>
      ),
    },
    {
      key: "job",
      label: "Applied For",
      render: (candidate) => (
        <div>
          <p className="font-medium text-gray-800">
            {candidate.job}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {candidate.experience}
          </p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "status",
      label: "Status",
      render: (candidate) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
            candidate.status
          )}`}
        >
          {candidate.status}
        </span>
      ),
    },
    {
      key: "appliedDate",
      label: "Applied",
      render: (candidate) => (
        <span className="text-sm text-gray-600">
          {formatDate(candidate.appliedDate)}
        </span>
      ),
    },
    {
      key: "resume",
      label: "Resume",
      render: (candidate) => (
        <a
          href={candidate.resumeUrl}
          onClick={(event) => {
            if (candidate.resumeUrl === "#") {
              event.preventDefault();
            }
          }}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EF3B3A] transition-colors hover:text-red-600"
        >
          <FileText size={16} />
          View Resume
        </a>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (candidate) => (
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setOpenMenuId((previous) =>
                previous === candidate.id
                  ? null
                  : candidate.id
              );
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Candidate actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === candidate.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setViewCandidate(candidate);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Eye size={16} />
                <span>View Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCandidate(candidate);
                  setEditStatus(candidate.status);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil size={16} />
                <span>Update Status</span>
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(candidate);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={16} />
                <span>Delete Candidate</span>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Candidates
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage applications and track candidate progress.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={filteredCandidates.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between max-[767px]:flex-row max-[767px]:items-center max-[767px]:gap-1.5">
        
        {/* Search */}
        <div className="relative w-full lg:max-w-sm max-[767px]:min-w-0 max-[767px]:flex-[1.45]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 max-[767px]:left-2 max-[767px]:size-[13px]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search candidates..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 max-[767px]:h-8 max-[767px]:py-1 max-[767px]:pl-7 max-[767px]:pr-1.5 max-[767px]:text-[9px]"
          />
        </div>

        {/* Filters */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto max-[767px]:min-w-0 max-[767px]:flex-[1.75] max-[767px]:flex-row max-[767px]:gap-1.5">
          
          {/* All Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2.5 text-[11px] text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:h-8 max-[767px]:min-w-0 max-[767px]:flex-1 max-[767px]:px-1 max-[767px]:py-1 max-[767px]:text-[9px]"
          >
            <option
              value="All"
              style={{
                fontSize: "9px",
                padding: "2px 4px",
              }}
            >
              All Status
            </option>

            {candidateStatuses.map((status) => (
              <option
                key={status}
                value={status}
                style={{
                  fontSize: "9px",
                  padding: "2px 4px",
                }}
              >
                {status}
              </option>
            ))}
          </select>

          {/* All Jobs */}
          <select
            value={jobFilter}
            onChange={(event) =>
              setJobFilter(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2.5 text-[11px] text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-52 max-[767px]:h-8 max-[767px]:min-w-0 max-[767px]:flex-1 max-[767px]:px-1 max-[767px]:py-1 max-[767px]:text-[9px]"
          >
            <option
              value="All"
              style={{
                fontSize: "9px",
                padding: "2px 4px",
              }}
            >
              All Jobs
            </option>

            {jobs.map((job) => (
              <option
                key={job}
                value={job}
                style={{
                  fontSize: "9px",
                  padding: "2px 4px",
                }}
              >
                {job}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Candidate Applications
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredCandidates.length} candidate
            {filteredCandidates.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <DataTable
          columns={candidateColumns}
          data={filteredCandidates}
          emptyMessage="No candidates found."
        />
      </section>

      {/* View Candidate Modal */}
      {viewCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setViewCandidate(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Candidate Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Application information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewCandidate.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {viewCandidate.job}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      viewCandidate.status
                    )}`}
                  >
                    {viewCandidate.status}
                  </span>
                </div>
              </div>

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
                      {viewCandidate.email}
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
                      {viewCandidate.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {viewCandidate.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Experience
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {viewCandidate.experience}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-400">
                  Applied For
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {viewCandidate.job}
                </p>

                <p className="mt-3 text-xs font-medium text-gray-400">
                  Applied Date
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {formatDate(viewCandidate.appliedDate)}
                </p>
              </div>

              <a
                href={viewCandidate.resumeUrl}
                onClick={(event) => {
                  if (viewCandidate.resumeUrl === "#") {
                    event.preventDefault();
                  }
                }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FileText size={17} />
                View Resume
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {editingCandidate && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setEditingCandidate(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Candidate Status
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update the application status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="mb-3 text-sm font-semibold text-gray-800">
                {editingCandidate.name}
              </p>

              <select
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
              >
                {candidateStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 sm:w-auto"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Candidate?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteCandidate.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 sm:w-auto"
              >
                Delete Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;