
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/Users.js";

import {
  generateAndStoreOTP,
  verifyOTP,
} from "../../../shared/services/otpService.js";

import {
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
  sendTemporaryPasswordEmail,
} from "../../../shared/services/emailService.js";

// =====================================================
// HELPERS
// =====================================================

const validatePassword = (password) =>
  typeof password === "string" && password.length >= 8;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isAccountUnavailable = (user) =>
  !user || user.deletedAt || user.status !== "Active";

const getUserProfileData = (user) => ({
  id: user._id,
  name: user.name || "",
  email: user.email,
  role: user.role,
  designation: user.designation || "",
  department: user.department || "",
  phone: user.phone || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// =====================================================
// LOGIN
// POST /api/auth/login
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

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (isAccountUnavailable(user)) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or unavailable",
      });
    }

    const otp = await generateAndStoreOTP(user.email, "login");
    await sendLoginOTPEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "Password verified. OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
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

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    if (!isAccountUnavailable(user)) {
      const otp = await generateAndStoreOTP(user.email, "reset");
      await sendForgotPasswordOTPEmail(user.email, otp);
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset OTP has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
    });
  }
};

// =====================================================
// VERIFY LOGIN OTP
// POST /api/auth/verify-login-otp
// =====================================================

export const verifyLoginOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp =
      typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Verify OTP before issuing an authenticated token.
    await verifyOTP(email, "login", otp);

    const user = await User.findOne({ email });

    if (isAccountUnavailable(user)) {
      return res.status(401).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userData = {
      ...getUserProfileData(user),
      mustChangePassword: user.mustChangePassword,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,

      // Compatibility with existing frontend code
      // that may still read response.admin.
      admin: userData,
    });
  } catch (error) {
    console.error("Login OTP verification error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

// =====================================================
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// =====================================================

export const verifyResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp =
      typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    await verifyOTP(email, "reset", otp);

    const user = await User.findOne({ email });

    if (isAccountUnavailable(user)) {
      return res.status(404).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        purpose: "password-reset",
        resetTokenVersion: user.resetTokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Reset OTP verification error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "OTP verification failed",
    });
  }
};

// =====================================================
// RESET PASSWORD
// PATCH /api/auth/reset-password
// =====================================================

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token and new password are required",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.email !== email || decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      email,
    }).select("+password");

    if (isAccountUnavailable(user)) {
      return res.status(404).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    if ((user.resetTokenVersion || 0) !== decoded.resetTokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Reset token is no longer valid",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetTokenVersion = (user.resetTokenVersion || 0) + 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login again",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// =====================================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (isAccountUnavailable(user)) {
      return res.status(401).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password change failed",
    });
  }
};

// =====================================================
// CREATE TEAM MEMBER
// POST /api/auth/team-members
// =====================================================

export const createTeamMember = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = req.body.role || "ADMIN";

    const allowedRoles = [
      "ADMIN",
      "HR",
      "INTERVIEWER",
      "HIRING_MANAGER",
      "L0_SCREENER",
    ];

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const temporaryPassword =
      crypto.randomBytes(12).toString("base64url") + "@1";

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const teamMember = await User.create({
      email,
      password: hashedPassword,
      name: "",
      role,
      designation: "",
      phone: "",
      status: "Active",
      tokenVersion: 0,
      resetTokenVersion: 0,
      mustChangePassword: true,
    });

    await sendTemporaryPasswordEmail(
      teamMember.email,
      temporaryPassword
    );

    return res.status(201).json({
      success: true,
      message: "Team member created successfully. Temporary password sent to email",
      teamMember: {
        id: teamMember._id,
        email: teamMember.email,
        role: teamMember.role,
      },
    });
  } catch (error) {
    console.error("Create team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Team member creation failed",
    });
  }
};

// =====================================================
// GET TEAM MEMBERS
// =====================================================

export const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find()
      .select("-password -tokenVersion -resetTokenVersion")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      teamMembers,
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

// =====================================================
// GET MY PROFILE
// GET /api/auth/me
// =====================================================

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -tokenVersion -resetTokenVersion");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    const profile = getUserProfileData(user);

    return res.status(200).json({
      success: true,
      user: profile,
      // Temporary compatibility for existing admin UI.
      admin: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// =====================================================
// UPDATE MY PROFILE
// PATCH /api/auth/profile
// =====================================================

export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "designation"];

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Only name, phone and designation can be updated",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || isAccountUnavailable(user)) {
      return res.status(404).json({
        success: false,
        message: "User profile not found or unavailable",
      });
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
        }

        user[field] = req.body[field].trim();
      }
    }

    await user.save();

    const profile = getUserProfileData(user);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: profile,
      admin: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};

// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
