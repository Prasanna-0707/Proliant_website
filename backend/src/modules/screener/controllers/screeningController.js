import mongoose from "mongoose";

import Candidate from "../../../models/Candidate.js";
import Screening from "../models/Screening.js";
import AuditLog from "../../../models/AuditLog.js";

import {
  isActiveAccount,
  isL0Screener,
} from "../../administrator/services/authorizationService.js";

import {
  createAuditLog,
} from "../../../services/auditLogService.js";

// =====================================================
// CONSTANTS
// =====================================================

const SCREENING_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

const SCREENING_DECISIONS = [
  "SHORTLIST",
  "REJECT",
  "ON_HOLD",
  "ESCALATE",
  "Selected",
  "Rejected",
  "On Hold",
];

const HR_REVIEW_DECISIONS = [
  "ON_HOLD",
  "ESCALATE",
  "On Hold",
];

const CHECKLIST_BOOLEAN_FIELDS = [
  "skillsMatch",
  "experienceMatch",
  "educationMatch",
  "requirementsMatch",
];

const CHECKLIST_ALLOWED_FIELDS = [
  ...CHECKLIST_BOOLEAN_FIELDS,
  "additionalNotes",
];

const LEGACY_DECISION_MAP = {
  Selected: "SHORTLIST",
  Rejected: "REJECT",
  "On Hold": "ON_HOLD",
};

// =====================================================
// HELPERS
// =====================================================

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

const isAuthorizedL0Screener = (user) =>
  isActiveAccount(user) && isL0Screener(user);

const isGlobalAdministrator = (user) =>
  normalize(user?.role) === "administrator" &&
  user?.adminScope === "GLOBAL";

const isDepartmentAdministrator = (user) =>
  normalize(user?.role) === "administrator" &&
  user?.adminScope === "DEPARTMENT" &&
  Boolean(String(user?.department || "").trim());

const isHrOrRecruiter = (user) => {
  const role = normalize(user?.role);

  return (
    role === "hr" ||
    role === "recruiter" ||
    role === "hr recruiter" ||
    role === "hr/recruiter" ||
    role === "hr admin" ||
    role === "hr manager"
  );
};

const isReadOnlyOversightUser = (user) =>
  isActiveAccount(user) &&
  (
    isGlobalAdministrator(user) ||
    isDepartmentAdministrator(user) ||
    isHrOrRecruiter(user)
  );

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse positive integer query parameters.
// Returns the default only when the parameter is omitted.
// Returns null when the supplied value is invalid.

const parsePositiveIntegerQuery = (
  value,
  defaultValue,
  maximum = Number.MAX_SAFE_INTEGER
) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }

  const normalized = String(value).trim();

  if (!/^[1-9]\d*$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed > maximum
  ) {
    return null;
  }

  return parsed;
};

const formatChecklist = (checklist = {}) => ({
  skillsMatch: checklist?.skillsMatch ?? null,
  experienceMatch: checklist?.experienceMatch ?? null,
  educationMatch: checklist?.educationMatch ?? null,
  requirementsMatch: checklist?.requirementsMatch ?? null,
  additionalNotes: checklist?.additionalNotes ?? "",
});

