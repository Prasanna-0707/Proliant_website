
import express from "express";

import {
  login,
  forgotPassword,
  verifyLoginOTP,
  verifyResetOTP,
  resetPassword,
  changePassword,
  getMyProfile,
  updateMyProfile,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Login and OTP verification
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);

// Forgot and reset password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Authenticated user operations
router.patch("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getMyProfile);
router.patch("/profile", authMiddleware, updateMyProfile);
router.post("/logout", authMiddleware, logout);

// Team-member routes are intentionally not enabled here yet.
// Enable these only after adding Admin-only authorization.
// router.post("/team-members", authMiddleware, allowRoles("ADMIN"), createTeamMember);
// router.get("/team-members", authMiddleware, allowRoles("ADMIN"), getTeamMembers);

export default router;
