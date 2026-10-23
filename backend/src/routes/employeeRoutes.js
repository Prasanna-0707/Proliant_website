import express from "express";

import {
  getEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  bulkAddEmployees,
  uploadEmployeeFile,
} from "../controllers/employeeController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getEmployees);
router.post("/", authMiddleware, addEmployee);
router.post(
  "/bulk",
  authMiddleware,
  uploadEmployeeFile,
  bulkAddEmployees
);

router.delete("/:id", authMiddleware, deleteEmployee);
router.put("/:id", authMiddleware, updateEmployee);

export default router;