const safeCandidateDetails = (candidate) => {
  if (!candidate) {
    return null;
  }

  return {
    _id: candidate._id,

    job: candidate.job || null,
    department: candidate.department || "",

    position: candidate.position,
    areaOfInterest: candidate.areaOfInterest,

    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,

    isFresher: candidate.isFresher,
    location: candidate.location,
    yearsOfExperience: candidate.yearsOfExperience,

    highestQualification:
      candidate.highestQualification,

    currentCompany: candidate.currentCompany,
    noticePeriod: candidate.noticePeriod,
    coverMessage: candidate.coverMessage,

    currentStage: candidate.currentStage,
    status: candidate.status,

    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
};

const applicationPopulate = {
  path: "application",
  select: [
    "job",
    "department",
    "position",
    "areaOfInterest",
    "name",
    "email",
    "phone",
    "isFresher",
    "location",
    "yearsOfExperience",
    "highestQualification",
    "currentCompany",
    "noticePeriod",
    "coverMessage",
    "currentStage",
    "assignedScreener",
    "status",
    "createdAt",
    "updatedAt",
  ].join(" "),
  populate: {
    path: "job",
    select: "title department location employmentType",
  },
};

// Get the latest HR review history entry.
const getLatestHRReviewEntry = (screening) => {
  const history = screening?.history || [];

  return [...history]
    .reverse()
    .find(
      (entry) =>
        entry.action === "HR_REVIEW_REQUESTED"
    ) || null;
};

// Determine the HR review reason.
const getHRReviewReason = (screening) => {
  const historyEntry = getLatestHRReviewEntry(screening);

  if (historyEntry?.feedback) {
    return historyEntry.feedback;
  }

  if (
    screening?.decision === "ESCALATE" &&
    screening?.escalationReason
  ) {
    return screening.escalationReason;
  }

  return (
    screening?.remarks ||
    screening?.feedback ||
    "Application requires HR review."
  );
};

// Keep older history records readable without inventing past values.
const formatHistoryEntry = (entry) => ({
  ...entry,
  applicationId: entry.applicationId || null,
  candidateName: entry.candidateName || "",
  screenerName: entry.screenerName || "",
  previousStatus: entry.previousStatus || "",
  newStatus: entry.newStatus || "",
  previousScreeningStatus: entry.previousScreeningStatus || "",
  newScreeningStatus: entry.newScreeningStatus || "",
  decision: LEGACY_DECISION_MAP[entry.decision] || entry.decision || "",
  remarks: entry.remarks || "",
  rejectionReason: entry.rejectionReason || "",
  createdAt: entry.createdAt || null,
});

// =====================================================
// 1. MY APPLICATIONS
// GET /api/screener/applications
//
// Supported query parameters:
// status, decision, search, jobId, page, limit
// =====================================================

export const getAssignedL0Applications = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view assigned applications.",
      });
    }

    // -------------------------------------------------
    // PAGINATION VALIDATION
    // -------------------------------------------------

    const page = parsePositiveIntegerQuery(
      req.query.page,
      1
    );

    if (page === null) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer.",
      });
    }

    const limit = parsePositiveIntegerQuery(
      req.query.limit,
      20,
      100
    );

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be a positive integer between 1 and 100.",
      });
    }

    const skip = (page - 1) * limit;

    // -------------------------------------------------
    // QUERY PARAMETERS
    // -------------------------------------------------

    const status = req.query.status !== undefined
      ? String(req.query.status).trim()
      : "";

    const decision = req.query.decision !== undefined
      ? String(req.query.decision).trim()
      : "";

    const search = req.query.search !== undefined
      ? String(req.query.search).trim().slice(0, 100)
      : "";

    const jobId = req.query.jobId !== undefined
      ? String(req.query.jobId).trim()
      : "";

    // -------------------------------------------------
    // STATUS VALIDATION
    // -------------------------------------------------

    if (
      status &&
      !SCREENING_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid screening status filter.",
        allowedValues: SCREENING_STATUSES,
      });
    }

    // -------------------------------------------------
    // DECISION VALIDATION
    // -------------------------------------------------

    if (
      decision &&
      !SCREENING_DECISIONS.includes(decision)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid screening decision filter.",
        allowedValues: SCREENING_DECISIONS,
      });
    }

    // -------------------------------------------------
    // JOB ID VALIDATION
    // -------------------------------------------------

    if (
      jobId &&
      !mongoose.isValidObjectId(jobId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    // -------------------------------------------------
    // BASE SCREENING FILTER
    //
    // A screener must only retrieve their own
    // assigned L0 applications.
    // -------------------------------------------------

    const filter = {
      assignedTo: req.admin._id,
      level: "L0",
    };

    if (status) {
      filter.status = status;
    }

    if (decision) {
      filter.decision = decision;
    }

    // -------------------------------------------------
    // SEARCH AND JOB FILTER
    //
    // Both filters can be used independently
    // or together.
    // -------------------------------------------------

    const candidateFilter = {};

    if (search) {
      const searchRegex = new RegExp(
        escapeRegex(search),
        "i"
      );

      candidateFilter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { position: searchRegex },
        { areaOfInterest: searchRegex },
      ];
    }

    if (jobId) {
      candidateFilter.job = new mongoose.Types.ObjectId(
        jobId
      );
    }

    // Execute candidate filtering only when
    // search or jobId has been provided.

    if (Object.keys(candidateFilter).length > 0) {
      const matchingCandidates = await Candidate.find(
        candidateFilter
      )
        .select("_id")
        .lean();

      const candidateIds = matchingCandidates.map(
        (candidate) => candidate._id
      );

      if (candidateIds.length === 0) {
        return res.status(200).json({
          success: true,
          total: 0,
          applications: [],
          pagination: {
            page,
            limit,
            totalPages: 0,
          },
        });
      }

      filter.application = {
        $in: candidateIds,
      };
    }

    // -------------------------------------------------
    // FETCH TOTAL AND SCREENING RECORDS
    // -------------------------------------------------

    const [total, screenings] = await Promise.all([
      Screening.countDocuments(filter),

      Screening.find(filter)
        .select(
          [
            "application",
            "level",
            "assignedTo",
            "status",
            "decision",
            "feedback",
            "checklist",
            "assignedAt",
            "startedAt",
            "submittedAt",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .populate(applicationPopulate)
        .sort({
          assignedAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // -------------------------------------------------
    // FORMAT APPLICATION RESPONSE
    // -------------------------------------------------

    const applications = screenings
      .filter((screening) => screening.application)
      .map((screening) => ({
        screeningId: screening._id,
        level: screening.level,
        screeningStatus: screening.status,
        decision: screening.decision,
        feedback: screening.feedback,
        checklist: formatChecklist(screening.checklist),
        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,
        application: safeCandidateDetails(
          screening.application
        ),
      }));

    return res.status(200).json({
      success: true,
      total,
      applications,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get assigned L0 applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned applications.",
    });
  }
};

// =====================================================
// 2. APPLICATION DETAILS
// GET /api/screener/applications/:applicationId
// =====================================================

export const getL0ApplicationDetails = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view application details.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const screening = await Screening.findOne({
      application: applicationId,
      level: "L0",
      assignedTo: req.admin._id,
    })
      .select(
        [
          "application",
          "level",
          "assignedTo",
          "status",
          "decision",
          "feedback",
          "remarks",
          "rejectionReason",
          "escalationReason",
          "checklist",
          "assignedAt",
          "startedAt",
          "submittedAt",
          "history",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .populate(applicationPopulate)
      .lean();

    if (!screening || !screening.application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found or not assigned to you.",
      });
    }

    return res.status(200).json({
      success: true,

      application: safeCandidateDetails(
        screening.application
      ),

      screening: {
        id: screening._id,
        level: screening.level,
        status: screening.status,
        decision: screening.decision,
        feedback: screening.feedback,
        remarks: screening.remarks,
        rejectionReason: screening.rejectionReason,
        escalationReason: screening.escalationReason,
        checklist: formatChecklist(screening.checklist),
        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get L0 application details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application details.",
    });
  }
};

// =====================================================
// 3. START SCREENING
// PATCH /api/screener/applications/:applicationId/start
// =====================================================

export const startL0Screening = async (req, res) => {
  let session;

  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can start screening.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    session = await mongoose.startSession();

    let operationResult;

    await session.withTransaction(async () => {
      const screening = await Screening.findOne({
        application: applicationId,
        level: "L0",
        assignedTo: req.admin._id,
      }).session(session);

      if (!screening) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message:
              "Application not found or not assigned to you.",
          },
        };
        return;
      }

      if (screening.status === "In Progress") {
        operationResult = {
          statusCode: 200,
          body: {
            success: true,
            message: "Screening is already in progress.",
            screening: {
              id: screening._id,
              application: screening.application,
              status: screening.status,
              startedAt: screening.startedAt,
            },
          },
        };
        return;
      }

      if (
        screening.status === "Completed" ||
        screening.status === "Cancelled"
      ) {
        operationResult = {
          statusCode: 409,
          body: {
            success: false,
            message:
              "A completed or cancelled screening cannot be started.",
            currentStatus: screening.status,
          },
        };
        return;
      }

      if (screening.status !== "Pending") {
        operationResult = {
          statusCode: 409,
          body: {
            success: false,
            message:
              "This screening cannot be started in its current state.",
            currentStatus: screening.status,
          },
        };
        return;
      }

      const candidate = await Candidate.findById(
        screening.application
      ).session(session);

      if (!candidate) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message: "Application not found.",
          },
        };
        return;
      }

      const previousStatus = screening.status;
      const previousCandidateStatus = candidate.status;
      const startedAt = new Date();

      screening.status = "In Progress";
      screening.startedAt = startedAt;

      screening.history.push({
        action: "STARTED",
        applicationId: candidate._id,
        candidateName: candidate.name || "",
        screenerName: req.admin.name || "",
        previousStatus: previousCandidateStatus,
        newStatus: candidate.status,
        previousScreeningStatus: previousStatus,
        newScreeningStatus: screening.status,
        performedBy: req.admin._id,
        performedByType: "HUMAN",
        performedById: req.admin._id.toString(),
        performedByName: req.admin.name || "",
        assignedTo: req.admin._id,
        remarks: "L0 screening started.",
        feedback: "L0 screening started.",
        createdAt: startedAt,
      });

      await screening.save({ session });

      await createAuditLog({
        req,
        action: "L0_SCREENING_STARTED",
        targetType: "Candidate",
        targetId: screening.application,
        targetLabel: `Application ${screening.application}`,
        department: req.admin.department || "",
        outcome: "SUCCESS",
        before: {
          screeningStatus: previousStatus,
        },
        after: {
          screeningStatus: screening.status,
          startedAt,
        },
        reason:
          "Assigned L0 screener started reviewing the application.",
        session,
      });

      operationResult = {
        statusCode: 200,
        body: {
          success: true,
          message: "Screening started successfully.",
          screening: {
            id: screening._id,
            application: screening.application,
            level: screening.level,
            status: screening.status,
            startedAt: screening.startedAt,
          },
        },
      };
    });

    return res
      .status(operationResult.statusCode)
      .json(operationResult.body);
  } catch (error) {
    console.error("Start L0 screening error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start screening.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// =====================================================
// 4. GET SCREENING CHECKLIST
// GET /api/screener/applications/:applicationId/checklist
// =====================================================

export const getL0ScreeningChecklist = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view the checklist.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const screening = await Screening.findOne({
      application: applicationId,
      level: "L0",
      assignedTo: req.admin._id,
    })
      .select(
        "_id application level status checklist assignedAt startedAt updatedAt"
      )
      .lean();

    if (!screening) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found or not assigned to you.",
      });
    }

    return res.status(200).json({
      success: true,
      applicationId: screening.application,
      screeningId: screening._id,
      screeningStatus: screening.status,
      checklist: formatChecklist(screening.checklist),
      updatedAt: screening.updatedAt,
    });
  } catch (error) {
    console.error(
      "Get L0 screening checklist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening checklist.",
    });
  }
};

