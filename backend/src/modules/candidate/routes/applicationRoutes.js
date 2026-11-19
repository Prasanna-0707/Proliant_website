import express from "express";

import {
  getApplicationById,
  getApplicationResume,
} from "../controllers/applicationController.js";

import {
  submitL0Screening,
  getApplicationScreeningHistory,
} from "../../screener/controllers/screeningController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requirePermission from "../../../shared/middleware/requirePermission.js";

// Staff-facing application APIs, mounted at /api/applications.
// Access to an individual application is further restricted by
// applicationAccessService (role, department and assignment).
const router = express.Router();

router.get(
  "/:id/resume",
  authMiddleware,
  requirePermission("applications.resume.read"),
  getApplicationResume
);

router.post(
  "/:id/screenings/l0",
  authMiddleware,
  submitL0Screening
);

router.get(
  "/:id/screenings",
  authMiddleware,
  getApplicationScreeningHistory
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("applications.read"),
  getApplicationById
);

export default router;