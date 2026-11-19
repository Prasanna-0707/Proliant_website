
import express from "express";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  exportCandidatesExcel,
  confirmCandidateJoining,
  correctCandidateJoiningDate,
  getCandidateJoiningHistory,
} from "../controllers/candidateController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import denyDepartmentAdminGenericAccess from "../middleware/denyDepartmentAdminGenericAccess.js";

const router = express.Router();

// =====================================================
// PUBLIC CANDIDATE APPLICATION
// POST /api/candidates
// =====================================================

// Public applications must remain accessible.
router.post("/", createCandidate);

// =====================================================
// JOINING CONFIRMATION
// PATCH /api/candidates/:id/confirm-joining
// =====================================================

// Authorization is enforced inside the controller.
// Only authorized HR personnel and Global Administrators.
router.patch(
  "/:id/confirm-joining",
  authMiddleware,
  confirmCandidateJoining
);

// =====================================================
// JOINING DATE CORRECTION
// PATCH /api/candidates/:id/correct-joining-date
// =====================================================

router.patch(
  "/:id/correct-joining-date",
  authMiddleware,
  correctCandidateJoiningDate
);

// =====================================================
// CANDIDATE JOINING HISTORY
// GET /api/candidates/:id/joining-history
// =====================================================

router.get(
  "/:id/joining-history",
  authMiddleware,
  getCandidateJoiningHistory
);

// =====================================================
// EXISTING GENERIC CANDIDATE APIs
// =====================================================

// Department Administrators must use their dedicated,
// department-scoped APIs instead of these generic APIs.

// GET ALL CANDIDATES
router.get(
  "/",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  getCandidates
);

// EXPORT CANDIDATES TO EXCEL
router.get(
  "/export/excel",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  exportCandidatesExcel
);

// GET SINGLE CANDIDATE
router.get(
  "/:id",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  getCandidate
);

// UPDATE CANDIDATE
router.put(
  "/:id",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  updateCandidate
);

// DELETE CANDIDATE
router.delete(
  "/:id",
  authMiddleware,
  denyDepartmentAdminGenericAccess,
  deleteCandidate
);

export default router;