// =====================================================
// 5. UPDATE SCREENING CHECKLIST
// PUT /api/screener/applications/:applicationId/checklist
// =====================================================

export const updateL0ScreeningChecklist = async (
  req,
  res
) => {
  let session;

  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can update the checklist.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const checklistInput = req.body?.checklist;

    if (
      !checklistInput ||
      typeof checklistInput !== "object" ||
      Array.isArray(checklistInput)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a valid checklist object in the request body.",
      });
    }

    const suppliedFields = Object.keys(checklistInput);

    if (suppliedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one checklist field must be provided.",
      });
    }

    const invalidFields = suppliedFields.filter(
      (field) =>
        !CHECKLIST_ALLOWED_FIELDS.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unknown checklist fields provided.",
        invalidFields,
        allowedFields: CHECKLIST_ALLOWED_FIELDS,
      });
    }

    for (const field of CHECKLIST_BOOLEAN_FIELDS) {
      if (
        Object.prototype.hasOwnProperty.call(
          checklistInput,
          field
        )
      ) {
        const value = checklistInput[field];

        if (
          value !== true &&
          value !== false &&
          value !== null
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${field} must be true, false, or null.`,
          });
        }
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        checklistInput,
        "additionalNotes"
      )
    ) {
      if (
        typeof checklistInput.additionalNotes !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Additional notes must be text.",
        });
      }

      if (checklistInput.additionalNotes.length > 2000) {
        return res.status(400).json({
          success: false,
          message:
            "Additional notes cannot exceed 2000 characters.",
        });
      }
    }

    session = await mongoose.startSession();

    let operationResult;

    await session.withTransaction(async () => {
      const screening = await Screening.findOne({
        application: applicationId,
        level: "L0",
        assignedTo: req.admin._id,
      }).session(session);

      if (!screening) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message:
              "Application not found or not assigned to you.",
          },
        };
        return;
      }

      if (screening.status === "Pending") {
        operationResult = {
          statusCode: 409,
          body: {
            success: false,
            message:
              "Start screening before updating the checklist.",
          },
        };
        return;
      }

      if (
        screening.status === "Completed" ||
        screening.status === "Cancelled"
      ) {
        operationResult = {
          statusCode: 409,
          body: {
            success: false,
            message:
              "The checklist cannot be changed after screening is completed or cancelled.",
            currentStatus: screening.status,
          },
        };
        return;
      }

      const previousChecklist = formatChecklist(
        screening.checklist?.toObject
          ? screening.checklist.toObject()
          : screening.checklist
      );

      const updatedChecklist = {
        ...previousChecklist,
      };

      for (const field of suppliedFields) {
        updatedChecklist[field] =
          field === "additionalNotes"
            ? checklistInput[field].trim()
            : checklistInput[field];
      }

      const candidate = await Candidate.findById(
        screening.application
      ).session(session);

      if (!candidate) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message: "Application not found.",
          },
        };
        return;
      }

      const previousStatus = candidate.status;
      const previousScreeningStatus = screening.status;

      screening.checklist = updatedChecklist;

      const updatedAt = new Date();

      screening.history.push({
        action: "CHECKLIST_UPDATED",
        applicationId: candidate._id,
        candidateName: candidate.name || "",
        screenerName: req.admin.name || "",
        previousStatus,
        newStatus: candidate.status,
        previousScreeningStatus,
        newScreeningStatus: screening.status,
        performedBy: req.admin._id,
        performedByType: "HUMAN",
        performedById: req.admin._id.toString(),
        performedByName: req.admin.name || "",
        assignedTo: req.admin._id,
        remarks:
          updatedChecklist.additionalNotes || "Checklist updated.",
        feedback: "Screening checklist updated.",
        createdAt: updatedAt,
      });

      await screening.save({ session });

      await createAuditLog({
        req,
        action: "L0_SCREENING_CHECKLIST_UPDATED",
        targetType: "Candidate",
        targetId: screening.application,
        targetLabel: `Application ${screening.application}`,
        department: req.admin.department || "",
        outcome: "SUCCESS",
        before: {
          checklist: previousChecklist,
        },
        after: {
          checklist: updatedChecklist,
        },
        reason:
          "Assigned L0 screener updated the screening checklist.",
        session,
      });

      operationResult = {
        statusCode: 200,
        body: {
          success: true,
          message:
            "Screening checklist updated successfully.",
          applicationId: screening.application,
          screeningId: screening._id,
          screeningStatus: screening.status,
          checklist: updatedChecklist,
          updatedAt: screening.updatedAt,
        },
      };
    });

    return res
      .status(operationResult.statusCode)
      .json(operationResult.body);
  } catch (error) {
    console.error(
      "Update L0 screening checklist error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update screening checklist.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// =====================================================
// 6. SUBMIT L0 SCREENING DECISION
// POST /api/screener/applications/:applicationId/decision
// =====================================================

export const submitL0ScreeningDecision = async (
  req,
  res
) => {
  let session;

  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can submit screening decisions.",
      });
    }

    const applicationId =
      req.params.applicationId || req.params.id;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const {
      decision: requestedDecision,
      feedback = "",
      remarks = "",
      rejectionReason = "",
      escalationReason = "",
    } = req.body || {};

    const decisionValue =
      typeof requestedDecision === "string"
        ? requestedDecision.trim()
        : "";

    if (!SCREENING_DECISIONS.includes(decisionValue)) {
      return res.status(400).json({
        success: false,
        message: "Invalid screening decision.",
        allowedValues: [
          "SHORTLIST",
          "REJECT",
          "ON_HOLD",
          "ESCALATE",
        ],
      });
    }

    const decision =
      LEGACY_DECISION_MAP[decisionValue] ||
      decisionValue;

    const textFields = {
      feedback: {
        value: feedback,
        maxLength: 5000,
      },
      remarks: {
        value: remarks,
        maxLength: 2000,
      },
      rejectionReason: {
        value: rejectionReason,
        maxLength: 2000,
      },
      escalationReason: {
        value: escalationReason,
        maxLength: 2000,
      },
    };

    for (const [field, config] of Object.entries(
      textFields
    )) {
      if (
        typeof config.value !== "string" ||
        config.value.length > config.maxLength
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${field} must be text with a maximum of ${config.maxLength} characters.`,
        });
      }
    }

    const cleanFeedback = feedback.trim();
    const cleanRemarks = remarks.trim();
    const cleanRejectionReason =
      rejectionReason.trim();
    const cleanEscalationReason =
      escalationReason.trim();

    if (
      decision === "REJECT" &&
      !cleanRejectionReason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A rejection reason is required when rejecting an application.",
      });
    }

    if (
      decision === "ESCALATE" &&
      !cleanEscalationReason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "An escalation reason is required when escalating an application.",
      });
    }

    session = await mongoose.startSession();

    let operationResult;

    await session.withTransaction(async () => {
      const screening = await Screening.findOne({
        application: applicationId,
        level: "L0",
        assignedTo: req.admin._id,
      }).session(session);

      if (!screening) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message:
              "Application not found or not assigned to you.",
          },
        };
        return;
      }

      if (screening.status !== "In Progress") {
        operationResult = {
          statusCode: 409,
          body: {
            success: false,
            message:
              "Start screening before submitting a decision.",
            currentStatus: screening.status,
          },
        };
        return;
      }

      const candidate = await Candidate.findById(
        screening.application
      ).session(session);

      if (!candidate) {
        operationResult = {
          statusCode: 404,
          body: {
            success: false,
            message: "Application not found.",
          },
        };
        return;
      }

      const previousState = {
        screeningStatus: screening.status,
        decision: screening.decision,
        candidateStatus: candidate.status,
        currentStage: candidate.currentStage,
      };

      let hrReviewRequired = false;

      switch (decision) {
        case "SHORTLIST":
          candidate.status = "L0_SHORTLISTED";
          candidate.currentStage = "L1_INTERVIEW";
          break;

        case "REJECT":
          candidate.status = "L0_REJECTED";
          candidate.currentStage = "CLOSED";
          break;

        case "ON_HOLD":
          candidate.status = "L0_ON_HOLD";
          candidate.currentStage = "HR_REVIEW";
          hrReviewRequired = true;
          break;

        case "ESCALATE":
          candidate.status = "HR_REVIEW_REQUIRED";
          candidate.currentStage = "HR_REVIEW";
          hrReviewRequired = true;
          break;

        default:
          throw new Error(
            "Unsupported screening decision."
          );
      }

      const submittedAt = new Date();

      screening.status = "Completed";
      screening.decision = decision;
      screening.feedback = cleanFeedback;
      screening.remarks = cleanRemarks;

      screening.rejectionReason =
        decision === "REJECT"
          ? cleanRejectionReason
          : "";

      screening.escalationReason =
        decision === "ESCALATE"
          ? cleanEscalationReason
          : "";

      screening.submittedAt = submittedAt;

      screening.history.push({
        action: "SUBMITTED",
        applicationId: candidate._id,
        candidateName: candidate.name || "",
        screenerName: req.admin.name || "",
        previousStatus: previousState.candidateStatus,
        newStatus: candidate.status,
        previousScreeningStatus: previousState.screeningStatus,
        newScreeningStatus: screening.status,
        performedBy: req.admin._id,
        performedByType: "HUMAN",
        performedById: req.admin._id.toString(),
        performedByName: req.admin.name || "",
        assignedTo: req.admin._id,
        decision,
        feedback: cleanFeedback,
        remarks: cleanRemarks,
        rejectionReason: screening.rejectionReason,
        createdAt: submittedAt,
      });

      if (hrReviewRequired) {
        const hrReviewReason =
          decision === "ESCALATE"
            ? cleanEscalationReason
            : cleanRemarks ||
              cleanFeedback ||
              "Application placed on hold for HR review.";

        screening.history.push({
          action: "HR_REVIEW_REQUESTED",
          applicationId: candidate._id,
          candidateName: candidate.name || "",
          screenerName: req.admin.name || "",
          previousStatus: previousState.candidateStatus,
          newStatus: candidate.status,
          previousScreeningStatus: previousState.screeningStatus,
          newScreeningStatus: screening.status,
          performedBy: req.admin._id,
          performedByType: "HUMAN",
          performedById: req.admin._id.toString(),
          performedByName: req.admin.name || "",
          assignedTo: req.admin._id,
          decision,
          feedback: hrReviewReason,
          remarks: hrReviewReason,
          rejectionReason: screening.rejectionReason,
          createdAt: submittedAt,
        });
      }

      await candidate.save({ session });
      await screening.save({ session });

      await createAuditLog({
        req,
        action: "L0_SCREENING_DECISION_SUBMITTED",
        targetType: "Candidate",
        targetId: candidate._id,
        targetLabel: candidate.name,
        department: candidate.department || "",
        outcome: "SUCCESS",
        before: previousState,
        after: {
          screeningStatus: screening.status,
          decision: screening.decision,
          candidateStatus: candidate.status,
          currentStage: candidate.currentStage,
          feedback: cleanFeedback,
          remarks: cleanRemarks,
          rejectionReason: cleanRejectionReason,
          escalationReason: cleanEscalationReason,
          hrReviewRequired,
        },
        reason:
          cleanRejectionReason ||
          cleanEscalationReason ||
          cleanRemarks ||
          cleanFeedback ||
          `L0 screening decision: ${decision}`,
        session,
      });

      operationResult = {
        statusCode: 200,
        body: {
          success: true,
          message:
            "L0 screening decision submitted successfully.",
          screening: {
            id: screening._id,
            application: screening.application,
            level: screening.level,
            status: screening.status,
            decision: screening.decision,
            submittedAt: screening.submittedAt,
          },
          candidate: {
            id: candidate._id,
            status: candidate.status,
            currentStage: candidate.currentStage,
          },
          hrReviewRequired,
        },
      };
    });

    return res
      .status(operationResult.statusCode)
      .json(operationResult.body);
  } catch (error) {
    console.error(
      "Submit L0 screening decision error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit L0 screening decision.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// =====================================================
// LEGACY SCREENING SUBMISSION
// POST /api/applications/:id/screenings/l0
// =====================================================

export const submitL0Screening = async (req, res) => {
  return submitL0ScreeningDecision(req, res);
};

// =====================================================
// 7. HR REVIEW REQUEST LIST
// GET /api/screener/hr-review-requests
// =====================================================

export const getL0HRReviewRequests = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view HR review requests.",
      });
    }

    // -------------------------------------------------
    // PAGINATION VALIDATION
    // -------------------------------------------------

    const page = parsePositiveIntegerQuery(
      req.query.page,
      1
    );

    if (page === null) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer.",
      });
    }

    const limit = parsePositiveIntegerQuery(
      req.query.limit,
      20,
      100
    );

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be a positive integer between 1 and 100.",
      });
    }

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Pagination values are too large.",
      });
    }

    const requestedDecision = req.query.decision
      ? String(req.query.decision).trim()
      : "";

    const normalizedDecision =
      LEGACY_DECISION_MAP[requestedDecision] ||
      requestedDecision;

    if (
      normalizedDecision &&
      !["ON_HOLD", "ESCALATE"].includes(
        normalizedDecision
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid HR review decision filter.",
        allowedValues: ["ON_HOLD", "ESCALATE"],
      });
    }

    const filter = {
      assignedTo: req.admin._id,
      level: "L0",
      status: "Completed",
      decision: {
        $in: HR_REVIEW_DECISIONS,
      },
    };

    if (normalizedDecision) {
      filter.decision =
        normalizedDecision === "ON_HOLD"
          ? { $in: ["ON_HOLD", "On Hold"] }
          : "ESCALATE";
    }

    const [total, screenings] = await Promise.all([
      Screening.countDocuments(filter),

      Screening.find(filter)
        .select(
          [
            "application",
            "level",
            "assignedTo",
            "status",
            "decision",
            "feedback",
            "remarks",
            "escalationReason",
            "history",
            "submittedAt",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .populate(applicationPopulate)
        .sort({
          submittedAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const requests = screenings
      .filter((screening) => screening.application)
      .map((screening) => {
        const historyEntry =
          getLatestHRReviewEntry(screening);

        return {
          screeningId: screening._id,
          applicationId: screening.application._id,

          decision:
            LEGACY_DECISION_MAP[screening.decision] ||
            screening.decision,

          requestReason:
            getHRReviewReason(screening),

          requestStatus: "REQUESTED",

          requestedAt:
            historyEntry?.createdAt ||
            screening.submittedAt,

          application: safeCandidateDetails(
            screening.application
          ),
        };
      });

    return res.status(200).json({
      success: true,
      total,
      requests,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get L0 HR review requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch HR review requests.",
    });
  }
};

// =====================================================
// 8. HR REVIEW REQUEST DETAILS
// GET /api/screener/hr-review-requests/:applicationId
// =====================================================

export const getL0HRReviewRequestDetails = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view HR review request details.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const screening = await Screening.findOne({
      application: applicationId,
      level: "L0",
      assignedTo: req.admin._id,
      status: "Completed",
      decision: {
        $in: HR_REVIEW_DECISIONS,
      },
    })
      .select(
        [
          "application",
          "level",
          "assignedTo",
          "status",
          "decision",
          "feedback",
          "remarks",
          "rejectionReason",
          "escalationReason",
          "checklist",
          "history",
          "assignedAt",
          "startedAt",
          "submittedAt",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .populate(applicationPopulate)
      .lean();

    if (!screening || !screening.application) {
      return res.status(404).json({
        success: false,
        message:
          "HR review request not found or not accessible to you.",
      });
    }

    const historyEntry =
      getLatestHRReviewEntry(screening);

    return res.status(200).json({
      success: true,

      request: {
        screeningId: screening._id,
        applicationId: screening.application._id,

        decision:
          LEGACY_DECISION_MAP[screening.decision] ||
          screening.decision,

        requestReason:
          getHRReviewReason(screening),

        requestStatus: "REQUESTED",

        requestedAt:
          historyEntry?.createdAt ||
          screening.submittedAt,
      },

      application: safeCandidateDetails(
        screening.application
      ),

      screening: {
        status: screening.status,
        feedback: screening.feedback,
        remarks: screening.remarks,
        checklist: formatChecklist(
          screening.checklist
        ),
        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,
        history: (screening.history || []).map(formatHistoryEntry),
      },
    });
  } catch (error) {
    console.error(
      "Get L0 HR review request details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch HR review request details.",
    });
  }
};

// =====================================================
// 9. LEGACY SCREENING HISTORY
// GET /api/applications/:id/screenings
// =====================================================

export const getApplicationScreeningHistory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const candidateExists = await Candidate.exists({
      _id: id,
    });

    if (!candidateExists) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const screening = await Screening.findOne({
      application: id,
      level: "L0",
    })
      .populate(
        "assignedTo",
        "name email role designation department"
      )
      .populate(
        "assignedBy",
        "name email role designation department"
      )
      .populate(
        "history.performedBy",
        "name email role designation department"
      )
      .populate(
        "history.assignedTo",
        "name email role designation department"
      )
      .lean();

    const user = req.admin;
    const userId = user?._id?.toString();

    const isAssignedScreener =
      isAuthorizedL0Screener(user) &&
      screening &&
      (
        screening.assignedTo?._id?.toString() === userId ||
        screening.history?.some(
          (entry) =>
            entry.performedBy?._id?.toString() === userId ||
            entry.assignedTo?._id?.toString() === userId
        )
      );

    if (
      !isReadOnlyOversightUser(user) &&
      !isAssignedScreener
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view this screening history.",
      });
    }

    const history = (screening?.history || []).map(
      formatHistoryEntry
    );

    return res.status(200).json({
      success: true,
      applicationId: id,
      screening: screening
        ? { ...screening, history }
        : null,
      history,
    });
  } catch (error) {
    console.error(
      "Get screening history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening history.",
    });
  }
};

