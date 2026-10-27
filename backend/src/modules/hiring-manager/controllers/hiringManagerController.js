import mongoose from "mongoose";

import Candidate from "../../../models/Candidate.js";
import Job from "../../../models/Job.js";
import Screening from "../../screener/models/Screening.js";
import Interview from "../../interviewer/models/Interview.js";
import ApplicationDecision from "../models/ApplicationDecision.js";
import HiringManagerAssignment from "../models/HiringManagerAssignment.js";

// =====================================================
// COMMON HELPERS
// =====================================================

const normalize = (value = "") =>
  String(value).trim().toLowerCase();

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({
    success: false,
    message,
  });

const isValidObjectId = (id) =>
  mongoose.isValidObjectId(id);

// =====================================================
// HIRING MANAGER AUTHORIZATION
// =====================================================

const isHiringManager = (admin) => {
  if (!admin?._id || admin.deletedAt) {
    return false;
  }

  if (normalize(admin.status) !== "active") {
    return false;
  }

  const role = normalize(admin.role);

  return (
    role === "hiring manager" ||
    role === "hiring lead"
  );
};

const authorizeHiringManager = (req, res) => {
  if (!req.admin?._id) {
    sendError(res, 401, "Authentication required.");
    return false;
  }

  if (!isHiringManager(req.admin)) {
    sendError(
      res,
      403,
      "Only an active Hiring Lead or Hiring Manager can access this API."
    );
    return false;
  }

  return true;
};

// =====================================================
// JOB ACCESS THROUGH EXPLICIT ASSIGNMENTS
// =====================================================

const jobProjection =
  "_id title department location status interviewWorkflow";

// Return only jobs with active assignments for this manager.
const getJobsForManager = async (managerId) => {
  const assignments = await HiringManagerAssignment.find({
    hiringManager: managerId,
    status: "Active",
  })
    .populate({
      path: "job",
      select: jobProjection,
    })
    .sort({ assignedAt: -1 })
    .lean();

  const uniqueJobs = new Map();

  for (const assignment of assignments) {
    const job = assignment.job;

    // Ignore assignments whose referenced job no longer exists.
    if (job?._id) {
      uniqueJobs.set(String(job._id), job);
    }
  }

  return [...uniqueJobs.values()];
};

// Find the job associated with an application and verify that
// the logged-in Hiring Manager has an active assignment.
const getJobForApplication = async (
  candidate,
  managerId
) => {
  // Support a direct Job reference if one is present.
  // The existing Candidate model may only contain position.
  const directJobId =
    candidate.job?._id ||
    candidate.jobId ||
    candidate.job;

  if (directJobId && isValidObjectId(directJobId)) {
    const assignment = await HiringManagerAssignment.findOne({
      hiringManager: managerId,
      job: directJobId,
      status: "Active",
    })
      .populate({
        path: "job",
        select: jobProjection,
      })
      .lean();

    if (assignment?.job?._id) {
      return assignment.job;
    }

    const jobExists = await Job.exists({
      _id: directJobId,
    });

    if (!jobExists) {
      throw createHttpError(
        404,
        "The job associated with this application was not found."
      );
    }

    throw createHttpError(
      403,
      "You are not assigned to this job."
    );
  }

  // Legacy applications contain the job title as a string.
  // Only use title matching when exactly one Job has that title.
  const position = String(
    candidate.position || ""
  ).trim();

  if (!position) {
    throw createHttpError(
      409,
      "This application is not linked to a job position."
    );
  }

  const matchingTitle = new RegExp(
    `^${escapeRegExp(position)}$`,
    "i"
  );

  const matchingJobs = await Job.find({
    title: matchingTitle,
  })
    .select(jobProjection)
    .lean();

  if (matchingJobs.length === 0) {
    throw createHttpError(
      404,
      "The application could not be matched to an existing job."
    );
  }

  if (matchingJobs.length > 1) {
    throw createHttpError(
      409,
      "This application cannot be safely matched because multiple jobs share its title."
    );
  }

  const matchedJob = matchingJobs[0];

  const assignmentExists =
    await HiringManagerAssignment.exists({
      hiringManager: managerId,
      job: matchedJob._id,
      status: "Active",
    });

  if (!assignmentExists) {
    throw createHttpError(
      403,
      "This job is not assigned to you."
    );
  }

  return matchedJob;
};

