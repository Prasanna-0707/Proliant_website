import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

import DataTable from "../components/DataTable";

const initialJobs = [
  {
    id: 1,
    title: "SAP ABAP Developer",
    department: "SAP",
    location: "Hyderabad, India",
    employmentType: "Full Time",
    status: "Published",
    description:
      "We are looking for an experienced SAP ABAP Developer to join our team.",
    requirements:
      "3+ years of SAP ABAP experience, strong knowledge of reports, interfaces and enhancements.",
    postedDate: "2026-09-01",
  },
  {
    id: 2,
    title: "HR Executive",
    department: "Human Resources",
    location: "Hyderabad, India",
    employmentType: "Full Time",
    status: "Draft",
    description:
      "We are looking for an HR Executive to support our growing organization.",
    requirements:
      "2+ years of HR experience with strong communication and employee management skills.",
    postedDate: "2026-08-28",
  },
  {
    id: 3,
    title: "SAP SD Consultant",
    department: "SAP",
    location: "Bangalore, India",
    employmentType: "Full Time",
    status: "Published",
    description:
      "Join our SAP consulting team as an experienced SAP SD Consultant.",
    requirements:
      "3+ years of SAP SD experience with strong knowledge of sales and distribution processes.",
    postedDate: "2026-08-25",
  },
  {
    id: 4,
    title: "Business Analyst",
    department: "Business",
    location: "Remote",
    employmentType: "Contract",
    status: "Draft",
    description:
      "We are seeking a Business Analyst to work with our clients and internal teams.",
    requirements:
      "Strong analytical skills, requirement gathering experience and excellent communication.",
    postedDate: "2026-08-20",
  },
];

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full Time",
  description: "",
  requirements: "",
  status: "Draft",
};

function Jobs() {
  const [jobs, setJobs] = useState(initialJobs);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        job.title.toLowerCase().includes(searchValue) ||
        job.department.toLowerCase().includes(searchValue) ||
        job.location.toLowerCase().includes(searchValue) ||
        job.employmentType.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      const matchesType =
        typeFilter === "All" || job.employmentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, search, statusFilter, typeFilter]);

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

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required.";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Job requirements are required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const openAddModal = () => {
    setEditingJob(null);
    setFormData(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);

    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
    });

    setErrors({});
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingJob) {
      setJobs((previous) =>
        previous.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                ...formData,
              }
            : job
        )
      );
    } else {
      const newJob = {
        id: Date.now(),
        ...formData,
        postedDate: new Date().toISOString().split("T")[0],
      };

      setJobs((previous) => [newJob, ...previous]);
    }

    setFormData(emptyForm);
    setErrors({});
    setEditingJob(null);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const handleTogglePublish = (job) => {
    setJobs((previous) =>
      previous.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status:
                item.status === "Published" ? "Draft" : "Published",
            }
          : item
      )
    );

    setOpenMenuId(null);
  };

  const handleDelete = () => {
    if (!deleteJob) {
      return;
    }

    setJobs((previous) =>
      previous.filter((job) => job.id !== deleteJob.id)
    );

    setDeleteJob(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const jobColumns = [
    {
      key: "title",
      label: "Job",
      render: (job) => (
        <div>
          <p className="font-semibold text-gray-900">{job.title}</p>

          <p className="mt-0.5 text-xs text-gray-500">
            {job.department}
          </p>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "employmentType",
      label: "Type",
      render: (job) => (
        <span className="text-sm text-gray-700">
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
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {job.status}
        </span>
      ),
    },
    {
      key: "postedDate",
      label: "Posted",
      render: (job) => (
        <span className="text-sm text-gray-600">
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
                previous === job.id ? null : job.id
              );
            }}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Job actions"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === job.id && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => openEditModal(job)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil size={16} />
                <span>Edit Job</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePublish(job)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
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

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={() => {
                  setDeleteJob(job);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
    <div className="relative p-5 sm:p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Jobs
          </h1>

          <p className="mt-1 text-sm text-gray-500">
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

      {/* Search & Filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between max-[767px]:flex-row max-[767px]:items-center max-[767px]:gap-2">
        <div className="relative w-full lg:max-w-sm max-[767px]:min-w-0 max-[767px]:flex-[1.8]">
          <Search
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 max-[767px]:h-3.5 max-[767px]:w-3.5"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search jobs..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 max-[767px]:h-8 max-[767px]:rounded-md max-[767px]:py-1.5 max-[767px]:pl-7 max-[767px]:pr-2 max-[767px]:text-[10px]"
          />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto max-[767px]:min-w-0 max-[767px]:flex-[2] max-[767px]:flex-row max-[767px]:gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:h-8 max-[767px]:w-auto max-[767px]:flex-1 max-[767px]:rounded-md max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-[10px]"
          >
            <option value="All" className="text-[10px]">
              All Status
            </option>

            <option value="Published" className="text-[10px]">
              Published
            </option>

            <option value="Draft" className="text-[10px]">
              Draft
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50 sm:w-40 max-[767px]:h-8 max-[767px]:w-auto max-[767px]:flex-1 max-[767px]:rounded-md max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-[10px]"
          >
            <option value="All" className="text-[10px]">
              All Types
            </option>

            <option value="Full Time" className="text-[10px]">
              Full Time
            </option>

            <option value="Part Time" className="text-[10px]">
              Part Time
            </option>

            <option value="Contract" className="text-[10px]">
              Contract
            </option>

            <option value="Internship" className="text-[10px]">
              Internship
            </option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Job Listings
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredJobs.length} job
            {filteredJobs.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <DataTable
          columns={jobColumns}
          data={filteredJobs}
          emptyMessage="No jobs found."
        />
      </section>

      {/* Add / Edit Job Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={handleCloseModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingJob ? "Edit Job" : "Create Job"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingJob
                    ? "Update job posting information."
                    : "Create a new job opportunity for your organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {/* Job Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Job Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. SAP ABAP Developer"
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.title
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.title && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Department & Employment Type */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="department"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Department
                    </label>

                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. SAP"
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                        errors.department
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                      }`}
                    />

                    {errors.department && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="employmentType"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Employment Type
                    </label>

                    <select
                      id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Location & Status */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Location
                    </label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad, India"
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                        errors.location
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                      }`}
                    />

                    {errors.location && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#EF3B3A] focus:ring-4 focus:ring-red-50"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Job Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the job role and responsibilities..."
                    className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.description
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.description && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <label
                    htmlFor="requirements"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Requirements
                  </label>

                  <textarea
                    id="requirements"
                    name="requirements"
                    rows={4}
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Mention skills, experience and qualifications..."
                    className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-4 ${
                      errors.requirements
                        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                        : "border-gray-300 focus:border-[#EF3B3A] focus:ring-red-50"
                    }`}
                  />

                  {errors.requirements && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.requirements}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
                >
                  {editingJob ? "Save Changes" : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteJob && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDeleteJob(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#EF3B3A]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Delete Job?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteJob.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteJob(null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="w-full rounded-lg bg-[#EF3B3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 sm:w-auto"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;