// =====================================================
// 10. L0 SCREENING STATISTICS
// GET /api/screenings/l0/stats
// =====================================================

export const getL0ScreeningStats = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view personal screening statistics.",
      });
    }

    const result = await Screening.aggregate([
      {
        $match: {
          assignedTo: req.admin._id,
          level: "L0",
        },
      },
      {
        $group: {
          _id: null,

          totalAssigned: { $sum: 1 },

          pending: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Pending"] },
                1,
                0,
              ],
            },
          },

          inProgress: {
            $sum: {
              $cond: [
                { $eq: ["$status", "In Progress"] },
                1,
                0,
              ],
            },
          },

          completed: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Completed"] },
                1,
                0,
              ],
            },
          },

          rejected: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$decision",
                    ["REJECT", "Rejected"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          selected: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$decision",
                    ["SHORTLIST", "Selected"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          onHold: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$decision",
                    ["ON_HOLD", "On Hold"],
                  ],
                },
                1,
                0,
              ],
            },
          },

          escalated: {
            $sum: {
              $cond: [
                { $eq: ["$decision", "ESCALATE"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    const stats = result[0] || {
      totalAssigned: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0,
      selected: 0,
      onHold: 0,
      escalated: 0,
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(
      "Get L0 screening stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening statistics.",
    });
  }
};

// =====================================================
// 11. SCREENER SCREENING HISTORY
// GET /api/screener/history
// =====================================================

export const getL0ScreeningHistory = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view screening history.",
      });
    }

    // -------------------------------------------------
    // PAGINATION VALIDATION
    // -------------------------------------------------

    const page = parsePositiveIntegerQuery(
      req.query.page,
      1
    );

    if (page === null) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be a positive integer.",
      });
    }

    const limit = parsePositiveIntegerQuery(
      req.query.limit,
      20,
      100
    );

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be a positive integer between 1 and 100.",
      });
    }

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Pagination values are too large.",
      });
    }

    const requestedDecision = req.query.decision
      ? String(req.query.decision).trim()
      : "";

    const filter = {
      level: "L0",
      status: {
        $in: ["Completed", "Cancelled"],
      },
      $or: [
        { assignedTo: req.admin._id },
        { "history.performedBy": req.admin._id },
        { "history.assignedTo": req.admin._id },
      ],
    };

    if (requestedDecision) {
      if (
        !SCREENING_DECISIONS.includes(requestedDecision)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid decision filter.",
          allowedValues: SCREENING_DECISIONS,
        });
      }

      const normalizedDecision =
        LEGACY_DECISION_MAP[requestedDecision] ||
        requestedDecision;

      const legacyValues = Object.entries(
        LEGACY_DECISION_MAP
      )
        .filter(
          ([, value]) =>
            value === normalizedDecision
        )
        .map(([key]) => key);

      filter.decision = {
        $in: [normalizedDecision, ...legacyValues],
      };
    }

    const [total, screenings] = await Promise.all([
      Screening.countDocuments(filter),

      Screening.find(filter)
        .select(
          [
            "application",
            "level",
            "assignedTo",
            "status",
            "decision",
            "feedback",
            "remarks",
            "rejectionReason",
            "escalationReason",
            "assignedAt",
            "startedAt",
            "submittedAt",
            "history",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .populate(applicationPopulate)
        .sort({
          submittedAt: -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const records = screenings
      .filter((screening) => screening.application)
      .map((screening) => ({
        screeningId: screening._id,
        applicationId: screening.application._id,
        screeningStatus: screening.status,

        decision:
          LEGACY_DECISION_MAP[screening.decision] ||
          screening.decision,

        feedback: screening.feedback,
        remarks: screening.remarks,
        rejectionReason: screening.rejectionReason,
        escalationReason: screening.escalationReason,

        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,

        historyCount: screening.history?.length || 0,
        history: (screening.history || []).map(formatHistoryEntry),

        application: safeCandidateDetails(
          screening.application
        ),
      }));

    return res.status(200).json({
      success: true,
      total,
      records,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get L0 screening history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening history.",
    });
  }
};

// =====================================================
// 12. INDIVIDUAL APPLICATION SCREENING HISTORY
// GET /api/screener/history/:applicationId
// =====================================================

export const getL0ApplicationHistoryDetails = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view screening history.",
      });
    }

    const { applicationId } = req.params;

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const screening = await Screening.findOne({
      application: applicationId,
      level: "L0",
      status: {
        $in: ["Completed", "Cancelled"],
      },
      $or: [
        { assignedTo: req.admin._id },
        { "history.performedBy": req.admin._id },
        { "history.assignedTo": req.admin._id },
      ],
    })
      .select(
        [
          "application",
          "level",
          "assignedTo",
          "status",
          "decision",
          "feedback",
          "remarks",
          "rejectionReason",
          "escalationReason",
          "checklist",
          "assignedAt",
          "startedAt",
          "submittedAt",
          "history",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .populate(applicationPopulate)
      .populate(
        "history.performedBy",
        "name email role designation department"
      )
      .populate(
        "history.assignedTo",
        "name email role designation department"
      )
      .lean();

    if (!screening || !screening.application) {
      return res.status(404).json({
        success: false,
        message:
          "Screening history not found or you do not have access.",
      });
    }

    return res.status(200).json({
      success: true,

      applicationId: screening.application._id,

      application: safeCandidateDetails(
        screening.application
      ),

      screening: {
        id: screening._id,
        level: screening.level,
        status: screening.status,

        decision:
          LEGACY_DECISION_MAP[screening.decision] ||
          screening.decision,

        feedback: screening.feedback,
        remarks: screening.remarks,
        rejectionReason: screening.rejectionReason,
        escalationReason: screening.escalationReason,

        checklist: formatChecklist(
          screening.checklist
        ),

        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt,
      },

      history: (screening.history || []).map(formatHistoryEntry),
    });
  } catch (error) {
    console.error(
      "Get individual L0 screening history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch application screening history.",
    });
  }
};

