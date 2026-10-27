import mongoose from "mongoose";

import Interview from "../models/Interview.js";
import EvaluationForm from "../models/EvaluationForm.js";

import Candidate from "../../../models/Candidate.js";
import Job from "../../../models/Job.js";

// =====================================================
// COMMON HELPERS
// =====================================================

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const normalize = (value = "") =>
  String(value).trim().toLowerCase();

const isValidObjectId = (id) =>
  mongoose.isValidObjectId(id);

// =====================================================
// AUTHORIZATION
// Only active interviewers can use this module.
// Explicit L1/L2/L3/... designations restrict access
// to their corresponding stage.
// =====================================================

const isActiveInterviewer = (admin) => {
  if (
    !admin ||
    !admin._id ||
    admin.status !== "Active" ||
    admin.deletedAt
  ) {
    return false;
  }

  const role = normalize(admin.role);
  const designation = normalize(admin.designation);

  return (
    role.includes("interviewer") ||
    designation.includes("interviewer")
  );
};

const canAccessStage = (admin, stageCode) => {
  const role = normalize(admin?.role);
  const designation = normalize(admin?.designation);

  const combined = `${role} ${designation}`.toUpperCase();

  // Find explicit L-level restrictions such as L1, L2, L3.
  const permittedLevels = [
    ...new Set(
      combined.match(/\bL\d+\b/g) || []
    ),
  ];

  // An interviewer without a specific L-level designation
  // may access stages assigned to that interviewer.
  if (permittedLevels.length === 0) {
    return true;
  }

  // A role explicitly marked L1 or L2 must not access
  // another L-level stage.
  return permittedLevels.includes(
    String(stageCode).trim().toUpperCase()
  );
};

const authorizeInterviewer = (req, res) => {
  if (!req.admin?._id) {
    sendError(res, 401, "Authentication required.");
    return false;
  }

  if (!isActiveInterviewer(req.admin)) {
    sendError(
      res,
      403,
      "Only an active interviewer can access these APIs."
    );
    return false;
  }

  return true;
};

// =====================================================
// POPULATE INTERVIEW DETAILS
// =====================================================

const populateInterviewDetails = (query) => {
  return query
    .populate({
      path: "application",
      select: "name email phone position status createdAt",
    })
    .populate({
      path: "job",
      select: "title department location interviewWorkflow",
    })
    .populate({
      path: "assignedTo",
      select: "name email role designation",
    })
    .populate({
      path: "assignedBy",
      select: "name email role designation",
    });
};

// =====================================================
// GET MY INTERVIEWS
// GET /api/interviews/my
//
// Returns only interviews assigned to the logged-in
// interviewer and matching their permitted stage.
// =====================================================

export const getMyInterviews = async (req, res) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const interviews = await populateInterviewDetails(
      Interview.find({
        assignedTo: req.admin._id,
      })
    ).sort({
      scheduledAt: 1,
    });

    const permittedInterviews = interviews.filter(
      (interview) =>
        canAccessStage(req.admin, interview.stageCode)
    );

    return res.status(200).json({
      success: true,
      count: permittedInterviews.length,
      interviews: permittedInterviews,
    });
  } catch (error) {
    console.error("Get my interviews failed:", error);

    return sendError(
      res,
      500,
      "Failed to fetch assigned interviews."
    );
  }
};

// =====================================================
// GET INTERVIEW DETAILS
// GET /api/interviews/:id
//
// An interviewer can view only their assigned interview.
// =====================================================

export const getInterviewById = async (req, res) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "Invalid interview ID."
      );
    }

    const interview = await populateInterviewDetails(
      Interview.findOne({
        _id: id,
        assignedTo: req.admin._id,
      })
    );

    if (!interview) {
      return sendError(
        res,
        404,
        "Interview not found or not assigned to you."
      );
    }

    if (
      !canAccessStage(req.admin, interview.stageCode)
    ) {
      return sendError(
        res,
        403,
        "You are not permitted to access this interview stage."
      );
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error(
      "Get interview details failed:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to fetch interview details."
    );
  }
};

