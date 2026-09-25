import { useEffect, useMemo, useRef, useState } from "react";

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
  Filter,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const candidateStatuses = [
  "New",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

const normalizeCandidate = (candidate) => {
  const isFresher = Boolean(candidate.isFresher);

  let experience = "N/A";

  if (isFresher) {
    experience = "Fresher";
  } else if (
    candidate.yearsOfExperience !== undefined &&
    candidate.yearsOfExperience !== null
  ) {
    experience = `${candidate.yearsOfExperience} ${
      candidate.yearsOfExperience === 1 ? "Year" : "Years"
    }`;
  }

  return {
    ...candidate,
    id: candidate._id,
    job: candidate.position || "N/A",
    experience,
    appliedDate: candidate.createdAt,
    resumeUrl: candidate.resume || "#",
    currentCompany: candidate.currentCompany || "N/A",
    location: candidate.location || "N/A",
    noticePeriod: candidate.noticePeriod || "N/A",
    areaOfInterest: candidate.areaOfInterest || "N/A",
    coverMessage: candidate.coverMessage || "",
  };
};

function Candidates() {
  const [candidates, setCandidates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef(null);

  const [isRoleFilterEnabled, setIsRoleFilterEnabled] = useState(false);
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [appliedRoles, setAppliedRoles] = useState([]);
  const [appliedDateFilter, setAppliedDateFilter] = useState("");
  const [appliedCustomFromDate, setAppliedCustomFromDate] = useState("");
  const [appliedCustomToDate, setAppliedCustomToDate] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewCandidate, setViewCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const [editStatus, setEditStatus] = useState("");

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

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await fetch(`${API_BASE_URL}/candidates`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Candidates API failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (
        result?.success !== true ||
        !Array.isArray(result?.candidates)
      ) {
        throw new Error("Invalid candidates response from backend");
      }

      const normalizedCandidates = result.candidates
        .map(normalizeCandidate)
        .sort(
          (a, b) =>
            new Date(b.appliedDate) -
            new Date(a.appliedDate)
        );

      setCandidates(normalizedCandidates);
    } catch (error) {
      console.error("Failed to load candidates:", error);

      setPageError("Unable to load candidate applications.");

      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isFilterOpen]);

  const jobs = useMemo(() => {
    return [
      ...new Set(
        candidates
          .map((candidate) => candidate.job)
          .filter(
            (job) =>
              job &&
              job !== "N/A"
          )
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const toggleRole = (role) => {
    setSelectedRoles((previous) => {
      if (previous.includes(role)) {
        return previous.filter(
          (selectedRole) => selectedRole !== role
        );
      }

      return [...previous, role];
    });
  };

  const getStartOfDay = (date) => {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  };

  const getCandidateDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return getStartOfDay(parsedDate);
  };

  const parseInputDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const [year, month, day] = dateValue
      .split("-")
      .map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    date.setHours(0, 0, 0, 0);

    return date;
  };

  const isCandidateWithinDateFilter = (
    candidateDateValue,
    dateFilter,
    fromDateValue,
    toDateValue
  ) => {
    const candidateDate = getCandidateDate(
      candidateDateValue
    );

    if (!candidateDate || !dateFilter) {
      return true;
    }

    const today = getStartOfDay(new Date());

    if (dateFilter === "today") {
      return candidateDate.getTime() === today.getTime();
    }

    if (dateFilter === "yesterday") {
      const yesterday = new Date(today);

      yesterday.setDate(
        yesterday.getDate() - 1
      );

      return (
        candidateDate.getTime() ===
        yesterday.getTime()
      );
    }

    if (dateFilter === "last7") {
      const startDate = new Date(today);

      startDate.setDate(
        startDate.getDate() - 6
      );

      return (
        candidateDate >= startDate &&
        candidateDate <= today
      );
    }

    if (dateFilter === "last30") {
      const startDate = new Date(today);

      startDate.setDate(
        startDate.getDate() - 29
      );

      return (
        candidateDate >= startDate &&
        candidateDate <= today
      );
    }

    if (dateFilter === "custom") {
      const fromDate =
        parseInputDate(fromDateValue);

      const toDate =
        parseInputDate(toDateValue);

      if (!fromDate && !toDate) {
        return true;
      }

      if (fromDate && !toDate) {
        return candidateDate >= fromDate;
      }

      if (!fromDate && toDate) {
        return candidateDate <= toDate;
      }

      return (
        candidateDate >= fromDate &&
        candidateDate <= toDate
      );
    }

    return true;
  };

  const clearFilters = () => {
    setIsRoleFilterEnabled(false);
    setIsDateFilterEnabled(false);

    setSelectedRoles([]);
    setSelectedDateFilter("");

    setCustomFromDate("");
    setCustomToDate("");

    setAppliedRoles([]);
    setAppliedDateFilter("");
    setAppliedCustomFromDate("");
    setAppliedCustomToDate("");
  };

  const applyFilters = () => {
    const validRoles = selectedRoles.filter((role) =>
      jobs.includes(role)
    );

    const dateIsCustom =
      selectedDateFilter === "custom";

    setAppliedRoles(
      isRoleFilterEnabled ? validRoles : []
    );

    setAppliedDateFilter(
      isDateFilterEnabled
        ? selectedDateFilter
        : ""
    );

    setAppliedCustomFromDate(
      isDateFilterEnabled && dateIsCustom
        ? customFromDate
        : ""
    );

    setAppliedCustomToDate(
      isDateFilterEnabled && dateIsCustom
        ? customToDate
        : ""
    );

    setIsFilterOpen(false);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        (candidate.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.phone || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.job || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.location || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.highestQualification || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.currentCompany || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.noticePeriod || "")
          .toLowerCase()
          .includes(searchValue) ||
        (candidate.areaOfInterest || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status === statusFilter;

      const matchesRole =
        appliedRoles.length === 0 ||
        appliedRoles.includes(candidate.job);

      const matchesAppliedDate =
        !appliedDateFilter ||
        isCandidateWithinDateFilter(
          candidate.appliedDate,
          appliedDateFilter,
          appliedCustomFromDate,
          appliedCustomToDate
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesAppliedDate
      );
    });
  }, [
    candidates,
    search,
    statusFilter,
    appliedRoles,
    appliedDateFilter,
    appliedCustomFromDate,
    appliedCustomToDate,
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleStatusUpdate = async () => {
    if (!editingCandidate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");

      const response = await fetch(
        `${API_BASE_URL}/candidates/${editingCandidate.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            position:
              editingCandidate.position ||
              editingCandidate.job,

            areaOfInterest:
              editingCandidate.areaOfInterest || "",

            name: editingCandidate.name,
            email: editingCandidate.email,
            phone: editingCandidate.phone,

            isFresher:
              editingCandidate.isFresher || false,

            location:
              editingCandidate.location || "",

            yearsOfExperience:
              editingCandidate.yearsOfExperience,

            highestQualification:
              editingCandidate.highestQualification,

            currentCompany:
              editingCandidate.currentCompany || "",

            noticePeriod:
              editingCandidate.noticePeriod,

            coverMessage:
              editingCandidate.coverMessage || "",

            resume:
              editingCandidate.resume || "",

            status: editStatus,
          }),
        }
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Candidate update failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to update candidate status"
        );
      }

      const updatedCandidate = result.candidate
        ? normalizeCandidate(result.candidate)
        : null;

      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.id === editingCandidate.id
            ? updatedCandidate || {
                ...candidate,
                status: editStatus,
              }
            : candidate
        )
      );

      setEditingCandidate(null);
      setEditStatus("");
    } catch (error) {
      console.error(
        "Failed to update candidate status:",
        error
      );

      setActionError(
        error.message ||
          "Unable to update candidate status."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");

      const response = await fetch(
        `${API_BASE_URL}/candidates/${deleteCandidate.id}`,
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
          `Candidate delete failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to delete candidate"
        );
      }

      setCandidates((previous) =>
        previous.filter(
          (candidate) =>
            candidate.id !== deleteCandidate.id
        )
      );

      setDeleteCandidate(null);
    } catch (error) {
      console.error(
        "Failed to delete candidate:",
        error
      );

      setActionError(
        error.message ||
          "Unable to delete candidate."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300";

      case "Shortlisted":
        return "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300";

      case "Interview":
        return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-300";

      case "Selected":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300";

      case "Rejected":
        return "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300";

      default:
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Temporary frontend Excel export.
  // Later this will call the backend export API.
  const handleDownloadExcel = () => {
    const headers = [
      "Candidate",
      "Email",
      "Phone",
      "Applied Role",
      "Area of Interest",
      "Highest Qualification",
      "Experience",
      "Current Company",
      "Notice Period",
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
      candidate.areaOfInterest,
      candidate.highestQualification,
      candidate.experience,
      candidate.currentCompany,
      candidate.noticePeriod,
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

            return `"${stringValue.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "proliant-candidates.csv";

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
          <p className="font-semibold text-gray-900 dark:text-white">
            {candidate.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
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
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {candidate.job}
          </p>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {candidate.experience}
          </p>
        </div>
      ),
    },

    {
      key: "highestQualification",
      label: "Highest Qualification",
      render: (candidate) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {candidate.highestQualification || "N/A"}
        </span>
      ),
    },

    {
      key: "experience",
      label: "Experience",
      render: (candidate) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {candidate.experience}
        </span>
      ),
    },

    {
      key: "currentCompany",
      label: "Current Company",
      render: (candidate) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {candidate.currentCompany}
        </span>
      ),
    },

    {
      key: "noticePeriod",
      label: "Notice Period",
      render: (candidate) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {candidate.noticePeriod}
        </span>
      ),
    },

    {
      key: "location",
      label: "Location",
      render: (candidate) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {candidate.location}
        </span>
      ),
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
        <span className="text-sm text-gray-600 dark:text-gray-300">
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
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Candidate actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === candidate.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => {
                  setViewCandidate(candidate);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Eye size={16} />

                <span>View Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCandidate(candidate);
                  setEditStatus(candidate.status);
                  setActionError("");
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Pencil size={16} />

                <span>Update Status</span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(candidate);
                  setActionError("");
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
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
    <div className="relative min-h-screen bg-gray-200 p-5 transition-colors dark:bg-gray-950 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Candidates
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage applications and track candidate progress.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={
            isLoading ||
            filteredCandidates.length === 0
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search candidates..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/40"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-950/40 sm:w-40"
          >
            <option value="All">
              All Status
            </option>

            {candidateStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <div
            ref={filterRef}
            className="relative w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={() =>
                setIsFilterOpen((previous) =>
                  !previous
                )
              }
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto ${
                isFilterOpen ||
                appliedRoles.length > 0 ||
                Boolean(appliedDateFilter)
                  ? "border-[#EF3B3A] bg-red-50 text-[#EF3B3A] dark:border-[#EF3B3A] dark:bg-red-950/20 dark:text-red-300"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
              aria-expanded={isFilterOpen}
              aria-label="Open candidate filters"
            >
              <Filter size={17} />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-40 w-[min(92vw,380px)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="space-y-4">
                  {/* Role Filter */}
                  <div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={isRoleFilterEnabled}
                        onChange={(event) => {
                          const checked =
                            event.target.checked;

                          setIsRoleFilterEnabled(
                            checked
                          );

                          if (!checked) {
                            setSelectedRoles([]);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                      />

                      <span>Role</span>
                    </label>

                    {isRoleFilterEnabled && (
                      <div className="mt-3 space-y-2 border-l border-gray-200 pl-7 dark:border-gray-700">
                        {jobs.length === 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            No roles available.
                          </p>
                        ) : (
                          jobs.map((job) => (
                            <label
                              key={job}
                              className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(
                                  job
                                )}
                                onChange={() =>
                                  toggleRole(job)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                              />

                              <span>{job}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Applied Date Filter */}
                  <div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={isDateFilterEnabled}
                        onChange={(event) => {
                          const checked =
                            event.target.checked;

                          setIsDateFilterEnabled(
                            checked
                          );

                          if (!checked) {
                            setSelectedDateFilter("");
                            setCustomFromDate("");
                            setCustomToDate("");
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                      />

                      <span>Applied Date</span>
                    </label>

                    {isDateFilterEnabled && (
                      <div className="mt-3 space-y-3 border-l border-gray-200 pl-7 dark:border-gray-700">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="applied-date-filter"
                            value="today"
                            checked={
                              selectedDateFilter ===
                              "today"
                            }
                            onChange={(event) =>
                              setSelectedDateFilter(
                                event.target.value
                              )
                            }
                            className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                          />

                          <span>Today</span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="applied-date-filter"
                            value="yesterday"
                            checked={
                              selectedDateFilter ===
                              "yesterday"
                            }
                            onChange={(event) =>
                              setSelectedDateFilter(
                                event.target.value
                              )
                            }
                            className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                          />

                          <span>Yesterday</span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="applied-date-filter"
                            value="last7"
                            checked={
                              selectedDateFilter ===
                              "last7"
                            }
                            onChange={(event) =>
                              setSelectedDateFilter(
                                event.target.value
                              )
                            }
                            className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                          />

                          <span>Last 7 Days</span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="applied-date-filter"
                            value="last30"
                            checked={
                              selectedDateFilter ===
                              "last30"
                            }
                            onChange={(event) =>
                              setSelectedDateFilter(
                                event.target.value
                              )
                            }
                            className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                          />

                          <span>Last 30 Days</span>
                        </label>

                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name="applied-date-filter"
                            value="custom"
                            checked={
                              selectedDateFilter ===
                              "custom"
                            }
                            onChange={(event) =>
                              setSelectedDateFilter(
                                event.target.value
                              )
                            }
                            className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                          />

                          <span>Custom Date Range</span>
                        </label>

                        {selectedDateFilter ===
                          "custom" && (
                          <div className="space-y-3 pt-1">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                From
                              </label>

                              <input
                                type="date"
                                value={customFromDate}
                                onChange={(event) =>
                                  setCustomFromDate(
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-red-950/40"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                To
                              </label>

                              <input
                                type="date"
                                value={customToDate}
                                onChange={(event) =>
                                  setCustomToDate(
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-red-950/40"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={applyFilters}
                    className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Candidate Applications
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Loading candidates..."
              : `${filteredCandidates.length} candidate${
                  filteredCandidates.length !== 1
                    ? "s"
                    : ""
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading candidate applications...
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
            columns={candidateColumns}
            data={filteredCandidates}
            emptyMessage="No candidates found."
          />
        )}
      </section>

      {/* View Candidate Modal */}
      {viewCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setViewCandidate(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Candidate Details
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Application information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {viewCandidate.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Location
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Highest Qualification
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.highestQualification ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Experience
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Current Company
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.currentCompany}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Notice Period
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.noticePeriod}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 text-gray-400 dark:text-gray-500"
                  />

                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Area of Interest
                    </p>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {viewCandidate.areaOfInterest}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  Applied For
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {viewCandidate.job}
                </p>

                <p className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                  Applied Date
                </p>

                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(
                    viewCandidate.appliedDate
                  )}
                </p>
              </div>

              {viewCandidate.coverMessage && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    Cover Message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {viewCandidate.coverMessage}
                  </p>
                </div>
              )}

              <a
                href={viewCandidate.resumeUrl}
                onClick={(event) => {
                  if (viewCandidate.resumeUrl === "#") {
                    event.preventDefault();
                  }
                }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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
          className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() =>
            setEditingCandidate(null)
          }
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Candidate Status
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Update the application status.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCandidate(null)
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                {editingCandidate.name}
              </p>

              <select
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-red-950/40"
              >
                {candidateStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditingCandidate(null)
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting
                  ? "Saving..."
                  : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() =>
            setDeleteCandidate(null)
          }
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/40">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Candidate?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteCandidate.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteCandidate(null)
                }
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
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
                  : "Delete Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;