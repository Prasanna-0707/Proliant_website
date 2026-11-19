
import mongoose from "mongoose";

import Candidate from "../models/Candidate.js";
import AuditLog from "../../administrator/models/AuditLog.js";
import Job from "../../hr/models/HRJob.js";

import {
  generateCandidatesExcel,
} from "../../../shared/services/excelService.js";

import {
  sendCandidateApplicationThankYouEmail,
  sendCandidateShortlistedEmailToHR,
  sendCandidateRejectedEmail,
} from "../../../shared/services/emailService.js";

import {
  assignL0ScreenerByWorkload,
} from "../../../shared/services/screenerAssignmentService.js";
import { notifyStaff, notifyHr } from "../../../shared/services/notificationService.js";

import { createAuditLog } from "../../../shared/services/auditLogService.js";

import {
  getActiveRole,
  isActiveAccount,
  isGlobalAdministrator,
  normalizeRole,
} from "../../../shared/services/authorizationService.js";

// =====================================================
// CONSTANTS
// =====================================================

const ALLOWED_NOTICE_PERIODS = [
  "Immediately",
  "30 Days",
  "60 Days",
  "90 Days",
];

const L0_WORKFLOW_STATUSES = [
  "ASSIGNED_TO_L0",
  "L0_SHORTLISTED",
  "L0_REJECTED",
  "L0_ON_HOLD",
  "HR_REVIEW_REQUIRED",
];

// Only HR-specific roles can confirm joining.
// Recruiter and combined HR/Recruiter roles are excluded.
const HR_JOINING_ROLES = new Set([
  "hr",
  "hr admin",
  "hr manager",
]);

const BUSINESS_TIME_ZONE =
  process.env.BUSINESS_TIME_ZONE || "Asia/Kolkata";

// =====================================================
// HELPERS
// =====================================================

const isOptionalString = (value) =>
  value === undefined ||
  value === null ||
  typeof value === "string";

const getSafeCandidate = (candidate) => {
  const data = candidate.toObject
    ? candidate.toObject()
    : { ...candidate };

  // Never expose stored resume contents or file paths.
  delete data.resume;

  return data;
};

// =====================================================
// JOINING CONFIRMATION HELPERS
// =====================================================

// Obtain the current business date independently of the
// server's operating-system timezone.

const getBusinessDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const dateParts = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, value])
  );

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

// Validate a strict YYYY-MM-DD calendar date.

const parseJoiningDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const parsedDate = new Date(
    `${value}T00:00:00.000Z`
  );

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return parsedDate;
};

// Format a stored joining date as YYYY-MM-DD.

