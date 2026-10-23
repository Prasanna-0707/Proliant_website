import express from "express";

import {
  getApplicationById,
  getApplicationResume,
} from "../controllers/applicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Retrieve the resume.
// Keep this route before "/:id" for clarity.
router.get(
  "/:id/resume",
  authMiddleware,
  getApplicationResume
);

// Retrieve one application's details.
router.get(
  "/:id",
  authMiddleware,
  getApplicationById
);

export default router;