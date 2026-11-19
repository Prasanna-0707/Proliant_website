import express from "express";

import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  updateTeamMemberStatus,
  deleteTeamMember,
} from "../controllers/teamMemberController.js";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import denyDepartmentAdministrator from "../../../shared/middleware/denyDepartmentAdministrator.js";

// Mounted at /api/auth/team-members
const router = express.Router();

router.use(authMiddleware, denyDepartmentAdministrator);

router.get("/", getTeamMembers);
router.get("/:id", getTeamMemberById);
router.post("/", createTeamMember);
router.put("/:id", updateTeamMember);
router.patch("/:id/status", updateTeamMemberStatus);
router.delete("/:id", deleteTeamMember);

export default router;
