import mongoose from "mongoose";

import HiringManagerAssignment from "../models/HiringManagerAssignment.js";
import User from "../../auth/models/Users.js";

import {
  isActiveAccount,
  isHiringManager,
} from "../../../shared/services/authorizationService.js";

import {
  loadJob,
  loadHiringManager,
  assignHiringManager,
  revokeAssignment,
} from "../../../shared/services/hiringAssignmentService.js";

import { notifyStaff } from "../../../shared/services/notificationService.js";
import { createAuditLog } from "../../../shared/services/auditLogService.js";

// Base URL: /api/hiring/assignments   (HR and Global Administrators)

const respondError = (res, error, fallback) => {
  if (error.statusCode) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This Hiring Manager is already assigned to the job.",
    });
  }

  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
};

const populateAssignment = (query) =>
  query
    .populate("hiringManager", "name email designation department status")
    .populate("job", "title department status")
    .populate("assignedBy", "name email")
    .populate("revokedBy", "name email");

const audit = (req, action, assignment, extra = {}) =>
  createAuditLog({
    req,
    action,
    targetType: "HiringManagerAssignment",
    targetId: assignment._id,
    targetLabel: String(assignment.job),
    metadata: {
      job: String(assignment.job),
      hiringManager: String(assignment.hiringManager),
      ...extra,
    },
  }).catch((error) => console.error("Assignment audit failed:", error.message));

// GET /api/hiring/assignments?status=Active&jobId=&hiringManagerId=
export const listAssignments = async (req, res) => {
  try {
    const filter = {};

    const status = req.query.status || "Active";

    if (status !== "all") {
      if (!["Active", "Revoked"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "status must be Active, Revoked or all." });
      }

      filter.status = status;
    }

    for (const [param, field] of [
      ["jobId", "job"],
      ["hiringManagerId", "hiringManager"],
    ]) {
      if (req.query[param]) {
        if (!mongoose.isValidObjectId(req.query[param])) {
          return res
            .status(400)
            .json({ success: false, message: `Invalid ${param}.` });
        }

        filter[field] = req.query[param];
      }
    }

    const assignments = await populateAssignment(
      HiringManagerAssignment.find(filter)
    ).sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    return respondError(res, error, "Failed to fetch assignments.");
  }
};

// GET /api/hiring/assignments/managers   -> active Hiring Managers (picker)
export const listHiringManagers = async (req, res) => {
  try {
    const users = await User.find({ status: "Active", deletedAt: null })
      .select("name email role designation department status deletedAt")
      .sort({ name: 1 });

    const managers = users
      .filter((user) => isActiveAccount(user) && isHiringManager(user))
      .map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        department: user.department,
      }));

    return res
      .status(200)
      .json({ success: true, count: managers.length, managers });
  } catch (error) {
    return respondError(res, error, "Failed to fetch Hiring Managers.");
  }
};

// POST /api/hiring/assignments   { jobId, hiringManagerId }
export const createAssignment = async (req, res) => {
  try {
    const job = await loadJob(req.body.jobId);
    const manager = await loadHiringManager(req.body.hiringManagerId);

    const { assignment, created } = await assignHiringManager({
      job,
      manager,
      actor: req.user,
    });

    if (!created) {
      return res.status(409).json({
        success: false,
        message: "This Hiring Manager is already assigned to the job.",
      });
    }

    await audit(req, "HIRING_MANAGER_ASSIGNED", assignment);

    const populated = await populateAssignment(
      HiringManagerAssignment.findById(assignment._id)
    );

    return res.status(201).json({
      success: true,
      message: "Hiring Manager assigned.",
      assignment: populated,
    });
  } catch (error) {
    return respondError(res, error, "Failed to assign the Hiring Manager.");
  }
};

// PATCH /api/hiring/assignments/:id/reassign   { hiringManagerId, reason? }
export const reassignAssignment = async (req, res) => {
  try {
    const current = await HiringManagerAssignment.findById(req.params.id);

    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }

    if (current.status !== "Active") {
      return res.status(409).json({
        success: false,
        message: "Only an active assignment can be reassigned.",
      });
    }

    if (String(current.hiringManager) === String(req.body.hiringManagerId)) {
      return res.status(409).json({
        success: false,
        message: "That Hiring Manager is already assigned to the job.",
      });
    }

    const job = await loadJob(current.job);
    const manager = await loadHiringManager(req.body.hiringManagerId);

    const previousManager = current.hiringManager;

    const { assignment } = await assignHiringManager({
      job,
      manager,
      actor: req.user,
    });

    await revokeAssignment({
      assignment: current,
      actor: req.user,
      reason: req.body.reason || "Reassigned to another Hiring Manager.",
    });

    await notifyStaff(previousManager, {
      title: "Job reassigned",
      message: `You are no longer the Hiring Manager for ${job.title}.`,
      type: "ASSIGNMENT",
    });

    await audit(req, "HIRING_MANAGER_REASSIGNED", assignment, {
      from: String(previousManager),
    });

    const populated = await populateAssignment(
      HiringManagerAssignment.findById(assignment._id)
    );

    return res.status(200).json({
      success: true,
      message: "Hiring Manager reassigned.",
      assignment: populated,
    });
  } catch (error) {
    return respondError(res, error, "Failed to reassign the Hiring Manager.");
  }
};

// DELETE /api/hiring/assignments/:id   { reason? }  (revokes; history is kept)
export const revokeHiringAssignment = async (req, res) => {
  try {
    const assignment = await HiringManagerAssignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }

    if (assignment.status === "Revoked") {
      return res.status(409).json({
        success: false,
        message: "This assignment is already revoked.",
      });
    }

    await revokeAssignment({
      assignment,
      actor: req.user,
      reason: req.body?.reason || req.query.reason || "",
    });

    await notifyStaff(assignment.hiringManager, {
      title: "Job assignment removed",
      message: "A job was removed from your Hiring Manager assignments.",
      type: "ASSIGNMENT",
    });

    await audit(req, "HIRING_MANAGER_REVOKED", assignment);

    return res.status(200).json({
      success: true,
      message: "Assignment revoked.",
    });
  } catch (error) {
    return respondError(res, error, "Failed to revoke the assignment.");
  }
};
