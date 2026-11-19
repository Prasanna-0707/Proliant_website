import mongoose from "mongoose";

import User from "../../auth/models/Users.js";
import Candidate from "../../candidate/models/Candidate.js";
import Screening from "../../screener/models/Screening.js";

import {
  isActiveAccount,
  isL0Screener,
} from "../../../shared/services/authorizationService.js";

import { notifyStaff } from "../../../shared/services/notificationService.js";
import { applyPortalEvent } from "../../../shared/services/portalApplicationService.js";
import { createAuditLog } from "../../../shared/services/auditLogService.js";

// =====================================================
// HR L0 SCREENER MANAGEMENT
// Base URL: /api/hr-screeners   (HR and Global Administrators)
//
// Works with real L0_SCREENER accounts (User collection) and the
// existing Screening records, so workload and history always match
// what the screeners themselves see.
// =====================================================

const OPEN_STATUSES = ["Pending", "In Progress"];

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const respondError = (res, error, fallback) => {
  if (error.statusCode) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
};

const actorModelName = (req) =>
  req.user?.constructor?.modelName === "Admin" ? "Admin" : "User";

const loadScreener = async (screenerId) => {
  if (!mongoose.isValidObjectId(screenerId)) {
    throw fail(400, "A valid screenerId is required.");
  }

  const screener = await User.findById(screenerId);

  if (!screener || !isActiveAccount(screener) || !isL0Screener(screener)) {
    throw fail(400, "The selected account is not an active L0 Screener.");
  }

  return screener;
};

const loadApplication = async (applicationId) => {
  if (!mongoose.isValidObjectId(applicationId)) {
    throw fail(400, "A valid applicationId is required.");
  }

  const candidate = await Candidate.findById(applicationId);

  if (!candidate) throw fail(404, "Application not found.");

  return candidate;
};

// GET /api/hr-screeners?includeInactive=true
// L0 Screeners with their current workload.
export const listScreeners = async (req, res) => {
  try {
    const accounts = await User.find({ deletedAt: null })
      .select("name email role designation department status deletedAt")
      .sort({ name: 1 });

    const screeners = accounts.filter(
      (account) =>
        isL0Screener(account) &&
        (req.query.includeInactive === "true" || isActiveAccount(account))
    );

    const ids = screeners.map((screener) => screener._id);

    const counts = await Screening.aggregate([
      {
        $match: {
          level: "L0",
          assignedTo: { $in: ids },
          assignmentPending: { $ne: true },
        },
      },
      {
        $group: {
          _id: { screener: "$assignedTo", status: "$status" },
          total: { $sum: 1 },
        },
      },
    ]);

    const byScreener = new Map();

    for (const row of counts) {
      const key = String(row._id.screener);
      const entry = byScreener.get(key) || {};
      entry[row._id.status] = row.total;
      byScreener.set(key, entry);
    }

    const result = screeners.map((screener) => {
      const entry = byScreener.get(String(screener._id)) || {};
      const pending = entry.Pending || 0;
      const inProgress = entry["In Progress"] || 0;
      const completed = entry.Completed || 0;

      return {
        _id: screener._id,
        name: screener.name,
        email: screener.email,
        designation: screener.designation,
        department: screener.department,
        status: screener.status,
        workload: {
          pending,
          inProgress,
          open: pending + inProgress,
          completed,
          totalAssigned: pending + inProgress + completed,
        },
      };
    });

    return res
      .status(200)
      .json({ success: true, count: result.length, screeners: result });
  } catch (error) {
    return respondError(res, error, "Failed to fetch L0 screeners.");
  }
};

