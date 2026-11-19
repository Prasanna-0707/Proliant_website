import mongoose from "mongoose";

import Interview from "../models/Interview.js";
import Candidate from "../../candidate/models/Candidate.js";
import Job from "../../hr/models/HRJob.js";
import User from "../../auth/models/Users.js";
import ApplicationDecision from "../../hiring-manager/models/ApplicationDecision.js";

import {
  canAccessInterviewStage,
  isActiveAccount,
  isActiveInterviewer,
  isGlobalAdministrator,
  isHrOrRecruiter,
  isL0Screener,
} from "../../../shared/services/authorizationService.js";

import { notifyStaff, notifyHr } from "../../../shared/services/notificationService.js";
import { sendInterviewEmail } from "../../../shared/services/emailService.js";
import {
  applyPortalEvent,
  getInterviewStageIndex,
} from "../../../shared/services/portalApplicationService.js";
import { createAuditLog } from "../../../shared/services/auditLogService.js";

// =====================================================
// INTERVIEW SCHEDULING AND MANAGEMENT
//
// Base URL: /api/interviews
//
//   L0 Screener   - schedules the FIRST interview stage (L1) for
//                   candidates assigned to them that they shortlisted;
//                   can reschedule/cancel/reassign what they scheduled.
//   HR / Global   - oversight: schedule any stage, reschedule, cancel,
//                   reassign, list everything.
// =====================================================

const fail = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const respondError = (res, error, fallback) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
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

// Returns "manager" (HR / Global Admin), "screener", or null.
const getSchedulingRole = (req) => {
  const user = req.user;

  if (!user || !isActiveAccount(user)) return null;

  if (
    isGlobalAdministrator(user, req.activeRole) ||
    isHrOrRecruiter(user, req.activeRole)
  ) {
    return "manager";
  }

  if (isL0Screener(user, req.activeRole)) return "screener";

  return null;
};

const requireSchedulingRole = (req) => {
  const role = getSchedulingRole(req);

  if (!role) {
    throw fail(
      403,
      "Only HR, Global Administrators or L0 Screeners can manage interviews."
    );
  }

  return role;
};

const actorModelName = (req) =>
  req.user?.constructor?.modelName === "Admin" ? "Admin" : "User";

const isValidTimeZone = (value) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return typeof value === "string" && value.trim().length > 0;
  } catch {
    return false;
  }
};

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const MODES = ["Online", "In Person", "Phone"];

// Validates the schedule fields shared by create and reschedule.
const parseSchedule = (body, { requireAll }) => {
  const result = {};

  if (requireAll || body.scheduledAt !== undefined) {
    const scheduledAt = new Date(body.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime())) {
      throw fail(400, "A valid scheduledAt date and time is required.");
    }

    if (scheduledAt.getTime() < Date.now() - 60 * 1000) {
      throw fail(400, "The interview must be scheduled in the future.");
    }

    result.scheduledAt = scheduledAt;
  }

  if (requireAll || body.timeZone !== undefined) {
    if (!isValidTimeZone(body.timeZone)) {
      throw fail(400, "A valid IANA timeZone is required (e.g. Asia/Kolkata).");
    }

    result.timeZone = body.timeZone.trim();
  }

  if (body.durationMinutes !== undefined) {
    const duration = Number(body.durationMinutes);

    if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
      throw fail(400, "durationMinutes must be a whole number from 15 to 480.");
    }

    result.durationMinutes = duration;
  }

  if (body.mode !== undefined) {
    if (!MODES.includes(body.mode)) {
      throw fail(400, `mode must be one of: ${MODES.join(", ")}.`);
    }

    result.mode = body.mode;
  }

  if (body.meetingLink !== undefined) {
    const link = String(body.meetingLink || "").trim();

    if (link && !isHttpUrl(link)) {
      throw fail(400, "meetingLink must be a valid http(s) URL.");
    }

    result.meetingLink = link;
  }

  if (body.location !== undefined) {
    result.location = String(body.location || "").trim().slice(0, 300);
  }

  if (body.instructions !== undefined) {
    const instructions = String(body.instructions || "").trim();

    if (instructions.length > 3000) {
      throw fail(400, "instructions cannot exceed 3000 characters.");
    }

    result.instructions = instructions;
  }

  return result;
};

