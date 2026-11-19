
import express from "express";

import {
  getApplicationById,
  getApplicationResume,
} from "../controllers/applicationController.js";

import {
  submitL0Screening,
  getApplicationScreeningHistory,
} from "../modules/screener/controllers/screeningController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import denyDepartmentAdminGenericAccess from "../middleware/denyDepartmentAdminGenericAccess.js";

const router = express.Router();

// =====================================================
// GET APPLICATION RESUME
// GET /api/applications/:id/resume
// =====================================================

router.get(
  "/:id/resume",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  getApplicationResume
);

// =====================================================
// SUBMIT L0 SCREENING
// POST /api/applications/:id/screenings/l0
// =====================================================

router.post(
  "/:id/screenings/l0",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  submitL0Screening
);

// =====================================================
// GET APPLICATION SCREENING HISTORY
// GET /api/applications/:id/screenings
// =====================================================

router.get(
  "/:id/screenings",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  getApplicationScreeningHistory
);

// =====================================================
// GET APPLICATION DETAILS
// GET /api/applications/:id
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  getApplicationById
);

export default router;