const formatJoiningDate = (value) => {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

// HR and Global Administrators may confirm joining.
// Recruiters and Department Administrators cannot.

const canConfirmCandidateJoining = (
  user,
  activeRole
) => {
  const normalizedRole = normalizeRole(activeRole);

  const isAuthorizedHR =
    HR_JOINING_ROLES.has(normalizedRole);

  const isAuthorizedGlobalAdministrator =
    isGlobalAdministrator(user, activeRole);

  return (
    isAuthorizedHR ||
    isAuthorizedGlobalAdministrator
  );
};

// =====================================================
// CREATE CANDIDATE
// POST /api/candidates
//
// Workflow:
// 1. Validate candidate information.
// 2. Validate the selected published job.
// 3. Create the candidate application.
// 4. Automatically assign an L0 screener.
// 5. Update the candidate assignment status.
// 6. Send application acknowledgement email.
// 7. Return application and assignment information.
// =====================================================

export const createCandidate = async (req, res) => {
  try {
    const {
      jobId,
      areaOfInterest,
      name,
      email,
      phone,
      isFresher,
      location,
      yearsOfExperience,
      highestQualification,
      currentCompany,
      noticePeriod,
      coverMessage,
      resume,
    } = req.body || {};

    // -------------------------------------------------
    // 1. VALIDATE JOB ID
    // -------------------------------------------------

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "A valid job ID is required.",
      });
    }

    // -------------------------------------------------
    // 2. VALIDATE REQUIRED CANDIDATE FIELDS
    // -------------------------------------------------

    const requiredFields = {
      areaOfInterest,
      name,
      email,
      phone,
      highestQualification,
      noticePeriod,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          typeof value !== "string" ||
          !value.trim()
      )
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required candidate fields are missing.",
        missingFields,
      });
    }

    if (isFresher !== true && isFresher !== false) {
      return res.status(400).json({
        success: false,
        message: "isFresher must be true or false.",
      });
    }

    // -------------------------------------------------
    // 3. VALIDATE EMAIL
    // -------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 254 ||
      !emailRegex.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // -------------------------------------------------
    // 4. VALIDATE NOTICE PERIOD
    // -------------------------------------------------

    if (!ALLOWED_NOTICE_PERIODS.includes(noticePeriod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice period.",
        allowedValues: ALLOWED_NOTICE_PERIODS,
      });
    }

    // -------------------------------------------------
    // 5. VALIDATE OPTIONAL FIELDS
    // -------------------------------------------------

    if (
      !isOptionalString(location) ||
      !isOptionalString(currentCompany) ||
      !isOptionalString(coverMessage) ||
      !isOptionalString(resume)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Optional candidate fields must contain text values.",
      });
    }

    if (
      typeof name !== "string" ||
      name.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate name cannot exceed 150 characters.",
      });
    }

    if (
      typeof phone !== "string" ||
      phone.trim().length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    if (
      coverMessage &&
      coverMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cover message cannot exceed 5000 characters.",
      });
    }

    if (
      resume &&
      resume.length > 21 * 1024 * 1024
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Resume exceeds the permitted storage size.",
      });
    }

    // -------------------------------------------------
    // 6. VALIDATE EXPERIENCE
    // -------------------------------------------------

    let experience = 0;

    if (
      !isFresher &&
      yearsOfExperience !== undefined
    ) {
      experience = Number(yearsOfExperience);

      if (
        !Number.isFinite(experience) ||
        experience < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Years of experience must be a valid non-negative number.",
        });
      }
    }

    // -------------------------------------------------
    // 7. FETCH AND VALIDATE JOB
    // -------------------------------------------------

    const now = new Date();

    const job = await Job.findOne({
      _id: jobId,
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
    })
      .select("_id title department status")
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "The selected job does not exist or is not currently accepting applications.",
      });
    }

    // -------------------------------------------------
    // 8. CREATE CANDIDATE
    // -------------------------------------------------

    const candidate = await Candidate.create({
      // Candidate information
      position: job.title,
      areaOfInterest: areaOfInterest.trim(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      isFresher,
      location: location?.trim() || "",
      yearsOfExperience: experience,
      highestQualification:
        highestQualification.trim(),

      currentCompany: isFresher
        ? ""
        : currentCompany?.trim() || "",

      noticePeriod,

      coverMessage:
        coverMessage?.trim() || "",

      resume: resume || undefined,

      // Job relationship
      job: job._id,
      department: job.department,

      // Initial recruitment workflow
      currentStage: "L0_SCREENING",

      assignedScreener: null,

      status: "New",
    });

    // -------------------------------------------------
    // 9. AUTOMATIC L0 SCREENER ASSIGNMENT
    // -------------------------------------------------

    let assignmentResult = {
      assigned: false,
      assignmentPending: true,
      reason:
        "Automatic screener assignment has not completed.",
    };

    try {
      assignmentResult =
        await assignL0ScreenerByWorkload(
          candidate._id,
          {
            requestId:
              req.headers?.["x-request-id"] || "",

            correlationId:
              req.headers?.["x-correlation-id"] || "",
          }
        );
    } catch (assignmentError) {
      // A valid candidate application must not be lost
      // because automatic assignment failed.
      console.error(
        "Automatic L0 screener assignment failed:",
        assignmentError
      );

      assignmentResult = {
        assigned: false,
        assignmentPending: true,
        reason:
          "Application received, but automatic screener assignment is pending.",
      };
    }

    // Staff notifications (never fail the registration).
    if (assignmentResult?.assigned && !assignmentResult.alreadyAssigned) {
      await notifyStaff(assignmentResult.screenerId, {
        title: "New screening assignment",
        message: `${candidate.name} applied for ${job.title} and has been assigned to you for L0 screening.`,
        type: "SCREENING",
        link: "/l0-screening",
        relatedApplication: candidate._id,
      });
    }

    await notifyHr({
      title: "New candidate application",
      message: `${candidate.name} applied for ${job.title} through the careers site.`,
      type: "WORKFLOW",
      link: "/hr/candidates",
      relatedApplication: candidate._id,
    });

    // -------------------------------------------------
    // 10. FETCH UPDATED CANDIDATE
    // -------------------------------------------------

    const updatedCandidate =
      await Candidate.findById(candidate._id);

    if (!updatedCandidate) {
      throw new Error(
        "Candidate was created but could not be retrieved."
      );
    }

    const screenerAssigned = Boolean(
      assignmentResult?.assigned &&
      updatedCandidate.assignedScreener
    );

    // -------------------------------------------------
    // 11. SEND APPLICATION ACKNOWLEDGEMENT EMAIL
    // -------------------------------------------------

    try {
      await sendCandidateApplicationThankYouEmail(
        updatedCandidate.email,
        updatedCandidate.name,
        updatedCandidate.position
      );
    } catch (emailError) {
      console.error(
        "Candidate thank-you email failed:",
        emailError.message
      );
    }

    // -------------------------------------------------
    // 12. RETURN SAFE RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Candidate application submitted successfully.",

      candidate: getSafeCandidate(updatedCandidate),

      workflow: {
        currentStage:
          updatedCandidate.currentStage,

        status:
          updatedCandidate.status,

        screenerAssigned,

        assignmentPending:
          !screenerAssigned,

        assignedScreener:
          updatedCandidate.assignedScreener || null,

        screenerName:
          assignmentResult?.screenerName || "",

        screeningId:
          assignmentResult?.screeningId || null,

        assignmentMessage: screenerAssigned
          ? "Application automatically assigned to an L0 screener."
          : "Application received. Screener assignment is pending.",

        assignmentReason:
          assignmentResult?.reason || "",
      },
    });
  } catch (error) {
    console.error("Create candidate error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate application data.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A duplicate record was detected.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Candidate application creation failed.",
    });
  }
};

