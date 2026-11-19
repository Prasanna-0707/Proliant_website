import RolePermission from "../models/RolePermission.js";

import {
  getActiveRole,
  isActiveAccount,
  normalizeRole,
  isGlobalAdministrator,
  isDepartmentAdministrator,
} from "../services/authorizationService.js";

// =====================================================
// CONVERT ACTIVE ROLE INTO ROLE PERMISSION KEY
// =====================================================

const getRolePermissionKey = (activeRole) => {
  const normalizedRole = normalizeRole(activeRole);

  // Only explicitly assigned L0 roles receive
  // the L0 Screener permission configuration.
  // Designation is never used for role mapping.

  const l0Roles = [
    "l0",
    "l0 screener",
    "l0 initial screener",
    "initial screener",
    "screener",
  ];

  const isExplicitL0Role =
    l0Roles.includes(normalizedRole) ||
    (
      normalizedRole.includes("l0") &&
      (
        normalizedRole.includes("screener") ||
        normalizedRole.includes("interviewer")
      )
    );

  if (isExplicitL0Role) {
    return "L0_SCREENER";
  }

  return normalizedRole
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

// =====================================================
// DEPARTMENT ADMIN PERMISSION RESTRICTIONS
// =====================================================

const DEPARTMENT_ADMIN_ALLOWED_PERMISSIONS = new Set([
  // Department Admin read-only dashboard
  "department.dashboard.read",

  // Department-scoped candidate read-only access
  "department.candidates.read",
  "department.candidate.details.read",
  "department.candidate.resume.read",
  "department.candidate.history.read",

  // Department-scoped interview feedback read-only access
  "department.interviews.feedback.read",

  // Department reports read-only access
  "department.reports.read",

  // User directory read-only access
  "admin.users.read",
]);

const LEGACY_HOD_ROLES = new Set([
  "hod",
  "head of department",
  "department head",
]);

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

      const normalizedRole = normalizeRole(activeRole);

      // 3. REJECT LEGACY HOD IDENTITIES

      if (LEGACY_HOD_ROLES.has(normalizedRole)) {
        return res.status(403).json({
          success: false,
          message:
            "HOD is not an authorized portal role. Use the appropriate Administrator account configuration.",
        });
      }

      // 4. VALIDATE ADMINISTRATOR SCOPE

      const isGlobalAdmin =
        isGlobalAdministrator(req.admin, activeRole);

      const isDepartmentAdmin =
        isDepartmentAdministrator(req.admin, activeRole);

      if (
        normalizedRole === "administrator" &&
        !isGlobalAdmin &&
        !isDepartmentAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your Administrator account must have a valid GLOBAL or DEPARTMENT scope and department assignment.",
        });
      }

      // 5. RESTRICT DEPARTMENT ADMINISTRATOR PERMISSIONS
      // Department Administrators are allowed only the
      // explicitly listed read-only permissions.
      //
      // User management mutations such as:
      // admin.users.create
      // admin.users.update
      // admin.users.role.update
      //
      // are intentionally excluded.

      if (
        isDepartmentAdmin &&
        !DEPARTMENT_ADMIN_ALLOWED_PERMISSIONS.has(
          permissionKey
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Department Administrators are restricted to approved read-only department-scoped permissions.",
          requiredPermission: permissionKey,
        });
      }

      // 6. RESOLVE ROLE PERMISSION DOCUMENT

      const roleKey = getRolePermissionKey(activeRole);

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

      // 7. CHECK REQUIRED PERMISSION

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

      // 8. STORE AUTHORIZATION CONTEXT

      req.permissionContext = {
        roleKey: rolePermission.key,
        roleName: rolePermission.name,
        activeRole,
        permission: permissionKey,

        dataScope: isGlobalAdmin
          ? "GLOBAL"
          : isDepartmentAdmin
            ? "DEPARTMENT"
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