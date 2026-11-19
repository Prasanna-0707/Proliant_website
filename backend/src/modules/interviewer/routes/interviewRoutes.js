import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";

import requirePermission from "../../../shared/middleware/requirePermission.js";

import {
  getMyInterviews,
  getInterviewById,
  submitInterviewEvaluation,
  updateInterviewEvaluation,
  getApplicationInterviews,
  getEvaluationFormForStage,
} from "../controllers/interviewController.js";

import {
  listEvaluationForms,
  getEvaluationFormById,
  createEvaluationForm,
  updateEvaluationForm,
  updateEvaluationFormStatus,
} from "../controllers/evaluationFormController.js";

import {
  listInterviews,
  listEligibleInterviewers,
  getManagedInterview,
  createInterview,
  rescheduleInterview,
  reassignInterviewer,
  cancelInterview,
} from "../controllers/interviewManagementController.js";

import requireHrAccess from "../../hr/middleware/requireHrAccess.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";

// =====================================================
// INTERVIEW ROUTES
// Base URL: /api/interviews
// =====================================================

const interviewRouter = express.Router();

interviewRouter.param("id", validateObjectIdParam);

// =====================================================
// INTERVIEW SCHEDULING AND MANAGEMENT
// HR, Global Administrators and L0 Screeners (role checks
// are inside the controller). These must be registered
// before "/:id".
// =====================================================

interviewRouter.get("/", authMiddleware, listInterviews);

interviewRouter.get(
  "/interviewers",
  authMiddleware,
  listEligibleInterviewers
);

interviewRouter.get(
  "/manage/:id",
  authMiddleware,
  getManagedInterview
);

interviewRouter.post("/", authMiddleware, createInterview);

interviewRouter.patch(
  "/:id/reschedule",
  authMiddleware,
  rescheduleInterview
);

interviewRouter.patch(
  "/:id/assign",
  authMiddleware,
  reassignInterviewer
);

interviewRouter.patch(
  "/:id/cancel",
  authMiddleware,
  cancelInterview
);

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

evaluationFormRouter.param("id", validateObjectIdParam);

// Form management: HR and Global Administrators only.
// These routes must be registered before "/:stage".
evaluationFormRouter.get(
  "/manage",
  authMiddleware,
  requireHrAccess,
  listEvaluationForms
);

evaluationFormRouter.post(
  "/manage",
  authMiddleware,
  requireHrAccess,
  createEvaluationForm
);

evaluationFormRouter.get(
  "/manage/:id",
  authMiddleware,
  requireHrAccess,
  getEvaluationFormById
);

evaluationFormRouter.put(
  "/manage/:id",
  authMiddleware,
  requireHrAccess,
  updateEvaluationForm
);

evaluationFormRouter.patch(
  "/manage/:id/status",
  authMiddleware,
  requireHrAccess,
  updateEvaluationFormStatus
);

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