// =====================================================
// GET ALL CANDIDATES
// GET /api/candidates
// =====================================================

export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate("job", "title department status")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.error("Get candidates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidates.",
    });
  }
};

// =====================================================
// GET SINGLE CANDIDATE
// GET /api/candidates/:id
// =====================================================

export const getCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const candidate = await Candidate.findById(id)
      .populate("job", "title department status");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error("Get candidate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate.",
    });
  }
};

// =====================================================
// UPDATE CANDIDATE
// PUT /api/candidates/:id
// =====================================================

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    const body = req.body || {};

    // Job association, L0 workflow and joining fields
    // are controlled by backend services, not direct clients.

    const protectedFields = [
      "jobId",
      "job",
      "department",
      "currentStage",
      "assignedScreener",
      "joinedAt",
    ];

    const attemptedProtectedFields =
      protectedFields.filter((field) =>
        Object.prototype.hasOwnProperty.call(
          body,
          field
        )
      );

    if (attemptedProtectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Job association, recruitment workflow and joining fields cannot be modified through this endpoint.",
        fields: attemptedProtectedFields,
      });
    }

    // New L0 workflow statuses must be changed through
    // the dedicated Screener decision APIs.
    if (L0_WORKFLOW_STATUSES.includes(body.status)) {
      return res.status(400).json({
        success: false,
        message:
          "L0 workflow statuses must be updated through the screening workflow APIs.",
      });
    }

    const oldStatus = candidate.status;

    const {
      position,
      areaOfInterest,
      name,
      email,
      phone,
      isFresher,
      location,
      yearsOfExperience,
      highestQualification,
      currentCompany,
      noticePeriod,
      coverMessage,
      resume,
      status,
    } = body;

    // -------------------------------------------------
    // UPDATE ONLY PROVIDED FIELDS
    // -------------------------------------------------

    if (position !== undefined) {
      candidate.position = position;
    }

    if (areaOfInterest !== undefined) {
      candidate.areaOfInterest = areaOfInterest;
    }

    if (name !== undefined) {
      candidate.name = name;
    }

    if (email !== undefined) {
      candidate.email = email;
    }

    if (phone !== undefined) {
      candidate.phone = phone;
    }

    if (isFresher !== undefined) {
      candidate.isFresher = isFresher;
    }

    if (location !== undefined) {
      candidate.location = location;
    }

    if (yearsOfExperience !== undefined) {
      candidate.yearsOfExperience =
        yearsOfExperience;
    }

    if (highestQualification !== undefined) {
      candidate.highestQualification =
        highestQualification;
    }

    if (currentCompany !== undefined) {
      candidate.currentCompany =
        currentCompany;
    }

    if (noticePeriod !== undefined) {
      candidate.noticePeriod = noticePeriod;
    }

    if (coverMessage !== undefined) {
      candidate.coverMessage = coverMessage;
    }

    if (resume !== undefined) {
      candidate.resume = resume;
    }

    // Preserve legacy HR status updates.
    if (status !== undefined) {
      candidate.status = status;
    }

    await candidate.save();

    // -------------------------------------------------
    // STATUS EMAIL NOTIFICATIONS
    // -------------------------------------------------

    if (
      oldStatus !== candidate.status &&
      candidate.status === "Shortlisted"
    ) {
      try {
        await sendCandidateShortlistedEmailToHR(
          candidate
        );
      } catch (emailError) {
        console.error(
          "Shortlisted notification email failed:",
          emailError.message
        );
      }
    }

    if (
      oldStatus !== candidate.status &&
      candidate.status === "Rejected"
    ) {
      try {
        await sendCandidateRejectedEmail(
          candidate.email,
          candidate.name,
          candidate.position
        );
      } catch (emailError) {
        console.error(
          "Rejection email failed:",
          emailError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully.",
      candidate: getSafeCandidate(candidate),
    });
  } catch (error) {
    console.error("Update candidate error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate update data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Candidate update failed.",
    });
  }
};

