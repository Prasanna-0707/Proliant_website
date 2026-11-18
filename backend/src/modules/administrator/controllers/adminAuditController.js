
import mongoose from "mongoose";

import AuditLog from "../../../models/AuditLog.js";

import {
  getTeamDirectoryAccess,
} from "../services/authorizationService.js";

// =====================================================
// HELPERS
// =====================================================

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

const parseDateFilter = (value, isEndDate = false) => {
  if (!value) return null;

  const dateString = String(value).trim();

  // Include the entire day for a date-only end date.
  if (isEndDate && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const date = new Date(`${dateString}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    date.setUTCDate(date.getUTCDate() + 1);

    return {
      value: date,
      operator: "$lt",
    };
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return {
    value: date,
    operator: isEndDate ? "$lte" : "$gte",
  };
};

// =====================================================
// GET ADMIN AUDIT LOGS
// GET /api/admin/audit-logs
// =====================================================

export const getAdminAuditLogs = async (req, res) => {
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
        message: "You do not have permission to view audit logs.",
      });
    }

    const page = parsePositiveInteger(req.query.page, 1);

    const limit = Math.min(
      parsePositiveInteger(req.query.limit, 20),
      100
    );

    const filter = {};

    // -------------------------------------------------
    // DEPARTMENT RESTRICTION
    // -------------------------------------------------

    if (access.type === "DEPARTMENT_ADMIN") {
      if (
        req.query.department &&
        String(req.query.department).trim().toLowerCase() !==
          access.department.trim().toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view audit logs belonging to your department.",
        });
      }

      filter.department = access.department;
    } else if (req.query.department) {
      filter.department = String(req.query.department).trim();
    }

    // -------------------------------------------------
    // ACTION FILTER
    // -------------------------------------------------

    if (req.query.action) {
      filter.action = String(req.query.action)
        .trim()
        .toUpperCase();
    }

    // -------------------------------------------------
    // RESOURCE TYPE FILTER
    // -------------------------------------------------

    if (req.query.targetType) {
      filter.targetType = String(req.query.targetType).trim();
    }

    // -------------------------------------------------
    // ACTOR FILTER
    // -------------------------------------------------

    if (req.query.actorId) {
      if (!mongoose.isValidObjectId(req.query.actorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid actor ID.",
        });
      }

      filter.actor = req.query.actorId;
    }

    // -------------------------------------------------
    // DATE RANGE FILTER
    // -------------------------------------------------

    const startDate = parseDateFilter(
      req.query.startDate || req.query.from
    );

    const endDate = parseDateFilter(
      req.query.endDate || req.query.to,
      true
    );

    if (startDate === undefined || endDate === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid date filter.",
      });
    }

    if (
      startDate &&
      endDate &&
      startDate.value >= endDate.value
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date must be earlier than end date.",
      });
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt[startDate.operator] = startDate.value;
      }

      if (endDate) {
        filter.createdAt[endDate.operator] = endDate.value;
      }
    }

    // -------------------------------------------------
    // KEYWORD SEARCH
    // -------------------------------------------------

    if (req.query.search) {
      const search = String(req.query.search).trim();

      if (search.length > 150) {
        return res.status(400).json({
          success: false,
          message: "Search text cannot exceed 150 characters.",
        });
      }

      if (search) {
        const searchRegex = new RegExp(
          escapeRegex(search),
          "i"
        );

        filter.$or = [
          { actorName: searchRegex },
          { actorEmail: searchRegex },
          { action: searchRegex },
          { targetType: searchRegex },
          { targetLabel: searchRegex },
          { department: searchRegex },
          { reason: searchRegex },
        ];
      }
    }

    // -------------------------------------------------
    // QUERY AUDIT LOGS
    // -------------------------------------------------

    const skip = (page - 1) * limit;

    const [auditLogs, total] = await Promise.all([
      AuditLog.find(filter)
        .select(
          "_id actor actorName actorEmail roleUsed adminScope action targetType targetId targetLabel department before after reason ipAddress createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      filters: {
        department:
          access.type === "DEPARTMENT_ADMIN"
            ? access.department
            : req.query.department || null,
        action: req.query.action || null,
        targetType: req.query.targetType || null,
        actorId: req.query.actorId || null,
        startDate:
          req.query.startDate || req.query.from || null,
        endDate:
          req.query.endDate || req.query.to || null,
        search: req.query.search || null,
      },
    });
  } catch (error) {
    console.error("Get admin audit logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs.",
    });
  }
};
