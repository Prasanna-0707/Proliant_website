import mongoose from "mongoose";

import EvaluationForm from "../models/EvaluationForm.js";
import Job from "../../hr/models/HRJob.js";

import { ACCOUNT_TYPES } from "../../../shared/constants/roles.js";
import { sendError } from "../../../shared/utils/httpErrors.js";

// =====================================================
// EVALUATION FORM MANAGEMENT
//
// HR and Global Administrators define the forms that
// interviewers fill in. Interviewers only read published
// forms through GET /api/evaluation-forms/:stage.
//
//   Draft      -> editable
//   Published  -> immutable; a new version is created to change it
//   Archived   -> no longer offered to interviewers
//
// Mounted at /api/evaluation-forms/manage
// =====================================================

const STAGE_CODE_PATTERN = /^[A-Z0-9_-]+$/;

const staffModelName = (req) =>
  req.auth?.accountType === ACCOUNT_TYPES.ADMIN ? "Admin" : "User";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// Validates and normalises the editable form fields.
// Returns { error } or { data }.
const parseFormBody = (body = {}, { partial = false } = {}) => {
  const data = {};

  if (!partial || body.stageCode !== undefined) {
    if (!isNonEmptyString(body.stageCode)) {
      return { error: "stageCode is required." };
    }

    const stageCode = body.stageCode.trim().toUpperCase();

    if (!STAGE_CODE_PATTERN.test(stageCode)) {
      return { error: "stageCode may only contain A-Z, 0-9, _ and -." };
    }

    data.stageCode = stageCode;
  }

  for (const field of ["stageName", "formName"]) {
    if (!partial || body[field] !== undefined) {
      if (!isNonEmptyString(body[field])) {
        return { error: `${field} is required.` };
      }

      data[field] = body[field].trim();
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return { error: "description must be text." };
    }

    data.description = body.description.trim();
  }

  if (body.questions !== undefined) {
    if (!Array.isArray(body.questions)) {
      return { error: "questions must be an array." };
    }

    const codes = new Set();

    for (const [index, question] of body.questions.entries()) {
      if (
        !question ||
        !isNonEmptyString(question.questionCode) ||
        !isNonEmptyString(question.questionText)
      ) {
        return {
          error: `Question ${index + 1} needs a questionCode and questionText.`,
        };
      }

      const code = question.questionCode.trim().toUpperCase();

      if (codes.has(code)) {
        return { error: `Duplicate questionCode "${code}".` };
      }

      codes.add(code);
    }

    data.questions = body.questions.map((question, index) => ({
      questionCode: question.questionCode.trim().toUpperCase(),
      category: question.category?.trim() || "General",
      questionText: question.questionText.trim(),
      helpText: question.helpText?.trim() || "",
      responseType: question.responseType || "RATING_AND_TEXT",
      isRequired: question.isRequired !== false,
      displayOrder: Number.isFinite(question.displayOrder)
        ? question.displayOrder
        : index,
    }));
  }

  return { data };
};

// =====================================================
// LIST FORMS
// GET /api/evaluation-forms/manage
// =====================================================

export const listEvaluationForms = async (req, res) => {
  try {
    const filter = {};

    if (req.query.stageCode) {
      filter.stageCode = String(req.query.stageCode).trim().toUpperCase();
    }

    if (req.query.status) {
      filter.status = String(req.query.status).trim();
    }

    if (req.query.job) {
      if (!mongoose.isValidObjectId(req.query.job)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job.",
        });
      }

      filter.job = req.query.job;
    }

    const forms = await EvaluationForm.find(filter)
      .sort({ stageCode: 1, version: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: forms.length,
      forms,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch evaluation forms.");
  }
};

// =====================================================
// GET ONE FORM
// GET /api/evaluation-forms/manage/:id
// =====================================================

export const getEvaluationFormById = async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id).lean();

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Evaluation form not found.",
      });
    }

    return res.status(200).json({ success: true, form });
  } catch (error) {
    return sendError(res, error, "Failed to fetch the evaluation form.");
  }
};

// =====================================================
// CREATE FORM (new Draft version)
// POST /api/evaluation-forms/manage
//
// The version number is assigned automatically: one more
// than the highest existing version for the same job + stage.
// =====================================================

export const createEvaluationForm = async (req, res) => {
  try {
    const { data, error } = parseFormBody(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    let job = null;

    if (req.body.job !== undefined && req.body.job !== null && req.body.job !== "") {
      if (!mongoose.isValidObjectId(req.body.job)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job.",
        });
      }

      if (!(await Job.exists({ _id: req.body.job }))) {
        return res.status(404).json({
          success: false,
          message: "The selected job does not exist.",
        });
      }

      job = req.body.job;
    }

    const latest = await EvaluationForm.findOne({
      job,
      stageCode: data.stageCode,
    })
      .sort({ version: -1 })
      .select("version")
      .lean();

    const form = await EvaluationForm.create({
      ...data,
      job,
      version: (latest?.version || 0) + 1,
      status: "Draft",
      createdBy: req.user._id,
      createdByModel: staffModelName(req),
      updatedBy: req.user._id,
      updatedByModel: staffModelName(req),
    });

    return res.status(201).json({
      success: true,
      message: "Evaluation form created as a draft.",
      form,
    });
  } catch (error) {
    return sendError(res, error, "Failed to create the evaluation form.");
  }
};

// =====================================================
// UPDATE DRAFT FORM
// PUT /api/evaluation-forms/manage/:id
// =====================================================

export const updateEvaluationForm = async (req, res) => {
  try {
    const form = await EvaluationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Evaluation form not found.",
      });
    }

    if (form.status !== "Draft") {
      return res.status(409).json({
        success: false,
        message:
          "Only draft forms can be edited. Create a new version to change a published form.",
      });
    }

    // job, version and status cannot be changed here.
    const { data, error } = parseFormBody(req.body, { partial: true });

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (data.stageCode && data.stageCode !== form.stageCode) {
      return res.status(400).json({
        success: false,
        message:
          "stageCode cannot be changed. Create a new form for another stage.",
      });
    }

    form.set(data);
    form.updatedBy = req.user._id;
    form.updatedByModel = staffModelName(req);

    await form.save();

    return res.status(200).json({
      success: true,
      message: "Evaluation form updated.",
      form,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update the evaluation form.");
  }
};

// =====================================================
// CHANGE STATUS
// PATCH /api/evaluation-forms/manage/:id/status
//
//   Draft     -> Published (older published versions of the same
//                job + stage become Archived)
//   Published -> Archived
// =====================================================

export const updateEvaluationFormStatus = async (req, res) => {
  try {
    const status = String(req.body?.status || "").trim();

    if (!["Published", "Archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "Published" or "Archived".',
      });
    }

    const form = await EvaluationForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Evaluation form not found.",
      });
    }

    if (status === "Published") {
      if (form.status !== "Draft") {
        return res.status(409).json({
          success: false,
          message: "Only a draft form can be published.",
        });
      }

      if (form.questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "A form needs at least one question before it is published.",
        });
      }

      await EvaluationForm.updateMany(
        {
          _id: { $ne: form._id },
          job: form.job,
          stageCode: form.stageCode,
          status: "Published",
        },
        { $set: { status: "Archived" } }
      );
    } else if (form.status !== "Published") {
      return res.status(409).json({
        success: false,
        message: "Only a published form can be archived.",
      });
    }

    form.status = status;
    form.updatedBy = req.user._id;
    form.updatedByModel = staffModelName(req);

    await form.save();

    return res.status(200).json({
      success: true,
      message: `Evaluation form ${status.toLowerCase()}.`,
      form,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update the form status.");
  }
};
