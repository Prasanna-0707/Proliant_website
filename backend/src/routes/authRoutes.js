import express from "express";

import {
  login,
  forgotPassword,
  verifyLoginOTP,
  verifyResetOTP,
  resetPassword,
  changePassword,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// =====================================================
// LOGIN
// =====================================================

// Step 1: Email + Password
router.post("/login", login);

// Step 2: Verify Login OTP
router.post("/verify-login-otp", verifyLoginOTP);


// =====================================================
// FORGOT PASSWORD
// =====================================================

// Step 1: Request Reset OTP
router.post("/forgot-password", forgotPassword);

// Step 2: Verify Reset OTP
router.post("/verify-reset-otp", verifyResetOTP);

// Step 3: Reset Password
router.post("/reset-password", resetPassword);


// =====================================================
// PROTECTED AUTH ROUTES
// =====================================================

// Change Password
router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

// Logout
router.post(
  "/logout",
  authMiddleware,
  logout
);


export default router;