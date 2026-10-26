import express from "express";
import candidateAuthMiddleware from "../../../middleware/candidateAuthMiddleware.js";
import { getCandidateDashboard } from "../controllers/candidateDashboardController.js";

const router = express.Router();

router.get(
  "/",
  candidateAuthMiddleware,
  getCandidateDashboard
);

export default router;