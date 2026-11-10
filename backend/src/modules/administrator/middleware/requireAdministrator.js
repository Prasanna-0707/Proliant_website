
import {
  getTeamDirectoryAccess,
} from "../services/authorizationService.js";

// Allows only active Global Administrators and
// Department Administrators to access Admin APIs.

const requireAdministrator = (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const access = getTeamDirectoryAccess(
      req.admin,
      req.activeRole
    );

    if (
      !access ||
      !["GLOBAL", "DEPARTMENT_ADMIN"].includes(access.type)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Global Administrators and Department Administrators can access these APIs.",
      });
    }

    req.adminAccess = access;
    return next();
  } catch (error) {
    console.error("Administrator authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify Administrator permissions.",
    });
  }
};

export default requireAdministrator;
