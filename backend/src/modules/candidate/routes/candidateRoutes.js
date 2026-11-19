
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

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../../hr/middleware/requireHrAccess.js";

const router = express.Router();

// =====================================================
// PUBLIC CANDIDATE APPLICATION
// =====================================================

router.post("/", createCandidate);

// =====================================================
// JOINING CONFIRMATION
// =====================================================

router.patch(
  "/:id/confirm-joining",
  authMiddleware,
  confirmCandidateJoining
);

// =====================================================
// JOINING DATE CORRECTION
// =====================================================

router.patch(
  "/:id/correct-joining-date",
  authMiddleware,
  correctCandidateJoiningDate
);

// =====================================================
// CANDIDATE JOINING HISTORY
// =====================================================

router.get(
  "/:id/joining-history",
  authMiddleware,
  getCandidateJoiningHistory
);

// =====================================================
// EXISTING CANDIDATE APIs
// =====================================================

router.get("/", authMiddleware, requireHrAccess, getCandidates);

router.get(
  "/export/excel",
  authMiddleware,
  requireHrAccess,
  exportCandidatesExcel
);

router.get("/:id", authMiddleware, requireHrAccess, getCandidate);

router.put("/:id", authMiddleware, requireHrAccess, updateCandidate);

router.delete("/:id", authMiddleware, requireHrAccess, deleteCandidate);

export default router;
