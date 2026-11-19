import {
  getActiveRole,
  isActiveAccount,
  isGlobalAdministrator,
  isDepartmentAdministrator,
} from "../../administrator/services/authorizationService.js";

// =====================================================
// REQUIRE DEPARTMENT ADMINISTRATOR ACCESS
//
// Permitted accounts:
// 1. Global Administrator
// 2. Department Administrator
//
// This module provides READ-ONLY oversight.
// =====================================================

const requireDepartmentAdmin = (req, res, next) => {
  try {
    // 1. CHECK AUTHENTICATED ACCOUNT

    const user = req.admin;

    if (!user || !isActiveAccount(user)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // 2. RESOLVE ACTIVE ROLE

    const activeRole = getActiveRole(
      user,
      req.activeRole
    );

    if (!activeRole) {
      return res.status(403).json({
        success: false,
        message:
          "Your active role is not configured or authorized.",
      });
    }

    // 3. DETERMINE ADMINISTRATOR SCOPE

    let accessScope = null;

    if (isGlobalAdministrator(user, activeRole)) {
      accessScope = "GLOBAL";
    } else if (
      isDepartmentAdministrator(user, activeRole)
    ) {
      accessScope = "DEPARTMENT";
    }

    if (!accessScope) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to the Department Admin module.",
      });
    }

    // 4. GET DEPARTMENT FROM AUTHENTICATED ACCOUNT

    const department = String(
      user.department || ""
    ).trim();

    if (
      accessScope === "DEPARTMENT" &&
      !department
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account does not have a department assigned.",
      });
    }

    // 5. ENFORCE READ-ONLY ACCESS

    const allowedMethods = [
      "GET",
      "HEAD",
      "OPTIONS",
    ];

    if (
      !allowedMethods.includes(
        String(req.method).toUpperCase()
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Department Admin access is read-only.",
      });
    }

    // 6. ATTACH ACCESS CONTEXT

    req.departmentAdminAccess = {
      userId: user._id,
      activeRole,
      scope: accessScope,
      department:
        accessScope === "GLOBAL"
          ? null
          : department,
      readOnly: true,
    };

    return next();
  } catch (error) {
    console.error(
      "Department Admin authorization error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify Department Admin access.",
    });
  }
};

export default requireDepartmentAdmin;