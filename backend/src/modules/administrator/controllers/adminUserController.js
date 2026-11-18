
import mongoose from "mongoose";

import Admin from "../../../models/Admin.js";

import {
  getTeamDirectoryAccess,
  canManageTeamMember,
  canViewTeamMember,
} from "../services/authorizationService.js";

import {
  createTeamMember as createExistingTeamMember,
  updateTeamMember as updateExistingTeamMember,
} from "../../../controllers/teamMemberController.js";

// =====================================================
// ADMIN USER ACCESS
// Only Global and Department Administrators can
// access these User Management APIs.
// =====================================================

const getAdminUserAccess = (req) => {
  const access = getTeamDirectoryAccess(
    req.admin,
    req.activeRole
  );

  if (
    !access ||
    !["GLOBAL", "DEPARTMENT_ADMIN"].includes(access.type)
  ) {
    return null;
  }

  return access;
};

const authorizeAdminUser = (req, res) => {
  const access = getAdminUserAccess(req);

  if (!access) {
    res.status(403).json({
      success: false,
      message:
        "Only Global Administrators and Department Administrators can manage user accounts.",
    });

    return null;
  }

  return access;
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

// Safe user fields.
// Passwords and authentication tokens are never returned.

const ADMIN_USER_SELECT =
  "_id name email role roles designation phone department adminScope status mustChangePassword createdAt updatedAt";

// =====================================================
// 1. GET ADMIN USERS
// GET /api/admin/users
// =====================================================

export const getAdminUsers = async (req, res) => {
  try {
    const access = authorizeAdminUser(req, res);

    if (!access) return;

    const page = parsePositiveInteger(req.query.page, 1);

    const limit = Math.min(
      parsePositiveInteger(req.query.limit, 20),
      100
    );

    const filter = {
      deletedAt: null,
    };

    // Department Administrators are restricted to
    // their own department.

    if (access.type === "DEPARTMENT_ADMIN") {
      if (
        req.query.department &&
        String(req.query.department).trim().toLowerCase() !==
          access.department.trim().toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can view users in your own department only.",
        });
      }

      filter.department = access.department;
      filter.adminScope = { $ne: "GLOBAL" };
    } else if (req.query.department) {
      filter.department = String(req.query.department).trim();
    }

    // Optional status filter.

    if (req.query.status) {
      const status = String(req.query.status).trim();

      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be Active or Inactive.",
        });
      }

      filter.status = status;
    }

    // Optional administrator-scope filter.

    if (req.query.adminScope) {
      const scope = String(req.query.adminScope)
        .trim()
        .toUpperCase();

      if (!["GLOBAL", "DEPARTMENT"].includes(scope)) {
        return res.status(400).json({
          success: false,
          message: "Invalid administrator scope.",
        });
      }

      if (
        access.type === "DEPARTMENT_ADMIN" &&
        scope === "GLOBAL"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Department Administrators cannot view Global Administrator accounts.",
        });
      }

      filter.adminScope = scope;
    }

    // Optional role filter.

    if (req.query.role) {
      const roleRegex = new RegExp(
        `^${escapeRegex(req.query.role)}$`,
        "i"
      );

      filter.$or = [
        { role: roleRegex },
        { roles: roleRegex },
      ];
    }

    // Optional search by name, email, phone,
    // designation or role.

    if (req.query.search) {
      const searchRegex = new RegExp(
        escapeRegex(req.query.search),
        "i"
      );

      const searchConditions = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { designation: searchRegex },
        { role: searchRegex },
        { roles: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchConditions },
        ];

        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Sorting is restricted to approved fields.

    const allowedSortFields = [
      "name",
      "email",
      "role",
      "department",
      "status",
      "createdAt",
    ];

    const requestedSort = String(
      req.query.sortBy || "createdAt"
    );

    const sortBy = allowedSortFields.includes(requestedSort)
      ? requestedSort
      : "createdAt";

    const sortOrder =
      String(req.query.sortOrder || "desc").toLowerCase() ===
      "asc"
        ? 1
        : -1;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      Admin.find(filter)
        .select(ADMIN_USER_SELECT)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Admin.countDocuments(filter),
    ]);

    const safeUsers = users.map((user) => ({
      ...user,

      isMe:
        user._id.toString() === req.admin._id.toString(),

      canManage: canManageTeamMember(
        req.admin,
        user,
        req.activeRole
      ),
    }));

    return res.status(200).json({
      success: true,
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch administrator users.",
    });
  }
};

// =====================================================
// 2. GET INDIVIDUAL ADMIN USER
// GET /api/admin/users/:id
// =====================================================

export const getAdminUserById = async (req, res) => {
  try {
    const access = authorizeAdminUser(req, res);

    if (!access) return;

    const { id } = req.params;

    // Validate MongoDB ObjectId.

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator user ID.",
      });
    }

    // Find the requested active account.

    const user = await Admin.findOne({
      _id: id,
      deletedAt: null,
    })
      .select(ADMIN_USER_SELECT)
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
    }

    // Check whether the logged-in administrator
    // is allowed to view this particular account.

    if (
      !canViewTeamMember(
        req.admin,
        user,
        req.activeRole
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        ...user,

        isMe:
          user._id.toString() === req.admin._id.toString(),

        canManage: canManageTeamMember(
          req.admin,
          user,
          req.activeRole
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get individual admin user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch administrator details.",
    });
  }
};

// =====================================================
// 3. CREATE ADMIN USER
// POST /api/admin/users
//
// Reuses the existing Team Members account-creation
// and audit-logging implementation.
// =====================================================

export const createAdminUser = async (req, res) => {
  try {
    const access = authorizeAdminUser(req, res);

    if (!access) return;

    return await createExistingTeamMember(req, res);
  } catch (error) {
    console.error("Create admin user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }
};

// =====================================================
// 4. UPDATE ADMIN USER
// PATCH /api/admin/users/:id
//
// Role and administrator-scope changes must use
// the dedicated /role endpoint.
// =====================================================

export const updateAdminUser = async (req, res) => {
  try {
    const access = authorizeAdminUser(req, res);

    if (!access) return;

    const body = req.body || {};

    if (
      Object.prototype.hasOwnProperty.call(body, "role") ||
      Object.prototype.hasOwnProperty.call(body, "roles") ||
      Object.prototype.hasOwnProperty.call(body, "adminScope")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Use the dedicated role endpoint to change user roles or administrator scope.",
      });
    }

    return await updateExistingTeamMember(req, res);
  } catch (error) {
    console.error("Update admin user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

// =====================================================
// 5. UPDATE ADMIN USER ROLE
// PATCH /api/admin/users/:id/role
//
// Reuses the existing account update and audit logic.
// =====================================================

export const updateAdminUserRole = async (req, res) => {
  try {
    const access = authorizeAdminUser(req, res);

    if (!access) return;

    const body = req.body || {};

    const allowedFields = [
      "role",
      "adminScope",
      "department",
      "reason",
    ];

    const unexpectedFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Only role, administrator scope, department and reason can be updated through this endpoint.",
      });
    }

    if (
      typeof body.role !== "string" ||
      !body.role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid role is required.",
      });
    }

    // Preserve the original body after delegating.

    const originalBody = req.body;

    req.body = {
      role: body.role.trim(),
      reason: String(body.reason || "").trim(),
    };

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "adminScope"
      )
    ) {
      req.body.adminScope = body.adminScope;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "department"
      )
    ) {
      req.body.department = body.department;
    }

    try {
      return await updateExistingTeamMember(req, res);
    } finally {
      req.body = originalBody;
    }
  } catch (error) {
    console.error("Update admin user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role.",
    });
  }
};
