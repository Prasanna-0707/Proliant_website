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
  "interviewWorkflow",
];

const STAFF_DISPLAY_FIELDS = "name email role designation";

const ALLOWED_STAGE_TYPES = [
  "SCREENING",
  "INTERVIEW",
  "HR_FINAL",
  "OFFER",
  "CUSTOM",
];

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
// HELPER: PREPARE CONFIGURABLE INTERVIEW WORKFLOW
//
// Supports:
// L0 -> L1
// L0 -> L1 -> L2
// L0 -> L1 -> L2 -> L3 -> L4
// Custom stage codes and names are also supported.
// =====================================================

const prepareInterviewWorkflow = (stages) => {
  if (!Array.isArray(stages)) {
    throw badRequest(
      "Interview workflow must be an array"
    );
  }

  const normalizedStages = stages.map((stage, index) => {
    if (
      !stage ||
      typeof stage !== "object" ||
      Array.isArray(stage)
    ) {
      throw badRequest(
        `Interview workflow stage ${index + 1} must be an object`
      );
    }

    const stageCode =
      typeof stage.stageCode === "string"
        ? stage.stageCode.trim().toUpperCase()
        : "";

    const stageName =
      typeof stage.stageName === "string"
        ? stage.stageName.trim()
        : "";

    const stageOrder = Number(stage.stageOrder);

    const stageType =
      typeof stage.stageType === "string"
        ? stage.stageType.trim().toUpperCase()
        : "INTERVIEW";

    const isEnabled =
      stage.isEnabled === undefined
        ? true
        : stage.isEnabled;

    // STAGE CODE
    if (
      !stageCode ||
      stageCode.length > 100 ||
      !/^[A-Z0-9_-]+$/.test(stageCode)
    ) {
      throw badRequest(
        `Interview workflow stage ${index + 1} has an invalid stageCode`
      );
    }

    // STAGE NAME
    if (
      !stageName ||
      stageName.length > 150
    ) {
      throw badRequest(
        `Interview workflow stage ${index + 1} requires a stageName of at most 150 characters`
      );
    }

    // STAGE ORDER
    if (
      !Number.isInteger(stageOrder) ||
      stageOrder < 0
    ) {
      throw badRequest(
        `Interview workflow stage ${index + 1} must have a non-negative whole-number stageOrder`
      );
    }

    // STAGE TYPE
    if (!ALLOWED_STAGE_TYPES.includes(stageType)) {
      throw badRequest(
        `Invalid stageType for workflow stage ${stageCode}`
      );
    }

    // ENABLED STATUS
    if (typeof isEnabled !== "boolean") {
      throw badRequest(
        `isEnabled must be true or false for workflow stage ${stageCode}`
      );
    }

    return {
      stageCode,
      stageName,
      stageOrder,
      stageType,
      isEnabled,
    };
  });

  // A stage code must be unique within the job workflow.
  const stageCodes = normalizedStages.map(
    (stage) => stage.stageCode
  );

  if (new Set(stageCodes).size !== stageCodes.length) {
    throw badRequest(
      "Interview workflow cannot contain duplicate stage codes"
    );
  }

  // Two stages cannot use the same sequence position.
  const stageOrders = normalizedStages.map(
    (stage) => stage.stageOrder
  );

  if (new Set(stageOrders).size !== stageOrders.length) {
    throw badRequest(
      "Interview workflow cannot contain duplicate stage orders"
    );
  }

  // Store stages in configured sequence order.
  return normalizedStages.sort(
    (a, b) => a.stageOrder - b.stageOrder
  );
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
      if (
        !skills.every(
          (skill) => typeof skill === "string"
        )
      ) {
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

  // CONFIGURABLE INTERVIEW WORKFLOW

  if (hasOwn(payload, "interviewWorkflow")) {
    payload.interviewWorkflow =
      prepareInterviewWorkflow(
        payload.interviewWorkflow
      );
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
  if (
    ownerId === null ||
    ownerId === undefined
  ) {
    return;
  }

  if (!mongoose.isValidObjectId(ownerId)) {
    throw badRequest(
      "Invalid Job Owner account"
    );
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

const handleError = (
  res,
  error,
  fallbackMessage
) => {
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
          {
            applicationStartDate: {
              $lte: now,
            },
          },
        ],
      },
      {
        $or: [
          { applicationEndDate: null },
          {
            applicationEndDate: {
              $gte: now,
            },
          },
        ],
      },
    ],
  };
};

// =====================================================
// GET ALL PUBLIC JOBS
// GET /api/jobs
// =====================================================

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find(
      getPublicJobsFilter()
    )
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

    await validateJobOwner(payload.owner);

    // Ignore any createdBy value from the client.
    payload.createdBy = req.admin._id;

    const job = await Job.create(payload);

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

    // Validate the effective date range, including dates
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

    // createdBy cannot be changed through this endpoint.
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