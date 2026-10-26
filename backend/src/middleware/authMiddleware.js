import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // Reject invalidated tokens.
    if ((admin.tokenVersion || 0) !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "Token is no longer valid. Please login again.",
      });
    }

    // Reject soft-deleted accounts.
    if (admin.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "This account is no longer available.",
      });
    }

    // Reject inactive accounts.
    if (admin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive. Please contact an administrator.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;