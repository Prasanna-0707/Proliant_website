import express from "express";

import {
  getEmployeeCount,
  updateEmployeeCount,
} from "../controllers/HRsiteSettingController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

const router = express.Router();

router.use(authMiddleware, requireHrAccess);

router.get("/employee-count", getEmployeeCount);
router.put("/employee-count", updateEmployeeCount);

export default router;