// =====================================================
// CONFIRM CANDIDATE JOINING
// PATCH /api/candidates/:id/confirm-joining
//
// Authorized:
// 1. HR
// 2. HR Admin
// 3. HR Manager
// 4. Global Administrator
//
// Responsibilities:
// 1. Verify authenticated user and role.
// 2. Validate candidate ID.
// 3. Validate actual joining date.
// 4. Prevent duplicate confirmation.
// 5. Update Candidate.joinedAt.
// 6. Write an audit entry in the same transaction.
// 7. Preserve existing recruitment status.
// =====================================================

export const confirmCandidateJoining = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // 1. AUTHENTICATION
    // -------------------------------------------------

    const user = req.user;

    if (!user || !isActiveAccount(user)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // -------------------------------------------------
    // 2. ROLE AUTHORIZATION
    // -------------------------------------------------

    const activeRole = getActiveRole(
      user,
      req.activeRole
    );

    if (
      !activeRole ||
      !canConfirmCandidateJoining(user, activeRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only authorized HR personnel and Global Administrators can confirm candidate joining.",
      });
    }

    // -------------------------------------------------
    // 3. VALIDATE CANDIDATE ID
    // -------------------------------------------------

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    // -------------------------------------------------
    // 4. VALIDATE JOINING DATE
    // -------------------------------------------------

    const body = req.body || {};

    const joiningDateInput = body.joiningDate;

    const joiningDate = parseJoiningDate(
      joiningDateInput
    );

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message:
          "A valid joiningDate in YYYY-MM-DD format is required.",
      });
    }

    const today = getBusinessDate();

    if (joiningDateInput > today) {
      return res.status(400).json({
        success: false,
        message:
          "Future joining dates cannot be confirmed as actual joining.",
      });
    }

    // -------------------------------------------------
    // 5. VALIDATE REASON
    // -------------------------------------------------

    const reason =
      body.reason === undefined
        ? ""
        : body.reason;

    if (
      typeof reason !== "string" ||
      reason.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reason must be a string containing no more than 2000 characters.",
      });
    }

    // -------------------------------------------------
    // 6. DATABASE TRANSACTION
    // -------------------------------------------------

    const session = await mongoose.startSession();

    let operationResult = null;

    try {
      await session.withTransaction(async () => {
        // Reset for transaction callback retries.
        operationResult = null;

        // ---------------------------------------------
        // FETCH CANDIDATE
        // ---------------------------------------------

        const candidate = await Candidate.findById(id)
          .session(session);

        if (!candidate) {
          operationResult = {
            status: 404,
            message: "Candidate not found.",
          };

          return;
        }

        // ---------------------------------------------
        // PREVENT DUPLICATE CONFIRMATION
        // ---------------------------------------------

        if (candidate.joinedAt) {
          operationResult = {
            status: 409,
            message:
              "Joining has already been confirmed for this candidate. Use the joining-date correction process if the recorded date is incorrect.",
            joinedAt: candidate.joinedAt,
          };

          return;
        }

        // ---------------------------------------------
        // DERIVE DEPARTMENT FROM JOB
        // ---------------------------------------------

        // Candidate.job -> Job.department.
        // Candidate.department and Candidate.position
        // are not used as authoritative sources.

        const job = candidate.job
          ? await Job.findById(candidate.job)
              .select("_id title department")
              .session(session)
              .lean()
          : null;

        const department = String(
          job?.department || ""
        ).trim();

        // ---------------------------------------------
        // CAPTURE BEFORE SNAPSHOT
        // ---------------------------------------------

        const before = {
          joinedAt: candidate.joinedAt || null,
        };

        // ---------------------------------------------
        // CONFIRM JOINING
        // ---------------------------------------------

        candidate.joinedAt = joiningDate;

        // Do not automatically change candidate.status.
        // Joining is a separate recruitment outcome.

        await candidate.save({ session });

        // ---------------------------------------------
        // CREATE AUDIT RECORD
        // ---------------------------------------------

        const candidateLabel = [
          candidate.name,
          candidate.email,
        ]
          .filter(Boolean)
          .join(" - ") || candidate._id.toString();

        await createAuditLog({
          req,

          action: "CANDIDATE_JOINING_CONFIRMED",

          targetType: "Candidate",
          targetId: candidate._id,
          targetLabel: candidateLabel,

          department,

          before,

          after: {
            joinedAt: candidate.joinedAt,
          },

          reason: reason.trim(),

          metadata: {
            activeRole,
            joiningDate: joiningDateInput,
            jobId: job?._id?.toString() || "",
            jobTitle: job?.title || "",
            departmentSource: job
              ? "JOB"
              : "UNAVAILABLE",
          },

          session,
        });

        operationResult = {
          status: 200,
          candidate,
          department,
          job,
        };
      });
    } finally {
      await session.endSession();
    }

    // -------------------------------------------------
    // 7. HANDLE TRANSACTION RESULT
    // -------------------------------------------------

    if (!operationResult) {
      return res.status(500).json({
        success: false,
        message:
          "Joining confirmation could not be completed.",
      });
    }

    if (operationResult.status !== 200) {
      return res.status(operationResult.status).json({
        success: false,
        message: operationResult.message,

        ...(operationResult.joinedAt
          ? { joinedAt: operationResult.joinedAt }
          : {}),
      });
    }

    // -------------------------------------------------
    // 8. SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Candidate joining confirmed successfully.",

      joiningConfirmation: {
        joinedAt:
          operationResult.candidate.joinedAt,

        confirmedBy: user._id,

        confirmedByEmail: user.email,

        confirmedByRole: activeRole,

        department:
          operationResult.department || null,
      },

      candidate: getSafeCandidate(
        operationResult.candidate
      ),

      auditLogged: true,
    });
  } catch (error) {
    console.error(
      "Confirm candidate joining error:",
      error
    );

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate joining information.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Candidate joining confirmation failed.",
    });
  }
};

