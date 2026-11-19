
import express from "express";


import {
  registerCandidate,
  loginCandidate,
  forgotCandidatePassword,
  verifyCandidateResetOTP,
  resetCandidatePassword,
} from "../controllers/candidateAuthController.js";


const router = express.Router();

// Candidate Registration
router.post("/register", registerCandidate);

// Candidate Login
router.post("/login", loginCandidate);

// Candidate password reset (OTP by email)
router.post("/forgot-password", forgotCandidatePassword);
router.post("/verify-reset-otp", verifyCandidateResetOTP);
router.post("/reset-password", resetCandidatePassword);

export default router;