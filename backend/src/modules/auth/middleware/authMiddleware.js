import mongoose from "mongoose";

import { verifyAccessToken } from "../services/tokenService.js";
import { findAccountById } from "../../../shared/services/accountService.js";
import { getAccountTypeForRole } from "../../../shared/constants/roles.js";

// =====================================================
// STAFF AUTHENTICATION MIDDLEWARE
//
// Verifies the JWT and loads the account from the
// collection named by the token's accountType:
//
//   ADMIN -> Admin  (Global / Department Administrator)
//   USER  -> User   (HR, Interviewer, Hiring Manager, L0 Screener)
//
// On success it sets:
//   req.user -> the loaded account document
//   req.auth -> { accountType, userId, role }
// =====================================================

const unauthorized = (res, message) =>
  res.status(401).json({ success: false, message });

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Access denied. No token provided.");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (
      !decoded.userId ||
      !decoded.accountType ||
      !mongoose.isValidObjectId(decoded.userId)
    ) {
      return unauthorized(res, "Invalid token. Please login again.");
    }

    const account = await findAccountById(
      decoded.accountType,
      decoded.userId
    );

    if (!account) {
      return unauthorized(res, "User not found.");
    }

    if ((account.tokenVersion || 0) !== decoded.tokenVersion) {
      return unauthorized(
        res,
        "Token is no longer valid. Please login again."
      );
    }

    if (account.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "This account is no longer available.",
      });
    }

    if (account.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // The account's role must belong to the collection it was
    // loaded from. This rejects inconsistent or tampered data.
    if (getAccountTypeForRole(account.role) !== decoded.accountType) {
      return unauthorized(res, "Invalid token. Please login again.");
    }

    req.user = account;
    req.auth = {
      accountType: decoded.accountType,
      userId: account._id.toString(),
      role: account.role,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return unauthorized(res, "Token expired. Please login again.");
    }

    return unauthorized(res, "Invalid or expired token.");
  }
};

export default authMiddleware;
