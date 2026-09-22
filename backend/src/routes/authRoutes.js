import express from "express";

import {
  login,
  forgotPassword,
  verifyLoginOTP,
  verifyResetOTP,
  resetPassword,
  changePassword,
  createTeamMember,
  getTeamMembers,
  getMyProfile,
  updateMyProfile,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  login
);

router.post(
  "/verify-login-otp",
  verifyLoginOTP
);

// =====================================================
// FORGOT PASSWORD / RESET PASSWORD
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPassword
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

// =====================================================
// ADMIN PROFILE
// =====================================================

// Get currently logged-in admin profile
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

// Update currently logged-in admin profile
router.patch(
  "/profile",
  authMiddleware,
  updateMyProfile
);

// =====================================================
// TEAM MEMBERS
// =====================================================

// Create team member
router.post(
  "/team-members",
  authMiddleware,
  createTeamMember
);

// Get all team members
router.get(
  "/team-members",
  authMiddleware,
  getTeamMembers
);

// =====================================================
// LOGOUT
// =====================================================

router.post(
  "/logout",
  authMiddleware,
  logout
);

export default router;