// =====================================================
// DELETE CANDIDATE
// DELETE /api/candidates/:id
// =====================================================

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    await candidate.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Candidate deleted successfully.",
    });
  } catch (error) {
    console.error("Delete candidate error:", error);

    return res.status(500).json({
      success: false,
      message: "Candidate deletion failed.",
    });
  }
};

// =====================================================
// EXPORT CANDIDATES TO EXCEL
// =====================================================

export const exportCandidatesExcel = async (
  req,
  res
) => {
  try {
    const candidates = await Candidate.find()
      .populate("job", "title department")
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
      Resume Storage is not implemented yet.

      When SharePoint Resume Storage is completed,
      resumeUrl will be populated through the
      secure resume storage integration.
    */

    const candidatesForExcel = candidates.map(
      (candidate) => ({
        ...candidate,
        resumeUrl: null,
      })
    );

    const excelBuffer =
      await generateCandidatesExcel(
        candidatesForExcel
      );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="candidates.xlsx"'
    );

    return res.status(200).send(excelBuffer);
  } catch (error) {
    console.error(
      "Candidate Excel export error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Candidate Excel export failed.",
    });
  }
};

// =====================================================
// CORRECT CANDIDATE JOINING DATE
// PATCH /api/candidates/:id/correct-joining-date
//
// Authorized:
// 1. HR
// 2. HR Admin
// 3. HR Manager
// 4. Global Administrator
//
// Responsibilities:
// 1. Verify authenticated user and role.
// 2. Validate candidate ID.
// 3. Require an existing joining confirmation.
// 4. Validate corrected joining date.
// 5. Require a mandatory correction reason.
// 6. Update Candidate.joinedAt.
// 7. Write an audit entry in the same transaction.
// 8. Preserve existing recruitment status.
// =====================================================

