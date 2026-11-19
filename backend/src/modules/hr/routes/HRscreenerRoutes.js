import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

import {
  listScreeners,
  listScreeningApplications,
  assignScreener,
  reassignScreener,
  getAssignmentHistory,
} from "../controllers/HRscreenerController.js";

// Base URL: /api/hr-screeners  (HR and Global Administrators only)
const router = express.Router();

router.use(authMiddleware, requireHrAccess);

router.get("/", listScreeners);
router.get("/applications", listScreeningApplications);
router.get("/assignment-history", getAssignmentHistory);
router.post("/assign", assignScreener);
router.post("/reassign", reassignScreener);

export default router;
