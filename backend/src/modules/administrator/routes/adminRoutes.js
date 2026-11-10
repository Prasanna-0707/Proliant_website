import express from "express";

import authMiddleware from "../../../middleware/authMiddleware.js";

import requireAdministrator from "../middleware/requireAdministrator.js";

import requirePermission from "../middleware/requirePermission.js";

// =====================================================
// USER MANAGEMENT CONTROLLER
// =====================================================

import {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  updateAdminUserRole,
} from "../controllers/adminUserController.js";

// =====================================================
// ROLES AND PERMISSIONS CONTROLLER
// =====================================================

import {
  getAdminRoles,
  updateRolePermissions,
} from "../controllers/adminRoleController.js";

// =====================================================
// AUDIT LOG CONTROLLER
// =====================================================

import {
  getAdminAuditLogs,
} from "../controllers/adminAuditController.js";

// =====================================================
// SETTINGS CONTROLLER
// =====================================================

import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/adminSettingsController.js";

// =====================================================
// DASHBOARD CONTROLLER
// =====================================================

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// =====================================================
// AUTHENTICATION AND ADMINISTRATOR AUTHORIZATION
// =====================================================

router.use(
  authMiddleware,
  requireAdministrator
);

// =====================================================
// USER MANAGEMENT APIs
// =====================================================

// GET /api/admin/users
router.get(
  "/users",
  requirePermission("admin.users.read"),
  getAdminUsers
);

// GET /api/admin/users/:id
router.get(
  "/users/:id",
  requirePermission("admin.users.read"),
  getAdminUserById
);

// POST /api/admin/users
router.post(
  "/users",
  requirePermission("admin.users.create"),
  createAdminUser
);

// PATCH /api/admin/users/:id
router.patch(
  "/users/:id",
  requirePermission("admin.users.update"),
  updateAdminUser
);

// PATCH /api/admin/users/:id/role
router.patch(
  "/users/:id/role",
  requirePermission("admin.users.role.update"),
  updateAdminUserRole
);

// =====================================================
// ROLES AND PERMISSIONS APIs
// =====================================================

// GET /api/admin/roles
router.get(
  "/roles",
  requirePermission("admin.roles.read"),
  getAdminRoles
);

// PUT /api/admin/roles/:id/permissions
router.put(
  "/roles/:id/permissions",
  requirePermission("admin.roles.permissions.update"),
  updateRolePermissions
);

// =====================================================
// AUDIT LOGS API
// =====================================================

// GET /api/admin/audit-logs
router.get(
  "/audit-logs",
  requirePermission("admin.audit.read"),
  getAdminAuditLogs
);

// =====================================================
// ADMINISTRATOR SETTINGS APIs
// =====================================================

// GET /api/admin/settings
router.get(
  "/settings",
  requirePermission("admin.settings.read"),
  getAdminSettings
);

// PATCH /api/admin/settings
router.patch(
  "/settings",
  requirePermission("admin.settings.update"),
  updateAdminSettings
);

// =====================================================
// ADMINISTRATOR DASHBOARD API
// =====================================================

// GET /api/admin/dashboard
router.get(
  "/dashboard",
  requirePermission("admin.dashboard.read"),
  getAdminDashboard
);

// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;