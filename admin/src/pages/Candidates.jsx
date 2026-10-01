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
  "On hold",
];

const dateFilterOptions = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["twoDaysAgo", "2 Days Ago"],
  ["last7", "Last 7 Days"],
  ["last30", "Last 30 Days"],
  ["custom", "Custom Date Range"],
];

const normalizeCandidate = (candidate) => {
  const isFresher = Boolean(candidate.isFresher);

  let experience = "N/A";

  if (isFresher) {
    experience = "Fresher";
  } else if (
    candidate.yearsOfExperience !== undefined &&
    candidate.yearsOfExperience !== null &&
    candidate.yearsOfExperience !== ""
  ) {
    experience = `${candidate.yearsOfExperience} ${
      Number(candidate.yearsOfExperience) === 1
        ? "Year"
        : "Years"
    }`;
  } else if (candidate.experience) {
    experience = candidate.experience;
  }

  return {
    ...candidate,

    id: candidate._id || candidate.id,

    job:
      candidate.position ||
      candidate.job ||
      "N/A",

    experience,

    appliedDate:
      candidate.createdAt ||
      candidate.appliedDate,

    resumeUrl:
      candidate.resume ||
      candidate.resumeUrl ||
      "#",

    currentCompany:
      candidate.currentCompany ||
      "N/A",

    location:
      candidate.location ||
      "N/A",

    noticePeriod:
      candidate.noticePeriod ||
      "N/A",

    areaOfInterest:
      candidate.areaOfInterest ||
      "N/A",

    highestQualification:
      candidate.highestQualification ||
      "N/A",

    coverMessage:
      candidate.coverMessage ||
      "",
  };
};