const getEnabledWorkflow = (job) =>
  (job.interviewWorkflow || [])
    .filter((stage) => stage.isEnabled)
    .slice()
    .sort((a, b) => a.stageOrder - b.stageOrder);

// The interviewer must be an active account allowed to take this stage.
const loadEligibleInterviewer = async (interviewerId, stageCode) => {
  if (!mongoose.isValidObjectId(interviewerId)) {
    throw fail(400, "A valid interviewerId is required.");
  }

  const interviewer = await User.findById(interviewerId);

  if (
    !interviewer ||
    !isActiveAccount(interviewer) ||
    !isActiveInterviewer(interviewer)
  ) {
    throw fail(400, "The selected interviewer is not an active interviewer.");
  }

  if (!canAccessInterviewStage(interviewer, stageCode)) {
    throw fail(
      400,
      `The selected interviewer is not permitted to conduct the ${stageCode} stage.`
    );
  }

  return interviewer;
};

// Prevents double-booking an interviewer.
const assertNoConflict = async ({
  interviewerId,
  scheduledAt,
  durationMinutes,
  excludeId = null,
}) => {
  const start = scheduledAt.getTime();
  const end = start + durationMinutes * 60 * 1000;

  const nearby = await Interview.find({
    assignedTo: interviewerId,
    status: { $in: ["Scheduled", "Confirmed", "Rescheduled"] },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    scheduledAt: {
      $gte: new Date(start - 480 * 60 * 1000),
      $lte: new Date(end),
    },
  })
    .select("scheduledAt durationMinutes")
    .lean();

  const clash = nearby.find((item) => {
    const otherStart = new Date(item.scheduledAt).getTime();
    const otherEnd = otherStart + (item.durationMinutes || 60) * 60 * 1000;
    return otherStart < end && otherEnd > start;
  });

  if (clash) {
    throw fail(
      409,
      "The interviewer already has an interview that overlaps this time."
    );
  }
};

const populateInterview = (query) =>
  query
    .populate("application", "name email phone position status currentStage assignedScreener job")
    .populate("job", "title department interviewWorkflow")
    .populate("assignedTo", "name email role designation department")
    .populate("assignedBy", "name email role")
    .populate("history.performedBy", "name email role");

// Screeners may only act on interviews for their own candidates / their own scheduling.
const assertCanManage = (req, role, interview, candidate) => {
  if (role === "manager") return;

  const mine =
    String(interview.assignedBy?._id || interview.assignedBy) ===
      String(req.user._id) ||
    String(candidate?.assignedScreener || "") === String(req.user._id);

  if (!mine) {
    throw fail(403, "You can only manage interviews for your own candidates.");
  }
};

const interviewEmailPayload = (interview, candidate, job, interviewer, extra = {}) => ({
  position: job?.title || candidate?.position,
  stageName: interview.stageName,
  candidateName: candidate?.name,
  interviewerName: interviewer?.name,
  scheduledAt: interview.scheduledAt,
  timeZone: interview.timeZone,
  mode: interview.mode,
  meetingLink: interview.meetingLink,
  location: interview.location,
  instructions: interview.instructions,
  ...extra,
});

// Sends emails to the interviewer and the candidate. Returns delivery status.
const sendInterviewEmails = async (event, interview, candidate, job, interviewer, extra) => {
  const payload = interviewEmailPayload(interview, candidate, job, interviewer, extra);
  const status = { interviewer: "skipped", candidate: "skipped" };

  const attempts = [
    ["interviewer", interviewer],
    ["candidate", candidate],
  ];

  for (const [key, person] of attempts) {
    if (!person?.email) continue;

    try {
      await sendInterviewEmail(event, { email: person.email, name: person.name }, payload);
      status[key] = "sent";
    } catch (error) {
      console.error(`Interview email (${key}) failed:`, error.message);
      status[key] = "failed";
    }
  }

  return status;
};

const audit = (req, action, interview, candidate, extra = {}) =>
  createAuditLog({
    req,
    action,
    targetType: "Interview",
    targetId: interview._id,
    targetLabel: `${candidate?.name || ""} - ${interview.stageName}`,
    department: candidate?.department || "",
    metadata: {
      application: String(interview.application?._id || interview.application),
      stageCode: interview.stageCode,
      ...extra,
    },
  }).catch((error) => console.error("Interview audit failed:", error.message));

