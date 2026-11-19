import express from "express";

import {
  getEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  bulkAddEmployees,
  uploadEmployeeFile,
} from "../controllers/HRemployeeController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";
import requireHrAccess from "../middleware/requireHrAccess.js";

const router = express.Router();

router.param("id", validateObjectIdParam);

// Employee directory management: HR and Global Administrators only.
router.use(authMiddleware, requireHrAccess);

router.get("/", getEmployees);

router.post("/", addEmployee);

router.post("/bulk", uploadEmployeeFile, bulkAddEmployees);

router.delete("/:id", deleteEmployee);

router.put("/:id", updateEmployee);

export default router;