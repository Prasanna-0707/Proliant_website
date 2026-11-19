
import bcrypt from "bcryptjs";
import CandidateAccount from "../models/CandidateAccount.js";
import generateCandidateId from "../../../shared/utils/generateCandidateId.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  generateAndStoreOTP,
  verifyOTP,
  OtpError,
} from "../../../shared/services/otpService.js";

import {
  sendCandidatePasswordResetOTPEmail,
  sendCandidatePasswordChangedEmail,
} from "../../../shared/services/emailService.js";

// =====================================================
// CANDIDATE REGISTRATION
// POST /api/candidate/auth/register
// =====================================================

export const registerCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // -------------------------------------------------
    // 1. Validate required fields
    // -------------------------------------------------

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and password are required",
      });
    }

    // -------------------------------------------------
    // 2. Normalize input
    // -------------------------------------------------

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid candidate details",
      });
    }

    // -------------------------------------------------
    // 3. Validate email format
    // -------------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // -------------------------------------------------
    // 4. Validate password
    // -------------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // -------------------------------------------------
    // 5. Check whether candidate already exists
    // -------------------------------------------------

    const existingCandidate = await CandidateAccount.findOne({
      email: normalizedEmail,
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // -------------------------------------------------
    // 6. Hash password
    // -------------------------------------------------

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      password,
      saltRounds
    );

    // -------------------------------------------------
    // 7. Create candidate account
    // -------------------------------------------------

        const candidateId = await generateCandidateId();

        const candidate = await CandidateAccount.create({
        candidateId,
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        });

    // -------------------------------------------------
    // 8. Return safe response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Candidate account created successfully",
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        isActive: candidate.isActive,
        createdAt: candidate.createdAt,
      },
    });

  } catch (error) {
    // -------------------------------------------------
    // Handle duplicate email race condition
    // -------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error(
      "Candidate registration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Candidate registration failed",
    });
  }
};



// Candidate Login
export const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find candidate account
    // password is select:false in the model, so explicitly include it
    const candidate = await CandidateAccount.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check account status
    if (!candidate.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact HR.",
      });
    }

    // 4. Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      candidate.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      {
        userId: candidate._id,
        role: "CANDIDATE",
        name: candidate.name,
        email: candidate.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 6. Update last login
    candidate.lastLoginAt = new Date();
    await candidate.save();

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: "Candidate login successful",
      token,
      candidate: {
        id: candidate._id,
        candidateId: candidate.candidateId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: "CANDIDATE",
      },
    });
  } catch (error) {
    console.error("Candidate Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// CANDIDATE PASSWORD RESET
//
//   POST /api/candidate/auth/forgot-password   { email }
//   POST /api/candidate/auth/verify-reset-otp  { email, otp }
//   POST /api/candidate/auth/reset-password    { email, resetToken, newPassword }
//
// The OTP is hashed in the database, expires in 5 minutes, allows 3
// attempts and has a 60 second resend cooldown. The reset token is
// short-lived and bound to the current password, so it works only once.
// =====================================================

const GENERIC_RESET_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";

const passwordFingerprint = (passwordHash) =>
  crypto
    .createHash("sha256")
    .update(String(passwordHash))
    .digest("hex")
    .slice(0, 24);

const cleanEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const forgotCandidatePassword = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const account = await CandidateAccount.findOne({ email });

    // Same response whether or not the account exists (no enumeration).
    if (account && account.isActive) {
      const otp = await generateAndStoreOTP(email, "candidate-reset");
      await sendCandidatePasswordResetOTPEmail(email, otp);
    }

    return res
      .status(200)
      .json({ success: true, message: GENERIC_RESET_MESSAGE });
  } catch (error) {
    if (error instanceof OtpError) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    console.error("Candidate forgot-password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send the verification code. Please try again.",
    });
  }
};

export const verifyCandidateResetOTP = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    const account = await CandidateAccount.findOne({ email }).select(
      "+password"
    );

    try {
      await verifyOTP(email, "candidate-reset", otp);
    } catch (otpError) {
      return res
        .status(400)
        .json({ success: false, message: otpError.message });
    }

    if (!account || !account.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or already used" });
    }

    const resetToken = jwt.sign(
      {
        sub: String(account._id),
        email,
        purpose: "candidate-password-reset",
        fp: passwordFingerprint(account.password),
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified. You can now set a new password.",
      resetToken,
    });
  } catch (error) {
    console.error("Candidate verify-reset-otp error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Unable to verify the code." });
  }
};

export const resetCandidatePassword = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);
    const { resetToken, newPassword } = req.body || {};

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token and new password are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Reset session is invalid or has expired.",
      });
    }

    const account = await CandidateAccount.findOne({ email }).select(
      "+password"
    );

    if (
      decoded.purpose !== "candidate-password-reset" ||
      decoded.email !== email ||
      !account ||
      String(account._id) !== decoded.sub ||
      decoded.fp !== passwordFingerprint(account.password)
    ) {
      return res.status(400).json({
        success: false,
        message: "Reset session is invalid or has already been used.",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();

    try {
      await sendCandidatePasswordChangedEmail(email, account.name);
    } catch (mailError) {
      console.error("Password changed email failed:", mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Password updated. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("Candidate reset-password error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Unable to reset the password." });
  }
};