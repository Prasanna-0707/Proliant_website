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

import DataTable from "../../components/DataTable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

// Static fallback data used only when the candidates API is unavailable.
// This data is for UI testing and is not saved to the backend.
const staticCandidates = [
  {
    _id: "sample-candidate-1",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    position: "React Developer",
    isFresher: false,
    yearsOfExperience: 2,
    location: "Hyderabad, India",
    highestQualification: "B.Tech Computer Science",
    currentCompany: "TechNova Solutions",
    noticePeriod: "30 Days",
    areaOfInterest: "Frontend Development",
    status: "New",
    createdAt: "2026-10-27T09:30:00.000Z",
    resume: "#",
    coverMessage: "Interested in building accessible and responsive web applications.",
  },
  {
    _id: "sample-candidate-2",
    name: "Priya Reddy",
    email: "priya.reddy@example.com",
    phone: "+91 91234 56780",
    position: "Full Stack Developer",
    isFresher: false,
    yearsOfExperience: 3,
    location: "Bengaluru, India",
    highestQualification: "MCA",
    currentCompany: "CloudBridge Technologies",
    noticePeriod: "60 Days",
    areaOfInterest: "React and Node.js",
    status: "Shortlisted",
    createdAt: "2026-10-25T11:15:00.000Z",
    resume: "#",
    coverMessage: "I have experience developing full-stack applications using React, Node.js, and MongoDB.",
  },
  {
    _id: "sample-candidate-3",
    name: "Kiran Kumar",
    email: "kiran.kumar@example.com",
    phone: "+91 99887 76655",
    position: "Junior Software Developer",
    isFresher: true,
    yearsOfExperience: 0,
    location: "Vijayawada, India",
    highestQualification: "B.Sc. Computer Science",
    currentCompany: "N/A",
    noticePeriod: "Immediate",
    areaOfInterest: "JavaScript Development",
    status: "Interview",
    createdAt: "2026-10-23T08:45:00.000Z",
    resume: "#",
    coverMessage: "I am a recent graduate looking for an opportunity to grow as a software developer.",
  },
  {
    _id: "sample-candidate-4",
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    phone: "+91 90123 45678",
    position: "UI/UX Designer",
    isFresher: false,
    yearsOfExperience: 4,
    location: "Pune, India",
    highestQualification: "B.Des Interaction Design",
    currentCompany: "PixelCraft Studio",
    noticePeriod: "15 Days",
    areaOfInterest: "Product Design",
    status: "On hold",
    createdAt: "2026-10-21T14:00:00.000Z",
    resume: "#",
    coverMessage: "I enjoy translating user needs into clear and useful product experiences.",
  },
  {
    _id: "sample-candidate-5",
    name: "Arjun Varma",
    email: "arjun.varma@example.com",
    phone: "+91 93456 78901",
    position: "Backend Developer",
    isFresher: false,
    yearsOfExperience: 5,
    location: "Chennai, India",
    highestQualification: "B.Tech Information Technology",
    currentCompany: "NextGen Systems",
    noticePeriod: "90 Days",
    areaOfInterest: "Node.js and MongoDB",
    status: "Selected",
    createdAt: "2026-10-19T10:20:00.000Z",
    resume: "#",
    coverMessage: "Experienced backend developer with an interest in scalable application architecture.",
  },
];

const normalizeCandidate = (candidate) => {
  const id =
    candidate._id ||
    candidate.id ||
    candidate.candidateId;

  const position =
    candidate.position ||
    candidate.job ||
    candidate.jobTitle ||
    candidate.appliedPosition ||
    "N/A";

  const yearsOfExperience =
    candidate.yearsOfExperience ??
    candidate.experienceYears ??
    candidate.experience ??
    0;

  const experience =
    candidate.isFresher ||
    Number(yearsOfExperience) === 0
      ? "Fresher"
      : `${yearsOfExperience} Years`;

  return {
    ...candidate,
    id,
    name: candidate.name || candidate.fullName || "N/A",
    email: candidate.email || "N/A",
    phone: candidate.phone || candidate.mobile || "N/A",
    job: position,
    position,
    experience,
    yearsOfExperience,
    isFresher:
      candidate.isFresher ??
      Number(yearsOfExperience) === 0,
    location: candidate.location || "N/A",
    highestQualification:
      candidate.highestQualification ||
      candidate.qualification ||
      "N/A",
    currentCompany:
      candidate.currentCompany ||
      candidate.company ||
      "N/A",
    noticePeriod: candidate.noticePeriod || "N/A",
    areaOfInterest: candidate.areaOfInterest || "N/A",
    status: candidate.status || "New",
    appliedDate:
      candidate.createdAt ||
      candidate.appliedDate ||
      candidate.applicationDate ||
      null,
    resumeUrl:
      candidate.resumeUrl ||
      candidate.resume ||
      "#",
    coverMessage:
      candidate.coverMessage ||
      candidate.message ||
      "",
  };
};

const statusClasses = {
  New: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",

  Shortlisted:
    "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300",

  Interview:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",

  Selected:
    "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",

  Rejected:
    "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",

  "On hold":
    "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
};

const statusClass = (status) =>
  statusClasses[status] ||
  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-red-950";

const secondaryButtonClass =
  "rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800";

