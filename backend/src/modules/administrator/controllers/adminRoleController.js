
import mongoose from "mongoose";

import RolePermission from "../models/RolePermission.js";

import {
  getTeamDirectoryAccess,
  isGlobalAdministrator,
} from "../services/authorizationService.js";

import { createAuditLog } from "../../../services/auditLogService.js";

// =====================================================
// ALLOWED PERMISSION CATALOG
// Only permissions registered here can be assigned.
// =====================================================

export const AVAILABLE_PERMISSIONS = [
  // ---------------------------------------------------
  // ADMIN DASHBOARD
  // ---------------------------------------------------

  {
    key: "admin.dashboard.read",
    description: "View Administrator dashboard",
    category: "Dashboard",
  },

  // ---------------------------------------------------
  // USER MANAGEMENT
  // ---------------------------------------------------

  {
    key: "admin.users.read",
    description: "View user accounts",
    category: "User Management",
  },
  {
    key: "admin.users.create",
    description: "Create user accounts",
    category: "User Management",
  },
  {
    key: "admin.users.update",
    description: "Update user information",
    category: "User Management",
  },
  {
    key: "admin.users.role.update",
    description: "Change assigned user roles",
    category: "User Management",
  },

  // ---------------------------------------------------
  // ROLE MANAGEMENT
  // ---------------------------------------------------

  {
    key: "admin.roles.read",
    description: "View roles and permissions",
    category: "Roles",
  },
  {
    key: "admin.roles.permissions.update",
    description: "Update role permissions",
    category: "Roles",
  },

  // ---------------------------------------------------
  // AUDIT
  // ---------------------------------------------------

  {
    key: "admin.audit.read",
    description: "View audit logs",
    category: "Audit",
  },

  // ---------------------------------------------------
  // ADMIN SETTINGS
  // ---------------------------------------------------

  {
    key: "admin.settings.read",
    description: "View Administrator settings",
    category: "Settings",
  },
  {
    key: "admin.settings.update",
    description: "Update Administrator settings",
    category: "Settings",
  },

  // ---------------------------------------------------
  // SHARED APPLICATION ACCESS
  // ---------------------------------------------------

  {
    key: "applications.read",
    description: "View authorized candidate application details",
    category: "Applications",
  },
  {
    key: "applications.resume.read",
    description: "View resumes for authorized applications",
    category: "Applications",
  },

  // ---------------------------------------------------
  // SCREENING
  // ---------------------------------------------------

  {
    key: "screening.assigned.read",
    description: "View assigned screening applications",
    category: "Screening",
  },
  {
    key: "screening.history.read",
    description: "View authorized screening history and oversight records",
    category: "Screening",
  },
  {
    key: "screening.checklist.update",
    description: "Update screening checklist",
    category: "Screening",
  },
  {
    key: "screening.decision.submit",
    description: "Submit screening decisions",
    category: "Screening",
  },

  // ---------------------------------------------------
  // INTERVIEWS
  // ---------------------------------------------------

  {
    key: "interviews.assigned.read",
    description: "View assigned interviews",
    category: "Interviews",
  },
  {
    key: "interviews.evaluation.submit",
    description: "Submit interview evaluations",
    category: "Interviews",
  },

  // ---------------------------------------------------
  // HIRING
  // ---------------------------------------------------

  {
    key: "hiring.pipeline.read",
    description: "View assigned hiring pipeline",
    category: "Hiring",
  },
  {
    key: "hiring.decision.submit",
    description: "Submit hiring decisions",
    category: "Hiring",
  },

  // ---------------------------------------------------
  // TEAM MEMBERS
  // ---------------------------------------------------

  {
    key: "team.members.read",
    description: "View permitted team directory records",
    category: "Team Members",
  },
];

// =====================================================
// HELPERS
// =====================================================

const getRoleDocument = async (id) => {
  if (mongoose.isValidObjectId(id)) {
    return RolePermission.findById(id);
  }

  return RolePermission.findOne({
    key: String(id).trim().toUpperCase(),
  });
};

const getAuditSnapshot = (role) => ({
  _id: role._id,
  key: role.key,
  name: role.name,
  permissions: [...role.permissions],
  dataScope: role.dataScope,
  isActive: role.isActive,
});

// =====================================================
// 1. GET ROLES
// GET /api/admin/roles
// =====================================================

export const getAdminRoles = async (req, res) => {
  try {
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
        message: "You cannot view role permissions.",
      });
    }

    const includeInactive =
      access.type === "GLOBAL" &&
      req.query.includeInactive === "true";

    const filter = includeInactive
      ? {}
      : { isActive: true };

    const roles = await RolePermission.find(filter)
      .select(
        "_id key name description permissions dataScope isSystemRole isActive createdAt updatedAt"
      )
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: roles.length,
      roles,
      availablePermissions: AVAILABLE_PERMISSIONS,
      canModifyPermissions: access.type === "GLOBAL",
    });
  } catch (error) {
    console.error("Get administrator roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles and permissions.",
    });
  }
};

// =====================================================
// 2. UPDATE ROLE PERMISSIONS
// PUT /api/admin/roles/:id/permissions
// Only Global Administrators can modify permissions.
// =====================================================

export const updateRolePermissions = async (req, res) => {
  let session;

  try {
    if (
      !isGlobalAdministrator(
        req.admin,
        req.activeRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Global Administrators can modify organization-wide role permissions.",
      });
    }

    const { id } = req.params;
    const { permissions, reason } = req.body || {};

    if (
      !id ||
      (
        !mongoose.isValidObjectId(id) &&
        !String(id).trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid role ID or role key is required.",
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be provided as an array.",
      });
    }

    if (permissions.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 100 permissions is allowed.",
      });
    }

    if (
      permissions.some(
        (permission) =>
          typeof permission !== "string" ||
          !permission.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Every permission must be a non-empty string.",
      });
    }

    const normalizedPermissions = [
      ...new Set(
        permissions.map((permission) =>
          permission.trim().toLowerCase()
        )
      ),
    ];

    const allowedPermissionKeys = new Set(
      AVAILABLE_PERMISSIONS.map(
        (permission) => permission.key
      )
    );

    const invalidPermissions = normalizedPermissions.filter(
      (permission) => !allowedPermissionKeys.has(permission)
    );

    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more permissions are not supported.",
        invalidPermissions,
      });
    }

    const role = await getRoleDocument(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const before = getAuditSnapshot(role);

    role.permissions = normalizedPermissions;
    role.updatedBy = req.admin._id;

    // Role modification and its audit record are committed
    // together through a MongoDB transaction.

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await role.save({ session });

      await createAuditLog({
        req,
        action: "ROLE_PERMISSIONS_UPDATED",
        targetType: "RolePermission",
        targetId: role._id,
        targetLabel: role.name,
        department: req.admin.department || "",
        before,
        after: getAuditSnapshot(role),
        reason:
          typeof reason === "string"
            ? reason.trim()
            : "",
        session,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Role permissions updated successfully.",
      auditLogged: true,
      role: {
        _id: role._id,
        key: role.key,
        name: role.name,
        permissions: role.permissions,
        dataScope: role.dataScope,
        isActive: role.isActive,
      },
    });
  } catch (error) {
    console.error("Update role permissions error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to update role permissions. The transaction was not committed.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
