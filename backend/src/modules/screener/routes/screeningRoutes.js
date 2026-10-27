import express from "express";

import {
  getAssignedL0Applications,
  getL0ScreeningStats,
} from "../controllers/screeningController.js";

import authMiddleware from "../../../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// L0 SCREENER APIs
// Base URL: /api/screenings
// =====================================================

// Applications assigned to the logged-in L0 screener
router.get(
  "/l0/assigned",
  authMiddleware,
  getAssignedL0Applications
);

// Statistics for the logged-in L0 screener
router.get(
  "/l0/stats",
  authMiddleware,
  getL0ScreeningStats
);

export default router;