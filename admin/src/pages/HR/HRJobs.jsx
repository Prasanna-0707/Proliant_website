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
import DataTable from "../../components/DataTable";
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
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            HR Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and publish job openings.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
        >
          <Plus size={18} />
          Add Job
        </button>
      </div>
      {/* SUCCESS MESSAGE */}
      {pageSuccess && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <span>{pageSuccess}</span>
          <button
            type="button"
            onClick={() => setPageSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {/* ERROR MESSAGE */}
      {pageError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error message"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs..."
            className={`${fieldClass} pl-10`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className={`${fieldClass} sm:w-48`}
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className={`${fieldClass} sm:w-48`}
        >
          <option value="All">All Employment Types</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      {/* JOBS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw size={18} className="animate-spin" />
            Loading jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              No jobs found
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <DataTable
            columns={jobColumns}
            data={filteredJobs}
            onRowClick={openDetailsModal}
          />
        )}
      </div>
      {/* CREATE / EDIT JOB MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingJob ? "Edit Job" : "Create New Job"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the job details below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close job form"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {formError}
                </div>
              )}
              {teamMemberWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
                  {teamMemberWarning}
                </div>
              )}
              {/* BASIC DETAILS */}
              <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  Basic Details
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="title">
                      Job Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className={fieldClass}
                    />
                    {errors.title && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="department">
                      Department *
                    </label>
                    <input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Engineering"
                      className={fieldClass}
                    />
                    {errors.department && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.department}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="location">
                      Location *
                    </label>
                    <input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad"
                      className={fieldClass}
                    />
                    {errors.location && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.location}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="employmentType">
                      Employment Type
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
                  <div>
                    <label className={labelClass} htmlFor="experience">
                      Experience *
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g. 2-4 years"
                      className={fieldClass}
                    />
                    {errors.experience && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.experience}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="workArrangement">
                      Work Arrangement
                    </label>
                    <select
                      id="workArrangement"
                      name="workArrangement"
                      value={formData.workArrangement}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="vacancies">
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
                      className={fieldClass}
                    />
                    {errors.vacancies && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.vacancies}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="requiredSkills">
                      Required Skills
                    </label>
                    <input
                      id="requiredSkills"
                      name="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                      placeholder="React, Node.js, MongoDB"
                      className={fieldClass}
                    />
                    <p className={helpClass}>
                      Enter skills separated by commas.
                    </p>
                  </div>
                </div>
              </div>
              {/* APPLICATION DATES */}
              <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  Application Dates
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      className={labelClass}
                      htmlFor="applicationStartDate"
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
                  </div>
                  <div>
                    <label
                      className={labelClass}
                      htmlFor="applicationEndDate"
                    >
                      Application End Date
                    </label>
                    <input
                      id="applicationEndDate"
                      name="applicationEndDate"
                      type="date"
                      min={formData.applicationStartDate || undefined}
                      value={formData.applicationEndDate}
                      onChange={handleChange}
                      className={fieldClass}
                    />
                    {errors.applicationEndDate && (
                      <p className={helpClass + " text-red-500"}>
                        {errors.applicationEndDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* JOB OWNER */}
              <div>
                <label className={labelClass} htmlFor="owner">
                  Job Owner
                </label>
                <select
                  id="owner"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  <option value="">No owner assigned</option>
                  {teamMembers.map((member) => (
                    <option
                      key={getStaffId(member)}
                      value={getStaffId(member)}
                    >
                      {getStaffName(member)}
                      {getStaffDesignation(member)
                        ? ` — ${getStaffDesignation(member)}`
                        : ""}
                    </option>
                  ))}
                </select>
                <p className={helpClass}>
                  Assign a team member to manage this job. This field is optional.
                </p>
              </div>
              {/* JOB DESCRIPTION */}
              <div>
                <label className={labelClass} htmlFor="jobDescription">
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={5}
                  value={formData.jobDescription}
                  onChange={handleChange}
                  placeholder="Describe the role and responsibilities..."
                  className={fieldClass}
                />
                {errors.jobDescription && (
                  <p className={helpClass + " text-red-500"}>
                    {errors.jobDescription}
                  </p>
                )}
              </div>
              {/* REQUIREMENTS */}
              <div>
                <label className={labelClass} htmlFor="requirements">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={5}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the required qualifications and skills..."
                  className={fieldClass}
                />
                {errors.requirements && (
                  <p className={helpClass + " text-red-500"}>
                    {errors.requirements}
                  </p>
                )}
              </div>
              {/* JOB STATUS */}
              <div>
                <label className={labelClass} htmlFor="status">
                  Status
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
              </div>
              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF3B3A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}
                  {isSaving
                    ? "Saving..."
                    : editingJob
                      ? "Update Job"
                      : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* JOB DETAILS MODAL */}
      {viewingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewingJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Job Details
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review the complete job information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close job details"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {viewingJob.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {viewingJob.department} · {viewingJob.location}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Employment Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {viewingJob.employmentType || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {viewingJob.experience || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Work Arrangement
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {viewingJob.workArrangement || "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Vacancies
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {viewingJob.vacancies ?? 1}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Application Start Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(viewingJob.applicationStartDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Application End Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(viewingJob.applicationEndDate)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {viewingJob.status || "Draft"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Job Owner
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {getStaffName(viewingJob.owner)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Required Skills
                </h3>
                {(viewingJob.requiredSkills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.requiredSkills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-[#EF3B3A] dark:bg-red-950/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No skills listed.
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Job Description
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {viewingJob.jobDescription ||
                    viewingJob.description ||
                    "No job description provided."}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Requirements
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {viewingJob.requirements ||
                    "No requirements provided."}
                </p>
              </div>
              <div className="flex justify-end border-t border-gray-200 pt-5 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setViewingJob(null)}
                  className="rounded-lg bg-[#EF3B3A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteJob && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isDeleting) setDeleteJob(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30">
                <Trash2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Job
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {deleteJob.title}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteJob(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && (
                  <RefreshCw size={16} className="animate-spin" />
                )}
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