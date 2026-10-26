import express from "express";

import {
  // Public Careers page
  getJobs,
  getJob,

  // HR job management
  getJobsForHR,
  getJobForHR,

  // Job management operations
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// HR JOB MANAGEMENT ROUTES
// These include Draft and Published jobs.
// Authentication is required.
// =====================================================

// Get all jobs for the HR Jobs table.
// Includes Job Owner and Created By details.
router.get(
  "/manage",
  authMiddleware,
  getJobsForHR
);

// Get one job for the HR details modal.
// Includes all job fields and staff details.
router.get(
  "/manage/:id",
  authMiddleware,
  getJobForHR
);

// =====================================================
// PUBLIC CAREERS PAGE ROUTES
// Only Published jobs currently accepting applications.
// =====================================================

// Get all publicly available jobs.
router.get(
  "/",
  getJobs
);

// Get one publicly available job.
router.get(
  "/:id",
  getJob
);

// =====================================================
// CREATE JOB
// =====================================================

router.post(
  "/",
  authMiddleware,
  createJob
);

// =====================================================
// UPDATE JOB
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  updateJob
);

// =====================================================
// DELETE JOB
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteJob
);

export default router;