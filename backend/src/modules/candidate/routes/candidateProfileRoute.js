import express from "express";

import candidateAuthMiddleware from "../../../middleware/candidateAuthMiddleware.js";

import {
  getCandidateProfile,
  updateCandidateProfile,
  updateCandidateResume,
  deleteCandidateResume,
} from "../controllers/candidateProfileController.js";

const router = express.Router();

// Get Candidate Profile
router.get(
  "/profile",
  candidateAuthMiddleware,
  getCandidateProfile
);

// Update Candidate Profile
router.put(
  "/profile",
  candidateAuthMiddleware,
  updateCandidateProfile
);

// Add or Update Candidate Resume
router.put(
  "/profile/resume",
  candidateAuthMiddleware,
  updateCandidateResume
);

// Delete Candidate Resume
router.delete(
  "/profile/resume",
  candidateAuthMiddleware,
  deleteCandidateResume
);

export default router;