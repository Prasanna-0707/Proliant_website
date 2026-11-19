import express from "express";

import { getDashboardStats } from "../controllers/HRdashboardController.js";
import authMiddleware from "../../auth/middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, getDashboardStats);

export default router;