import mongoose from "mongoose";
import Candidate from "../../../models/Candidate.js";
import Screening from "../models/Screening.js";

// =====================================================
// HELPERS
// =====================================================

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/[_-]+/g, " ");

const isActiveAccount = (user) =>
  user &&
  user.status === "Active" &&
  !user.deletedAt;

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

// Supports common L0 role names. Adjust this list to match
// the actual role values stored in your Admin collection.
const isL0Screener = (user) => {
  const role = normalize(user?.role);
  const designation = normalize(user?.designation);

  return (
    [
      "l0",
      "l0 screener",
      "l0 initial screener",
      "initial screener",
      "screener",
    ].includes(role) ||
    (
      role.includes("l0") &&
      (role.includes("screener") || role.includes("interviewer"))
    ) ||
    (
      role === "interviewer" &&
      (designation.includes("l0") || designation.includes("screener"))
    )
  );
};

const isReadOnlyOversightUser = (user) =>
  isActiveAccount(user) &&
  (
    isGlobalAdministrator(user) ||
    isDepartmentAdministrator(user) ||
    isHrOrRecruiter(user)
  );

const safeCandidateDetails = (candidate) => ({
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
});

// =====================================================
// 1. ASSIGNED APPLICATIONS
// GET /api/screenings/l0/assigned
// =====================================================

export const getAssignedL0Applications = async (req, res) => {
  try {
    if (!isActiveAccount(req.admin) || !isL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message: "Only an active L0 screener can view assigned applications.",
      });
    }

    const screenings = await Screening.find({
      assignedTo: req.admin._id,
      level: "L0",
    })
      .select(
        "application level assignedTo assignedBy status decision feedback assignedAt submittedAt createdAt updatedAt"
      )
      .populate({
        path: "application",
        select:
          "position areaOfInterest name email phone isFresher location yearsOfExperience highestQualification currentCompany noticePeriod coverMessage status createdAt updatedAt",
      })
      .sort({ assignedAt: -1 })
      .lean();

    const assignedApplications = screenings
      .filter((screening) => screening.application)
      .map((screening) => ({
        screeningId: screening._id,
        level: screening.level,
        screeningStatus: screening.status,
        decision: screening.decision,
        feedback: screening.feedback,
        assignedAt: screening.assignedAt,
        submittedAt: screening.submittedAt,
        application: safeCandidateDetails(screening.application),
      }));

    return res.status(200).json({
      success: true,
      total: assignedApplications.length,
      assignedApplications,
    });
  } catch (error) {
    console.error("Get assigned L0 applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned applications.",
    });
  }
};

// =====================================================
// 2. SAVE L0 SCREENING
// POST /api/applications/:id/screenings/l0
// =====================================================

export const submitL0Screening = async (req, res) => {
  try {
    if (!isActiveAccount(req.admin) || !isL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message: "Only an active L0 screener can submit screening results.",
      });
    }

    const { id } = req.params;
    const { decision, feedback = "" } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (!["Selected", "Rejected", "On Hold"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be Selected, Rejected, or On Hold.",
      });
    }

    if (typeof feedback !== "string" || feedback.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be text with a maximum of 5000 characters.",
      });
    }

    const applicationExists = await Candidate.exists({ _id: id });

    if (!applicationExists) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const screening = await Screening.findOne({
      application: id,
      level: "L0",
      assignedTo: req.admin._id,
    });

    if (!screening) {
      return res.status(403).json({
        success: false,
        message: "This application is not assigned to you.",
      });
    }

    if (screening.status === "Completed") {
      return res.status(409).json({
        success: false,
        message: "This screening has already been completed.",
      });
    }

    screening.status = "Completed";
    screening.decision = decision;
    screening.feedback = feedback.trim();
    screening.submittedAt = new Date();

    screening.history.push({
      action: "SUBMITTED",
      performedBy: req.admin._id,
      assignedTo: req.admin._id,
      decision,
      feedback: feedback.trim(),
      createdAt: new Date(),
    });

    await screening.save();

    return res.status(200).json({
      success: true,
      message: "Screening result submitted successfully.",
      screening: {
        id: screening._id,
        application: screening.application,
        level: screening.level,
        status: screening.status,
        decision: screening.decision,
        feedback: screening.feedback,
        submittedAt: screening.submittedAt,
      },
    });
  } catch (error) {
    console.error("Submit L0 screening error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit screening result.",
    });
  }
};

// =====================================================
// 3. SCREENING HISTORY
// GET /api/applications/:id/screenings
// =====================================================

export const getApplicationScreeningHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const candidateExists = await Candidate.exists({ _id: id });

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
      .populate("assignedTo", "name email role designation department")
      .populate("assignedBy", "name email role designation department")
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
      isActiveAccount(user) &&
      isL0Screener(user) &&
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

    return res.status(200).json({
      success: true,
      applicationId: id,
      screening: screening || null,
      history: screening?.history || [],
    });
  } catch (error) {
    console.error("Get screening history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening history.",
    });
  }
};

// =====================================================
// 4. L0 SCREENING STATISTICS
// GET /api/screenings/l0/stats
// =====================================================

export const getL0ScreeningStats = async (req, res) => {
  try {
    if (!isActiveAccount(req.admin) || !isL0Screener(req.admin)) {
      return res.status(403).json({
        success: false,
        message: "Only an active L0 screener can view personal screening statistics.",
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
              $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$decision", "Rejected"] }, 1, 0],
            },
          },
          selected: {
            $sum: {
              $cond: [{ $eq: ["$decision", "Selected"] }, 1, 0],
            },
          },
          onHold: {
            $sum: {
              $cond: [{ $eq: ["$decision", "On Hold"] }, 1, 0],
            },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const stats = result[0] || {
      totalAssigned: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
      selected: 0,
      onHold: 0,
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get L0 screening stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screening statistics.",
    });
  }
};