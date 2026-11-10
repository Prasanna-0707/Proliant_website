import express from "express";

import authMiddleware from "../../../middleware/authMiddleware.js";

import requirePermission from "../../administrator/middleware/requirePermission.js";

import {
  requireHiringManager,
  passThroughUnlessHiringManager,
} from "../middleware/requireHiringManager.js";

import {
  getHiringPipeline,
  getApplicationDetailsForHiringManager,
  getApplicationFeedback,
  getApplicationDecisionHistory,
  submitApplicationDecision,
  getHiringFeedbackHistory,
} from "../controllers/hiringManagerController.js";

const hiringManagerRouter = express.Router();
const applicationHiringManagerRouter = express.Router();

// ============================================
// Hiring Manager APIs
// Base path: /api/hiring
// ============================================

// 1. View the hiring pipeline

hiringManagerRouter.get(
  "/pipeline",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.pipeline.read"),
  getHiringPipeline
);

// 2. View feedback history across accessible applications

hiringManagerRouter.get(
  "/feedback-history",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.pipeline.read"),
  getHiringFeedbackHistory
);

// ============================================
// Application-specific Hiring Manager APIs
// Base path: /api/applications
// ============================================

// 3. View application details.
//
// Non-Hiring-Managers continue to the existing
// application router.
//
// Hiring Managers must also have the read permission.

applicationHiringManagerRouter.get(
  "/:id",
  authMiddleware,
  passThroughUnlessHiringManager,
  requirePermission("hiring.pipeline.read"),
  getApplicationDetailsForHiringManager
);

// 4. View feedback for an application

applicationHiringManagerRouter.get(
  "/:id/feedback",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.pipeline.read"),
  getApplicationFeedback
);

// 5. View decision history for an application

applicationHiringManagerRouter.get(
  "/:id/decisions",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.pipeline.read"),
  getApplicationDecisionHistory
);

// 6. Submit a Hiring Manager decision

applicationHiringManagerRouter.post(
  "/:id/decisions",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.decision.submit"),
  submitApplicationDecision
);

// ============================================
// EXPORT ROUTERS
// ============================================

export { applicationHiringManagerRouter };

export default hiringManagerRouter;