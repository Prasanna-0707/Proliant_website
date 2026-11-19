import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";

import requirePermission from "../../../shared/middleware/requirePermission.js";

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
  getHiringInterviews,
} from "../controllers/hiringManagerController.js";

import requireHrAccess from "../../hr/middleware/requireHrAccess.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";
import {
  listAssignments,
  listHiringManagers,
  createAssignment,
  reassignAssignment,
  revokeHiringAssignment,
} from "../controllers/hiringAssignmentController.js";

const hiringManagerRouter = express.Router();
hiringManagerRouter.param("id", validateObjectIdParam);
const applicationHiringManagerRouter = express.Router();

// ============================================
// Hiring Manager APIs
// Base path: /api/hiring
// ============================================

// 0. Hiring Manager assignments (HR and Global Administrators).
// Registered first so these literal paths are never shadowed.

hiringManagerRouter.get("/assignments", authMiddleware, requireHrAccess, listAssignments);
hiringManagerRouter.get("/assignments/managers", authMiddleware, requireHrAccess, listHiringManagers);
hiringManagerRouter.post("/assignments", authMiddleware, requireHrAccess, createAssignment);
hiringManagerRouter.patch("/assignments/:id/reassign", authMiddleware, requireHrAccess, reassignAssignment);
hiringManagerRouter.delete("/assignments/:id", authMiddleware, requireHrAccess, revokeHiringAssignment);

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

// 2b. Scheduled interviews for assigned jobs

hiringManagerRouter.get(
  "/interviews",
  authMiddleware,
  requireHiringManager,
  requirePermission("hiring.pipeline.read"),
  getHiringInterviews
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