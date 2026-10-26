import express from "express";

import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  updateTeamMemberStatus,
  deleteTeamMember,
} from "../controllers/teamMemberController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Read team directory
router.get("/", authMiddleware, getTeamMembers);
router.get("/:id", authMiddleware, getTeamMemberById);

// Create account
router.post("/", authMiddleware, createTeamMember);

// Edit permitted account fields
router.put("/:id", authMiddleware, updateTeamMember);

// Activate / deactivate account
router.patch(
  "/:id/status",
  authMiddleware,
  updateTeamMemberStatus
);

// Soft-delete account
router.delete("/:id", authMiddleware, deleteTeamMember);

export default router;