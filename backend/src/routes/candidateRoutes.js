
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

router.get("/", authMiddleware, getCandidates);

router.get(
  "/export/excel",
  authMiddleware,
  exportCandidatesExcel
);

router.get("/:id", authMiddleware, getCandidate);

router.put("/:id", authMiddleware, updateCandidate);

router.delete("/:id", authMiddleware, deleteCandidate);

export default router;
