import mongoose from "mongoose";

import Candidate from "../models/Candidate.js";
import Job from "../models/job.js";

import {
  generateCandidatesExcel,
} from "../services/excelService.js";

import {
  sendCandidateApplicationThankYouEmail,
  sendCandidateShortlistedEmailToHR,
  sendCandidateRejectedEmail,
} from "../services/emailService.js";

import {
  assignL0ScreenerByWorkload,
} from "../services/screenerAssignmentService.js";

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

    // -------------------------------------------------
    // 10. FETCH UPDATED CANDIDATE
    // -------------------------------------------------

    // The assignment service may have changed:
    // - Candidate status
    // - Assigned screener
    // - Screening record

    const updatedCandidate =
      await Candidate.findById(candidate._id);

    if (!updatedCandidate) {
      throw new Error(
        "Candidate was created but could not be retrieved."
      );
    }

    // Confirm that the assignment actually exists
    // on the latest candidate record.
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

    // Job association and L0 workflow fields are
    // controlled by backend services, not direct clients.

    const protectedFields = [
      "jobId",
      "job",
      "department",
      "currentStage",
      "assignedScreener",
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
          "Job association and recruitment workflow fields cannot be modified through this endpoint.",
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