import express from "express";

import { getDashboardStats } from "../controllers/HRdashboardController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

const router = express.Router();

router.get("/stats", authMiddleware, requireHrAccess, getDashboardStats);

export default router;