// =====================================================
// 13. DASHBOARD SUMMARY
// GET /api/screener/dashboard
//
// Returns assigned workload and decision statistics.
// =====================================================

export const getL0Dashboard = async (req, res) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view the dashboard.",
      });
    }

    const screenerId = req.admin._id;

    const [aggregation, hrReviewRequests] =
      await Promise.all([
        Screening.aggregate([
          {
            $match: {
              assignedTo: screenerId,
              level: "L0",
            },
          },
          {
            $group: {
              _id: null,

              totalAssigned: { $sum: 1 },

              pending: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "Pending"] },
                    1,
                    0,
                  ],
                },
              },

              inProgress: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "In Progress"] },
                    1,
                    0,
                  ],
                },
              },

              completed: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "Completed"] },
                    1,
                    0,
                  ],
                },
              },

              shortlisted: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$decision",
                        ["SHORTLIST", "Selected"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rejected: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$decision",
                        ["REJECT", "Rejected"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              onHold: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$decision",
                        ["ON_HOLD", "On Hold"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              escalated: {
                $sum: {
                  $cond: [
                    { $eq: ["$decision", "ESCALATE"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ]),

        Screening.countDocuments({
          assignedTo: screenerId,
          level: "L0",
          status: "Completed",
          decision: {
            $in: ["ON_HOLD", "On Hold", "ESCALATE"],
          },
        }),
      ]);

    const stats = aggregation[0] || {
      totalAssigned: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      shortlisted: 0,
      rejected: 0,
      onHold: 0,
      escalated: 0,
    };

    stats.hrReviewRequests = hrReviewRequests;

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully.",

      dashboard: {
        screener: {
          id: req.admin._id,
          name: req.admin.name || "",
          department: req.admin.department || "",
        },

        stats,
      },
    });
  } catch (error) {
    console.error("Get L0 dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard data.",
    });
  }
};