const getCandidateForManager = async (
  applicationId,
  managerId
) => {
  if (!isValidObjectId(applicationId)) {
    throw createHttpError(
      400,
      "Invalid application ID."
    );
  }

  const candidate = await Candidate.findById(
    applicationId
  );

  if (!candidate) {
    throw createHttpError(
      404,
      "Application not found."
    );
  }

  const job = await getJobForApplication(
    candidate,
    managerId
  );

  return {
    candidate,
    job,
  };
};

// =====================================================
// WORKFLOW HELPERS
// =====================================================

const getEnabledWorkflow = (job) =>
  (job.interviewWorkflow || [])
    .filter((stage) => stage.isEnabled)
    .slice()
    .sort((a, b) => a.stageOrder - b.stageOrder);

const getNextStage = (job, currentOrder) =>
  getEnabledWorkflow(job).find(
    (stage) => stage.stageOrder > currentOrder
  ) || null;

// =====================================================
// 1. APPLICATION DETAILS
// GET /api/applications/:id
// =====================================================

export const getApplicationDetailsForHiringManager = async (
  req,
  res,
  next
) => {
  // Allow non-Hiring-Manager requests to continue to the
  // application's existing general-purpose handler.
  if (!isHiringManager(req.admin)) {
    return next();
  }

  if (!authorizeHiringManager(req, res)) {
    return;
  }

  try {
    const { candidate, job } =
      await getCandidateForManager(
        req.params.id,
        req.admin._id
      );

    return res.status(200).json({
      success: true,
      application: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        areaOfInterest: candidate.areaOfInterest,
        isFresher: candidate.isFresher,
        location: candidate.location,
        highestQualification:
          candidate.highestQualification,
        currentCompany: candidate.currentCompany,
        noticePeriod: candidate.noticePeriod,
        status: candidate.status,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        resumeAvailable: Boolean(candidate.resume),
        resumeEndpoint: candidate.resume
          ? `/api/applications/${candidate._id}/resume`
          : null,
      },
      job: {
        _id: job._id,
        title: job.title,
        department: job.department,
        location: job.location,
        interviewWorkflow: getEnabledWorkflow(job),
      },
    });
  } catch (error) {
    console.error(
      "Hiring Manager application details failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to fetch application details."
    );
  }
};

// =====================================================
// 2. CANDIDATE PIPELINE
// GET /api/hiring/pipeline
// =====================================================

