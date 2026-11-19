import express from "express";

import {
  getPublishedJobs,
  getPublishedJobById,
} from "../controllers/candidateJobController.js";

const router = express.Router();

// Get all published jobs
router.get("/", getPublishedJobs);

// Get one published job
router.get("/:jobId", getPublishedJobById);

export default router;