// =====================================================
// EVALUATION HELPERS
// =====================================================

const normalizeEvaluationText = (
  value,
  fieldName,
  maxLength
) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be text.`);
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new Error(
      `${fieldName} cannot exceed ${maxLength} characters.`
    );
  }

  return result;
};

const getPublishedEvaluationForm = async (
  jobId,
  stageCode
) => {
  // Prefer the form configured for this specific job.
  const jobSpecificForm = await EvaluationForm.findOne({
    job: jobId,
    stageCode,
    status: "Published",
  }).sort({
    version: -1,
  });

  if (jobSpecificForm) {
    return jobSpecificForm;
  }

  // Otherwise, try the default form for this stage.
  return EvaluationForm.findOne({
    job: null,
    stageCode,
    status: "Published",
  }).sort({
    version: -1,
  });
};

const prepareEvaluationCriteria = (
  inputCriteria,
  form
) => {
  if (
    inputCriteria !== undefined &&
    !Array.isArray(inputCriteria)
  ) {
    throw new Error(
      "Evaluation criteria must be an array."
    );
  }

  const criteria = inputCriteria || [];

  if (criteria.length > 100) {
    throw new Error(
      "An evaluation cannot contain more than 100 criteria."
    );
  }

  const normalizedCriteria = criteria.map(
    (item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        throw new Error(
          `Evaluation criterion ${index + 1} is invalid.`
        );
      }

      const questionCode = String(
        item.questionCode || ""
      )
        .trim()
        .toUpperCase();

      let configuredQuestion = null;

      if (form) {
        configuredQuestion = form.questions.find(
          (question) =>
            question.questionCode === questionCode
        );

        if (!configuredQuestion) {
          throw new Error(
            `Question code "${questionCode}" does not belong to the published evaluation form.`
          );
        }
      }

      const questionText = configuredQuestion
        ? configuredQuestion.questionText
        : normalizeEvaluationText(
            item.questionText,
            "Question text",
            500
          );

      if (!questionCode || !questionText) {
        throw new Error(
          `Evaluation criterion ${index + 1} requires a question code and question text.`
        );
      }

      const rating = item.rating;

      if (
        rating !== undefined &&
        rating !== null &&
        (
          !Number.isInteger(Number(rating)) ||
          Number(rating) < 1 ||
          Number(rating) > 5
        )
      ) {
        throw new Error(
          `Rating for question "${questionCode}" must be between 1 and 5.`
        );
      }

      const answer = normalizeEvaluationText(
        item.answer,
        "Answer",
        2000
      );

      const comments = normalizeEvaluationText(
        item.comments,
        "Comments",
        2000
      );

      // Validate answers when a published form exists.
      if (configuredQuestion && configuredQuestion.isRequired) {
        const responseType =
          configuredQuestion.responseType;

        if (
          (
            responseType === "RATING" ||
            responseType === "RATING_AND_TEXT"
          ) &&
          (
            rating === undefined ||
            rating === null
          )
        ) {
          throw new Error(
            `A rating is required for "${questionCode}".`
          );
        }

        if (
          (
            responseType === "TEXT" ||
            responseType === "RATING_AND_TEXT"
          ) &&
          !answer &&
          !comments
        ) {
          throw new Error(
            `A text response is required for "${questionCode}".`
          );
        }

        if (
          responseType === "YES_NO" &&
          !["yes", "no"].includes(
            answer.toLowerCase()
          )
        ) {
          throw new Error(
            `Question "${questionCode}" requires a Yes or No answer.`
          );
        }
      }

      return {
        questionCode,
        questionText,
        ...(rating !== undefined &&
          rating !== null && {
            rating: Number(rating),
          }),
        answer,
        comments,
      };
    }
  );

  // Reject duplicate question entries.
  const codes = normalizedCriteria.map(
    (criterion) => criterion.questionCode
  );

  if (new Set(codes).size !== codes.length) {
    throw new Error(
      "Evaluation criteria cannot contain duplicate question codes."
    );
  }

  // A submitted evaluation must answer all required
  // questions from the published form.
  if (form) {
    for (const question of form.questions) {
      if (!question.isRequired) {
        continue;
      }

      const answer = normalizedCriteria.find(
        (criterion) =>
          criterion.questionCode ===
          question.questionCode
      );

      if (!answer) {
        throw new Error(
          `Required question "${question.questionCode}" is missing.`
        );
      }
    }
  }

  return normalizedCriteria;
};

const prepareEvaluationPayload = async (
  body,
  interview,
  form
) => {
  const recommendation = body.recommendation;

  if (
    !["Advance", "Reject", "Hold"].includes(
      recommendation
    )
  ) {
    throw new Error(
      "Recommendation must be Advance, Reject, or Hold."
    );
  }

  const overallRating = body.overallRating;

  if (
    overallRating !== undefined &&
    overallRating !== null &&
    (
      !Number.isInteger(Number(overallRating)) ||
      Number(overallRating) < 1 ||
      Number(overallRating) > 5
    )
  ) {
    throw new Error(
      "Overall rating must be between 1 and 5."
    );
  }

  const strengths = normalizeEvaluationText(
    body.strengths,
    "Strengths",
    3000
  );

  const concerns = normalizeEvaluationText(
    body.concerns,
    "Concerns",
    3000
  );

  const feedback = normalizeEvaluationText(
    body.feedback,
    "Feedback",
    5000
  );

  // Rejections and holds require a documented reason.
  if (
    ["Reject", "Hold"].includes(recommendation) &&
    !feedback &&
    !concerns
  ) {
    throw new Error(
      "Feedback or concerns are required for a Reject or Hold recommendation."
    );
  }

  const criteria = prepareEvaluationCriteria(
    body.criteria,
    form
  );

  // If no form has been published yet, require enough
  // free-form information for a useful evaluation.
  if (
    !form &&
    !feedback &&
    criteria.length === 0
  ) {
    throw new Error(
      "A published form is not available. Provide feedback or evaluation criteria."
    );
  }

  return {
    status: "Submitted",
    overallRating:
      overallRating === undefined ||
      overallRating === null
        ? undefined
        : Number(overallRating),
    strengths,
    concerns,
    feedback,
    recommendation,
    criteria,
    submittedBy: null,
    submittedAt: new Date(),
  };
};

// =====================================================
// VALIDATE INTERVIEW STAGE
// Stage must belong to this job's current workflow.
// =====================================================

const validateConfiguredInterviewStage = async (
  interview
) => {
  const job = await Job.findById(interview.job);

  if (!job) {
    throw new Error(
      "The job associated with this interview was not found."
    );
  }

  const stage = (job.interviewWorkflow || []).find(
    (item) =>
      item.stageCode === interview.stageCode &&
      item.isEnabled
  );

  if (!stage) {
    throw new Error(
      "This interview stage is not enabled in the job's configured workflow."
    );
  }

  return {
    job,
    stage,
  };
};

// =====================================================
// SUBMIT INTERVIEW EVALUATION
// POST /api/interviews/:id/evaluation
// =====================================================

export const submitInterviewEvaluation = async (
  req,
  res
) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "Invalid interview ID."
      );
    }

    const interview = await Interview.findOne({
      _id: id,
      assignedTo: req.admin._id,
    });

    if (!interview) {
      return sendError(
        res,
        404,
        "Interview not found or not assigned to you."
      );
    }

    if (
      !canAccessStage(req.admin, interview.stageCode)
    ) {
      return sendError(
        res,
        403,
        "You are not permitted to evaluate this interview stage."
      );
    }

    if (
      ["Cancelled", "No-Show"].includes(
        interview.status
      )
    ) {
      return sendError(
        res,
        409,
        "An evaluation cannot be submitted for a cancelled or no-show interview."
      );
    }

    if (
      interview.evaluation?.status === "Submitted"
    ) {
      return sendError(
        res,
        409,
        "An evaluation has already been submitted. Use the evaluation update API for an authorized correction."
      );
    }

    await validateConfiguredInterviewStage(interview);

    const form = await getPublishedEvaluationForm(
      interview.job,
      interview.stageCode
    );

    const evaluation =
      await prepareEvaluationPayload(
        req.body,
        interview,
        form
      );

    evaluation.submittedBy = req.admin._id;

    interview.evaluation = evaluation;

    // Feedback submission does not automatically advance
    // the candidate or change the interview stage.
    await interview.save();

    return res.status(201).json({
      success: true,
      message: "Interview evaluation submitted successfully.",
      interviewId: interview._id,
      evaluation: interview.evaluation,
    });
  } catch (error) {
    console.error(
      "Submit interview evaluation failed:",
      error
    );

    const statusCode =
      error.name === "ValidationError" ||
      error.name === "CastError"
        ? 400
        : error.message?.includes("required") ||
            error.message?.includes("must be") ||
            error.message?.includes("cannot") ||
            error.message?.includes("Recommendation") ||
            error.message?.includes("Rating") ||
            error.message?.includes("rating") ||
            error.message?.includes("question") ||
            error.message?.includes("form") ||
            error.message?.includes("Feedback")
          ? 400
          : error.message?.includes("not enabled") ||
              error.message?.includes("not found")
            ? 409
            : 500;

    return sendError(
      res,
      statusCode,
      statusCode === 500
        ? "Failed to submit interview evaluation."
        : error.message
    );
  }
};

// =====================================================
// UPDATE INTERVIEW EVALUATION
// PATCH /api/interviews/:id/evaluation
//
// Stores the previous evaluation before a correction.
// A correction reason is mandatory.
// =====================================================

export const updateInterviewEvaluation = async (
  req,
  res
) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "Invalid interview ID."
      );
    }

    const interview = await Interview.findOne({
      _id: id,
      assignedTo: req.admin._id,
    });

    if (!interview) {
      return sendError(
        res,
        404,
        "Interview not found or not assigned to you."
      );
    }

    if (
      !canAccessStage(req.admin, interview.stageCode)
    ) {
      return sendError(
        res,
        403,
        "You are not permitted to update this interview evaluation."
      );
    }

    if (
      interview.evaluation?.status !== "Submitted"
    ) {
      return sendError(
        res,
        409,
        "Only a submitted evaluation can be corrected."
      );
    }

    const correctionReason =
      typeof req.body.correctionReason === "string"
        ? req.body.correctionReason.trim()
        : "";

    if (
      !correctionReason ||
      correctionReason.length > 1500
    ) {
      return sendError(
        res,
        400,
        "A correction reason of at most 1500 characters is required."
      );
    }

    if (
      ["Cancelled", "No-Show"].includes(
        interview.status
      )
    ) {
      return sendError(
        res,
        409,
        "A cancelled or no-show interview cannot be updated."
      );
    }

    await validateConfiguredInterviewStage(interview);

    const form = await getPublishedEvaluationForm(
      interview.job,
      interview.stageCode
    );

    const updatedEvaluation =
      await prepareEvaluationPayload(
        req.body,
        interview,
        form
      );

    // Preserve the previous evaluation before overwriting it.
    const previousEvaluation =
      interview.evaluation.toObject();

    interview.evaluationHistory.push({
      previousEvaluation,
      updatedBy: req.admin._id,
      correctionReason,
      changedAt: new Date(),
    });

    updatedEvaluation.submittedBy =
      req.admin._id;

    interview.evaluation = updatedEvaluation;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview evaluation corrected successfully.",
      interviewId: interview._id,
      evaluation: interview.evaluation,
      correctionsRecorded:
        interview.evaluationHistory.length,
    });
  } catch (error) {
    console.error(
      "Update interview evaluation failed:",
      error
    );

    const statusCode =
      error.name === "ValidationError" ||
      error.name === "CastError"
        ? 400
        : error.message?.includes("required") ||
            error.message?.includes("must be") ||
            error.message?.includes("cannot") ||
            error.message?.includes("Recommendation") ||
            error.message?.includes("Rating") ||
            error.message?.includes("rating") ||
            error.message?.includes("question") ||
            error.message?.includes("form") ||
            error.message?.includes("Feedback")
          ? 400
          : error.message?.includes("not enabled") ||
              error.message?.includes("not found")
            ? 409
            : 500;

    return sendError(
      res,
      statusCode,
      statusCode === 500
        ? "Failed to update interview evaluation."
        : error.message
    );
  }
};

// =====================================================
// GET INTERVIEWS FOR AN APPLICATION
// GET /api/applications/:id/interviews
//
// Returns only interview records assigned to the
// logged-in interviewer for this application.
// =====================================================

export const getApplicationInterviews = async (
  req,
  res
) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(
        res,
        400,
        "Invalid application ID."
      );
    }

    const application = await Candidate.findById(id)
      .select("_id");

    if (!application) {
      return sendError(
        res,
        404,
        "Application not found."
      );
    }

    const interviews = await populateInterviewDetails(
      Interview.find({
        application: id,
        assignedTo: req.admin._id,
      })
    ).sort({
      stageOrder: 1,
      scheduledAt: -1,
    });

    const permittedInterviews = interviews.filter(
      (interview) =>
        canAccessStage(req.admin, interview.stageCode)
    );

    return res.status(200).json({
      success: true,
      count: permittedInterviews.length,
      interviews: permittedInterviews,
    });
  } catch (error) {
    console.error(
      "Get application interviews failed:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to fetch application interviews."
    );
  }
};

// =====================================================
// GET EVALUATION FORM FOR A STAGE
// GET /api/evaluation-forms/:stage
//
// Optional query:
// ?jobId=<job MongoDB ID>
//
// Job-specific forms are available only when the
// interviewer is assigned to that job and stage.
// =====================================================

export const getEvaluationFormForStage = async (
  req,
  res
) => {
  try {
    if (!authorizeInterviewer(req, res)) {
      return;
    }

    const stageCode = String(
      req.params.stage || ""
    )
      .trim()
      .toUpperCase();

    if (
      !stageCode ||
      !/^[A-Z0-9_-]+$/.test(stageCode)
    ) {
      return sendError(
        res,
        400,
        "Invalid evaluation stage."
      );
    }

    if (!canAccessStage(req.admin, stageCode)) {
      return sendError(
        res,
        403,
        "You are not permitted to access this evaluation stage."
      );
    }

    const { jobId } = req.query;

    let form;

    if (jobId) {
      if (!isValidObjectId(jobId)) {
        return sendError(
          res,
          400,
          "Invalid job ID."
        );
      }

      const assignedInterview = await Interview.exists({
        assignedTo: req.admin._id,
        job: jobId,
        stageCode,
      });

      if (!assignedInterview) {
        return sendError(
          res,
          403,
          "You must be assigned to this job and stage to retrieve its evaluation form."
        );
      }

      form = await getPublishedEvaluationForm(
        jobId,
        stageCode
      );
    } else {
      // Without jobId, retrieve the stage's default form.
      form = await EvaluationForm.findOne({
        job: null,
        stageCode,
        status: "Published",
      }).sort({
        version: -1,
      });
    }

    if (!form) {
      return sendError(
        res,
        404,
        "No published evaluation form exists for this stage."
      );
    }

    return res.status(200).json({
      success: true,
      form,
    });
  } catch (error) {
    console.error(
      "Get evaluation form failed:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to fetch evaluation form."
    );
  }
};