// =====================================================
// GET /api/interviews/interviewers?stageCode=L1
// Active interviewers who may take a stage (assignment picker).
// =====================================================

export const listEligibleInterviewers = async (req, res) => {
  try {
    requireSchedulingRole(req);

    const stageCode = String(req.query.stageCode || "").trim().toUpperCase();

    const users = await User.find({ status: "Active", deletedAt: null })
      .select("name email role designation department status deletedAt")
      .sort({ name: 1 });

    const interviewers = users
      .filter(
        (user) =>
          isActiveAccount(user) &&
          isActiveInterviewer(user) &&
          (!stageCode || canAccessInterviewStage(user, stageCode))
      )
      .map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
      }));

    return res.status(200).json({
      success: true,
      count: interviewers.length,
      interviewers,
    });
  } catch (error) {
    return respondError(res, error, "Failed to fetch interviewers.");
  }
};

// =====================================================
// POST /api/interviews
// Schedule an interview for a stage of the job's workflow.
// =====================================================

export const createInterview = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);

    const { applicationId, interviewerId } = req.body;
    let stageCode = String(req.body.stageCode || "").trim().toUpperCase();

    if (!mongoose.isValidObjectId(applicationId)) {
      throw fail(400, "A valid applicationId is required.");
    }

    const candidate = await Candidate.findById(applicationId);

    if (!candidate) throw fail(404, "Application not found.");

    if (!candidate.job) {
      throw fail(409, "This application is not linked to a job.");
    }

    const job = await Job.findById(candidate.job);

    if (!job) throw fail(404, "The job for this application was not found.");

    const workflow = getEnabledWorkflow(job);

    // Without a stageCode the first enabled interview stage is used
    // (this is the L1 interview scheduled after L0 shortlisting).
    if (!stageCode) {
      stageCode = workflow.find((item) => item.stageType === "INTERVIEW")?.stageCode || "";
    }

    if (!stageCode) {
      throw fail(400, "This job has no interview stage configured.");
    }

    const stage = workflow.find((item) => item.stageCode === stageCode);

    if (!stage || stage.stageType !== "INTERVIEW") {
      throw fail(
        400,
        "The stage is not an enabled interview stage in this job's workflow."
      );
    }

    if (["L0_REJECTED", "Rejected", "Selected"].includes(candidate.status)) {
      throw fail(409, `Cannot schedule interviews for a ${candidate.status} application.`);
    }

    const interviewStages = workflow.filter((item) => item.stageType === "INTERVIEW");
    const isFirstInterview = interviewStages[0]?.stageCode === stage.stageCode;

    if (role === "screener") {
      if (String(candidate.assignedScreener) !== String(req.user._id)) {
        throw fail(403, "You can only schedule interviews for candidates assigned to you.");
      }

      if (!isFirstInterview) {
        throw fail(
          403,
          "L0 Screeners can schedule only the first interview stage. Later rounds are managed by HR."
        );
      }

      if (candidate.status !== "L0_SHORTLISTED") {
        throw fail(409, "Shortlist the candidate before scheduling the interview.");
      }
    } else if (!isFirstInterview) {
      // Later rounds require an "Advance" decision for the previous stage.
      const previous = workflow
        .filter((item) => item.stageOrder < stage.stageOrder && item.stageType === "INTERVIEW")
        .pop();

      const decision = previous
        ? await ApplicationDecision.findOne({
            application: candidate._id,
            job: job._id,
            stageCode: previous.stageCode,
          }).sort({ decidedAt: -1, createdAt: -1 })
        : null;

      if (decision?.decision !== "Advance") {
        throw fail(
          409,
          `The ${previous?.stageName || "previous"} stage must be advanced before scheduling ${stage.stageName}.`
        );
      }
    } else if (!["L0_SHORTLISTED", "Interview", "Shortlisted"].includes(candidate.status)) {
      throw fail(409, "The candidate must be shortlisted before an interview is scheduled.");
    }

    const existing = await Interview.exists({
      application: candidate._id,
      stageCode: stage.stageCode,
      status: { $in: ["Scheduled", "Confirmed", "Rescheduled", "Completed"] },
    });

    if (existing) {
      throw fail(
        409,
        "An interview for this stage already exists. Reschedule or cancel it instead."
      );
    }

    const interviewer = await loadEligibleInterviewer(interviewerId, stage.stageCode);

    const schedule = parseSchedule(req.body, { requireAll: true });
    schedule.durationMinutes = schedule.durationMinutes || 60;

    await assertNoConflict({
      interviewerId: interviewer._id,
      scheduledAt: schedule.scheduledAt,
      durationMinutes: schedule.durationMinutes,
    });

    const interview = await Interview.create({
      application: candidate._id,
      job: job._id,
      stageCode: stage.stageCode,
      stageName: stage.stageName,
      stageOrder: stage.stageOrder,
      assignedTo: interviewer._id,
      assignedBy: req.user._id,
      assignedByModel: actorModelName(req),
      ...schedule,
      status: "Scheduled",
      history: [
        {
          action: "SCHEDULED",
          performedBy: req.user._id,
          performedByModel: actorModelName(req),
          performedByName: req.user.name || "",
          newScheduledAt: schedule.scheduledAt,
          newInterviewer: interviewer._id,
        },
      ],
    });

    candidate.status = "Interview";
    candidate.currentStage = stage.stageCode;
    await candidate.save();

    const emailStatus = await sendInterviewEmails(
      "scheduled",
      interview,
      candidate,
      job,
      interviewer
    );

    await notifyStaff(interviewer._id, {
      title: "New interview assignment",
      message: `${stage.stageName} interview with ${candidate.name} for ${job.title}.`,
      type: "INTERVIEW",
      link: "/interviewer/my-interviews",
      relatedApplication: candidate._id,
      relatedInterview: interview._id,
    });

    await applyPortalEvent(candidate._id, "INTERVIEW_SCHEDULED", {
      interviewIndex: getInterviewStageIndex(job, stage.stageCode),
      scheduledAt: schedule.scheduledAt,
    });

    await audit(req, "INTERVIEW_SCHEDULED", interview, candidate, {
      interviewer: String(interviewer._id),
    });

    const populated = await populateInterview(Interview.findById(interview._id));

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview: populated,
      emailStatus,
    });
  } catch (error) {
    return respondError(res, error, "Failed to schedule the interview.");
  }
};

