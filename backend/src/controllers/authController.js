import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";

import {
  generateAndStoreOTP,
  verifyOTP,
} from "../services/otpService.js";

import {
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
  sendTemporaryPasswordEmail,
} from "../services/emailService.js";

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const validatePassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8
  );
};

// =====================================================
// EMAIL NORMALIZATION
// =====================================================

const normalizeEmail = (email) => {
  return email?.trim().toLowerCase();
};

// =====================================================
// LOGIN
// =====================================================

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email });

    // TEMPORARY DEBUG LOGS
    console.log("LOGIN EMAIL:", email);
    console.log("ADMIN FOUND:", !!admin);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    // TEMPORARY DEBUG LOG
    console.log("PASSWORD VALID:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const otp = await generateAndStoreOTP(
      admin.email,
      "login"
    );

    await sendLoginOTPEmail(
      admin.email,
      otp
    );

    return res.status(200).json({
      success: true,
      message: "Password verified. OTP sent to your email",
      email: admin.email,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset OTP has been sent",
      });
    }

    const otp = await generateAndStoreOTP(
      admin.email,
      "reset"
    );

    await sendForgotPasswordOTPEmail(
      admin.email,
      otp
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset OTP has been sent",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

// =====================================================
// VERIFY LOGIN OTP
// =====================================================

export const verifyLoginOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    await verifyOTP(
      email,
      "login",
      otp
    );

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        tokenVersion: admin.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        mustChangePassword: admin.mustChangePassword,
      },
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// VERIFY RESET OTP
// =====================================================

export const verifyResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    await verifyOTP(
      email,
      "reset",
      otp
    );

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const resetToken = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        purpose: "password-reset",
        resetTokenVersion:
          admin.resetTokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const resetToken = req.body.resetToken;
    const newPassword = req.body.newPassword;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, reset token and new password are required",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long",
      });
    }

    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET
    );

    if (decoded.email !== email) {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (
      (admin.resetTokenVersion || 0) !==
      decoded.resetTokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: "Reset token is no longer valid",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    admin.password = hashedPassword;
    admin.mustChangePassword = false;

    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    admin.resetTokenVersion =
      (admin.resetTokenVersion || 0) + 1;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login again",
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    admin.password = hashedPassword;
    admin.mustChangePassword = false;

    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Password change failed",
      error: error.message,
    });
  }
};



// =====================================================
// LOGOUT
// =====================================================

export const logout = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(
      req.admin._id,
      {
        $inc: {
          tokenVersion: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};