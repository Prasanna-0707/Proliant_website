import express from "express";

import {
  getEmployeeCount,
  updateEmployeeCount,
} from "../controllers/siteSettingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get employee count
router.get("/employee-count", authMiddleware, getEmployeeCount);

// Update employee count
router.put("/employee-count", authMiddleware, updateEmployeeCount);

export default router;