// =====================================================
// GET /api/interviews?status=&stageCode=&applicationId=&interviewerId=&from=&to=
// HR / Global Admin: all interviews. Screener: their own.
// =====================================================

export const listInterviews = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);

    const filter = {};

    if (req.query.status) {
      const statuses = String(req.query.status).split(",").map((item) => item.trim());
      filter.status = { $in: statuses };
    }

    if (req.query.stageCode) {
      filter.stageCode = String(req.query.stageCode).trim().toUpperCase();
    }

    for (const [param, field] of [
      ["applicationId", "application"],
      ["interviewerId", "assignedTo"],
      ["jobId", "job"],
    ]) {
      if (req.query[param]) {
        if (!mongoose.isValidObjectId(req.query[param])) {
          throw fail(400, `Invalid ${param}.`);
        }

        filter[field] = req.query[param];
      }
    }

    if (req.query.from || req.query.to) {
      filter.scheduledAt = {};

      if (req.query.from) filter.scheduledAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.scheduledAt.$lte = new Date(req.query.to);
    }

    if (role === "screener") {
      const ownCandidates = await Candidate.find({
        assignedScreener: req.user._id,
      }).distinct("_id");

      filter.$or = [
        { assignedBy: req.user._id },
        { application: { $in: ownCandidates } },
      ];
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

    const interviews = await populateInterview(Interview.find(filter))
      .select("-evaluation -evaluationHistory")
      .sort({ scheduledAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    return respondError(res, error, "Failed to fetch interviews.");
  }
};

// =====================================================
// GET /api/interviews/manage/:id   (detail with scheduling history)
// =====================================================

export const getManagedInterview = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);

    const interview = await populateInterview(Interview.findById(req.params.id)).select(
      "-evaluation -evaluationHistory"
    );

    if (!interview) throw fail(404, "Interview not found.");

    const candidate = await Candidate.findById(interview.application?._id || interview.application)
      .select("assignedScreener")
      .lean();

    assertCanManage(req, role, interview, candidate);

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    return respondError(res, error, "Failed to fetch the interview.");
  }
};