// =====================================================
// 14. DASHBOARD RECENT APPLICATIONS
// GET /api/screener/dashboard/recent-applications
// =====================================================

export const getL0DashboardRecentApplications = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view recent applications.",
      });
    }

    // -------------------------------------------------
    // LIMIT VALIDATION
    // -------------------------------------------------

    const limit = parsePositiveIntegerQuery(
      req.query.limit,
      5,
      20
    );

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be a positive integer between 1 and 20.",
      });
    }

    const screenings = await Screening.find({
      assignedTo: req.admin._id,
      level: "L0",
    })
      .select(
        [
          "application",
          "level",
          "status",
          "decision",
          "feedback",
          "assignedAt",
          "startedAt",
          "submittedAt",
        ].join(" ")
      )
      .populate(applicationPopulate)
      .sort({
        assignedAt: -1,
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    const applications = screenings
      .filter((screening) => screening.application)
      .map((screening) => ({
        screeningId: screening._id,

        screeningStatus: screening.status,
        decision: screening.decision,
        feedback: screening.feedback,

        assignedAt: screening.assignedAt,
        startedAt: screening.startedAt,
        submittedAt: screening.submittedAt,

        application: safeCandidateDetails(
          screening.application
        ),
      }));

    return res.status(200).json({
      success: true,
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Get dashboard recent applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve recent applications.",
    });
  }
};

