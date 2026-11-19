import express from "express";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  exportCandidatesExcel,
} from "../controllers/HRcandidateController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";

const router = express.Router();

// Public - candidate can submit an application
router.post("/", createCandidate);

// Admin only
router.get("/", authMiddleware, getCandidates);
router.get("/export/excel",authMiddleware,exportCandidatesExcel);
router.get("/:id", authMiddleware, getCandidate);
router.put("/:id", authMiddleware, updateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);

export default router;