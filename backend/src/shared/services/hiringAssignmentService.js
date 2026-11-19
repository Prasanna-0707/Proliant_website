import mongoose from "mongoose";

import HiringManagerAssignment from "../../modules/hiring-manager/models/HiringManagerAssignment.js";
import Job from "../../modules/hr/models/HRJob.js";
import User from "../../modules/auth/models/Users.js";

import { isActiveAccount, isHiringManager } from "./authorizationService.js";
import { notifyStaff } from "./notificationService.js";

// =====================================================
// HIRING MANAGER ASSIGNMENTS
//
// The only place that writes HiringManagerAssignment records. The HR
// Jobs form and the Hiring Manager Assignments page both use it, so
// they always see the same records and duplicate active assignments
// are impossible (also enforced by a partial unique index).
// =====================================================

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const actorModel = (actor) =>
  actor?.constructor?.modelName === "Admin" ? "Admin" : "User";

export const loadJob = async (jobId) => {
  if (!mongoose.isValidObjectId(jobId)) throw fail(400, "Invalid job ID.");

  const job = await Job.findById(jobId).select("title department status");

  if (!job) throw fail(404, "Job not found.");

  return job;
};

export const loadHiringManager = async (managerId) => {
  if (!mongoose.isValidObjectId(managerId)) {
    throw fail(400, "Invalid hiring manager ID.");
  }

  const manager = await User.findById(managerId);

  if (!manager || !isActiveAccount(manager) || !isHiringManager(manager)) {
    throw fail(400, "The selected account is not an active Hiring Manager.");
  }

  return manager;
};

// Idempotent: returns the existing active assignment instead of
// creating a duplicate.
export const assignHiringManager = async ({ job, manager, actor }) => {
  const existing = await HiringManagerAssignment.findOne({
    hiringManager: manager._id,
    job: job._id,
    status: "Active",
  });

  if (existing) return { assignment: existing, created: false };

  let assignment;

  try {
    assignment = await HiringManagerAssignment.create({
      hiringManager: manager._id,
      job: job._id,
      assignedBy: actor._id,
      assignedByModel: actorModel(actor),
    });
  } catch (error) {
    // Lost a race against the unique index: treat as already assigned.
    if (error.code === 11000) {
      const winner = await HiringManagerAssignment.findOne({
        hiringManager: manager._id,
        job: job._id,
        status: "Active",
      });

      if (winner) return { assignment: winner, created: false };
    }

    throw error;
  }

  await notifyStaff(manager._id, {
    title: "Job assigned to you",
    message: `You are now the Hiring Manager for ${job.title}.`,
    type: "ASSIGNMENT",
    link: "/hiring-manager/interview-pipeline",
  });

  return { assignment, created: true };
};

export const revokeAssignment = async ({ assignment, actor, reason = "" }) => {
  if (assignment.status === "Revoked") return assignment;

  assignment.status = "Revoked";
  assignment.revokedBy = actor._id;
  assignment.revokedByModel = actorModel(actor);
  assignment.revokedAt = new Date();
  assignment.revocationReason = String(reason || "").trim().slice(0, 1000);

  await assignment.save();

  return assignment;
};

// Makes the job's ACTIVE hiring managers exactly equal to managerIds
// (used by the HR Jobs form). Returns what changed.
export const syncJobHiringManagers = async ({ job, managerIds, actor }) => {
  if (!Array.isArray(managerIds)) {
    throw fail(400, "hiringManagerIds must be an array.");
  }

  const wanted = [...new Set(managerIds.map(String))];

  const managers = [];

  for (const id of wanted) managers.push(await loadHiringManager(id));

  const active = await HiringManagerAssignment.find({
    job: job._id,
    status: "Active",
  });

  const result = { added: 0, revoked: 0 };

  for (const assignment of active) {
    if (!wanted.includes(String(assignment.hiringManager))) {
      await revokeAssignment({
        assignment,
        actor,
        reason: "Removed from the job by HR.",
      });
      result.revoked += 1;
    }
  }

  for (const manager of managers) {
    const { created } = await assignHiringManager({ job, manager, actor });
    if (created) result.added += 1;
  }

  return result;
};

// Active hiring managers per job id, for HR job responses.
export const getActiveManagersByJob = async (jobIds) => {
  const assignments = await HiringManagerAssignment.find({
    job: { $in: jobIds },
    status: "Active",
  })
    .populate("hiringManager", "name email designation department")
    .lean();

  const map = new Map();

  for (const item of assignments) {
    const key = String(item.job);
    if (!item.hiringManager) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item.hiringManager);
  }

  return map;
};

export { fail as assignmentError };
