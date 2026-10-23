import mongoose from "mongoose";
import Job from "../models/Job.js";
import Admin from "../models/Admin.js";

// =====================================================
// ALLOWED JOB FIELDS
// createdBy is deliberately excluded.
// =====================================================

const JOB_FIELDS = [
  "title",
  "department",
  "employmentType",
  "location",
  "experience",
  "workArrangement",
  "vacancies",
  "requiredSkills",
  "applicationStartDate",
  "applicationEndDate",
  "owner",
  "status",
  "jobDescription",
  "requirements",
];

const STAFF_DISPLAY_FIELDS = "name email role designation";

// =====================================================
// HELPER: CHECK WHETHER A FIELD EXISTS
// =====================================================

const hasOwn = (object, field) =>
  Object.prototype.hasOwnProperty.call(object, field);

// =====================================================
// HELPER: CREATE VALIDATION ERROR
// =====================================================

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

// =====================================================
// HELPER: PREPARE JOB DATA
// =====================================================

const prepareJobPayload = (body = {}) => {
  const payload = {};

  // Accept only fields supported by the Job model.
  for (const field of JOB_FIELDS) {
    if (hasOwn(body, field)) {
      payload[field] = body[field];
    }
  }

  // REQUIRED SKILLS
  // Supports an array or comma-separated text.

  if (hasOwn(payload, "requiredSkills")) {
    const skills = payload.requiredSkills;

    if (Array.isArray(skills)) {
      if (!skills.every((skill) => typeof skill === "string")) {
        throw badRequest(
          "Required skills must contain only text values"
        );
      }

      payload.requiredSkills = skills
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else if (typeof skills === "string") {
      payload.requiredSkills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else {
      throw badRequest(
        "Required skills must be an array or comma-separated text"
      );
    }
  }

  // VACANCIES
  // Must be a positive whole number.

  if (hasOwn(payload, "vacancies")) {
    const vacancies = Number(payload.vacancies);

    if (
      payload.vacancies === "" ||
      !Number.isInteger(vacancies) ||
      vacancies < 1
    ) {
      throw badRequest(
        "Vacancies must be a positive whole number"
      );
    }

    payload.vacancies = vacancies;
  }

  // APPLICATION DATES
  // Blank date fields are allowed.

  for (const field of [
    "applicationStartDate",
    "applicationEndDate",
  ]) {
    if (!hasOwn(payload, field)) {
      continue;
    }

    const value = payload[field];

    if (value === "" || value === null) {
      payload[field] = null;
      continue;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw badRequest(
        `${field} must be a valid date`
      );
    }

    payload[field] = date;
  }

  // JOB OWNER
  // Blank selection means no owner is assigned.

  if (
    hasOwn(payload, "owner") &&
    (payload.owner === "" || payload.owner === null)
  ) {
    payload.owner = null;
  }

  return payload;
};

// =====================================================
// HELPER: VALIDATE APPLICATION DATE RANGE
// =====================================================

const validateDateRange = (startDate, endDate) => {
  if (
    startDate &&
    endDate &&
    new Date(startDate).getTime() >
      new Date(endDate).getTime()
  ) {
    throw badRequest(
      "Application end date cannot be before the start date"
    );
  }
};

// =====================================================
// HELPER: VALIDATE JOB OWNER
// Job Owner is optional.
// If selected, the staff account must exist.
// =====================================================

const validateJobOwner = async (ownerId) => {
  if (ownerId === null || ownerId === undefined) {
    return;
  }

  if (!mongoose.isValidObjectId(ownerId)) {
    throw badRequest("Invalid Job Owner account");
  }

  const ownerExists = await Admin.exists({
    _id: ownerId,
  });

  if (!ownerExists) {
    throw badRequest(
      "The selected Job Owner account does not exist"
    );
  }
};

// =====================================================
// HELPER: POPULATE JOB OWNER AND CREATOR DETAILS
// =====================================================

const populateStaffDetails = (query) => {
  return query
    .populate("owner", STAFF_DISPLAY_FIELDS)
    .populate("createdBy", STAFF_DISPLAY_FIELDS);
};

// =====================================================
// HELPER: ERROR HANDLING
// =====================================================

const handleError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  const isValidationError =
    error.name === "ValidationError" ||
    error.name === "CastError";

  const statusCode =
    error.statusCode ||
    (isValidationError ? 400 : 500);

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 400
        ? error.message
        : fallbackMessage,
    ...(statusCode === 500 && {
      error: error.message,
    }),
  });
};

