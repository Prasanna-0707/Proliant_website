import RolePermission from "../models/RolePermission.js";

import {
  getActiveRole,
  isActiveAccount,
  isL0Screener,
  normalizeRole,
} from "../services/authorizationService.js";

// =====================================================
// CONVERT ACTIVE ROLE INTO ROLE PERMISSION KEY
// =====================================================

const getRolePermissionKey = (activeRole, user) => {
  const normalizedRole = normalizeRole(activeRole)
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  // Generic Interviewer accounts designated as L0
  // must use the L0 Screener permission configuration.
  if (
    normalizedRole === "INTERVIEWER" &&
    isL0Screener(user)
  ) {
    return "L0_SCREENER";
  }

  // Map role names to keys used in seedData.js.
  const roleAliases = {
    HEAD_OF_DEPARTMENT: "HOD",
  };

  return roleAliases[normalizedRole] || normalizedRole;
};

// =====================================================
// REQUIRE SPECIFIC PERMISSION
// =====================================================

const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // 1. CHECK AUTHENTICATED USER

      if (!req.admin || !isActiveAccount(req.admin)) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // 2. GET ACTIVE ROLE

      const activeRole = getActiveRole(
        req.admin,
        req.activeRole
      );

      if (!activeRole) {
        return res.status(403).json({
          success: false,
          message:
            "Your active role is not configured or authorized.",
        });
      }

      // 3. RESOLVE ROLE PERMISSION DOCUMENT

      const roleKey = getRolePermissionKey(
        activeRole,
        req.admin
      );

      const rolePermission = await RolePermission.findOne({
        key: roleKey,
        isActive: true,
      })
        .select("key name permissions dataScope")
        .lean();

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message:
            "No active permission configuration exists for your role.",
        });
      }

      // 4. CHECK REQUIRED PERMISSION

      const hasPermission =
        Array.isArray(rolePermission.permissions) &&
        rolePermission.permissions.includes(permissionKey);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
          requiredPermission: permissionKey,
        });
      }

      // 5. STORE AUTHORIZATION CONTEXT

      req.permissionContext = {
        roleKey: rolePermission.key,
        roleName: rolePermission.name,
        activeRole,
        permission: permissionKey,
        dataScope:
          req.admin.adminScope === "GLOBAL"
            ? "GLOBAL"
            : rolePermission.dataScope,
      };

      return next();
    } catch (error) {
      console.error(
        "Permission authorization error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to verify user permissions.",
      });
    }
  };
};

export default requirePermission;