export const getHiringPipeline = async (req, res) => {
  try {
    if (!authorizeHiringManager(req, res)) {
      return;
    }

    const jobs = await getJobsForManager(
      req.admin._id
    );

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          jobs: 0,
          applications: 0,
        },
        jobs: [],
        message:
          "No jobs are currently assigned to this Hiring Manager.",
      });
    }

    // Existing Candidate records use position as a job-title
    // string. Match only titles that identify exactly one Job.
    const allJobRecords = await Job.find({})
      .select("_id title")
      .lean();

    const jobsByTitle = new Map();

    for (const record of allJobRecords) {
      const titleKey = normalize(record.title);

      if (!jobsByTitle.has(titleKey)) {
        jobsByTitle.set(titleKey, []);
      }

      jobsByTitle.get(titleKey).push(record);
    }

    const uniquelyMatchableJobs = jobs.filter(
      (job) => {
        const titleKey = normalize(job.title);

        return (
          titleKey &&
          jobsByTitle.get(titleKey)?.length === 1
        );
      }
    );

    const candidateTitleMatchers =
      uniquelyMatchableJobs.map((job) => ({
        position: new RegExp(
          `^${escapeRegExp(job.title)}$`,
          "i"
        ),
      }));

    const candidates = candidateTitleMatchers.length
      ? await Candidate.find({
          $or: candidateTitleMatchers,
        })
          .select("-resume")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          jobs: jobs.length,
          applications: 0,
        },
        jobs: jobs.map((job) => ({
          jobId: job._id,
          jobTitle: job.title,
          totalApplications: 0,
          stages: getEnabledWorkflow(job).map(
            (stage) => ({
              stageCode: stage.stageCode,
              stageName: stage.stageName,
              stageOrder: stage.stageOrder,
              count: 0,
              candidates: [],
            })
          ),
        })),
        note:
          "Applications are matched by position title only when that title identifies a single job. Applications with ambiguous titles are omitted until they can be linked to a specific job.",
      });
    }

    const candidateIds = candidates.map(
      (candidate) => candidate._id
    );

    const jobIds = jobs.map(
      (job) => job._id
    );

    const [
      screenings,
      interviews,
      decisions,
    ] = await Promise.all([
      Screening.find({
        application: {
          $in: candidateIds,
        },
        level: "L0",
      }).lean(),

      Interview.find({
        application: {
          $in: candidateIds,
        },
        job: {
          $in: jobIds,
        },
      }).lean(),

      ApplicationDecision.find({
        application: {
          $in: candidateIds,
        },
        job: {
          $in: jobIds,
        },
      })
        .sort({ decidedAt: -1 })
        .lean(),
    ]);

    const screeningByApplication = new Map();

    for (const screening of screenings) {
      screeningByApplication.set(
        String(screening.application),
        screening
      );
    }

    const interviewsByApplication = new Map();

    for (const interview of interviews) {
      const key = String(interview.application);

      if (!interviewsByApplication.has(key)) {
        interviewsByApplication.set(key, []);
      }

      interviewsByApplication.get(key).push(
        interview
      );
    }

    const latestDecisionByApplicationAndJob =
      new Map();

    for (const decision of decisions) {
      const key =
        `${decision.application}:${decision.job}`;

      if (
        !latestDecisionByApplicationAndJob.has(key)
      ) {
        latestDecisionByApplicationAndJob.set(
          key,
          decision
        );
      }
    }

    // Determine the current workflow stage for an application.
    const getStageForCandidate = (
      candidate,
      job,
      screening,
      candidateInterviews,
      latestDecision
    ) => {
      const workflow = getEnabledWorkflow(job);

      const l0Stage =
        workflow.find(
          (stage) =>
            stage.stageCode === "L0" ||
            stage.stageType === "SCREENING"
        ) || workflow[0];

      const terminalStage = (
        stageCode,
        stageName,
        stageOrder = 999999
      ) => ({
        stageCode,
        stageName,
        stageOrder,
      });

      if (latestDecision) {
        if (latestDecision.decision === "Reject") {
          return terminalStage(
            "REJECTED",
            "Rejected",
            999998
          );
        }

        if (latestDecision.decision === "Hold") {
          return terminalStage(
            "ON_HOLD",
            "On Hold",
            latestDecision.stageOrder
          );
        }

        if (latestDecision.decision === "Advance") {
          return (
            getNextStage(
              job,
              latestDecision.stageOrder
            ) ||
            terminalStage(
              "WORKFLOW_COMPLETE",
              "Awaiting Final Outcome"
            )
          );
        }
      }

      // Use the first non-cancelled interview as the current
      // stage until an authorized decision advances the process.
      const candidateJobInterviews =
        candidateInterviews
          .filter(
            (interview) =>
              String(interview.job) ===
              String(job._id)
          )
          .sort(
            (a, b) =>
              a.stageOrder - b.stageOrder
          );

      const currentInterview =
        candidateJobInterviews.find(
          (interview) =>
            interview.status !== "Cancelled"
        );

      if (currentInterview) {
        const configuredStage =
          workflow.find(
            (stage) =>
              stage.stageCode ===
              currentInterview.stageCode
          );

        return (
          configuredStage || {
            stageCode: currentInterview.stageCode,
            stageName: currentInterview.stageName,
            stageOrder: currentInterview.stageOrder,
          }
        );
      }

      // L0 screening outcome.
      if (screening) {
        if (
          screening.status === "Completed" &&
          screening.decision === "Rejected"
        ) {
          return terminalStage(
            "REJECTED",
            "Rejected"
          );
        }

        if (
          screening.status === "Completed" &&
          screening.decision === "On Hold"
        ) {
          return terminalStage(
            "ON_HOLD",
            "On Hold"
          );
        }

        if (
          screening.status === "Completed" &&
          screening.decision === "Selected"
        ) {
          const nextStage = l0Stage
            ? getNextStage(job, l0Stage.stageOrder)
            : workflow[0];

          return (
            nextStage ||
            terminalStage(
              "WORKFLOW_COMPLETE",
              "Awaiting Final Outcome"
            )
          );
        }

        if (
          screening.status === "Pending" &&
          l0Stage
        ) {
          return l0Stage;
        }
      }

      // Fallback to the existing candidate status.
      const status = normalize(candidate.status);

      if (status === "rejected") {
        return terminalStage(
          "REJECTED",
          "Rejected"
        );
      }

      if (
        status === "on hold" ||
        status === "hold"
      ) {
        return terminalStage(
          "ON_HOLD",
          "On Hold"
        );
      }

      if (status === "selected") {
        return terminalStage(
          "SELECTED",
          "Selected"
        );
      }

      if (
        status === "interview" ||
        status === "shortlisted"
      ) {
        const firstInterviewStage =
          workflow.find(
            (stage) =>
              stage.stageType === "INTERVIEW"
          );

        if (firstInterviewStage) {
          return firstInterviewStage;
        }
      }

      if (l0Stage) {
        return l0Stage;
      }

      return terminalStage(
        "WORKFLOW_NOT_CONFIGURED",
        "Workflow Not Configured"
      );
    };

    const pipelineJobs = jobs.map((job) => {
      const workflow = getEnabledWorkflow(job);
      const titleKey = normalize(job.title);

      const titleIsUnique =
        jobsByTitle.get(titleKey)?.length === 1;

      const jobCandidates = titleIsUnique
        ? candidates.filter(
            (candidate) =>
              normalize(candidate.position) ===
              titleKey
          )
        : [];

      const stages = new Map();

      for (const stage of workflow) {
        stages.set(stage.stageCode, {
          stageCode: stage.stageCode,
          stageName: stage.stageName,
          stageOrder: stage.stageOrder,
          count: 0,
          candidates: [],
        });
      }

      for (const candidate of jobCandidates) {
        const candidateId = String(candidate._id);

        const candidateInterviews =
          interviewsByApplication.get(candidateId) || [];

        const screening =
          screeningByApplication.get(candidateId);

        const decisionKey =
          `${candidateId}:${job._id}`;

        const latestDecision =
          latestDecisionByApplicationAndJob.get(
            decisionKey
          );

        const currentStage = getStageForCandidate(
          candidate,
          job,
          screening,
          candidateInterviews,
          latestDecision
        );

        const stageKey = currentStage.stageCode;

        if (!stages.has(stageKey)) {
          stages.set(stageKey, {
            ...currentStage,
            count: 0,
            candidates: [],
          });
        }

        const stageBucket = stages.get(stageKey);

        stageBucket.count += 1;

        stageBucket.candidates.push({
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: candidate.position,
          status: candidate.status,
          appliedAt: candidate.createdAt,
        });
      }

      return {
        jobId: job._id,
        jobTitle: job.title,
        totalApplications: jobCandidates.length,
        stages: [...stages.values()].sort(
          (a, b) =>
            a.stageOrder - b.stageOrder
        ),
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        jobs: jobs.length,
        applications: pipelineJobs.reduce(
          (total, job) =>
            total + job.totalApplications,
          0
        ),
      },
      jobs: pipelineJobs,
      note:
        "Applications are matched by position title only when that title identifies a single job. Applications with ambiguous titles are omitted until they can be linked to a specific job.",
    });
  } catch (error) {
    console.error(
      "Get Hiring Manager pipeline failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to fetch candidate pipeline."
    );
  }
};

