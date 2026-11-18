import express from "express";

import authMiddleware from "../../../middleware/authMiddleware.js";

import requirePermission from "../../administrator/middleware/requirePermission.js";

import {
  getMyInterviews,
  getInterviewById,
  submitInterviewEvaluation,
  updateInterviewEvaluation,
  getApplicationInterviews,
  getEvaluationFormForStage,
} from "../controllers/interviewController.js";

// =====================================================
// INTERVIEW ROUTES
// Base URL: /api/interviews
// =====================================================

const interviewRouter = express.Router();

// IMPORTANT:
// Keep "/my" before "/:id" for route clarity.

// =====================================================
// 1. MY ASSIGNED INTERVIEWS
// =====================================================

interviewRouter.get(
  "/my",
  authMiddleware,
  requirePermission("interviews.assigned.read"),
  getMyInterviews
);

// =====================================================
// 2. INTERVIEW DETAILS
// =====================================================

interviewRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("interviews.assigned.read"),
  getInterviewById
);

// =====================================================
// 3. SUBMIT INTERVIEW EVALUATION
// =====================================================

interviewRouter.post(
  "/:id/evaluation",
  authMiddleware,
  requirePermission("interviews.evaluation.submit"),
  submitInterviewEvaluation
);

// =====================================================
// 4. UPDATE INTERVIEW EVALUATION
// =====================================================

interviewRouter.patch(
  "/:id/evaluation",
  authMiddleware,
  requirePermission("interviews.evaluation.submit"),
  updateInterviewEvaluation
);


// =====================================================
// APPLICATION INTERVIEW ROUTES
// Base URL: /api/applications
// =====================================================

export const applicationInterviewRouter =
  express.Router();

// Retain existing authentication.
// This application-level endpoint may be shared
// with HR and Hiring Manager workflows.

applicationInterviewRouter.get(
  "/:id/interviews",
  authMiddleware,
  getApplicationInterviews
);


// =====================================================
// EVALUATION FORM ROUTES
// Base URL: /api/evaluation-forms
// =====================================================

export const evaluationFormRouter =
  express.Router();

evaluationFormRouter.get(
  "/:stage",
  authMiddleware,
  requirePermission("interviews.assigned.read"),
  getEvaluationFormForStage
);


// =====================================================
// EXPORT INTERVIEW ROUTER
// =====================================================

export default interviewRouter;