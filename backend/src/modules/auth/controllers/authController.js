import bcrypt from "bcryptjs";

import {
  generateAndStoreOTP,
  verifyOTP,
  OtpError,
} from "../../../shared/services/otpService.js";

import {
  sendLoginOTPEmail,
  sendForgotPasswordOTPEmail,
} from "../../../shared/services/emailService.js";

import {
  findAccountByEmail,
  findAccountById,
  normalizeEmail,
} from "../../../shared/services/accountService.js";

import {
  isGlobalAdministrator,
  isDepartmentAdministrator,
} from "../../../shared/services/authorizationService.js";

import {
  signAccessToken,
  signResetToken,
  verifyResetToken,
} from "../services/tokenService.js";

// =====================================================
// HELPERS
// =====================================================

const validatePassword = (password) =>
  typeof password === "string" && password.length >= 8;

const isAccountUnavailable = (account) =>
  !account || account.deletedAt || account.status !== "Active";

// Effective administrator access after the approved-Global-Admin rule:
// "GLOBAL", "DEPARTMENT", or "NONE" (also for every non-administrator).
const getAdminAccessLevel = (account) => {
  if (isGlobalAdministrator(account)) return "GLOBAL";
  if (isDepartmentAdministrator(account)) return "DEPARTMENT";

  return "NONE";
};

const getProfileData = (account, accountType) => ({
  id: account._id,
  name: account.name || "",
  email: account.email,
  role: account.role,
  accountType,
  designation: account.designation || "",
  department: account.department || "",
  adminScope: account.adminScope ?? null,
  adminAccessLevel: getAdminAccessLevel(account),
  phone: account.phone || "",
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

// =====================================================
// LOGIN
// POST /api/auth/login
//
// The account is located in the Admin collection first and
// then in the User collection. Emails are unique across both.
// =====================================================

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const found = await findAccountByEmail(email, {
      includePassword: true,
    });

    if (
      !found ||
      !(await bcrypt.compare(password, found.account.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (isAccountUnavailable(found.account)) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or unavailable",
      });
    }

    const otp = await generateAndStoreOTP(found.account.email, "login");
    await sendLoginOTPEmail(found.account.email, otp);

    return res.status(200).json({
      success: true,
      message: "Password verified. OTP sent to your email",
      email: found.account.email,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof OtpError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

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
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const found = await findAccountByEmail(email);

    // Do not reveal whether an account exists.
    if (found && !isAccountUnavailable(found.account)) {
      const otp = await generateAndStoreOTP(found.account.email, "reset");
      await sendForgotPasswordOTPEmail(found.account.email, otp);
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset OTP has been sent",
    });
  } catch (error) {
    // A resend-cooldown rejection must look identical to success so the
    // endpoint never reveals whether an account exists.
    if (error instanceof OtpError) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset OTP has been sent",
      });
    }

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
    const email = normalizeEmail(req.body?.email);
    const otp =
      typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Verify the OTP before issuing an authenticated token.
    await verifyOTP(email, "login", otp);

    const found = await findAccountByEmail(email);

    if (!found || isAccountUnavailable(found.account)) {
      return res.status(401).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const { account, accountType } = found;

    const token = signAccessToken(account, accountType);

    const userData = {
      ...getProfileData(account, accountType),
      mustChangePassword: account.mustChangePassword,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      accountType,
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
    const email = normalizeEmail(req.body?.email);
    const otp =
      typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    await verifyOTP(email, "reset", otp);

    const found = await findAccountByEmail(email);

    if (!found || isAccountUnavailable(found.account)) {
      return res.status(404).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const resetToken = signResetToken(found.account, found.accountType);

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
// POST /api/auth/reset-password
// =====================================================

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { resetToken, newPassword } = req.body || {};

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

    let decoded;

    try {
      decoded = verifyResetToken(resetToken);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.email !== email || decoded.purpose !== "password-reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const account = await findAccountById(
      decoded.accountType,
      decoded.userId,
      { includePassword: true }
    );

    if (!account || account.email !== email || isAccountUnavailable(account)) {
      return res.status(404).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    if ((account.resetTokenVersion || 0) !== decoded.resetTokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Reset token is no longer valid",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);
    account.mustChangePassword = false;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.resetTokenVersion = (account.resetTokenVersion || 0) + 1;

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login again",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// =====================================================

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

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

    const account = await findAccountById(
      req.auth.accountType,
      req.user._id,
      { includePassword: true }
    );

    if (isAccountUnavailable(account)) {
      return res.status(401).json({
        success: false,
        message: "Account not found or unavailable",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    account.password = await bcrypt.hash(newPassword, 10);
    account.mustChangePassword = false;
    account.tokenVersion = (account.tokenVersion || 0) + 1;

    await account.save();

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
// GET MY PROFILE
// GET /api/auth/me
// =====================================================

export const getMyProfile = async (req, res) => {
  try {
    const profile = getProfileData(req.user, req.auth.accountType);

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
    const body = req.body || {};

    const invalidFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Only name, phone and designation can be updated",
      });
    }

    const account = await findAccountById(
      req.auth.accountType,
      req.user._id
    );

    if (isAccountUnavailable(account)) {
      return res.status(404).json({
        success: false,
        message: "User profile not found or unavailable",
      });
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
        }

        account[field] = body[field].trim();
      }
    }

    await account.save();

    const profile = getProfileData(account, req.auth.accountType);

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
    await req.user.constructor.updateOne(
      { _id: req.user._id },
      { $inc: { tokenVersion: 1 } }
    );

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
