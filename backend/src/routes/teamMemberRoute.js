import express from "express";

import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/teamMemberController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const normalizeEmail = (email = "") => {
  return email.trim().toLowerCase();
};

const router = express.Router();


// =====================================================
// TEAM MEMBERS
// =====================================================

// Get all team members
router.get(
  "/",
  authMiddleware,
  getTeamMembers
);


// Get one team member
router.get(
  "/:id",
  authMiddleware,
  getTeamMemberById
);


// Create team member
router.post(
  "/",
  authMiddleware,
  createTeamMember
);


// Update team member
router.put(
  "/:id",
  authMiddleware,
  updateTeamMember
);


// Delete team member
router.delete(
  "/:id",
  authMiddleware,
  deleteTeamMember
);


export default router;