import jwt from "jsonwebtoken";
import CandidateAccount from "../models/CandidateAccount.js";

const candidateAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check candidate role
    if (decoded.role !== "CANDIDATE") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Candidate access only.",
      });
    }

    // 4. Find candidate account
    const candidate = await CandidateAccount.findById(decoded.userId).select(
      "-password"
    );

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Candidate account not found",
      });
    }

    // 5. Check account status
    if (!candidate.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // 6. Attach candidate details to request
    req.candidate = candidate;

    // 7. Continue to controller
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.error("Candidate Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default candidateAuthMiddleware;