// GET /api/hr-screeners/applications?scope=unassigned|assigned|all&screenerId=&search=&limit=
// Applications with their L0 screener, for assignment screens.
export const listScreeningApplications = async (req, res) => {
  try {
    const scope = req.query.scope || "all";
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

    const filter = {};

    if (scope === "unassigned") {
      filter.assignedScreener = null;
      filter.status = "New";
    } else if (scope === "assigned") {
      filter.assignedScreener = { $ne: null };
    } else if (scope !== "all") {
      throw fail(400, "scope must be unassigned, assigned or all.");
    }

    if (req.query.screenerId) {
      if (!mongoose.isValidObjectId(req.query.screenerId)) {
        throw fail(400, "Invalid screenerId.");
      }

      filter.assignedScreener = req.query.screenerId;
    }

    if (req.query.search) {
      const pattern = new RegExp(
        String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [{ name: pattern }, { email: pattern }, { position: pattern }];
    }

    const candidates = await Candidate.find(filter)
      .select("name email position department status currentStage assignedScreener job createdAt")
      .populate("assignedScreener", "name email department")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const screenings = await Screening.find({
      application: { $in: candidates.map((item) => item._id) },
      level: "L0",
    })
      .select("application status assignmentPending assignmentPendingReason assignedAt")
      .lean();

    const byApplication = new Map(
      screenings.map((item) => [String(item.application), item])
    );

    const applications = candidates.map((item) => {
      const screening = byApplication.get(String(item._id));

      return {
        ...item,
        screening: screening
          ? {
              status: screening.status,
              assignmentPending: Boolean(screening.assignmentPending),
              assignmentPendingReason: screening.assignmentPendingReason || "",
              assignedAt: screening.assignedAt,
            }
          : null,
      };
    });

    return res
      .status(200)
      .json({ success: true, count: applications.length, applications });
  } catch (error) {
    return respondError(res, error, "Failed to fetch screening applications.");
  }
};

// Shared by assign and reassign.
const applyAssignment = async (req, { reassign }) => {
  const reason = String(req.body.reason || "").trim().slice(0, 1500);

  if (reassign && !reason) throw fail(400, "A reason is required to reassign.");

  const candidate = await loadApplication(req.body.applicationId);
  const screener = await loadScreener(req.body.screenerId);

  if (["L0_REJECTED", "Rejected", "Selected"].includes(candidate.status)) {
    throw fail(409, `A ${candidate.status} application cannot be assigned.`);
  }

  let screening = await Screening.findOne({
    application: candidate._id,
    level: "L0",
  });

  const currentlyAssigned = Boolean(
    screening && !screening.assignmentPending && screening.assignedTo
  );

  if (!reassign && currentlyAssigned) {
    throw fail(409, "This application already has a screener. Use reassign instead.");
  }

  if (reassign && !currentlyAssigned) {
    throw fail(409, "This application has no screener yet. Use assign instead.");
  }

  if (screening && screening.status === "Completed") {
    throw fail(409, "Screening for this application is already completed.");
  }

  if (reassign && String(screening.assignedTo) === String(screener._id)) {
    throw fail(409, "That screener is already assigned to this application.");
  }

  const previousScreener = screening?.assignedTo || null;
  const previousStatus = candidate.status;
  const previousScreeningStatus = screening?.status || "";
  const now = new Date();

  if (!screening) {
    screening = new Screening({
      application: candidate._id,
      level: "L0",
      status: "Pending",
    });
  }

  screening.assignedTo = screener._id;
  screening.assignmentPending = false;
  screening.assignmentPendingReason = "";
  screening.assignmentPendingSince = null;
  screening.assignedBy = req.user._id;
  screening.assignedByModel = actorModelName(req);
  screening.assignedByType = "HUMAN";
  screening.assignedById = String(req.user._id);
  screening.status = "Pending";
  screening.assignedAt = now;

  screening.history.push({
    action: reassign ? "REASSIGNED" : "ASSIGNED",
    applicationId: candidate._id,
    candidateName: candidate.name || "",
    screenerName: screener.name || "",
    previousStatus,
    newStatus: "ASSIGNED_TO_L0",
    previousScreeningStatus,
    newScreeningStatus: "Pending",
    performedBy: req.user._id,
    performedByType: "HUMAN",
    performedById: String(req.user._id),
    performedByName: req.user.name || "",
    assignedTo: screener._id,
    remarks: reason || "Assigned by HR.",
    createdAt: now,
  });

  await screening.save();

  candidate.assignedScreener = screener._id;
  candidate.status = "ASSIGNED_TO_L0";
  if (!["L0_SCREENING", "L0"].includes(candidate.currentStage)) {
    candidate.currentStage = "L0_SCREENING";
  }
  await candidate.save();

  await notifyStaff(screener._id, {
    title: reassign ? "Application reassigned to you" : "New screening assignment",
    message: `${candidate.name} (${candidate.position}) was assigned to you for L0 screening.`,
    type: "SCREENING",
    link: "/l0-screening",
    relatedApplication: candidate._id,
  });

  if (previousScreener) {
    await notifyStaff(previousScreener, {
      title: "Application reassigned",
      message: `${candidate.name} (${candidate.position}) was reassigned to another screener.`,
      type: "SCREENING",
      relatedApplication: candidate._id,
    });
  }

  await applyPortalEvent(candidate._id, "ASSIGNED");

  await createAuditLog({
    req,
    action: reassign ? "L0_APPLICATION_REASSIGNED" : "L0_APPLICATION_ASSIGNED",
    targetType: "Candidate",
    targetId: candidate._id,
    targetLabel: candidate.name,
    department: candidate.department || "",
    before: {
      status: previousStatus,
      assignedScreener: previousScreener ? String(previousScreener) : null,
    },
    after: {
      status: candidate.status,
      assignedScreener: String(screener._id),
    },
    reason,
  }).catch((error) => console.error("Screener audit failed:", error.message));

  return {
    application: {
      _id: candidate._id,
      name: candidate.name,
      status: candidate.status,
      currentStage: candidate.currentStage,
    },
    screener: { _id: screener._id, name: screener.name, email: screener.email },
    departmentMismatch:
      Boolean(candidate.department) &&
      String(candidate.department).trim().toLowerCase() !==
        String(screener.department || "").trim().toLowerCase(),
  };
};

// POST /api/hr-screeners/assign    { applicationId, screenerId, reason? }
export const assignScreener = async (req, res) => {
  try {
    const result = await applyAssignment(req, { reassign: false });

    return res
      .status(201)
      .json({ success: true, message: "Screener assigned.", ...result });
  } catch (error) {
    return respondError(res, error, "Failed to assign the screener.");
  }
};

// POST /api/hr-screeners/reassign  { applicationId, screenerId, reason }
export const reassignScreener = async (req, res) => {
  try {
    const result = await applyAssignment(req, { reassign: true });

    return res
      .status(200)
      .json({ success: true, message: "Screener reassigned.", ...result });
  } catch (error) {
    return respondError(res, error, "Failed to reassign the screener.");
  }
};

// GET /api/hr-screeners/assignment-history?applicationId=&screenerId=&limit=
export const getAssignmentHistory = async (req, res) => {
  try {
    const filter = { level: "L0" };

    if (req.query.applicationId) {
      if (!mongoose.isValidObjectId(req.query.applicationId)) {
        throw fail(400, "Invalid applicationId.");
      }

      filter.application = req.query.applicationId;
    }

    if (req.query.screenerId) {
      if (!mongoose.isValidObjectId(req.query.screenerId)) {
        throw fail(400, "Invalid screenerId.");
      }

      filter["history.assignedTo"] = req.query.screenerId;
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

    const screenings = await Screening.find(filter)
      .select("application history")
      .lean();

    const entries = [];

    for (const screening of screenings) {
      for (const item of screening.history || []) {
        if (!["ASSIGNED", "REASSIGNED"].includes(item.action)) continue;

        if (
          req.query.screenerId &&
          String(item.assignedTo) !== String(req.query.screenerId)
        ) {
          continue;
        }

        entries.push({
          application: screening.application,
          candidateName: item.candidateName,
          action: item.action,
          screenerName: item.screenerName,
          assignedTo: item.assignedTo,
          performedByName: item.performedByName,
          performedByType: item.performedByType,
          remarks: item.remarks,
          at: item.createdAt,
        });
      }
    }

    entries.sort((a, b) => new Date(b.at) - new Date(a.at));

    return res.status(200).json({
      success: true,
      count: Math.min(entries.length, limit),
      history: entries.slice(0, limit),
    });
  } catch (error) {
    return respondError(res, error, "Failed to fetch assignment history.");
  }
};
