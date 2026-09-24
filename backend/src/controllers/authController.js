
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
// ADMIN PROFILE RESPONSE
// =====================================================

const getAdminProfileData = (admin) => {
  return {
    id: admin._id,
    name: admin.name || "",
    email: admin.email,
    role: admin.role || "Administrator",
    designation:
      admin.designation || "Administrator",
    phone: admin.phone || "",
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
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
      message:
        "Password verified. OTP sent to your email",
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

    // Do not reveal whether account exists
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
      message:
        "Failed to send password reset OTP",
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
        tokenVersion:
          admin.tokenVersion || 0,
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
        name: admin.name || "",
        email: admin.email,
        role:
          admin.role || "Administrator",
        designation:
          admin.designation ||
          "Administrator",
        phone: admin.phone || "",
        mustChangePassword:
          admin.mustChangePassword,
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
      message:
        "OTP verified successfully",
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

    if (
      !email ||
      !resetToken ||
      !newPassword
    ) {
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

    if (
      decoded.email !== email ||
      decoded.purpose !== "password-reset"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const admin = await Admin.findOne({
      email,
    });

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
        message:
          "Reset token is no longer valid",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    admin.password = hashedPassword;
    admin.mustChangePassword = false;

    // Invalidate existing login tokens
    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    // Invalidate reset tokens
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
      message:
        "Invalid or expired reset token",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
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
        message:
          "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    admin.password = hashedPassword;
    admin.mustChangePassword = false;

    // Invalidate existing login tokens
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
      message:
        "Password change failed",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE TEAM MEMBER
// =====================================================

export const createTeamMember = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingAdmin =
      await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const temporaryPassword =
      crypto.randomBytes(6)
        .toString("base64url") +
      "@1";

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );

    const teamMember =
      await Admin.create({
        email,
        password: hashedPassword,
        name: "",
        role: "Administrator",
        designation: "Administrator",
        phone: "",
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
      message:
        "Team member created successfully. Temporary password sent to email",
      teamMember: {
        id: teamMember._id,
        email: teamMember.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Team member creation failed",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL TEAM MEMBERS
// =====================================================

export const getTeamMembers = async (
  req,
  res
) => {
  try {
    const teamMembers =
      await Admin.find()
        .select(
          "-password -tokenVersion -resetTokenVersion"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      teamMembers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch team members",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY ADMIN PROFILE
// =====================================================

export const getMyProfile = async (
  req,
  res
) => {
  try {
    const admin = await Admin.findById(
      req.admin._id
    ).select(
      "-password -tokenVersion -resetTokenVersion"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: getAdminProfileData(admin),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MY ADMIN PROFILE
// =====================================================

export const updateMyProfile = async (
  req,
  res
) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "designation",
    ];

    const invalidFields =
      Object.keys(req.body).filter(
        (field) =>
          !allowedFields.includes(field)
      );

    // Email, password, role and security
    // fields cannot be updated here.
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Only name, phone and designation can be updated",
      });
    }

    const admin = await Admin.findById(
      req.admin._id
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin profile not found",
      });
    }

    // NAME
    if (req.body.name !== undefined) {
      if (
        typeof req.body.name !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be a string",
        });
      }

      admin.name = req.body.name.trim();
    }

    // PHONE
    if (req.body.phone !== undefined) {
      if (
        typeof req.body.phone !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Phone must be a string",
        });
      }

      admin.phone = req.body.phone.trim();
    }

    // DESIGNATION
    if (req.body.designation !== undefined) {
      if (
        typeof req.body.designation !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Designation must be a string",
        });
      }

      admin.designation =
        req.body.designation.trim();
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      admin: getAdminProfileData(admin),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Profile update failed",
      error: error.message,
    });
  }
};

// =====================================================
// LOGOUT
// =====================================================

export const logout = async (
  req,
  res
) => {
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