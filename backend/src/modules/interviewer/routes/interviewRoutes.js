import express from "express";

import authMiddleware from "../../../middleware/authMiddleware.js";

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

interviewRouter.get(
  "/my",
  authMiddleware,
  getMyInterviews
);

interviewRouter.get(
  "/:id",
  authMiddleware,
  getInterviewById
);

interviewRouter.post(
  "/:id/evaluation",
  authMiddleware,
  submitInterviewEvaluation
);

interviewRouter.patch(
  "/:id/evaluation",
  authMiddleware,
  updateInterviewEvaluation
);

// =====================================================
// APPLICATION INTERVIEW ROUTES
// Base URL: /api/applications
// =====================================================

export const applicationInterviewRouter =
  express.Router();

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
  getEvaluationFormForStage
);

// =====================================================
// EXPORT INTERVIEW ROUTER
// =====================================================

export default interviewRouter;