export const correctCandidateJoiningDate = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // 1. AUTHENTICATION
    // -------------------------------------------------

    const user = req.user;

    if (!user || !isActiveAccount(user)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // -------------------------------------------------
    // 2. ROLE AUTHORIZATION
    // -------------------------------------------------

    const activeRole = getActiveRole(
      user,
      req.activeRole
    );

    if (
      !activeRole ||
      !canConfirmCandidateJoining(user, activeRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only authorized HR personnel and Global Administrators can correct candidate joining dates.",
      });
    }

    // -------------------------------------------------
    // 3. VALIDATE CANDIDATE ID
    // -------------------------------------------------

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    // -------------------------------------------------
    // 4. VALIDATE CORRECTED JOINING DATE
    // -------------------------------------------------

    const body = req.body || {};

    const joiningDateInput = body.joiningDate;

    const joiningDate = parseJoiningDate(
      joiningDateInput
    );

    if (!joiningDate) {
      return res.status(400).json({
        success: false,
        message:
          "A valid joiningDate in YYYY-MM-DD format is required.",
      });
    }

    const today = getBusinessDate();

    if (joiningDateInput > today) {
      return res.status(400).json({
        success: false,
        message:
          "Future joining dates cannot be recorded as actual joining.",
      });
    }

    // -------------------------------------------------
    // 5. VALIDATE MANDATORY CORRECTION REASON
    // -------------------------------------------------

    const reason = body.reason;

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A correction reason is mandatory.",
      });
    }

    if (reason.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Correction reason cannot exceed 2000 characters.",
      });
    }

    const normalizedReason = reason.trim();

    // -------------------------------------------------
    // 6. DATABASE TRANSACTION
    // -------------------------------------------------

    const session = await mongoose.startSession();

    let operationResult = null;

    try {
      await session.withTransaction(async () => {
        // Reset before transaction callback retries.
        operationResult = null;

        // ---------------------------------------------
        // FETCH CANDIDATE
        // ---------------------------------------------

        const candidate = await Candidate.findById(id)
          .session(session);

        if (!candidate) {
          operationResult = {
            status: 404,
            message: "Candidate not found.",
          };

          return;
        }

        // ---------------------------------------------
        // REQUIRE EXISTING JOINING CONFIRMATION
        // ---------------------------------------------

        if (!candidate.joinedAt) {
          operationResult = {
            status: 409,
            message:
              "Joining must be confirmed before its date can be corrected.",
          };

          return;
        }

        const previousJoiningDate =
          candidate.joinedAt;

        const previousJoiningDateString =
          formatJoiningDate(previousJoiningDate);

        // ---------------------------------------------
        // PREVENT UNNECESSARY DATE CORRECTION
        // ---------------------------------------------

        if (
          previousJoiningDateString ===
          joiningDateInput
        ) {
          operationResult = {
            status: 409,
            message:
              "The supplied joining date is already recorded.",
            joinedAt: candidate.joinedAt,
          };

          return;
        }

        // ---------------------------------------------
        // DERIVE DEPARTMENT FROM JOB
        // ---------------------------------------------

        const job = candidate.job
          ? await Job.findById(candidate.job)
              .select("_id title department")
              .session(session)
              .lean()
          : null;

        const department = String(
          job?.department || ""
        ).trim();

        // ---------------------------------------------
        // CAPTURE BEFORE SNAPSHOT
        // ---------------------------------------------

        const before = {
          joinedAt: previousJoiningDate,
        };

        // ---------------------------------------------
        // CORRECT JOINING DATE
        // ---------------------------------------------

        candidate.joinedAt = joiningDate;

        // Joining date correction does not change
        // the candidate's recruitment status.

        await candidate.save({ session });

        // ---------------------------------------------
        // CREATE AUDIT RECORD
        // ---------------------------------------------

        const candidateLabel = [
          candidate.name,
          candidate.email,
        ]
          .filter(Boolean)
          .join(" - ") || candidate._id.toString();

        await createAuditLog({
          req,

          action: "CANDIDATE_JOINING_DATE_CORRECTED",

          targetType: "Candidate",
          targetId: candidate._id,
          targetLabel: candidateLabel,

          department,

          before,

          after: {
            joinedAt: candidate.joinedAt,
          },

          reason: normalizedReason,

          metadata: {
            activeRole,

            previousJoiningDate:
              previousJoiningDateString,

            correctedJoiningDate:
              joiningDateInput,

            jobId: job?._id?.toString() || "",
            jobTitle: job?.title || "",

            departmentSource: job
              ? "JOB"
              : "UNAVAILABLE",
          },

          session,
        });

        operationResult = {
          status: 200,
          candidate,
          department,
          previousJoiningDate:
            previousJoiningDateString,
        };
      });
    } finally {
      await session.endSession();
    }

    // -------------------------------------------------
    // 7. HANDLE TRANSACTION RESULT
    // -------------------------------------------------

    if (
      !operationResult ||
      operationResult.status !== 200
    ) {
      return res
        .status(operationResult?.status || 500)
        .json({
          success: false,
          message:
            operationResult?.message ||
            "Joining date correction failed.",

          ...(operationResult?.joinedAt
            ? { joinedAt: operationResult.joinedAt }
            : {}),
        });
    }

    // -------------------------------------------------
    // 8. SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Candidate joining date corrected successfully.",

      joiningCorrection: {
        previousJoiningDate:
          operationResult.previousJoiningDate,

        joinedAt:
          operationResult.candidate.joinedAt,

        correctedBy: user._id,
        correctedByEmail: user.email,
        correctedByRole: activeRole,

        department:
          operationResult.department || null,
      },

      candidate: getSafeCandidate(
        operationResult.candidate
      ),

      auditLogged: true,
    });
  } catch (error) {
    console.error(
      "Candidate joining date correction error:",
      error
    );

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate joining information.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Candidate joining date correction failed.",
    });
  }
};