// Loads an interview that can still be changed.
const loadChangeableInterview = async (req, role) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) throw fail(404, "Interview not found.");

  const candidate = await Candidate.findById(interview.application);

  assertCanManage(req, role, interview, candidate);

  if (["Completed", "Cancelled", "No-Show"].includes(interview.status)) {
    throw fail(409, `A ${interview.status} interview cannot be changed.`);
  }

  if (interview.evaluation?.status === "Submitted") {
    throw fail(409, "An interview with a submitted evaluation cannot be changed.");
  }

  const job = await Job.findById(interview.job);

  return { interview, candidate, job };
};

// =====================================================
// PATCH /api/interviews/:id/reschedule
// Also accepts interviewerId to change the interviewer at the same time.
// =====================================================

export const rescheduleInterview = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);
    const { interview, candidate, job } = await loadChangeableInterview(req, role);

    const reason = String(req.body.reason || "").trim();

    if (!reason) throw fail(400, "A reason is required to reschedule.");

    if (reason.length > 1500) throw fail(400, "reason cannot exceed 1500 characters.");

    const changes = parseSchedule(req.body, { requireAll: false });

    if (!changes.scheduledAt) throw fail(400, "A new scheduledAt is required.");

    let interviewer = await User.findById(interview.assignedTo);
    const previousInterviewer = interview.assignedTo;

    if (req.body.interviewerId && String(req.body.interviewerId) !== String(interview.assignedTo)) {
      interviewer = await loadEligibleInterviewer(req.body.interviewerId, interview.stageCode);
    }

    await assertNoConflict({
      interviewerId: interviewer._id,
      scheduledAt: changes.scheduledAt,
      durationMinutes: changes.durationMinutes || interview.durationMinutes,
      excludeId: interview._id,
    });

    const previousScheduledAt = interview.scheduledAt;
    const interviewerChanged = String(previousInterviewer) !== String(interviewer._id);

    Object.assign(interview, changes);
    interview.assignedTo = interviewer._id;
    interview.status = "Rescheduled";
    interview.history.push({
      action: "RESCHEDULED",
      performedBy: req.user._id,
      performedByModel: actorModelName(req),
      performedByName: req.user.name || "",
      previousScheduledAt,
      newScheduledAt: interview.scheduledAt,
      previousInterviewer,
      newInterviewer: interviewer._id,
      reason,
    });

    await interview.save();

    const emailStatus = await sendInterviewEmails(
      "rescheduled",
      interview,
      candidate,
      job,
      interviewer,
      { reason }
    );

    await notifyStaff(interviewer._id, {
      title: "Interview rescheduled",
      message: `${interview.stageName} interview with ${candidate?.name} was rescheduled.`,
      type: "INTERVIEW",
      link: "/interviewer/my-interviews",
      relatedApplication: candidate?._id,
      relatedInterview: interview._id,
    });

    if (interviewerChanged) {
      await notifyStaff(previousInterviewer, {
        title: "Interview reassigned",
        message: `Your ${interview.stageName} interview with ${candidate?.name} was reassigned to another interviewer.`,
        type: "INTERVIEW",
        relatedApplication: candidate?._id,
        relatedInterview: interview._id,
      });
    }

    await applyPortalEvent(candidate?._id, "INTERVIEW_RESCHEDULED", {
      interviewIndex: getInterviewStageIndex(job, interview.stageCode),
      scheduledAt: interview.scheduledAt,
    });

    await audit(req, "INTERVIEW_RESCHEDULED", interview, candidate, { reason });

    const populated = await populateInterview(Interview.findById(interview._id));

    return res.status(200).json({
      success: true,
      message: "Interview rescheduled.",
      interview: populated,
      emailStatus,
    });
  } catch (error) {
    return respondError(res, error, "Failed to reschedule the interview.");
  }
};

// =====================================================
// PATCH /api/interviews/:id/assign   { interviewerId, reason? }
// Change the interviewer without changing the time.
// =====================================================

