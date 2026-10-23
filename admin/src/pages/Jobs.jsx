import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

import DataTable from "../components/DataTable";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// =====================================================
// API HELPER
// =====================================================

const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("adminToken");
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message ||
        `Request failed with status ${response.status}`
    );
  }

  return result;
};

// =====================================================
// DATA HELPERS
// =====================================================

const normalizeJob = (job) => ({
  ...job,
  id: job._id,
  description: job.jobDescription ?? job.description ?? "",
  postedDate: job.createdAt ?? job.postedDate ?? null,
  requiredSkills: Array.isArray(job.requiredSkills)
    ? job.requiredSkills
    : typeof job.requiredSkills === "string"
      ? job.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [],
});

const getJobId = (job) => job?._id || job?.id;

const getStaffId = (staff) => {
  if (!staff) return "";
  return typeof staff === "object" ? staff._id || staff.id || "" : staff;
};

const getStaffName = (staff) =>
  staff?.name?.trim() || staff?.email || "Unknown staff member";

const getStaffRole = (staff) =>
  staff?.role?.trim() || "Role not set";

const getStaffDesignation = (staff) =>
  staff?.designation?.trim() || "";

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Convert the selected starting date to the beginning of that day.
const toStartDateISO = (value) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// Convert the selected ending date to the end of that day.
const toEndDateISO = (value) => {
  if (!value) return null;

  const date = new Date(`${value}T23:59:59.999`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full Time",
  experience: "",
  workArrangement: "On-site",
  vacancies: "1",
  requiredSkills: "",
  applicationStartDate: "",
  applicationEndDate: "",
  owner: "",
  jobDescription: "",
  requirements: "",
  status: "Draft",
};

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/30";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200";

const helpClass = "mt-1.5 text-xs text-gray-500 dark:text-gray-400";

// =====================================================
// JOBS PAGE
// =====================================================

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [teamMemberWarning, setTeamMemberWarning] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // =====================================================
  // FETCH JOBS FROM BACKEND
  // GET /api/jobs/manage
  // =====================================================

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const result = await apiRequest("/jobs/manage");

      setJobs(
        Array.isArray(result.jobs)
          ? result.jobs.map(normalizeJob)
          : []
      );
    } catch (error) {
      console.error("Fetch HR jobs error:", error);

      setPageError(
        error.message ||
          "Unable to load jobs. Please check your login and backend."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH STAFF ACCOUNTS FOR OPTIONAL JOB OWNER
  // GET /api/auth/team-members
  // =====================================================

  const fetchTeamMembers = useCallback(async () => {
    try {
      const result = await apiRequest("/auth/team-members");

      setTeamMembers(
        Array.isArray(result.teamMembers)
          ? result.teamMembers
          : []
      );

      setTeamMemberWarning("");
    } catch (error) {
      console.error("Fetch staff accounts error:", error);

      setTeamMemberWarning(
        "Staff accounts could not be loaded. You can still create a job without assigning an owner."
      );
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchTeamMembers();
  }, [fetchJobs, fetchTeamMembers]);

  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  const filteredJobs = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.department,
        job.location,
        job.employmentType,
        job.workArrangement,
        job.experience,
        ...(job.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        job.employmentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, search, statusFilter, typeFilter]);

  // =====================================================
  // FORM HANDLING
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setFormError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required.";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required.";
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required.";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Job requirements are required.";
    }

    const vacancies = Number(formData.vacancies);

    if (
      formData.vacancies === "" ||
      !Number.isInteger(vacancies) ||
      vacancies < 1
    ) {
      newErrors.vacancies =
        "Vacancies must be a positive whole number.";
    }

    if (
      formData.applicationStartDate &&
      formData.applicationEndDate &&
      formData.applicationStartDate > formData.applicationEndDate
    ) {
      newErrors.applicationEndDate =
        "The end date cannot be before the start date.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // OPEN CREATE JOB MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingJob(null);
    setFormData({ ...emptyForm });
    setErrors({});
    setFormError("");
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT JOB MODAL
  // =====================================================

  const openEditModal = (job) => {
    setEditingJob(job);

    setFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      employmentType: job.employmentType || "Full Time",
      experience: job.experience || "",
      workArrangement: job.workArrangement || "On-site",
      vacancies: String(job.vacancies ?? 1),
      requiredSkills: (job.requiredSkills || []).join(", "),
      applicationStartDate: toDateInputValue(
        job.applicationStartDate
      ),
      applicationEndDate: toDateInputValue(
        job.applicationEndDate
      ),
      owner: getStaffId(job.owner),
      jobDescription: job.jobDescription || job.description || "",
      requirements: job.requirements || "",
      status: job.status || "Draft",
    });

    setErrors({});
    setFormError("");
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE CREATE/EDIT MODAL
  // =====================================================

  const handleCloseModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingJob(null);
    setFormData({ ...emptyForm });
    setErrors({});
    setFormError("");
  };

  // =====================================================
  // OPEN JOB DETAILS MODAL
  // =====================================================

  const openDetailsModal = (job) => {
    setViewingJob(job);
    setOpenMenuId(null);
  };

  // =====================================================
  // CREATE OR UPDATE JOB
  // POST /api/jobs
  // PUT /api/jobs/:id
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setFormError("");
    setPageError("");
    setPageSuccess("");

    const payload = {
      title: formData.title.trim(),
      department: formData.department.trim(),
      employmentType: formData.employmentType,
      location: formData.location.trim(),
      experience: formData.experience.trim(),
      workArrangement: formData.workArrangement,

      vacancies: Number(formData.vacancies),

      requiredSkills: formData.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),

      applicationStartDate: toStartDateISO(
        formData.applicationStartDate
      ),

      applicationEndDate: toEndDateISO(
        formData.applicationEndDate
      ),

      // Owner is optional. Blank means no owner assigned.
      owner: formData.owner || null,

      jobDescription: formData.jobDescription.trim(),
      requirements: formData.requirements.trim(),
      status: formData.status,
    };

    try {
      const isEditing = Boolean(editingJob);
      const endpoint = isEditing
        ? `/jobs/${getJobId(editingJob)}`
        : "/jobs";

      const result = await apiRequest(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!result.job) {
        throw new Error(
          "The server did not return the saved job."
        );
      }

      const savedJob = normalizeJob(result.job);

      if (isEditing) {
        setJobs((previous) =>
          previous.map((job) =>
            getJobId(job) === getJobId(savedJob)
              ? savedJob
              : job
          )
        );

        setPageSuccess("Job updated successfully.");
      } else {
        setJobs((previous) => [savedJob, ...previous]);

        setPageSuccess("Job created successfully.");
      }

      setIsModalOpen(false);
      setEditingJob(null);
      setFormData({ ...emptyForm });
      setErrors({});
      setFormError("");
    } catch (error) {
      console.error("Save job error:", error);

      setFormError(
        error.message || "Unable to save the job."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // PUBLISH OR UNPUBLISH JOB
  // PUT /api/jobs/:id
  // =====================================================

  const handleTogglePublish = async (job) => {
    const nextStatus =
      job.status === "Published" ? "Draft" : "Published";

    setOpenMenuId(null);
    setPageError("");
    setPageSuccess("");

    try {
      const result = await apiRequest(
        `/jobs/${getJobId(job)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      if (!result.job) {
        throw new Error(
          "The server did not return the updated job."
        );
      }

      const updatedJob = normalizeJob(result.job);

      setJobs((previous) =>
        previous.map((item) =>
          getJobId(item) === getJobId(updatedJob)
            ? updatedJob
            : item
        )
      );

      setPageSuccess(
        nextStatus === "Published"
          ? "Job published successfully."
          : "Job moved to Draft successfully."
      );
    } catch (error) {
      console.error("Change job status error:", error);

      setPageError(
        error.message || "Unable to change the job status."
      );
    }
  };

  // =====================================================
  // DELETE JOB
  // DELETE /api/jobs/:id
  // =====================================================

  const handleDelete = async () => {
    if (!deleteJob) return;

    setIsDeleting(true);
    setPageError("");
    setPageSuccess("");

    try {
      await apiRequest(
        `/jobs/${getJobId(deleteJob)}`,
        {
          method: "DELETE",
        }
      );

      setJobs((previous) =>
        previous.filter(
          (job) => getJobId(job) !== getJobId(deleteJob)
        )
      );

      setPageSuccess("Job deleted successfully.");
      setDeleteJob(null);
    } catch (error) {
      console.error("Delete job error:", error);

      setPageError(
        error.message || "Unable to delete the job."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const jobColumns = [
    {
      key: "title",
      label: "Job",
      render: (job) => (
        <div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openDetailsModal(job);
            }}
            className="text-left font-semibold text-gray-900 transition-colors hover:text-[#EF3B3A] dark:text-white"
          >
            {job.title}
          </button>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {job.department}
          </p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (job) => (
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {job.location}
        </span>
      ),
    },
    {
      key: "employmentType",
      label: "Type",
      render: (job) => (
        <span className="text-sm text-gray-700 dark:text-gray-200">
          {job.employmentType}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (job) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            job.status === "Published"
              ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {job.status}
        </span>
      ),
    },
    {
      key: "postedDate",
      label: "Created",
      render: (job) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(job.postedDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (job) => (
        <div className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setOpenMenuId((previous) =>
                previous === getJobId(job)
                  ? null
                  : getJobId(job)
              );
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label={`Actions for ${job.title}`}
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === getJobId(job) && (
            <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => openDetailsModal(job)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Eye size={16} />
                <span>View Job Details</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(job)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Pencil size={16} />
                <span>Edit Job</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePublish(job)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {job.status === "Published" ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}

                <span>
                  {job.status === "Published"
                    ? "Unpublish Job"
                    : "Publish Job"}
                </span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

              <button
                type="button"
                onClick={() => {
                  setDeleteJob(job);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 size={16} />
                <span>Delete Job</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <div className="relative min-h-screen bg-gray-100 p-5 transition-colors dark:bg-gray-950 sm:p-6">
      {/* PAGE HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Jobs
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage job openings and recruitment opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
        >
          <Plus size={18} />
          Create Job
        </button>
      </div>

      {/* SUCCESS AND ERROR MESSAGES */}

      {pageSuccess && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
        >
          {pageSuccess}
        </div>
      )}

      {pageError && (
        <div
          role="alert"
          className="mb-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{pageError}</span>

          <button
            type="button"
            onClick={fetchJobs}
            className="inline-flex items-center gap-2 font-semibold hover:underline"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between max-[767px]:flex-row max-[767px]:items-center max-[767px]:gap-2">
        <div className="relative w-full lg:max-w-sm max-[767px]:min-w-0 max-[767px]:flex-[1.8]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-red-950/30 max-[767px]:h-8 max-[767px]:rounded-md max-[767px]:py-1.5 max-[767px]:pl-7 max-[767px]:pr-2 max-[767px]:text-[10px]"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto max-[767px]:min-w-0 max-[767px]:flex-[2] max-[767px]:flex-row max-[767px]:gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-red-950/30 sm:w-40 max-[767px]:h-8 max-[767px]:w-auto max-[767px]:flex-1 max-[767px]:rounded-md max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-[10px]"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-red-950/30 sm:w-40 max-[767px]:h-8 max-[767px]:w-auto max-[767px]:flex-1 max-[767px]:rounded-md max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-[10px]"
          >
            <option value="All">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* JOBS TABLE */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Job Listings
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {isLoading
              ? "Loading jobs..."
              : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading jobs from the server...
          </div>
        ) : (
          <DataTable
            columns={jobColumns}
            data={filteredJobs}
            emptyMessage={
              pageError
                ? "Unable to load jobs. Check the error message above."
                : "No jobs found."
            }
          />
        )}
      </section>

      {/* =================================================
          JOB DETAILS MODAL
      ================================================= */}

      {viewingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setViewingJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
              <div className="pr-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingJob.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {viewingJob.department} · {viewingJob.location}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {viewingJob.employmentType}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {viewingJob.workArrangement || "Not specified"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      viewingJob.status === "Published"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {viewingJob.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close job details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {viewingJob.experience || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Vacancies
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {viewingJob.vacancies ?? 1}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Application start date
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(viewingJob.applicationStartDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Application end date
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(viewingJob.applicationEndDate)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Required Skills
                </h3>

                {viewingJob.requiredSkills?.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewingJob.requiredSkills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No specific skills have been added.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  About the role
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {viewingJob.jobDescription ||
                    viewingJob.description ||
                    "No job description available."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Requirements
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {viewingJob.requirements ||
                    "No requirements specified."}
                </p>
              </div>

              <div className="grid gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Job Owner
                  </h3>

                  {viewingJob.owner ? (
                    <>
                      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {getStaffName(viewingJob.owner)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getStaffRole(viewingJob.owner)}
                      </p>

                      {getStaffDesignation(viewingJob.owner) && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {getStaffDesignation(viewingJob.owner)}
                        </p>
                      )}

                      {viewingJob.owner.email && (
                        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                          {viewingJob.owner.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No owner assigned.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Created By
                  </h3>

                  {viewingJob.createdBy ? (
                    <>
                      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {getStaffName(viewingJob.createdBy)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getStaffRole(viewingJob.createdBy)}
                      </p>

                      {getStaffDesignation(viewingJob.createdBy) && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {getStaffDesignation(viewingJob.createdBy)}
                        </p>
                      )}

                      {viewingJob.createdBy.email && (
                        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                          {viewingJob.createdBy.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Not recorded for this existing job.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Created: {formatDate(viewingJob.createdAt)}
                {" · "}
                Last updated: {formatDate(viewingJob.updatedAt)}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingJob(null);
                  openEditModal(viewingJob);
                }}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Pencil size={16} />
                  Edit Job
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CREATE / EDIT JOB MODAL
      ================================================= */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingJob ? "Edit Job" : "Create Job"}
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {editingJob
                    ? "Update job posting information."
                    : "Create a new job opportunity for your organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {formError}
                  </p>
                )}

                {/* Job Title */}

                <div>
                  <label htmlFor="title" className={labelClass}>
                    Job Title *
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. SAP ABAP Developer"
                    className={`${fieldClass} ${
                      errors.title ? "border-red-400" : ""
                    }`}
                  />

                  {errors.title && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Department and Employment Type */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="department" className={labelClass}>
                      Department *
                    </label>

                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. AI or SAP"
                      className={`${fieldClass} ${
                        errors.department ? "border-red-400" : ""
                      }`}
                    />

                    {errors.department && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="employmentType" className={labelClass}>
                      Employment Type *
                    </label>

                    <select
                      id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Location and Experience */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="location" className={labelClass}>
                      Location *
                    </label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad, India"
                      className={`${fieldClass} ${
                        errors.location ? "border-red-400" : ""
                      }`}
                    />

                    {errors.location && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className={labelClass}>
                      Experience *
                    </label>

                    <input
                      id="experience"
                      name="experience"
                      type="text"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g. 3+ years"
                      className={`${fieldClass} ${
                        errors.experience ? "border-red-400" : ""
                      }`}
                    />

                    {errors.experience && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.experience}
                      </p>
                    )}
                  </div>
                </div>

                {/* Work Arrangement and Vacancies */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="workArrangement"
                      className={labelClass}
                    >
                      Work Arrangement *
                    </label>

                    <select
                      id="workArrangement"
                      name="workArrangement"
                      value={formData.workArrangement}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>

                    <p className={helpClass}>
                      Where or how the employee will work.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="vacancies" className={labelClass}>
                      Number of Vacancies *
                    </label>

                    <input
                      id="vacancies"
                      name="vacancies"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.vacancies}
                      onChange={handleChange}
                      className={`${fieldClass} ${
                        errors.vacancies ? "border-red-400" : ""
                      }`}
                    />

                    {errors.vacancies && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.vacancies}
                      </p>
                    )}

                    <p className={helpClass}>
                      Planned openings, not a limit on applications.
                    </p>
                  </div>
                </div>

                {/* Required Skills */}

                <div>
                  <label
                    htmlFor="requiredSkills"
                    className={labelClass}
                  >
                    Required Skills
                  </label>

                  <input
                    id="requiredSkills"
                    name="requiredSkills"
                    type="text"
                    value={formData.requiredSkills}
                    onChange={handleChange}
                    placeholder="e.g. SAP S/4HANA, SAP MDG, Data Migration"
                    className={fieldClass}
                  />

                  <p className={helpClass}>
                    Separate skills with commas. These can be displayed on
                    the public Careers page.
                  </p>
                </div>

                {/* Application Dates */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="applicationStartDate"
                      className={labelClass}
                    >
                      Application Start Date
                    </label>

                    <input
                      id="applicationStartDate"
                      name="applicationStartDate"
                      type="date"
                      value={formData.applicationStartDate}
                      onChange={handleChange}
                      className={fieldClass}
                    />

                    <p className={helpClass}>
                      Leave blank if there is no scheduled opening date.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="applicationEndDate"
                      className={labelClass}
                    >
                      Application End Date
                    </label>

                    <input
                      id="applicationEndDate"
                      name="applicationEndDate"
                      type="date"
                      value={formData.applicationEndDate}
                      onChange={handleChange}
                      className={`${fieldClass} ${
                        errors.applicationEndDate
                          ? "border-red-400"
                          : ""
                      }`}
                    />

                    {errors.applicationEndDate && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.applicationEndDate}
                      </p>
                    )}

                    <p className={helpClass}>
                      Leave blank if there is no deadline.
                    </p>
                  </div>
                </div>

                {/* Job Owner */}

                <div>
                  <label htmlFor="owner" className={labelClass}>
                    Job Owner (person responsible for managing this vacancy)
                  </label>

                  <select
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="">
                      No owner assigned
                    </option>

                    {teamMembers.map((member) => {
                      const memberId = member._id || member.id;

                      if (!memberId) return null;

                      const name =
                        member.name?.trim() ||
                        member.email ||
                        "Unnamed staff member";

                      const role = member.role || "Role not set";
                      const designation = member.designation?.trim();

                      const displayLabel = designation
                        ? `${name} (${role} — ${designation})`
                        : `${name} (${role})`;

                      return (
                        <option key={memberId} value={memberId}>
                          {displayLabel}
                        </option>
                      );
                    })}
                  </select>

                  <p className={helpClass}>
                    Optional. Leave blank if no owner has been assigned.
                    The creator will be recorded automatically.
                  </p>

                  {teamMemberWarning && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      {teamMemberWarning}
                    </p>
                  )}
                </div>

                {/* Job Description */}

                <div>
                  <label
                    htmlFor="jobDescription"
                    className={labelClass}
                  >
                    Job Description *
                  </label>

                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    rows={4}
                    value={formData.jobDescription}
                    onChange={handleChange}
                    placeholder="Describe the role and responsibilities..."
                    className={`${fieldClass} resize-none ${
                      errors.jobDescription ? "border-red-400" : ""
                    }`}
                  />

                  {errors.jobDescription && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                {/* Requirements */}

                <div>
                  <label
                    htmlFor="requirements"
                    className={labelClass}
                  >
                    Requirements *
                  </label>

                  <textarea
                    id="requirements"
                    name="requirements"
                    rows={4}
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Mention qualifications, skills and experience..."
                    className={`${fieldClass} resize-none ${
                      errors.requirements ? "border-red-400" : ""
                    }`}
                  />

                  {errors.requirements && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                </div>

                {/* Status */}

                <div>
                  <label htmlFor="status" className={labelClass}>
                    Job Status *
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>

                  <p className={helpClass}>
                    Draft jobs remain visible to HR but do not appear on
                    the public Careers page.
                  </p>
                </div>
              </div>

              {/* FORM BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {isSaving
                    ? "Saving..."
                    : editingJob
                      ? "Save Changes"
                      : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {deleteJob && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!isDeleting) setDeleteJob(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A] dark:bg-red-950/50 dark:text-red-400">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {deleteJob.title}
              </span>
              ? This action cannot be undone.
            </p>

            {pageError && (
              <p
                role="alert"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                {pageError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteJob(null)}
                disabled={isDeleting}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isDeleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;