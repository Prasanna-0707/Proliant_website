import express from "express";

import { applyForJob, getMyApplications, getMyApplicationDetails,} from "../controllers/candidateApplicationController.js";

import candidateAuthMiddleware from "../../../middleware/candidateAuthMiddleware.js";

const router = express.Router();

// Candidate applies for a job
router.post(
  "/",
  candidateAuthMiddleware,
  applyForJob,
);

// Candidate fetches their own applications
router.get(
  "/",
  candidateAuthMiddleware,
  getMyApplications
);

// Candidate fetches details of a specific application
router.get(
  "/:applicationId",
  candidateAuthMiddleware,
  getMyApplicationDetails
);

export default router;