const modalCardClass =
  "w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900";

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  const filterRef = useRef(null);

  const [isRoleFilterEnabled, setIsRoleFilterEnabled] =
    useState(false);

  const [isDateFilterEnabled, setIsDateFilterEnabled] =
    useState(false);

  const [selectedRoles, setSelectedRoles] = useState(
    []
  );

  const [selectedDateFilter, setSelectedDateFilter] =
    useState("");

  const [customFromDate, setCustomFromDate] =
    useState("");

  const [customToDate, setCustomToDate] =
    useState("");

  const [appliedRoles, setAppliedRoles] = useState(
    []
  );

  const [appliedDateFilter, setAppliedDateFilter] =
    useState("");

  const [
    appliedCustomFromDate,
    setAppliedCustomFromDate,
  ] = useState("");

  const [
    appliedCustomToDate,
    setAppliedCustomToDate,
  ] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [viewCandidate, setViewCandidate] =
    useState(null);

  const [editingCandidate, setEditingCandidate] =
    useState(null);

  const [deleteCandidate, setDeleteCandidate] =
    useState(null);

  const [editStatus, setEditStatus] = useState("");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(
      "adminToken"
    )}`,
    "Content-Type": "application/json",
  });

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/login";
  };

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

      // Do not clear the logged-in session when this data endpoint
      // returns 401. Show sample data instead, as requested.
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

      const normalized = result.candidates
        .map(normalizeCandidate)
        .sort(
          (a, b) =>
            new Date(b.appliedDate || 0) -
            new Date(a.appliedDate || 0)
        );

      setCandidates(normalized);
    } catch (error) {
      console.warn(
        "Candidates API is unavailable. Displaying sample candidates:",
        error
      );

      const normalizedSamples = staticCandidates
        .map(normalizeCandidate)
        .sort(
          (a, b) =>
            new Date(b.appliedDate || 0) -
            new Date(a.appliedDate || 0)
        );

      setCandidates(normalizedSamples);
      setPageError(
        "The candidates API is unavailable. Sample data is being displayed for UI testing; changes to these sample records are not saved to the backend."
      );
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

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const jobs = useMemo(
    () =>
      [
        ...new Set(
          candidates
            .map((candidate) => candidate.job)
            .filter(
              (job) => job && job !== "N/A"
            )
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      ),
    [candidates]
  );

  const toggleRole = (role) => {
    setSelectedRoles((previous) =>
      previous.includes(role)
        ? previous.filter(
            (item) => item !== role
          )
        : [...previous, role]
    );
  };

  const getStartOfDay = (date) => {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  };

  const getCandidateDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return getStartOfDay(date);
  };

  const parseInputDate = (value) => {
    if (!value) return null;

    const [year, month, day] =
      value.split("-").map(Number);

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
    value,
    filter,
    fromValue,
    toValue
  ) => {
    const candidateDate =
      getCandidateDate(value);

    if (!candidateDate || !filter) {
      return true;
    }

    const today = getStartOfDay(
      new Date()
    );

    if (filter === "today") {
      return (
        candidateDate.getTime() ===
        today.getTime()
      );
    }

    if (filter === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(
        yesterday.getDate() - 1
      );

      return (
        candidateDate.getTime() ===
        yesterday.getTime()
      );
    }

    if (filter === "twoDaysAgo") {
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(
        twoDaysAgo.getDate() - 2
      );

      return (
        candidateDate.getTime() ===
        twoDaysAgo.getTime()
      );
    }

    if (filter === "last7") {
      const startDate = new Date(today);
      startDate.setDate(
        startDate.getDate() - 6
      );

      return (
        candidateDate >= startDate &&
        candidateDate <= today
      );
    }

    if (filter === "last30") {
      const startDate = new Date(today);
      startDate.setDate(
        startDate.getDate() - 29
      );

      return (
        candidateDate >= startDate &&
        candidateDate <= today
      );
    }

    if (filter === "custom") {
      const fromDate =
        parseInputDate(fromValue);

      const toDate =
        parseInputDate(toValue);

      if (fromDate && candidateDate < fromDate) {
        return false;
      }

      if (toDate && candidateDate > toDate) {
        return false;
      }

      return true;
    }

    return true;
  };

  const applyFilters = () => {
    setAppliedRoles(
      isRoleFilterEnabled
        ? selectedRoles
        : []
    );

    setAppliedDateFilter(
      isDateFilterEnabled
        ? selectedDateFilter
        : ""
    );

    setAppliedCustomFromDate(
      isDateFilterEnabled &&
        selectedDateFilter === "custom"
        ? customFromDate
        : ""
    );

    setAppliedCustomToDate(
      isDateFilterEnabled &&
        selectedDateFilter === "custom"
        ? customToDate
        : ""
    );

    setIsFilterOpen(false);
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

    setIsFilterOpen(false);
  };

  const activeFilterCount =
    appliedRoles.length +
    (appliedDateFilter ? 1 : 0);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          candidate.name,
          candidate.email,
          candidate.phone,
          candidate.job,
          candidate.location,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesStatus =
        statusFilter === "All" ||
        candidate.status === statusFilter;

      const matchesRole =
        appliedRoles.length === 0 ||
        appliedRoles.includes(candidate.job);

      const matchesDate =
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
        matchesDate
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

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleStatusUpdate = async () => {
    if (!editingCandidate) return;

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
              editingCandidate.areaOfInterest ||
              "",

            name: editingCandidate.name,
            email: editingCandidate.email,
            phone: editingCandidate.phone,

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

      const result =
        await response.json();

      if (result?.success !== true) {
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

      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.id ===
          editingCandidate.id
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
    if (!deleteCandidate) return;

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

      const result =
        await response.json();

      if (result?.success !== true) {
        throw new Error(
          result?.message ||
            "Failed to delete candidate"
        );
      }

      setCandidates((previous) =>
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

  const handleDownloadExcel = () => {
    const headers = [
      "Candidate Name",
      "Email Address",
      "Phone Number",
      "Applied Position",
      "Experience",
      "Location",
      "Application Status",
      "Applied On",
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
          candidate.resumeUrl === "#"
            ? ""
            : candidate.resumeUrl,
        ]
      );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
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

  const openViewCandidate = (
    candidate
  ) => {
    setViewCandidate(candidate);
    setOpenMenuId(null);
  };

  const openEditCandidate = (
    candidate
  ) => {
    setEditingCandidate(candidate);
    setEditStatus(
      candidate.status || "New"
    );
    setActionError("");
    setOpenMenuId(null);
  };

  const openDeleteCandidate = (
    candidate
  ) => {
    setDeleteCandidate(candidate);
    setActionError("");
    setOpenMenuId(null);
  };

  const renderActions = (
    candidate
  ) => (
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
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Candidate actions"
      >
        <MoreVertical size={18} />
      </button>

      {openMenuId === candidate.id && (
        <div className="absolute right-0 top-10 z-30 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            onClick={() =>
              openViewCandidate(candidate)
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Eye size={15} />
            View
          </button>

          <button
            type="button"
            onClick={() =>
              openEditCandidate(candidate)
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Pencil size={15} />
            Edit Status
          </button>

          <button
            type="button"
            onClick={() =>
              openDeleteCandidate(candidate)
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  const columns = [
    {
      key: "name",
      label: "Candidate Name",

      render: (candidate) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {candidate.name}
          </p>

          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
            {candidate.email}
          </p>
        </div>
      ),
    },

    {
      key: "job",
      label: "Applied Position",

      render: (candidate) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {candidate.job}
        </span>
      ),
    },

    {
      key: "experience",
      label: "Experience",

      render: (candidate) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {candidate.experience}
        </span>
      ),
    },

    {
      key: "location",
      label: "Location",

      render: (candidate) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {candidate.location}
        </span>
      ),
    },

    {
      key: "appliedDate",
      label: "Applied On",

      render: (candidate) => (
        <span className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          {formatDate(candidate.appliedDate)}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (candidate) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
            candidate.status
          )}`}
        >
          {candidate.status}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (candidate) =>
        renderActions(candidate),
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            Candidates
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track all candidate applications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={filteredCandidates.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* API Fallback Notice */}
      {pageError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          {pageError}
        </div>
      )}

      {/* Action Error */}
      {actionError && !editingCandidate && !deleteCandidate && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, phone, position..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className={`${inputClass} sm:w-48`}
            >
              <option value="All">
                All Statuses
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

            <div
              className="relative"
              ref={filterRef}
            >
              <button
                type="button"
                onClick={() =>
                  setIsFilterOpen((previous) =>
                    !previous
                  )
                }
                className={`${secondaryButtonClass} flex w-full items-center justify-center gap-2 sm:w-auto`}
              >
                <Filter size={16} />
                Filters

                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF3B3A] px-1 text-xs font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-12 z-40 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Filters
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setIsFilterOpen(false)
                      }
                      className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {/* Role Filter */}
                  <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isRoleFilterEnabled}
                        onChange={(event) => {
                          setIsRoleFilterEnabled(
                            event.target.checked
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 accent-[#EF3B3A]"
                      />

                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Filter by Position
                      </span>
                    </label>

                    {isRoleFilterEnabled && (
                      <div className="mt-3 max-h-36 space-y-2 overflow-y-auto pl-6">
                        {jobs.length === 0 ? (
                          <p className="text-xs text-gray-400">
                            No positions available.
                          </p>
                        ) : (
                          jobs.map((job) => (
                            <label
                              key={job}
                              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(
                                  job
                                )}
                                onChange={() =>
                                  toggleRole(job)
                                }
                                className="h-4 w-4 rounded border-gray-300 accent-[#EF3B3A]"
                              />

                              <span>{job}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date Filter */}
                  <div className="pt-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDateFilterEnabled}
                        onChange={(event) => {
                          setIsDateFilterEnabled(
                            event.target.checked
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 accent-[#EF3B3A]"
                      />

                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Filter by Applied Date
                      </span>
                    </label>

                    {isDateFilterEnabled && (
                      <div className="mt-3 space-y-3 pl-6">
                        <select
                          value={selectedDateFilter}
                          onChange={(event) =>
                            setSelectedDateFilter(
                              event.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">
                            Select date range
                          </option>

                          {dateFilterOptions.map(
                            ([value, label]) => (
                              <option
                                key={value}
                                value={value}
                              >
                                {label}
                              </option>
                            )
                          )}
                        </select>

                        {selectedDateFilter ===
                          "custom" && (
                          <div className="space-y-2">
                            <div>
                              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                From Date
                              </label>

                              <input
                                type="date"
                                value={customFromDate}
                                onChange={(event) =>
                                  setCustomFromDate(
                                    event.target.value
                                  )
                                }
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                                To Date
                              </label>

                              <input
                                type="date"
                                value={customToDate}
                                min={customFromDate || undefined}
                                onChange={(event) =>
                                  setCustomToDate(
                                    event.target.value
                                  )
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-semibold text-gray-500 transition-colors hover:text-red-600 dark:text-gray-400"
                    >
                      Clear All
                    </button>

                    <button
                      type="button"
                      onClick={applyFilters}
                      className="rounded-lg bg-[#EF3B3A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(appliedRoles.length > 0 ||
          appliedDateFilter) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Active filters:
            </span>

            {appliedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {role}

                <button
                  type="button"
                  onClick={() => {
                    setAppliedRoles((previous) =>
                      previous.filter(
                        (item) => item !== role
                      )
                    );

                    setSelectedRoles((previous) =>
                      previous.filter(
                        (item) => item !== role
                      )
                    );
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {appliedDateFilter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {dateFilterOptions.find(
                  ([value]) =>
                    value === appliedDateFilter
                )?.[1] || "Date Filter"}

                <button
                  type="button"
                  onClick={() => {
                    setAppliedDateFilter("");
                    setSelectedDateFilter("");
                    setAppliedCustomFromDate("");
                    setAppliedCustomToDate("");
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Candidate List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              All Candidates
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              View and manage candidate applications.
            </p>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {filteredCandidates.length}
            </span>{" "}
            {filteredCandidates.length === 1
              ? "candidate"
              : "candidates"}{" "}
            found
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <DataTable
            columns={columns}
            data={filteredCandidates}
            loading={isLoading}
            emptyMessage="No candidates found."
          />
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 p-4 md:hidden">
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              Loading candidates...
            </div>
          ) : filteredCandidates.length ===
            0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              No candidates found.
            </div>
          ) : (
            filteredCandidates.map(
              (candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {candidate.name}
                      </h3>

                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {candidate.email}
                      </p>
                    </div>

                    {renderActions(candidate)}
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-400">
                      Applied Position
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {candidate.job}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Location
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-700 dark:text-gray-300">
                          {candidate.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          Experience
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {candidate.experience}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        candidate.status
                      )}`}
                    >
                      {candidate.status}
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Applied: {formatDate(candidate.appliedDate)}
                    </span>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {viewCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setViewCandidate(null)
          }
        >
          <div
            className={`${modalCardClass} max-h-[90vh] max-w-2xl overflow-y-auto`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Candidate Details
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Complete candidate application information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewCandidate(null)
                }
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-[#EF3B3A] dark:bg-red-950">
                  {viewCandidate.name
                    ?.charAt(0)
                    ?.toUpperCase() || "C"}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {viewCandidate.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {viewCandidate.job}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                    viewCandidate.status
                  )}`}
                >
                  {viewCandidate.status}
                </span>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Mail
                      size={18}
                      className="mt-0.5 text-gray-400"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Email Address
                      </p>

                      <p className="mt-1 break-all text-sm text-gray-700 dark:text-gray-300">
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
                      <p className="text-xs text-gray-400">
                        Phone Number
                      </p>

                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
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
                      <p className="text-xs text-gray-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {viewCandidate.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    [
                      "Applied Position",
                      viewCandidate.job,
                    ],
                    [
                      "Experience",
                      viewCandidate.experience,
                    ],
                    [
                      "Highest Qualification",
                      viewCandidate.highestQualification,
                    ],
                    [
                      "Current Company",
                      viewCandidate.currentCompany,
                    ],
                    [
                      "Notice Period",
                      viewCandidate.noticePeriod,
                    ],
                    [
                      "Area of Interest",
                      viewCandidate.areaOfInterest,
                    ],
                    [
                      "Applied Date",
                      formatDate(viewCandidate.appliedDate),
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">
                        {label}
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {viewCandidate.coverMessage && (
                <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Cover Message
                  </h3>

                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {viewCandidate.coverMessage}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Application ID: {viewCandidate.id}
                </span>

                {viewCandidate.resumeUrl &&
                  viewCandidate.resumeUrl !== "#" && (
                    <a
                      href={viewCandidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                    >
                      <FileText size={16} />
                      View Resume
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isSubmitting) {
              setEditingCandidate(null);
              setActionError("");
            }
          }}
        >
          <div
            className={`${modalCardClass} max-w-md`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Candidate Status
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Update the application status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCandidate(null);
                  setActionError("");
                }}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {editingCandidate.name}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {editingCandidate.job}
                </p>
              </div>

              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {actionError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Status
                </label>

                <select
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(event.target.value)
                  }
                  className={inputClass}
                >
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
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCandidate(null);
                    setActionError("");
                  }}
                  disabled={isSubmitting}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={
                    isSubmitting ||
                    !editStatus
                  }
                  className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Candidate Modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isSubmitting) {
              setDeleteCandidate(null);
              setActionError("");
            }
          }}
        >
          <div
            className={`${modalCardClass} max-w-md`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete Candidate
              </h2>

              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setActionError("");
                }}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <Trash2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Are you sure you want to delete this candidate?
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You are about to delete{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {deleteCandidate.name}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
              </div>

              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteCandidate(null)
                  }
                  disabled={isSubmitting}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Deleting..."
                    : "Delete Candidate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Candidates;


//   Filter,
// } from "lucide-react";

// import DataTable from "../../components/DataTable";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// const candidateStatuses = [
//   "New",
//   "Shortlisted",
//   "Interview",
//   "Selected",
//   "Rejected",
//   "On hold",
// ];

// const dateFilterOptions = [
//   ["today", "Today"],
//   ["yesterday", "Yesterday"],
//   ["twoDaysAgo", "2 Days Ago"],
//   ["last7", "Last 7 Days"],
//   ["last30", "Last 30 Days"],
//   ["custom", "Custom Date Range"],
// ];

// const normalizeCandidate = (candidate) => {
//   let experience = "N/A";

//   if (candidate.isFresher) {
//     experience = "Fresher";
//   } else if (
//     candidate.yearsOfExperience !== undefined &&
//     candidate.yearsOfExperience !== null &&
//     candidate.yearsOfExperience !== ""
//   ) {
//     experience = `${candidate.yearsOfExperience} ${
//       Number(candidate.yearsOfExperience) === 1
//         ? "Year"
//         : "Years"
//     }`;
//   } else if (candidate.experience) {
//     experience = candidate.experience;
//   }

//   return {
//     ...candidate,
//     id: candidate._id || candidate.id,
//     job: candidate.position || candidate.job || "N/A",
//     experience,
//     appliedDate: candidate.createdAt || candidate.appliedDate,
//     resumeUrl:
//       candidate.resume || candidate.resumeUrl || "#",
//     currentCompany: candidate.currentCompany || "N/A",
//     location: candidate.location || "N/A",
//     noticePeriod: candidate.noticePeriod || "N/A",
//     areaOfInterest:
//       candidate.areaOfInterest || "N/A",
//     highestQualification:
//       candidate.highestQualification || "N/A",
//     coverMessage: candidate.coverMessage || "",
//   };
// };

// const statusClasses = {
//   New: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",

//   Shortlisted:
//     "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300",

//   Interview:
//     "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",

//   Selected:
//     "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300",

//   Rejected:
//     "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",

//   "On hold":
//     "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300",
// };

// const statusClass = (status) =>
//   statusClasses[status] ||
//   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

// const inputClass =
//   "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-red-950";

// const secondaryButtonClass =
//   "rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800";

// const modalCardClass =
//   "w-full rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900";

// function Candidates() {
//   const [candidates, setCandidates] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pageError, setPageError] = useState("");
//   const [actionError, setActionError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] =
//     useState("All");

//   const [isFilterOpen, setIsFilterOpen] =
//     useState(false);

//   const filterRef = useRef(null);

//   const [isRoleFilterEnabled, setIsRoleFilterEnabled] =
//     useState(false);

//   const [isDateFilterEnabled, setIsDateFilterEnabled] =
//     useState(false);

//   const [selectedRoles, setSelectedRoles] = useState(
//     []
//   );

//   const [selectedDateFilter, setSelectedDateFilter] =
//     useState("");

//   const [customFromDate, setCustomFromDate] =
//     useState("");

//   const [customToDate, setCustomToDate] =
//     useState("");

//   const [appliedRoles, setAppliedRoles] = useState(
//     []
//   );

//   const [appliedDateFilter, setAppliedDateFilter] =
//     useState("");

//   const [
//     appliedCustomFromDate,
//     setAppliedCustomFromDate,
//   ] = useState("");

//   const [
//     appliedCustomToDate,
//     setAppliedCustomToDate,
//   ] = useState("");

//   const [openMenuId, setOpenMenuId] = useState(null);

//   const [viewCandidate, setViewCandidate] =
//     useState(null);

//   const [editingCandidate, setEditingCandidate] =
//     useState(null);

//   const [deleteCandidate, setDeleteCandidate] =
//     useState(null);

//   const [editStatus, setEditStatus] = useState("");

//   const getAuthHeaders = () => ({
//     Authorization: `Bearer ${localStorage.getItem(
//       "adminToken"
//     )}`,
//     "Content-Type": "application/json",
//   });

//   const handleUnauthorized = () => {
//     localStorage.removeItem("adminToken");
//     localStorage.removeItem("adminUser");
//     window.location.href = "/login";
//   };

//   const fetchCandidates = async () => {
//     try {
//       setIsLoading(true);
//       setPageError("");

//       const response = await fetch(
//         `${API_BASE_URL}/candidates`,
//         {
//           headers: getAuthHeaders(),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(
//           `Candidates API failed with status ${response.status}`
//         );
//       }

//       const result = await response.json();

//       if (
//         result?.success !== true ||
//         !Array.isArray(result?.candidates)
//       ) {
//         throw new Error(
//           "Invalid candidates response from backend"
//         );
//       }

//       const normalized = result.candidates
//         .map(normalizeCandidate)
//         .sort(
//           (a, b) =>
//             new Date(b.appliedDate || 0) -
//             new Date(a.appliedDate || 0)
//         );

//       setCandidates(normalized);
//     } catch (error) {
//       console.error(
//         "Failed to load candidates:",
//         error
//       );

//       setPageError(
//         "Unable to load candidate applications."
//       );

//       setCandidates([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCandidates();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         filterRef.current &&
//         !filterRef.current.contains(event.target)
//       ) {
//         setIsFilterOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//   }, []);

//   const jobs = useMemo(
//     () =>
//       [
//         ...new Set(
//           candidates
//             .map((candidate) => candidate.job)
//             .filter(
//               (job) => job && job !== "N/A"
//             )
//         ),
//       ].sort((a, b) =>
//         a.localeCompare(b)
//       ),
//     [candidates]
//   );

//   const toggleRole = (role) => {
//     setSelectedRoles((previous) =>
//       previous.includes(role)
//         ? previous.filter(
//             (item) => item !== role
//           )
//         : [...previous, role]
//     );
//   };

//   const getStartOfDay = (date) => {
//     const result = new Date(date);

//     result.setHours(0, 0, 0, 0);

//     return result;
//   };

//   const getCandidateDate = (value) => {
//     if (!value) return null;

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     return getStartOfDay(date);
//   };

//   const parseInputDate = (value) => {
//     if (!value) return null;

//     const [year, month, day] =
//       value.split("-").map(Number);

//     if (!year || !month || !day) {
//       return null;
//     }

//     const date = new Date(
//       year,
//       month - 1,
//       day
//     );

//     date.setHours(0, 0, 0, 0);

//     return date;
//   };

//   const isCandidateWithinDateFilter = (
//     value,
//     filter,
//     fromValue,
//     toValue
//   ) => {
//     const candidateDate =
//       getCandidateDate(value);

//     if (!candidateDate || !filter) {
//       return true;
//     }

//     const today = getStartOfDay(
//       new Date()
//     );

//     if (filter === "today") {
//       return (
//         candidateDate.getTime() ===
//         today.getTime()
//       );
//     }

//     if (filter === "yesterday") {
//       const yesterday = new Date(today);

//       yesterday.setDate(
//         yesterday.getDate() - 1
//       );

//       return (
//         candidateDate.getTime() ===
//         yesterday.getTime()
//       );
//     }

//     if (filter === "twoDaysAgo") {
//       const date = new Date(today);

//       date.setDate(
//         date.getDate() - 2
//       );

//       return (
//         candidateDate.getTime() ===
//         date.getTime()
//       );
//     }

//     if (
//       filter === "last7" ||
//       filter === "last30"
//     ) {
//       const startDate = new Date(today);

//       startDate.setDate(
//         startDate.getDate() -
//           (filter === "last7" ? 6 : 29)
//       );

//       return (
//         candidateDate >= startDate &&
//         candidateDate <= today
//       );
//     }

//     if (filter === "custom") {
//       const fromDate =
//         parseInputDate(fromValue);

//       const toDate =
//         parseInputDate(toValue);

//       if (!fromDate && !toDate) {
//         return true;
//       }

//       if (fromDate && !toDate) {
//         return candidateDate >= fromDate;
//       }

//       if (!fromDate && toDate) {
//         return candidateDate <= toDate;
//       }

//       return (
//         candidateDate >= fromDate &&
//         candidateDate <= toDate
//       );
//     }

//     return true;
//   };

//   const clearFilters = () => {
//     setIsRoleFilterEnabled(false);
//     setIsDateFilterEnabled(false);

//     setSelectedRoles([]);
//     setSelectedDateFilter("");
//     setCustomFromDate("");
//     setCustomToDate("");

//     setAppliedRoles([]);
//     setAppliedDateFilter("");
//     setAppliedCustomFromDate("");
//     setAppliedCustomToDate("");
//   };

//   const applyFilters = () => {
//     setAppliedRoles(
//       isRoleFilterEnabled
//         ? selectedRoles.filter((role) =>
//             jobs.includes(role)
//           )
//         : []
//     );

//     setAppliedDateFilter(
//       isDateFilterEnabled
//         ? selectedDateFilter
//         : ""
//     );

//     setAppliedCustomFromDate(
//       isDateFilterEnabled &&
//         selectedDateFilter === "custom"
//         ? customFromDate
//         : ""
//     );

//     setAppliedCustomToDate(
//       isDateFilterEnabled &&
//         selectedDateFilter === "custom"
//         ? customToDate
//         : ""
//     );

//     setIsFilterOpen(false);
//   };

//   const filteredCandidates = useMemo(() => {
//     const searchValue =
//       search.toLowerCase().trim();

//     return candidates.filter((candidate) => {
//       const searchableValues = [
//         candidate.name,
//         candidate.email,
//         candidate.phone,
//         candidate.job,
//         candidate.location,
//         candidate.highestQualification,
//         candidate.currentCompany,
//         candidate.noticePeriod,
//         candidate.areaOfInterest,
//       ];

//       const matchesSearch =
//         searchableValues.some((value) =>
//           String(value || "")
//             .toLowerCase()
//             .includes(searchValue)
//         );

//       const matchesStatus =
//         statusFilter === "All" ||
//         candidate.status ===
//           statusFilter;

//       const matchesRole =
//         appliedRoles.length === 0 ||
//         appliedRoles.includes(
//           candidate.job
//         );

//       const matchesDate =
//         !appliedDateFilter ||
//         isCandidateWithinDateFilter(
//           candidate.appliedDate,
//           appliedDateFilter,
//           appliedCustomFromDate,
//           appliedCustomToDate
//         );

//       return (
//         matchesSearch &&
//         matchesStatus &&
//         matchesRole &&
//         matchesDate
//       );
//     });
//   }, [
//     candidates,
//     search,
//     statusFilter,
//     appliedRoles,
//     appliedDateFilter,
//     appliedCustomFromDate,
//     appliedCustomToDate,
//   ]);

//   const formatDate = (value) => {
//     if (!value) return "N/A";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return "N/A";
//     }

//     return date.toLocaleDateString(
//       "en-IN",
//       {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }
//     );
//   };

//   const handleStatusUpdate = async () => {
//     if (!editingCandidate) return;

//     try {
//       setIsSubmitting(true);
//       setActionError("");

//       const response = await fetch(
//         `${API_BASE_URL}/candidates/${editingCandidate.id}`,
//         {
//           method: "PUT",
//           headers: getAuthHeaders(),

//           body: JSON.stringify({
//             position:
//               editingCandidate.position ||
//               editingCandidate.job,

//             areaOfInterest:
//               editingCandidate.areaOfInterest ||
//               "",

//             name: editingCandidate.name,
//             email: editingCandidate.email,
//             phone: editingCandidate.phone,

//             isFresher:
//               editingCandidate.isFresher ||
//               false,

//             location:
//               editingCandidate.location ||
//               "",

//             yearsOfExperience:
//               editingCandidate.yearsOfExperience,

//             highestQualification:
//               editingCandidate.highestQualification,

//             currentCompany:
//               editingCandidate.currentCompany ||
//               "",

//             noticePeriod:
//               editingCandidate.noticePeriod,

//             coverMessage:
//               editingCandidate.coverMessage ||
//               "",

//             resume:
//               editingCandidate.resume ||
//               editingCandidate.resumeUrl ||
//               "",

//             status: editStatus,
//           }),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(
//           `Candidate update failed with status ${response.status}`
//         );
//       }

//       const result =
//         await response.json();

//       if (result?.success !== true) {
//         throw new Error(
//           result?.message ||
//             "Failed to update candidate status"
//         );
//       }

//       const updatedCandidate =
//         result.candidate
//           ? normalizeCandidate(
//               result.candidate
//             )
//           : null;

//       setCandidates((previous) =>
//         previous.map((candidate) =>
//           candidate.id ===
//           editingCandidate.id
//             ? updatedCandidate || {
//                 ...candidate,
//                 status: editStatus,
//               }
//             : candidate
//         )
//       );

//       setEditingCandidate(null);
//       setEditStatus("");
//     } catch (error) {
//       console.error(
//         "Failed to update candidate status:",
//         error
//       );

//       setActionError(
//         error.message ||
//           "Unable to update candidate status."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteCandidate) return;

//     try {
//       setIsSubmitting(true);
//       setActionError("");

//       const response = await fetch(
//         `${API_BASE_URL}/candidates/${deleteCandidate.id}`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       if (response.status === 401) {
//         handleUnauthorized();
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(
//           `Candidate delete failed with status ${response.status}`
//         );
//       }

//       const result =
//         await response.json();

//       if (result?.success !== true) {
//         throw new Error(
//           result?.message ||
//             "Failed to delete candidate"
//         );
//       }

//       setCandidates((previous) =>
//         previous.filter(
//           (candidate) =>
//             candidate.id !==
//             deleteCandidate.id
//         )
//       );

//       setDeleteCandidate(null);
//     } catch (error) {
//       console.error(
//         "Failed to delete candidate:",
//         error
//       );

//       setActionError(
//         error.message ||
//           "Unable to delete candidate."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDownloadExcel = () => {
//     const headers = [
//       "Candidate Name",
//       "Email Address",
//       "Phone Number",
//       "Applied Position",
//       "Experience",
//       "Location",
//       "Application Status",
//       "Applied On",
//       "Resume",
//     ];

//     const rows =
//       filteredCandidates.map(
//         (candidate) => [
//           candidate.name,
//           candidate.email,
//           candidate.phone,
//           candidate.job,
//           candidate.experience,
//           candidate.location,
//           candidate.status,
//           formatDate(
//             candidate.appliedDate
//           ),
//           candidate.resumeUrl === "#"
//             ? ""
//             : candidate.resumeUrl,
//         ]
//       );

//     const csvContent = [
//       headers,
//       ...rows,
//     ]
//       .map((row) =>
//         row
//           .map(
//             (value) =>
//               `"${String(
//                 value ?? ""
//               ).replace(
//                 /"/g,
//                 '""'
//               )}"`
//           )
//           .join(",")
//       )
//       .join("\n");

//     const blob = new Blob(
//       [csvContent],
//       {
//         type: "text/csv;charset=utf-8;",
//       }
//     );

//     const url =
//       URL.createObjectURL(blob);

//     const link =
//       document.createElement("a");

//     link.href = url;
//     link.download =
//       "proliant-candidates.csv";

//     document.body.appendChild(link);

//     link.click();

//     document.body.removeChild(link);

//     URL.revokeObjectURL(url);
//   };

//   const openViewCandidate = (
//     candidate
//   ) => {
//     setViewCandidate(candidate);
//     setOpenMenuId(null);
//   };

//   const openEditCandidate = (
//     candidate
//   ) => {
//     setEditingCandidate(candidate);
//     setEditStatus(
//       candidate.status || "New"
//     );
//     setActionError("");
//     setOpenMenuId(null);
//   };

//   const openDeleteCandidate = (
//     candidate
//   ) => {
//     setDeleteCandidate(candidate);
//     setActionError("");
//     setOpenMenuId(null);
//   };

//   const renderActions = (
//     candidate
//   ) => (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={(event) => {
//           event.stopPropagation();

//           setOpenMenuId((previous) =>
//             previous === candidate.id
//               ? null
//               : candidate.id
//           );
//         }}
//         className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
//         aria-label="Candidate actions"
//       >
//         <MoreVertical size={18} />
//       </button>

//       {openMenuId === candidate.id && (
//         <div className="absolute right-0 top-10 z-30 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
//           <button
//             type="button"
//             onClick={() =>
//               openViewCandidate(candidate)
//             }
//             className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
//           >
//             <Eye size={15} />
//             View
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               openEditCandidate(candidate)
//             }
//             className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
//           >
//             <Pencil size={15} />
//             Edit Status
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               openDeleteCandidate(candidate)
//             }
//             className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
//           >
//             <Trash2 size={15} />
//             Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   const columns = [
//     {
//       key: "name",
//       label: "Candidate Name",

//       render: (candidate) => (
//         <div className="min-w-0">
//           <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
//             {candidate.name}
//           </p>

//           <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
//             {candidate.email}
//           </p>
//         </div>
//       ),
//     },

//     {
//       key: "phone",
//       label: "Phone Number",

//       render: (candidate) => (
//         <span className="text-sm text-gray-600 dark:text-gray-300">
//           {candidate.phone || "N/A"}
//         </span>
//       ),
//     },

//     {
//       key: "job",
//       label: "Applied Position",

//       render: (candidate) => (
//         <span className="text-sm text-gray-700 dark:text-gray-300">
//           {candidate.job}
//         </span>
//       ),
//     },

//     {
//       key: "experience",
//       label: "Experience",

//       render: (candidate) => (
//         <span className="text-sm text-gray-600 dark:text-gray-300">
//           {candidate.experience}
//         </span>
//       ),
//     },

//     {
//       key: "location",
//       label: "Location",

//       render: (candidate) => (
//         <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
//           <MapPin
//             size={14}
//             className="shrink-0 text-gray-400"
//           />

//           <span>
//             {candidate.location}
//           </span>
//         </div>
//       ),
//     },

//     {
//       key: "status",
//       label: "Application Status",

//       render: (candidate) => (
//         <span
//           className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
//             candidate.status
//           )}`}
//         >
//           {candidate.status ||
//             "New"}
//         </span>
//       ),
//     },

//     {
//       key: "appliedDate",
//       label: "Applied On",

//       render: (candidate) => (
//         <span className="text-sm text-gray-600 dark:text-gray-300">
//           {formatDate(
//             candidate.appliedDate
//           )}
//         </span>
//       ),
//     },

//     {
//       key: "actions",
//       label: "",

//       render: (candidate) =>
//         renderActions(candidate),
//     },
//   ];

//   return (
//     <div className="relative min-h-screen bg-gray-100 p-5 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100 sm:p-6">
//       {/* Page Header */}
//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//             Candidates
//           </h1>

//           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//             Manage candidate applications and statuses.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={
//             handleDownloadExcel
//           }
//           className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
//         >
//           <Download size={17} />
//           Export
//         </button>
//       </div>

//       {/* Search + Status + Filters */}
//       <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
//         <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
//           <div className="relative flex-1">
//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(event) =>
//                 setSearch(
//                   event.target.value
//                 )
//               }
//               placeholder="Search candidates..."
//               className={`${inputClass} pl-10`}
//             />
//           </div>

//           <select
//             value={statusFilter}
//             onChange={(event) =>
//               setStatusFilter(
//                 event.target.value
//               )
//             }
//             className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#EF3B3A] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
//           >
//             <option value="All">
//               All Status
//             </option>

//             {candidateStatuses.map(
//               (status) => (
//                 <option
//                   key={status}
//                   value={status}
//                 >
//                   {status}
//                 </option>
//               )
//             )}
//           </select>

//           <div
//             className="relative"
//             ref={filterRef}
//           >
//             <button
//               type="button"
//               onClick={() =>
//                 setIsFilterOpen(
//                   (previous) =>
//                     !previous
//                 )
//               }
//               className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 lg:w-auto"
//             >
//               <Filter size={17} />
//               Filters
//             </button>

//             {isFilterOpen && (
//               <div className="absolute right-0 top-12 z-40 w-[320px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//                     Filters
//                   </h3>

//                   <button
//                     type="button"
//                     onClick={
//                       clearFilters
//                     }
//                     className="text-xs font-medium text-[#EF3B3A] hover:underline"
//                   >
//                     Clear
//                   </button>
//                 </div>

//                 <div className="mt-4 space-y-4">
//                   {/* Role Filter */}
//                   <label className="flex items-center justify-between gap-3">
//                     <span className="text-sm text-gray-700 dark:text-gray-300">
//                       Filter by role
//                     </span>

//                     <input
//                       type="checkbox"
//                       checked={
//                         isRoleFilterEnabled
//                       }
//                       onChange={(
//                         event
//                       ) =>
//                         setIsRoleFilterEnabled(
//                           event.target
//                             .checked
//                         )
//                       }
//                       className="h-4 w-4 accent-[#EF3B3A]"
//                     />
//                   </label>

//                   {isRoleFilterEnabled && (
//                     <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
//                       {jobs.length ===
//                       0 ? (
//                         <p className="text-xs text-gray-500">
//                           No roles available.
//                         </p>
//                       ) : (
//                         jobs.map(
//                           (role) => (
//                             <label
//                               key={role}
//                               className="flex items-center gap-2"
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={selectedRoles.includes(
//                                   role
//                                 )}
//                                 onChange={() =>
//                                   toggleRole(
//                                     role
//                                   )
//                                 }
//                                 className="h-4 w-4 accent-[#EF3B3A]"
//                               />

//                               <span className="text-sm text-gray-700 dark:text-gray-300">
//                                 {role}
//                               </span>
//                             </label>
//                           )
//                         )
//                       )}
//                     </div>
//                   )}

//                   {/* Date Filter */}
//                   <label className="flex items-center justify-between gap-3">
//                     <span className="text-sm text-gray-700 dark:text-gray-300">
//                       Filter by date
//                     </span>

//                     <input
//                       type="checkbox"
//                       checked={
//                         isDateFilterEnabled
//                       }
//                       onChange={(
//                         event
//                       ) =>
//                         setIsDateFilterEnabled(
//                           event.target
//                             .checked
//                         )
//                       }
//                       className="h-4 w-4 accent-[#EF3B3A]"
//                     />
//                   </label>

//                   {isDateFilterEnabled && (
//                     <div className="space-y-3">
//                       <select
//                         value={
//                           selectedDateFilter
//                         }
//                         onChange={(event) =>
//                           setSelectedDateFilter(
//                             event.target
//                               .value
//                           )
//                         }
//                         className={
//                           inputClass
//                         }
//                       >
//                         <option value="">
//                           Select date range
//                         </option>

//                         {dateFilterOptions.map(
//                           ([
//                             value,
//                             label,
//                           ]) => (
//                             <option
//                               key={
//                                 value
//                               }
//                               value={
//                                 value
//                               }
//                             >
//                               {label}
//                             </option>
//                           )
//                         )}
//                       </select>

//                       {selectedDateFilter ===
//                         "custom" && (
//                         <div className="grid grid-cols-2 gap-2">
//                           <input
//                             type="date"
//                             value={
//                               customFromDate
//                             }
//                             onChange={(
//                               event
//                             ) =>
//                               setCustomFromDate(
//                                 event
//                                   .target
//                                   .value
//                               )
//                             }
//                             className={
//                               inputClass
//                             }
//                           />

//                           <input
//                             type="date"
//                             value={
//                               customToDate
//                             }
//                             onChange={(
//                               event
//                             ) =>
//                               setCustomToDate(
//                                 event
//                                   .target
//                                   .value
//                               )
//                             }
//                             className={
//                               inputClass
//                             }
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-5 flex justify-end">
//                   <button
//                     type="button"
//                     onClick={
//                       applyFilters
//                     }
//                     className="rounded-lg bg-[#EF3B3A] px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
//                   >
//                     Apply Filters
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Page Error */}
//       {pageError && (
//         <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
//           {pageError}
//         </div>
//       )}

//       {/* Candidate Applications */}
//       <section className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
//         <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
//           <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h2 className="text-base font-semibold text-gray-900 dark:text-white">
//                 Candidate Applications
//               </h2>

//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Manage and review candidate applications.
//               </p>
//             </div>

//             <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
//               {
//                 filteredCandidates.length
//               }{" "}
//               {
//                 filteredCandidates.length ===
//                 1
//                   ? "candidate"
//                   : "candidates"
//               }{" "}
//               found
//             </p>
//           </div>
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden md:block">
//           <DataTable
//             columns={columns}
//             data={filteredCandidates}
//             loading={isLoading}
//             emptyMessage="No candidates found."
//           />
//         </div>

//         {/* Mobile Cards */}
//         <div className="space-y-3 p-4 md:hidden">
//           {isLoading ? (
//             <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
//               Loading candidates...
//             </div>
//           ) : filteredCandidates.length ===
//             0 ? (
//             <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
//               No candidates found.
//             </div>
//           ) : (
//             filteredCandidates.map(
//               (candidate) => (
//                 <div
//                   key={candidate.id}
//                   className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
//                         {candidate.name}
//                       </h3>

//                       <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
//                         {
//                           candidate.email
//                         }
//                       </p>
//                     </div>

//                     {renderActions(
//                       candidate
//                     )}
//                   </div>

//                   <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//                     <p className="text-xs font-medium text-gray-400">
//                       Applied Position
//                     </p>

//                     <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                       {
//                         candidate.job
//                       }
//                     </p>
//                   </div>

//                   <div className="mt-4 grid grid-cols-2 gap-4">
//                     <div className="flex items-start gap-3">
//                       <MapPin
//                         size={18}
//                         className="mt-0.5 shrink-0 text-gray-400"
//                       />

//                       <div className="min-w-0">
//                         <p className="text-xs font-medium text-gray-400">
//                           Location
//                         </p>

//                         <p className="mt-1 wrap-break-word text-sm text-gray-700 dark:text-gray-300">
//                           {
//                             candidate.location ||
//                             "N/A"
//                           }
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Phone
//                         size={18}
//                         className="mt-0.5 shrink-0 text-gray-400"
//                       />

//                       <div className="min-w-0">
//                         <p className="text-xs font-medium text-gray-400">
//                           Phone Number
//                         </p>

//                         <p className="mt-1 wrap-break-word text-sm text-gray-700 dark:text-gray-300">
//                           {
//                             candidate.phone ||
//                             "N/A"
//                           }
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-400" />

//                       <div className="min-w-0">
//                         <p className="text-xs font-medium text-gray-400">
//                           Application Status
//                         </p>

//                         <span
//                           className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
//                             candidate.status
//                           )}`}
//                         >
//                           {
//                             candidate.status ||
//                             "New"
//                           }
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-400" />

//                       <div className="min-w-0">
//                         <p className="text-xs font-medium text-gray-400">
//                           Applied On
//                         </p>

//                         <p className="mt-1 wrap-break-word text-sm text-gray-700 dark:text-gray-300">
//                           {formatDate(
//                             candidate.appliedDate
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )
//             )
//           )}
//         </div>
//       </section>

//       {/* View Candidate Modal */}
//       {viewCandidate && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
//           onClick={() =>
//             setViewCandidate(null)
//           }
//         >
//           <div
//             className={`${modalCardClass} max-h-[90vh] max-w-2xl overflow-y-auto`}
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   Candidate Details
//                 </h2>

//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   View candidate application details.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setViewCandidate(null)
//                 }
//                 className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
//                 aria-label="Close modal"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="space-y-5 px-6 py-6">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
//                   {
//                     viewCandidate.name
//                   }
//                 </h3>

//                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                   {
//                     viewCandidate.email
//                   }
//                 </p>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 {[
//                   [
//                     "Email Address",
//                     viewCandidate.email,
//                     Mail,
//                   ],

//                   [
//                     "Phone Number",
//                     viewCandidate.phone,
//                     Phone,
//                   ],

//                   [
//                     "Location",
//                     viewCandidate.location,
//                     MapPin,
//                   ],

//                   [
//                     "Experience",
//                     viewCandidate.experience,
//                     FileText,
//                   ],

//                   [
//                     "Highest Qualification",
//                     viewCandidate.highestQualification,
//                     FileText,
//                   ],

//                   [
//                     "Current Company",
//                     viewCandidate.currentCompany,
//                     FileText,
//                   ],

//                   [
//                     "Notice Period",
//                     viewCandidate.noticePeriod,
//                     FileText,
//                   ],

//                   [
//                     "Area of Interest",
//                     viewCandidate.areaOfInterest,
//                     FileText,
//                   ],
//                 ].map(
//                   ([
//                     label,
//                     value,
//                     Icon,
//                   ]) => (
//                     <div
//                       key={label}
//                       className="flex items-start gap-3"
//                     >
//                       <Icon
//                         size={18}
//                         className="mt-0.5 shrink-0 text-gray-400"
//                       />

//                       <div className="min-w-0">
//                         <p className="text-xs font-medium text-gray-400">
//                           {label}
//                         </p>

//                         <p className="mt-1 wrap-break-word text-sm text-gray-700 dark:text-gray-300">
//                           {value ||
//                             "N/A"}
//                         </p>
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>

//               <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//                 <p className="text-xs font-medium text-gray-400">
//                   Applied Position
//                 </p>

//                 <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                   {
//                     viewCandidate.job
//                   }
//                 </p>

//                 <p className="mt-3 text-xs font-medium text-gray-400">
//                   Applied On
//                 </p>

//                 <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
//                   {formatDate(
//                     viewCandidate.appliedDate
//                   )}
//                 </p>
//               </div>

//               <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//                 <p className="text-xs font-medium text-gray-400">
//                   Application Status
//                 </p>

//                 <span
//                   className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
//                     viewCandidate.status
//                   )}`}
//                 >
//                   {
//                     viewCandidate.status ||
//                     "New"
//                   }
//                 </span>
//               </div>

//               {viewCandidate.coverMessage && (
//                 <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
//                   <p className="text-xs font-medium text-gray-400">
//                     Cover Message
//                   </p>

//                   <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
//                     {
//                       viewCandidate.coverMessage
//                     }
//                   </p>
//                 </div>
//               )}

//               <a
//                 href={
//                   viewCandidate.resumeUrl
//                 }
//                 onClick={(event) => {
//                   if (
//                     viewCandidate.resumeUrl ===
//                     "#"
//                   ) {
//                     event.preventDefault();
//                   }
//                 }}
//                 target="_blank"
//                 rel="noreferrer"
//                 className={
//                   secondaryButtonClass +
//                   " inline-flex w-full items-center justify-center gap-2"
//                 }
//               >
//                 <FileText size={17} />
//                 View Resume
//               </a>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Status Modal */}
//       {editingCandidate && (
//         <div
//           className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
//           onClick={() =>
//             !isSubmitting &&
//             setEditingCandidate(null)
//           }
//         >
//           <div
//             className={`${modalCardClass} max-w-md`}
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                   Update Candidate Status
//                 </h2>

//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Update the application status.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setEditingCandidate(
//                     null
//                   )
//                 }
//                 disabled={isSubmitting}
//                 className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
//                 aria-label="Close modal"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="px-6 py-6">
//               <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
//                 {
//                   editingCandidate.name
//                 }
//               </p>

//               <select
//                 value={editStatus}
//                 onChange={(event) =>
//                   setEditStatus(
//                     event.target.value
//                   )
//                 }
//                 disabled={isSubmitting}
//                 className={inputClass}
//               >
//                 {candidateStatuses.map(
//                   (status) => (
//                     <option
//                       key={status}
//                       value={status}
//                     >
//                       {status}
//                     </option>
//                   )
//                 )}
//               </select>

//               {actionError && (
//                 <p className="mt-3 text-sm text-red-600 dark:text-red-400">
//                   {actionError}
//                 </p>
//               )}
//             </div>

//             <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end dark:border-gray-800">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setEditingCandidate(
//                     null
//                   )
//                 }
//                 disabled={isSubmitting}
//                 className={
//                   secondaryButtonClass
//                 }
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   handleStatusUpdate
//                 }
//                 disabled={isSubmitting}
//                 className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {isSubmitting
//                   ? "Saving..."
//                   : "Save Status"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Candidate Modal */}
//       {deleteCandidate && (
//         <div
//           className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
//           onClick={() =>
//             !isSubmitting &&
//             setDeleteCandidate(null)
//           }
//         >
//           <div
//             className={`${modalCardClass} max-w-md p-6`}
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/50">
//               <Trash2 size={20} />
//             </div>

//             <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
//               Delete Candidate?
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
//               Are you sure you want to
//               delete{" "}
//               <span className="font-semibold text-gray-700 dark:text-gray-200">
//                 {
//                   deleteCandidate.name
//                 }
//               </span>
//               ? This action cannot be
//               undone.
//             </p>

//             {actionError && (
//               <p className="mt-3 text-sm text-red-600 dark:text-red-400">
//                 {actionError}
//               </p>
//             )}

//             <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setDeleteCandidate(null)
//                 }
//                 disabled={isSubmitting}
//                 className={
//                   secondaryButtonClass
//                 }
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleDelete}
//                 disabled={isSubmitting}
//                 className="rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {isSubmitting
//                   ? "Deleting..."
//                   : "Delete Candidate"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Candidates;