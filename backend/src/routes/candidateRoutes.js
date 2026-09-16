import express from "express";

import {
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public - candidate can submit an application
router.post("/", createCandidate);

// Admin only
router.get("/", authMiddleware, getCandidates);
router.get("/:id", authMiddleware, getCandidate);
router.put("/:id", authMiddleware, updateCandidate);
router.delete("/:id", authMiddleware, deleteCandidate);

export default router;