// =====================================================
// 15. DASHBOARD RECENT ACTIVITY
// GET /api/screener/dashboard/recent-activity
//
// Reads the existing audit log records.
// Does not expose sensitive before/after snapshots.
// =====================================================

export const getL0DashboardRecentActivity = async (
  req,
  res
) => {
  try {
    if (!isAuthorizedL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only an active L0 screener can view recent activity.",
      });
    }

    // -------------------------------------------------
    // LIMIT VALIDATION
    // -------------------------------------------------

    const limit = parsePositiveIntegerQuery(
      req.query.limit,
      10,
      50
    );

    if (limit === null) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be a positive integer between 1 and 50.",
      });
    }

    const activities = await AuditLog.find({
      actorType: "HUMAN",
      actor: req.admin._id,

      action: {
        $in: [
          "L0_SCREENING_STARTED",
          "L0_SCREENING_CHECKLIST_UPDATED",
          "L0_SCREENING_DECISION_SUBMITTED",
        ],
      },
    })
      .select(
        [
          "action",
          "targetType",
          "targetId",
          "targetLabel",
          "department",
          "outcome",
          "reason",
          "actorName",
          "roleUsed",
          "createdAt",
        ].join(" ")
      )
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    const recentActivity = activities.map(
      (activity) => ({
        id: activity._id,

        action: activity.action,

        resourceType: activity.targetType,
        resourceId: activity.targetId,
        resourceLabel: activity.targetLabel,

        department: activity.department,

        outcome: activity.outcome,
        reason: activity.reason,

        performedBy:
          activity.actorName ||
          req.admin.name ||
          "",

        role: activity.roleUsed,

        createdAt: activity.createdAt,
      })
    );

    return res.status(200).json({
      success: true,
      total: recentActivity.length,
      activities: recentActivity,
    });
  } catch (error) {
    console.error(
      "Get dashboard recent activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve recent activity.",
    });
  }
};