// =====================================================
// 3. GET INTERVIEW FEEDBACK
// GET /api/applications/:id/feedback
// Returns submitted evaluations only; drafts are not exposed.
// =====================================================

export const getApplicationFeedback = async (
  req,
  res
) => {
  try {
    if (!authorizeHiringManager(req, res)) {
      return;
    }

    const { candidate, job } =
      await getCandidateForManager(
        req.params.id,
        req.admin._id
      );

    const interviews = await Interview.find({
      application: candidate._id,
      job: job._id,
      "evaluation.status": "Submitted",
    })
      .populate(
        "assignedTo",
        "name email role designation"
      )
      .sort({
        stageOrder: 1,
        "evaluation.submittedAt": -1,
      });

    const feedback = interviews.map(
      (interview) => ({
        interviewId: interview._id,
        applicationId: candidate._id,
        jobId: job._id,
        stageCode: interview.stageCode,
        stageName: interview.stageName,
        stageOrder: interview.stageOrder,
        interviewer: interview.assignedTo,
        interviewStatus: interview.status,
        evaluation: interview.evaluation,
      })
    );

    return res.status(200).json({
      success: true,
      applicationId: candidate._id,
      job: {
        _id: job._id,
        title: job.title,
      },
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error(
      "Get application feedback failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to fetch submitted interview feedback."
    );
  }
};

// =====================================================
// 4. GET DECISION HISTORY
// GET /api/applications/:id/decisions
// =====================================================

export const getApplicationDecisionHistory = async (
  req,
  res
) => {
  try {
    if (!authorizeHiringManager(req, res)) {
      return;
    }

    const { candidate, job } =
      await getCandidateForManager(
        req.params.id,
        req.admin._id
      );

    const decisions = await ApplicationDecision.find({
      application: candidate._id,
      job: job._id,
    })
      .populate(
        "decidedBy",
        "name email role designation"
      )
      .populate("supersedes")
      .sort({
        decidedAt: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      applicationId: candidate._id,
      job: {
        _id: job._id,
        title: job.title,
      },
      count: decisions.length,
      decisions,
    });
  } catch (error) {
    console.error(
      "Get decision history failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to fetch decision history."
    );
  }
};

// =====================================================
// 5. SUBMIT HIRING DECISION
// POST /api/applications/:id/decisions
// Records an auditable decision without automatically
// changing Candidate.status or advancing the workflow.
// =====================================================

export const submitApplicationDecision = async (
  req,
  res
) => {
  try {
    if (!authorizeHiringManager(req, res)) {
      return;
    }

    const { candidate, job } =
      await getCandidateForManager(
        req.params.id,
        req.admin._id
      );

    const stageCode = String(
      req.body.stageCode || ""
    )
      .trim()
      .toUpperCase();

    const decision = String(
      req.body.decision || ""
    ).trim();

    const reason = String(
      req.body.reason || ""
    ).trim();

    if (!stageCode) {
      return sendError(
        res,
        400,
        "stageCode is required."
      );
    }

    if (
      !["Advance", "Reject", "Hold"].includes(
        decision
      )
    ) {
      return sendError(
        res,
        400,
        "Decision must be Advance, Reject, or Hold."
      );
    }

    if (
      ["Reject", "Hold"].includes(decision) &&
      !reason
    ) {
      return sendError(
        res,
        400,
        "A reason is required for Reject or Hold decisions."
      );
    }

    if (reason.length > 3000) {
      return sendError(
        res,
        400,
        "Decision reason cannot exceed 3000 characters."
      );
    }

    const workflow = getEnabledWorkflow(job);

    const stage = workflow.find(
      (item) => item.stageCode === stageCode
    );

    if (!stage) {
      return sendError(
        res,
        400,
        "The selected stage is not enabled in this job's configured workflow."
      );
    }

    // Interview stages require a submitted evaluation before
    // the manager records a decision for that stage.
    if (stage.stageType === "INTERVIEW") {
      const hasSubmittedEvaluation =
        await Interview.exists({
          application: candidate._id,
          job: job._id,
          stageCode,
          "evaluation.status": "Submitted",
        });

      if (!hasSubmittedEvaluation) {
        return sendError(
          res,
          409,
          "A submitted interview evaluation is required before recording a decision for this stage."
        );
      }
    }

    // Preserve previous decisions instead of overwriting them.
    const previousDecision =
      await ApplicationDecision.findOne({
        application: candidate._id,
        job: job._id,
        stageCode,
      }).sort({
        decidedAt: -1,
        createdAt: -1,
      });

    if (previousDecision && !reason) {
      return sendError(
        res,
        400,
        "A reason is required when revising an existing stage decision."
      );
    }

    const recordedDecision =
      await ApplicationDecision.create({
        application: candidate._id,
        job: job._id,
        stageCode: stage.stageCode,
        stageName: stage.stageName,
        stageOrder: stage.stageOrder,
        decision,
        reason,
        decidedBy: req.admin._id,
        roleUsed: req.admin.role || "Hiring Manager",
        supersedes: previousDecision?._id || null,
        decidedAt: new Date(),
      });

    await recordedDecision.populate(
      "decidedBy",
      "name email role designation"
    );

    return res.status(201).json({
      success: true,
      message: "Hiring decision recorded successfully.",
      decision: recordedDecision,
      note:
        "The decision has been recorded as an auditable record. Candidate status and workflow advancement are separate operations.",
    });
  } catch (error) {
    console.error(
      "Submit hiring decision failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to record the hiring decision."
    );
  }
};

// =====================================================
// 6. GET FEEDBACK HISTORY
// GET /api/hiring/feedback-history
// Active assignments determine which job feedback is visible.
// =====================================================

export const getHiringFeedbackHistory = async (
  req,
  res
) => {
  try {
    if (!authorizeHiringManager(req, res)) {
      return;
    }

    const jobs = await getJobsForManager(
      req.admin._id
    );

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        feedbackHistory: [],
      });
    }

    const jobIds = jobs.map(
      (job) => job._id
    );

    const interviews = await Interview.find({
      job: {
        $in: jobIds,
      },
      "evaluation.status": "Submitted",
    })
      .populate(
        "application",
        "name email phone position status"
      )
      .populate(
        "assignedTo",
        "name email role designation"
      )
      .sort({
        updatedAt: -1,
      });

    const feedbackHistory = [];

    for (const interview of interviews) {
      if (!interview.application) {
        continue;
      }

      const commonDetails = {
        applicationId: interview.application._id,
        candidate: {
          name: interview.application.name,
          email: interview.application.email,
          position: interview.application.position,
        },
        jobId: interview.job,
        interviewId: interview._id,
        stageCode: interview.stageCode,
        stageName: interview.stageName,
        stageOrder: interview.stageOrder,
        interviewer: interview.assignedTo,
      };

      // Include prior evaluation versions for audit/history.
      for (
        const history of
        interview.evaluationHistory || []
      ) {
        feedbackHistory.push({
          ...commonDetails,
          isCurrent: false,
          evaluation: history.previousEvaluation,
          correction: {
            updatedBy: history.updatedBy,
            correctionReason: history.correctionReason,
            changedAt: history.changedAt,
          },
        });
      }

      // Include the current evaluation.
      feedbackHistory.push({
        ...commonDetails,
        isCurrent: true,
        evaluation: interview.evaluation,
        correction: null,
      });
    }

    feedbackHistory.sort((a, b) => {
      const dateA = new Date(
        a.evaluation?.submittedAt || 0
      ).getTime();

      const dateB = new Date(
        b.evaluation?.submittedAt || 0
      ).getTime();

      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: feedbackHistory.length,
      feedbackHistory,
    });
  } catch (error) {
    console.error(
      "Get feedback history failed:",
      error
    );

    return sendError(
      res,
      error.statusCode || 500,
      error.statusCode
        ? error.message
        : "Failed to fetch feedback history."
    );
  }
};