// =====================================================
// HELPER: PUBLIC JOB FILTER
//
// Only Published jobs are returned.
// Applications must be within the configured dates.
// A missing or blank date does not restrict applications.
// =====================================================

const getPublicJobsFilter = () => {
  const now = new Date();

  return {
    status: "Published",

    $and: [
      {
        $or: [
          { applicationStartDate: null },
          { applicationStartDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { applicationEndDate: null },
          { applicationEndDate: { $gte: now } },
        ],
      },
    ],
  };
};

// =====================================================
// GET ALL PUBLIC JOBS
// GET /api/jobs
//
// Used by the public Careers page.
// Returns only published jobs currently accepting applications.
// Does not expose internal Job Owner or Created By details.
// =====================================================

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find(getPublicJobsFilter())
      .select("-owner -createdBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch published jobs"
    );
  }
};

// =====================================================
// GET ONE PUBLIC JOB
// GET /api/jobs/:id
//
// Only returns a published job currently accepting applications.
// =====================================================

export const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findOne({
      _id: id,
      ...getPublicJobsFilter(),
    }).select("-owner -createdBy");

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Job not found, unpublished, or not currently accepting applications",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch published job"
    );
  }
};

// =====================================================
// GET ALL JOBS FOR HR
// GET /api/jobs/manage
//
// Returns Draft and Published jobs.
// Includes Job Owner and Created By staff details.
// =====================================================

export const getJobsForHR = async (req, res) => {
  try {
    const jobs = await populateStaffDetails(
      Job.find()
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch HR job records"
    );
  }
};

// =====================================================
// GET ONE JOB FOR HR
// GET /api/jobs/manage/:id
//
// Returns the complete details of one job,
// regardless of whether its status is Draft or Published.
// =====================================================

export const getJobForHR = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await populateStaffDetails(
      Job.findById(id)
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch HR job details"
    );
  }
};

// =====================================================
// CREATE JOB
// POST /api/jobs
//
// Job Owner remains blank unless selected.
// Created By is assigned automatically using the
// authenticated account and cannot be chosen by the client.
// =====================================================

export const createJob = async (req, res) => {
  try {
    if (!req.admin?._id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated staff account not found",
      });
    }

    const payload = prepareJobPayload(req.body);

    const requiredFields = [
      "title",
      "department",
      "employmentType",
      "location",
      "experience",
      "jobDescription",
      "requirements",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        typeof payload[field] !== "string" ||
        !payload[field].trim()
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required job fields are missing",
        missingFields,
      });
    }

    validateDateRange(
      payload.applicationStartDate,
      payload.applicationEndDate
    );

    // If no owner was selected, this validation allows null.
    await validateJobOwner(payload.owner);

    // Record who created this post.
    // Ignore any createdBy value supplied by the frontend.
    payload.createdBy = req.admin._id;

    // The schema defaults status to Draft when status is omitted.
    const job = await Job.create(payload);

    // Return staff names, email, role and designation,
    // instead of returning only their database IDs.
    await job.populate([
      {
        path: "owner",
        select: STAFF_DISPLAY_FIELDS,
      },
      {
        path: "createdBy",
        select: STAFF_DISPLAY_FIELDS,
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to create job"
    );
  }
};

// =====================================================
// UPDATE JOB
// PUT /api/jobs/:id
//
// Allows the Job Owner to be assigned or cleared.
// Created By remains unchanged.
// =====================================================

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const payload = prepareJobPayload(req.body);

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid job fields were provided",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check the effective date range, including dates
    // that were not included in this update.
    const startDate =
      payload.applicationStartDate !== undefined
        ? payload.applicationStartDate
        : job.applicationStartDate;

    const endDate =
      payload.applicationEndDate !== undefined
        ? payload.applicationEndDate
        : job.applicationEndDate;

    validateDateRange(startDate, endDate);

    if (hasOwn(payload, "owner")) {
      await validateJobOwner(payload.owner);
    }

    // createdBy is not included in JOB_FIELDS.
    // It cannot be overwritten through this endpoint.
    job.set(payload);

    await job.save();

    await job.populate([
      {
        path: "owner",
        select: STAFF_DISPLAY_FIELDS,
      },
      {
        path: "createdBy",
        select: STAFF_DISPLAY_FIELDS,
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update job"
    );
  }
};

// =====================================================
// DELETE JOB
// DELETE /api/jobs/:id
// =====================================================

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to delete job"
    );
  }
};