function Candidates() {
  const [candidates, setCandidates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
   * Custom filter popup
   */
  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  const filterRef = useRef(null);

  const [isRoleFilterEnabled, setIsRoleFilterEnabled] =
    useState(false);

  const [isDateFilterEnabled, setIsDateFilterEnabled] =
    useState(false);

  const [selectedRoles, setSelectedRoles] =
    useState([]);

  const [selectedDateFilter, setSelectedDateFilter] =
    useState("");

  const [customFromDate, setCustomFromDate] =
    useState("");

  const [customToDate, setCustomToDate] =
    useState("");

  /*
   * Applied filters
   *
   * These are separate from the temporary
   * selections so that Apply actually applies
   * the selected filters.
   */
  const [appliedRoles, setAppliedRoles] =
    useState([]);

  const [appliedDateFilter, setAppliedDateFilter] =
    useState("");

  const [appliedCustomFromDate, setAppliedCustomFromDate] =
    useState("");

  const [appliedCustomToDate, setAppliedCustomToDate] =
    useState("");

  /*
   * Candidate actions
   */
  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [viewCandidate, setViewCandidate] =
    useState(null);

  const [editingCandidate, setEditingCandidate] =
    useState(null);

  const [deleteCandidate, setDeleteCandidate] =
    useState(null);

  const [editStatus, setEditStatus] =
    useState("");

  /*
   * Authentication
   */
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("adminToken");

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
   * Fetch candidates from backend
   */
  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await fetch(
        `${API_BASE_URL}/candidates`,
        {
          headers: getAuthHeaders(),
        }
      );

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
        throw new Error(
          "Invalid candidates response from backend"
        );
      }

      const normalizedCandidates =
        result.candidates
          .map(normalizeCandidate)
          .sort(
            (a, b) =>
              new Date(b.appliedDate || 0) -
              new Date(a.appliedDate || 0)
          );

      setCandidates(normalizedCandidates);
    } catch (error) {
      console.error(
        "Failed to load candidates:",
        error
      );

      setPageError(
        "Unable to load candidate applications."
      );

      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  /*
   * Close filter popup when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(
          event.target
        )
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

  /*
   * Roles are generated dynamically from
   * backend candidate data.
   */
  const jobs = useMemo(() => {
    return [
      ...new Set(
        candidates
          .map(
            (candidate) =>
              candidate.job
          )
          .filter(
            (job) =>
              job &&
              job !== "N/A"
          )
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [candidates]);

  /*
   * Toggle role selection
   */
  const toggleRole = (role) => {
    setSelectedRoles((previous) => {
      if (previous.includes(role)) {
        return previous.filter(
          (selectedRole) =>
            selectedRole !== role
        );
      }

      return [
        ...previous,
        role,
      ];
    });
  };

  /*
   * Date helpers
   */
  const getStartOfDay = (date) => {
    const result = new Date(date);

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  };

  const getCandidateDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return null;
    }

    const parsedDate =
      new Date(dateValue);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return null;
    }

    return getStartOfDay(
      parsedDate
    );
  };

  const parseInputDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return null;
    }

    const [
      year,
      month,
      day,
    ] = dateValue
      .split("-")
      .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  };

  /*
   * Applied date filter logic
   */
  const isCandidateWithinDateFilter = (
    candidateDateValue,
    dateFilter,
    fromDateValue,
    toDateValue
  ) => {
    const candidateDate =
      getCandidateDate(
        candidateDateValue
      );

    if (
      !candidateDate ||
      !dateFilter
    ) {
      return true;
    }

    const today =
      getStartOfDay(
        new Date()
      );

    /*
     * Today
     */
    if (
      dateFilter === "today"
    ) {
      return (
        candidateDate.getTime() ===
        today.getTime()
      );
    }

    /*
     * Yesterday
     */
    if (
      dateFilter === "yesterday"
    ) {
      const yesterday =
        new Date(today);

      yesterday.setDate(
        yesterday.getDate() - 1
      );

      return (
        candidateDate.getTime() ===
        yesterday.getTime()
      );
    }

    /*
     * 2 Days Ago
     */
    if (
      dateFilter === "twoDaysAgo"
    ) {
      const twoDaysAgo =
        new Date(today);

      twoDaysAgo.setDate(
        twoDaysAgo.getDate() - 2
      );

      return (
        candidateDate.getTime() ===
        twoDaysAgo.getTime()
      );
    }

    /*
     * Last 7 Days
     */
    if (
      dateFilter === "last7"
    ) {
      const startDate =
        new Date(today);

      startDate.setDate(
        startDate.getDate() - 6
      );

      return (
        candidateDate >=
          startDate &&
        candidateDate <=
          today
      );
    }

    /*
     * Last 30 Days
     */
    if (
      dateFilter === "last30"
    ) {
      const startDate =
        new Date(today);

      startDate.setDate(
        startDate.getDate() - 29
      );

      return (
        candidateDate >=
          startDate &&
        candidateDate <=
          today
      );
    }

    /*
     * Custom Date Range
     */
    if (
      dateFilter === "custom"
    ) {
      const fromDate =
        parseInputDate(
          fromDateValue
        );

      const toDate =
        parseInputDate(
          toDateValue
        );

      if (
        !fromDate &&
        !toDate
      ) {
        return true;
      }

      if (
        fromDate &&
        !toDate
      ) {
        return (
          candidateDate >=
          fromDate
        );
      }

      if (
        !fromDate &&
        toDate
      ) {
        return (
          candidateDate <=
          toDate
        );
      }

      return (
        candidateDate >=
          fromDate &&
        candidateDate <=
          toDate
      );
    }

    return true;
  };

  /*
   * Clear Filter
   */
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

  /*
   * Apply Filter
   */
  const applyFilters = () => {
    const validRoles =
      selectedRoles.filter(
        (role) =>
          jobs.includes(role)
      );

    const isCustomDate =
      selectedDateFilter ===
      "custom";

    setAppliedRoles(
      isRoleFilterEnabled
        ? validRoles
        : []
    );

    setAppliedDateFilter(
      isDateFilterEnabled
        ? selectedDateFilter
        : ""
    );

    setAppliedCustomFromDate(
      isDateFilterEnabled &&
      isCustomDate
        ? customFromDate
        : ""
    );

    setAppliedCustomToDate(
      isDateFilterEnabled &&
      isCustomDate
        ? customToDate
        : ""
    );

    setIsFilterOpen(false);
  };

  /*
   * Search + Status + Role + Date
   */
  const filteredCandidates =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      return candidates.filter(
        (candidate) => {
          const searchableValues = [
            candidate.name,
            candidate.email,
            candidate.phone,
            candidate.job,
            candidate.location,
            candidate.highestQualification,
            candidate.currentCompany,
            candidate.noticePeriod,
            candidate.areaOfInterest,
          ];

          const matchesSearch =
            searchableValues.some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    searchValue
                  )
            );

          const matchesStatus =
            statusFilter === "All" ||
            candidate.status ===
              statusFilter;

          const matchesRole =
            appliedRoles.length === 0 ||
            appliedRoles.includes(
              candidate.job
            );

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
        }
      );
    }, [
      candidates,
      search,
      statusFilter,
      appliedRoles,
      appliedDateFilter,
      appliedCustomFromDate,
      appliedCustomToDate,
    ]);

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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

  /*
   * Update candidate status
   */
  const handleStatusUpdate =
    async () => {
      if (!editingCandidate) {
        return;
      }

      try {
        setIsSubmitting(true);
        setActionError("");

        const response =
          await fetch(
            `${API_BASE_URL}/candidates/${editingCandidate.id}`,
            {
              method: "PUT",
              headers:
                getAuthHeaders(),

              body: JSON.stringify({
                position:
                  editingCandidate.position ||
                  editingCandidate.job,

                areaOfInterest:
                  editingCandidate.areaOfInterest ||
                  "",

                name:
                  editingCandidate.name,

                email:
                  editingCandidate.email,

                phone:
                  editingCandidate.phone,

                isFresher:
                  editingCandidate.isFresher ||
                  false,

                location:
                  editingCandidate.location ||
                  "",

                yearsOfExperience:
                  editingCandidate.yearsOfExperience,

                highestQualification:
                  editingCandidate.highestQualification,

                currentCompany:
                  editingCandidate.currentCompany ||
                  "",

                noticePeriod:
                  editingCandidate.noticePeriod,

                coverMessage:
                  editingCandidate.coverMessage ||
                  "",

                resume:
                  editingCandidate.resume ||
                  editingCandidate.resumeUrl ||
                  "",

                status:
                  editStatus,
              }),
            }
          );

        if (
          response.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Candidate update failed with status ${response.status}`
          );
        }

        const result =
          await response.json();

        if (
          result?.success !== true
        ) {
          throw new Error(
            result?.message ||
              "Failed to update candidate status"
          );
        }

        const updatedCandidate =
          result.candidate
            ? normalizeCandidate(
                result.candidate
              )
            : null;

        setCandidates(
          (previous) =>
            previous.map(
              (candidate) =>
                candidate.id ===
                editingCandidate.id
                  ? updatedCandidate ||
                    {
                      ...candidate,
                      status:
                        editStatus,
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

  /*
   * Delete candidate
   */
  const handleDelete =
    async () => {
      if (!deleteCandidate) {
        return;
      }

      try {
        setIsSubmitting(true);
        setActionError("");

        const response =
          await fetch(
            `${API_BASE_URL}/candidates/${deleteCandidate.id}`,
            {
              method: "DELETE",
              headers:
                getAuthHeaders(),
            }
          );

        if (
          response.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Candidate delete failed with status ${response.status}`
          );
        }

        const result =
          await response.json();

        if (
          result?.success !== true
        ) {
          throw new Error(
            result?.message ||
              "Failed to delete candidate"
          );
        }

        setCandidates(
          (previous) =>
            previous.filter(
              (candidate) =>
                candidate.id !==
                deleteCandidate.id
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

  const getStatusClass = (
    status
  ) => {
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

  /*
   * CSV / Excel download
   */
  const handleDownloadExcel =
    () => {
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

      const rows =
        filteredCandidates.map(
          (candidate) => [
            candidate.name,
            candidate.email,
            candidate.phone,
            candidate.job,
            candidate.experience,
            candidate.location,
            candidate.status,
            formatDate(
              candidate.appliedDate
            ),
            candidate.resumeUrl ===
            "#"
              ? ""
              : candidate.resumeUrl,
          ]
        );

      const csvContent =
        [headers, ...rows]
          .map((row) =>
            row
              .map((value) => {
                const stringValue =
                  String(
                    value ?? ""
                  );

                return `"${stringValue.replace(
                  /"/g,
                  '""'
                )}"`;
              })
              .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [csvContent],
          {
            type: "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.download =
        "proliant-candidates.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );
    };

  const openViewCandidate =
    (candidate) => {
      setViewCandidate(
        candidate
      );
      setOpenMenuId(null);
    };

  const openEditCandidate =
    (candidate) => {
      setEditingCandidate(
        candidate
      );

      setEditStatus(
        candidate.status ||
          "New"
      );

      setActionError("");
      setOpenMenuId(null);
    };

  const openDeleteCandidate =
    (candidate) => {
      setDeleteCandidate(
        candidate
      );

      setActionError("");
      setOpenMenuId(null);
    };

  const renderActions =
    (candidate) => (
      <div className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            setOpenMenuId(
              (previous) =>
                previous ===
                candidate.id
                  ? null
                  : candidate.id
            );
          }}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          aria-label="Candidate actions"
        >
          <MoreVertical
            size={18}
          />
        </button>

        {openMenuId ===
          candidate.id && (
          <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() =>
                openViewCandidate(
                  candidate
                )
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Eye size={16} />
              <span>
                View Candidate
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                openEditCandidate(
                  candidate
                )
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Pencil
                size={16}
              />
              <span>
                Update Status
              </span>
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              onClick={() =>
                openDeleteCandidate(
                  candidate
                )
              }
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2
                size={16}
              />
              <span>
                Delete Candidate
              </span>
            </button>
          </div>
        )}
      </div>
    );

  const candidateColumns = [
    {
      key: "name",
      label: "Candidate",

      render: (
        candidate
      ) => (
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

      render: (
        candidate
      ) => (
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

      render: (
        candidate
      ) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
            candidate.status
          )}`}
        >
          {candidate.status ||
            "N/A"}
        </span>
      ),
    },

    {
      key: "appliedDate",
      label: "Applied",

      render: (
        candidate
      ) => (
        <span className="text-sm text-gray-600">
          {formatDate(
            candidate.appliedDate
          )}
        </span>
      ),
    },

    {
      key: "resume",
      label: "Resume",

      render: (
        candidate
      ) => (
        <a
          href={
            candidate.resumeUrl
          }
          onClick={(event) => {
            if (
              candidate.resumeUrl ===
              "#"
            ) {
              event.preventDefault();
            }
          }}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EF3B3A] transition-colors hover:text-red-600"
        >
          <FileText
            size={16}
          />
          View Resume
        </a>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render:
        renderActions,
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
            Manage applications
            and track candidate
            progress.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleDownloadExcel
          }
          disabled={
            filteredCandidates.length ===
            0
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {pageError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {pageError}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {/* Search + Filters */}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between max-[767px]:flex-row max-[767px]:items-center max-[767px]:gap-1.5">
        <div className="relative w-full lg:max-w-sm max-[767px]:min-w-0 max-[767px]:flex-[1.45]">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 max-[767px]:left-2 max-[767px]:size-[13px]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search candidates..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 max-[767px]:h-8 max-[767px]:py-1 max-[767px]:pl-7 max-[767px]:pr-1.5 max-[767px]:text-[9px]"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto max-[767px]:min-w-0 max-[767px]:flex-[1.75] max-[767px]:flex-row max-[767px]:gap-1.5">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2.5 text-[11px] text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:h-8 max-[767px]:min-w-0 max-[767px]:flex-1 max-[767px]:px-1 max-[767px]:py-1 max-[767px]:text-[9px]"
          >
            <option value="All">
              All Status
            </option>

            {candidateStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          {/* Custom Filter */}

          <div
            ref={filterRef}
            className="relative w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={() =>
                setIsFilterOpen(
                  (previous) =>
                    !previous
                )
              }
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto max-[767px]:h-8 max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-[9px] ${
                isFilterOpen ||
                appliedRoles.length >
                  0 ||
                Boolean(
                  appliedDateFilter
                )
                  ? "border-[#EF3B3A] bg-red-50 text-[#EF3B3A]"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-expanded={
                isFilterOpen
              }
              aria-label="Open candidate filters"
            >
              <Filter
                size={17}
              />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-40 w-[min(92vw,380px)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                <div className="space-y-4">

                  {/* Role */}

                  <div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800">
                      <input
                        type="checkbox"
                        checked={
                          isRoleFilterEnabled
                        }
                        onChange={(
                          event
                        ) => {
                          const checked =
                            event.target
                              .checked;

                          setIsRoleFilterEnabled(
                            checked
                          );

                          if (
                            !checked
                          ) {
                            setSelectedRoles(
                              []
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                      />

                      <span>
                        Role
                      </span>
                    </label>

                    {isRoleFilterEnabled && (
                      <div className="mt-3 max-h-40 space-y-2 overflow-y-auto border-l border-gray-200 pl-7">
                        {jobs.length ===
                        0 ? (
                          <p className="text-xs text-gray-500">
                            No roles
                            available.
                          </p>
                        ) : (
                          jobs.map(
                            (
                              job
                            ) => (
                              <label
                                key={
                                  job
                                }
                                className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(
                                    job
                                  )}
                                  onChange={() =>
                                    toggleRole(
                                      job
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                                />

                                <span>
                                  {
                                    job
                                  }
                                </span>
                              </label>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Applied Date */}

                  <div>
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800">
                      <input
                        type="checkbox"
                        checked={
                          isDateFilterEnabled
                        }
                        onChange={(
                          event
                        ) => {
                          const checked =
                            event.target
                              .checked;

                          setIsDateFilterEnabled(
                            checked
                          );

                          if (
                            !checked
                          ) {
                            setSelectedDateFilter(
                              ""
                            );
                            setCustomFromDate(
                              ""
                            );
                            setCustomToDate(
                              ""
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                      />

                      <span>
                        Applied Date
                      </span>
                    </label>

                    {isDateFilterEnabled && (
                      <div className="mt-3 space-y-3 border-l border-gray-200 pl-7">
                        {dateFilterOptions.map(
                          ([
                            value,
                            label,
                          ]) => (
                            <label
                              key={
                                value
                              }
                              className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                            >
                              <input
                                type="radio"
                                name="applied-date-filter"
                                value={
                                  value
                                }
                                checked={
                                  selectedDateFilter ===
                                  value
                                }
                                onChange={(
                                  event
                                ) =>
                                  setSelectedDateFilter(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="h-4 w-4 border-gray-300 text-[#EF3B3A] accent-[#EF3B3A] focus:ring-[#EF3B3A]"
                              />

                              <span>
                                {
                                  label
                                }
                              </span>
                            </label>
                          )
                        )}

                        {selectedDateFilter ===
                          "custom" && (
                          <div className="space-y-3 pt-1">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                From
                              </label>

                              <input
                                type="date"
                                value={
                                  customFromDate
                                }
                                onChange={(
                                  event
                                ) =>
                                  setCustomFromDate(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                To
                              </label>

                              <input
                                type="date"
                                value={
                                  customToDate
                                }
                                onChange={(
                                  event
                                ) =>
                                  setCustomToDate(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={
                      applyFilters
                    }
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

      {/* Candidate Applications */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Candidate Applications
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {isLoading
              ? "Loading candidates..."
              : `${filteredCandidates.length} candidate${
                  filteredCandidates.length !==
                  1
                    ? "s"
                    : ""
                } found`}
          </p>
        </div>

        {/* Desktop */}

        <div className="hidden md:block">
          <DataTable
            columns={
              candidateColumns
            }
            data={
              filteredCandidates
            }
            emptyMessage={
              isLoading
                ? "Loading candidates..."
                : "No candidates found."
            }
          />
        </div>

        {/* Mobile */}

        <div className="space-y-3 p-3 md:hidden">
          {isLoading ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              Loading
              candidates...
            </div>
          ) : filteredCandidates.length ===
            0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              No candidates
              found.
            </div>
          ) : (
            filteredCandidates.map(
              (candidate) => (
                <div
                  key={
                    candidate.id
                  }
                  className="relative overflow-visible rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {
                          candidate.name
                        }
                      </h3>

                      <p className="mt-0.5 break-all text-xs text-gray-500">
                        {
                          candidate.email
                        }
                      </p>
                    </div>

                    {renderActions(
                      candidate
                    )}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <FileText
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Applied For
                        </p>

                        <p className="break-words text-sm font-medium text-gray-800">
                          {
                            candidate.job
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            candidate.experience
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Location
                        </p>

                        <p className="break-words text-sm text-gray-700">
                          {
                            candidate.location
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone
                        size={16}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Phone
                        </p>

                        <p className="text-sm text-gray-700">
                          {
                            candidate.phone
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 shrink-0" />

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Status
                        </p>

                        <span
                          className={`mt-0.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            candidate.status
                          )}`}
                        >
                          {
                            candidate.status
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 shrink-0" />

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Applied Date
                        </p>

                        <p className="text-sm text-gray-700">
                          {formatDate(
                            candidate.appliedDate
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-2">
                    <a
                      href={
                        candidate.resumeUrl
                      }
                      onClick={(
                        event
                      ) => {
                        if (
                          candidate.resumeUrl ===
                          "#"
                        ) {
                          event.preventDefault();
                        }
                      }}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <FileText
                        size={16}
                      />
                      View Resume
                    </a>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </section>

            {/* View Candidate Modal */}

      {viewCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() =>
            setViewCandidate(
              null
            )
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Candidate
                  Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Application
                  information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewCandidate(
                    null
                  )
                }
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {
                      viewCandidate.name
                    }
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      viewCandidate.job
                    }
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                    viewCandidate.status
                  )}`}
                >
                  {
                    viewCandidate.status
                  }
                </span>
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
                      {
                        viewCandidate.email ||
                        "N/A"
                      }
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
                      {
                        viewCandidate.phone ||
                        "N/A"
                      }
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
                      {
                        viewCandidate.location
                      }
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
                      {
                        viewCandidate.experience
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Highest
                    Qualification
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {
                      viewCandidate.highestQualification
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Current
                    Company
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {
                      viewCandidate.currentCompany
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Notice Period
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {
                      viewCandidate.noticePeriod
                    }
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Area of
                    Interest
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {
                      viewCandidate.areaOfInterest
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-400">
                  Applied For
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {
                    viewCandidate.job
                  }
                </p>

                <p className="mt-3 text-xs font-medium text-gray-400">
                  Applied Date
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {formatDate(
                    viewCandidate.appliedDate
                  )}
                </p>
              </div>

              {viewCandidate.coverMessage && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400">
                    Cover Message
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {
                      viewCandidate.coverMessage
                    }
                  </p>
                </div>
              )}

              <a
                href={
                  viewCandidate.resumeUrl
                }
                onClick={(event) => {
                  if (
                    viewCandidate.resumeUrl ===
                    "#"
                  ) {
                    event.preventDefault();
                  }
                }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FileText
                  size={17}
                />

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
          onClick={() =>
            setEditingCandidate(
              null
            )
          }
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Candidate
                  Status
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update the
                  application
                  status.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingCandidate(
                    null
                  )
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="mb-3 text-sm font-semibold text-gray-800">
                {
                  editingCandidate.name
                }
              </p>

              <select
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(
                    event.target
                      .value
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
              >
                {candidateStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={
                        status
                      }
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setEditingCandidate(
                    null
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  isSubmitting
                }
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() =>
            setDeleteCandidate(
              null
            )
          }
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2
                size={20}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Candidate?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you
              want to delete{" "}
              <span className="font-semibold text-gray-700">
                {
                  deleteCandidate.name
                }
              </span>
              ? This action
              cannot be undone.
            </p>

            {actionError && (
              <p className="mt-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteCandidate(
                    null
                  )
                }
                disabled={
                  isSubmitting
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={
                  isSubmitting
                }
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