// =====================================================
// 16. L0 SCREENER PROFILE
// =====================================================

// Safe profile response.
// Never expose passwords, tokens or internal account fields.

const getL0ProfileData = (admin) => ({
  _id: admin._id,
  name: admin.name || "",
  email: admin.email || "",
  phone: admin.phone || "",
  role: admin.role || "",
  designation: admin.designation || "",
  department: admin.department || "",
  status: admin.status || "",
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

// =====================================================
// GET L0 SCREENER PROFILE
// GET /api/screener/profile
// =====================================================

export const getL0Profile = async (req, res) => {
  try {
    const admin = req.admin;

    if (!isAuthorizedL0Screener(admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only authorized L0 Screeners can access this profile.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      profile: getL0ProfileData(admin),
    });
  } catch (error) {
    console.error("Get L0 profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch L0 screener profile.",
    });
  }
};

// =====================================================
// UPDATE L0 SCREENER PROFILE
// PATCH /api/screener/profile
//
// Allowed fields:
// 1. name
// 2. phone
//
// Email, role, designation, department and account
// permissions cannot be changed through this endpoint.
// =====================================================

export const updateL0Profile = async (req, res) => {
  try {
    const admin = req.admin;

    if (!isAuthorizedL0Screener(admin)) {
      return res.status(403).json({
        success: false,
        message:
          "Only authorized L0 Screeners can update this profile.",
      });
    }

    const body = req.body || {};

    if (
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data.",
      });
    }

    const allowedFields = ["name", "phone"];

    const unexpectedFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "You can update only your name and phone number.",
        restrictedFields: unexpectedFields,
      });
    }

    if (Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one profile field to update.",
      });
    }

    const updates = {};

    // Validate name.
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (typeof body.name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Name must be a valid string.",
        });
      }

      const name = body.name.trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 100 characters.",
        });
      }

      updates.name = name;
    }

    // Validate phone.
    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      if (typeof body.phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Phone number must be a valid string.",
        });
      }

      const phone = body.phone.trim();

      if (phone.length > 30) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number cannot exceed 30 characters.",
        });
      }

      updates.phone = phone;
    }

    // Capture previous values for audit logging.
    const previousProfile = {
      name: admin.name || "",
      phone: admin.phone || "",
    };

    const hasChanges = Object.entries(updates).some(
      ([field, value]) =>
        previousProfile[field] !== value
    );

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: "No profile changes detected.",
        profile: getL0ProfileData(admin),
      });
    }

    Object.assign(admin, updates);

    await admin.save();

    await createAuditLog({
      req,
      action: "L0_SCREENER_PROFILE_UPDATED",
      targetType: "Admin",
      targetId: admin._id,
      targetLabel: admin.name || admin.email,
      department: admin.department || "",
      outcome: "SUCCESS",
      before: previousProfile,
      after: {
        name: admin.name || "",
        phone: admin.phone || "",
      },
      reason:
        "L0 Screener updated their own profile information.",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: getL0ProfileData(admin),
    });
  } catch (error) {
    console.error("Update L0 profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update L0 screener profile.",
    });
  }
};