// =====================================================
// GET CANDIDATE JOINING HISTORY
// GET /api/candidates/:id/joining-history
//
// Authorized:
// 1. HR
// 2. HR Admin
// 3. HR Manager
// 4. Global Administrator
//
// Retrieves:
// 1. Joining confirmation events.
// 2. Joining date correction events.
// 3. Previous and updated joining dates.
// 4. Actor and timestamp information.
// 5. Correction reasons.
// =====================================================

export const getCandidateJoiningHistory = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // 1. AUTHENTICATION
    // -------------------------------------------------

    const user = req.user;

    if (!user || !isActiveAccount(user)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // -------------------------------------------------
    // 2. ROLE AUTHORIZATION
    // -------------------------------------------------

    const activeRole = getActiveRole(
      user,
      req.activeRole
    );

    if (
      !activeRole ||
      !canConfirmCandidateJoining(user, activeRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only authorized HR personnel and Global Administrators can access candidate joining history.",
      });
    }

    // -------------------------------------------------
    // 3. VALIDATE CANDIDATE ID
    // -------------------------------------------------

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    // -------------------------------------------------
    // 4. FETCH CANDIDATE
    // -------------------------------------------------

    const candidate = await Candidate.findById(id)
      .select("_id name email joinedAt")
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    // -------------------------------------------------
    // 5. FETCH JOINING AUDIT RECORDS
    // -------------------------------------------------

    const auditRecords = await AuditLog.find({
      targetType: "Candidate",

      targetId: candidate._id,

      outcome: "SUCCESS",

      action: {
        $in: [
          "CANDIDATE_JOINING_CONFIRMED",
          "CANDIDATE_JOINING_DATE_CORRECTED",
        ],
      },
    })
      .select(
        [
          "action",
          "actor",
          "actorId",
          "actorName",
          "actorEmail",
          "roleUsed",
          "department",
          "outcome",
          "reason",
          "before",
          "after",
          "metadata",
          "createdAt",
        ].join(" ")
      )
      .sort({
        createdAt: 1,
        _id: 1,
      })
      .lean();

    // -------------------------------------------------
    // 6. FORMAT JOINING HISTORY
    // -------------------------------------------------

    const history = auditRecords.map(
      (record) => {
        const isConfirmation =
          record.action ===
          "CANDIDATE_JOINING_CONFIRMED";

        return {
          auditId: record._id,

          action: record.action,

          eventType: isConfirmation
            ? "JOINING_CONFIRMED"
            : "JOINING_DATE_CORRECTED",

          previousJoiningDate:
            formatJoiningDate(
              record.before?.joinedAt
            ),

          joiningDate:
            formatJoiningDate(
              record.after?.joinedAt
            ),

          reason: record.reason || "",

          performedBy: {
            id:
              record.actorId ||
              record.actor?.toString() ||
              null,

            name:
              record.actorName || "Unknown",

            email:
              record.actorEmail || "",

            role:
              record.metadata?.activeRole ||
              record.roleUsed ||
              "",
          },

          department:
            record.department || null,

          outcome: record.outcome,

          performedAt: record.createdAt,
        };
      }
    );

    // -------------------------------------------------
    // 7. SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,

        currentJoiningDate:
          formatJoiningDate(candidate.joinedAt),
      },

      totalEvents: history.length,

      history,
    });
  } catch (error) {
    console.error(
      "Candidate joining history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve candidate joining history.",
    });
  }
};
