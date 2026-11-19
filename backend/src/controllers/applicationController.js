
import mongoose from "mongoose";
import Candidate from "../models/Candidate.js";
import Job from "../models/job.js";
import Screening from "../modules/screener/models/Screening.js";

import {
  isActiveAccount,
  isL0Screener,
} from "../modules/administrator/services/authorizationService.js";

// =====================================================
// GET APPLICATION DETAILS
// GET /api/applications/:id
// =====================================================

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const candidate = await Candidate.findById(id).lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // Do not expose raw resume data or Base64 contents.
    const application = {
      _id: candidate._id,
      position: candidate.position,
      areaOfInterest: candidate.areaOfInterest,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      isFresher: candidate.isFresher,
      location: candidate.location,
      yearsOfExperience: candidate.yearsOfExperience,
      highestQualification: candidate.highestQualification,
      currentCompany: candidate.currentCompany,
      noticePeriod: candidate.noticePeriod,
      coverMessage: candidate.coverMessage,
      status: candidate.status,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,

      resumeAvailable:
        typeof candidate.resume === "string" &&
        candidate.resume.trim().length > 0,

      resumeEndpoint:
        typeof candidate.resume === "string" &&
        candidate.resume.trim().length > 0
          ? `/api/applications/${candidate._id}/resume`
          : null,
    };

    res.setHeader("Cache-Control", "private, no-store");

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application details.",
    });
  }
};


// =====================================================
// RESUME CONFIGURATION
// =====================================================

const MAX_RESUME_SIZE_BYTES = 15 * 1024 * 1024;

const SUPPORTED_RESUME_TYPES = {
  "application/pdf": {
    extension: "pdf",
  },

  "application/msword": {
    extension: "doc",
  },

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
  },
};


// =====================================================
// INTERNAL RESUME DOWNLOAD HANDLER
//
// Supports:
// 1. Existing application resume download.
// 2. Existing assigned L0 Screener resume download.
// 3. Department Admin resume download.
//
// candidateRecord is optional. When supplied, the
// caller has already fetched and authorized the candidate.
// =====================================================

const downloadApplicationResume = async (
  req,
  res,
  candidateRecord = null
) => {
  const id =
    req.params.id ||
    req.params.candidateId;

  if (
    !candidateRecord &&
    !mongoose.isValidObjectId(id)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid application ID.",
    });
  }

  const candidate =
    candidateRecord ||
    await Candidate.findById(id)
      .select("_id name resume")
      .lean();

  if (!candidate) {
    return res.status(404).json({
      success: false,
      message: "Application not found.",
    });
  }

  const storedResume = candidate.resume;

  if (
    typeof storedResume !== "string" ||
    !storedResume.trim()
  ) {
    return res.status(404).json({
      success: false,
      message: "No resume is stored for this application.",
    });
  }

  // Only Base64 data URLs are supported.
  // Filesystem paths and arbitrary external URLs are not exposed.
  const match = storedResume.match(
    /^data:(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,([A-Za-z0-9+/=\r\n]+)$/i
  );

  if (!match) {
    return res.status(501).json({
      success: false,
      message:
        "A resume reference exists, but this storage format is not supported by the current API. Configure the appropriate secure storage integration first.",
    });
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2].replace(/\s/g, "");

  const fileType = SUPPORTED_RESUME_TYPES[mimeType];

  if (!fileType || !base64Data) {
    return res.status(415).json({
      success: false,
      message: "Unsupported or invalid resume file format.",
    });
  }

  // Check encoded size before allocating the decoded buffer.
  const maximumBase64Length =
    Math.ceil(MAX_RESUME_SIZE_BYTES / 3) * 4;

  if (base64Data.length > maximumBase64Length) {
    return res.status(413).json({
      success: false,
      message: "Resume exceeds the 15 MB size limit.",
    });
  }

  const fileBuffer = Buffer.from(base64Data, "base64");

  if (
    fileBuffer.length === 0 ||
    fileBuffer.length > MAX_RESUME_SIZE_BYTES
  ) {
    return res.status(413).json({
      success: false,
      message:
        "Resume is empty or exceeds the 15 MB size limit.",
    });
  }

  // Validate file content against the declared MIME type.
  const startsWith = (...bytes) =>
    bytes.every((byte, index) => fileBuffer[index] === byte);

  let validFile = false;

  if (mimeType === "application/pdf") {
    validFile = startsWith(0x25, 0x50, 0x44, 0x46);
  } else if (mimeType === "application/msword") {
    validFile = startsWith(0xd0, 0xcf, 0x11, 0xe0);
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    validFile = startsWith(0x50, 0x4b, 0x03, 0x04);
  }

  if (!validFile) {
    return res.status(415).json({
      success: false,
      message:
        "The resume file content does not match its declared file type.",
    });
  }

  const filename = `resume-${candidate._id}.${fileType.extension}`;

  res.setHeader("Content-Type", mimeType);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  res.setHeader("Content-Length", fileBuffer.length);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  return res.status(200).send(fileBuffer);
};