export const reassignInterviewer = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);
    const { interview, candidate, job } = await loadChangeableInterview(req, role);

    if (String(req.body.interviewerId) === String(interview.assignedTo)) {
      throw fail(409, "That interviewer is already assigned.");
    }

    const interviewer = await loadEligibleInterviewer(req.body.interviewerId, interview.stageCode);

    await assertNoConflict({
      interviewerId: interviewer._id,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      excludeId: interview._id,
    });

    const previousInterviewer = interview.assignedTo;

    interview.assignedTo = interviewer._id;
    interview.history.push({
      action: "REASSIGNED",
      performedBy: req.user._id,
      performedByModel: actorModelName(req),
      performedByName: req.user.name || "",
      previousInterviewer,
      newInterviewer: interviewer._id,
      reason: String(req.body.reason || "").trim().slice(0, 1500),
    });

    await interview.save();

    const emailStatus = await sendInterviewEmails(
      "scheduled",
      interview,
      candidate,
      job,
      interviewer
    );

    await notifyStaff(interviewer._id, {
      title: "New interview assignment",
      message: `${interview.stageName} interview with ${candidate?.name} for ${job?.title} was assigned to you.`,
      type: "INTERVIEW",
      link: "/interviewer/my-interviews",
      relatedApplication: candidate?._id,
      relatedInterview: interview._id,
    });

    await notifyStaff(previousInterviewer, {
      title: "Interview reassigned",
      message: `Your ${interview.stageName} interview with ${candidate?.name} was reassigned.`,
      type: "INTERVIEW",
      relatedApplication: candidate?._id,
      relatedInterview: interview._id,
    });

    await audit(req, "INTERVIEW_REASSIGNED", interview, candidate, {
      from: String(previousInterviewer),
      to: String(interviewer._id),
    });

    const populated = await populateInterview(Interview.findById(interview._id));

    return res.status(200).json({
      success: true,
      message: "Interviewer reassigned.",
      interview: populated,
      emailStatus,
    });
  } catch (error) {
    return respondError(res, error, "Failed to reassign the interviewer.");
  }
};

// =====================================================
// PATCH /api/interviews/:id/cancel   { reason }
// =====================================================

export const cancelInterview = async (req, res) => {
  try {
    const role = requireSchedulingRole(req);
    const { interview, candidate, job } = await loadChangeableInterview(req, role);

    const reason = String(req.body.reason || "").trim();

    if (!reason) throw fail(400, "A reason is required to cancel.");

    if (reason.length > 1500) throw fail(400, "reason cannot exceed 1500 characters.");

    interview.status = "Cancelled";
    interview.cancellationReason = reason;
    interview.history.push({
      action: "CANCELLED",
      performedBy: req.user._id,
      performedByModel: actorModelName(req),
      performedByName: req.user.name || "",
      previousScheduledAt: interview.scheduledAt,
      previousInterviewer: interview.assignedTo,
      reason,
    });

    await interview.save();

    // The candidate returns to the shortlisted state so the interview
    // can be scheduled again.
    if (candidate && candidate.status === "Interview") {
      const stillScheduled = await Interview.exists({
        application: candidate._id,
        status: { $in: ["Scheduled", "Confirmed", "Rescheduled"] },
      });

      if (!stillScheduled) {
        candidate.status = "L0_SHORTLISTED";
        candidate.currentStage = "L1_INTERVIEW";
        await candidate.save();
      }
    }

    const interviewer = await User.findById(interview.assignedTo);

    const emailStatus = await sendInterviewEmails(
      "cancelled",
      interview,
      candidate,
      job,
      interviewer,
      { reason }
    );

    await notifyStaff(interview.assignedTo, {
      title: "Interview cancelled",
      message: `${interview.stageName} interview with ${candidate?.name} was cancelled.`,
      type: "INTERVIEW",
      link: "/interviewer/my-interviews",
      relatedApplication: candidate?._id,
      relatedInterview: interview._id,
    });

    await notifyHr({
      title: "Interview cancelled",
      message: `${interview.stageName} interview with ${candidate?.name} was cancelled: ${reason}`,
      type: "INTERVIEW",
      link: "/hr/l1-interview",
      relatedApplication: candidate?._id,
      relatedInterview: interview._id,
    });

    await applyPortalEvent(candidate?._id, "INTERVIEW_CANCELLED", {
      interviewIndex: getInterviewStageIndex(job, interview.stageCode),
    });

    await audit(req, "INTERVIEW_CANCELLED", interview, candidate, { reason });

    const populated = await populateInterview(Interview.findById(interview._id));

    return res.status(200).json({
      success: true,
      message: "Interview cancelled.",
      interview: populated,
      emailStatus,
    });
  } catch (error) {
    return respondError(res, error, "Failed to cancel the interview.");
  }
};