// =====================================================
// GET APPLICATION RESUME
// GET /api/applications/:id/resume
// =====================================================

export const getApplicationResume = async (req, res) => {
  try {
    return await downloadApplicationResume(req, res);
  } catch (error) {
    console.error("Get application resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve application resume.",
    });
  }
};


// =====================================================
// GET DEPARTMENT ADMIN CANDIDATE RESUME
// GET /api/department-admin/candidates/:candidateId/resume
//
// Authorization:
// 1. Global Administrator - organization-wide access.
// 2. Department Administrator - own department only.
//
// Required permission:
// department.candidate.resume.read
//
// Department ownership is determined through:
// Candidate.job -> Job.department.
// =====================================================

export const getDepartmentAdminCandidateResume = async (
  req,
  res
) => {
  try {
    // -------------------------------------------------
    // 1. VERIFY DEPARTMENT ADMIN ACCESS CONTEXT
    // -------------------------------------------------

    const access = req.departmentAdminAccess;

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrator access context is missing.",
      });
    }

    const scope = String(
      access.scope || ""
    ).toUpperCase();

    if (
      scope !== "GLOBAL" &&
      scope !== "DEPARTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid administrator access scope.",
      });
    }

    // -------------------------------------------------
    // 2. VERIFY REQUIRED PERMISSION
    // -------------------------------------------------

    if (
      req.permissionContext?.permission !==
      "department.candidate.resume.read"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view candidate resumes.",
      });
    }

    // -------------------------------------------------
    // 3. VALIDATE CANDIDATE ID
    // -------------------------------------------------

    const { candidateId } = req.params;

    if (!mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID.",
      });
    }

    // -------------------------------------------------
    // 4. FETCH CANDIDATE AND ASSOCIATED JOB
    // -------------------------------------------------

    const candidate = await Candidate.findById(candidateId)
      .select("_id name resume job")
      .populate({
        path: "job",
        select: "department",
      })
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found.",
      });
    }

    const job =
      candidate.job &&
      typeof candidate.job === "object" &&
      candidate.job._id
        ? candidate.job
        : null;

    const jobDepartment = String(
      job?.department || ""
    ).trim();

    // -------------------------------------------------
    // 5. ENFORCE DEPARTMENT OWNERSHIP
    // -------------------------------------------------

    if (scope === "DEPARTMENT") {
      const adminDepartment = String(
        access.department || ""
      ).trim();

      if (
        !adminDepartment ||
        !jobDepartment ||
        jobDepartment.toLowerCase() !==
          adminDepartment.toLowerCase()
      ) {
        // Use the same response for missing and
        // unauthorized department records to avoid
        // exposing another department's candidate data.
        return res.status(404).json({
          success: false,
          message:
            "Candidate not found in your department.",
        });
      }
    }

    // -------------------------------------------------
    // 6. REUSE EXISTING SECURE RESUME DOWNLOAD
    // -------------------------------------------------

    return await downloadApplicationResume(
      req,
      res,
      candidate
    );
  } catch (error) {
    console.error(
      "Department Admin candidate resume error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve candidate resume.",
    });
  }
};


// =====================================================
// GET RESUME FOR ASSIGNED L0 SCREENER
// GET /api/screener/applications/:id/resume
// =====================================================

export const getScreenerApplicationResume = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.admin;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    // Ensure the logged-in user is an active L0 screener.
    if (
      !admin ||
      !(await isActiveAccount(admin)) ||
      !(await isL0Screener(admin))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Active L0 screener access is required.",
      });
    }

    // Verify application assignment ownership.
    const assignment = await Screening.findOne({
      application: id,
      level: "L0",
      assignedTo: admin._id,
      status: {
        $ne: "Cancelled",
      },
    })
      .select("_id")
      .lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found or not assigned to you.",
      });
    }

    // Reuse the existing secure resume download logic.
    return await downloadApplicationResume(req, res);
  } catch (error) {
    console.error("Get screener resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve screener resume.",
    });
  }
};
