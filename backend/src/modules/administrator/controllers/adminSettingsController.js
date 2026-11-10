
import mongoose from "mongoose";

import AdminSetting from "../models/AdminSetting.js";

import {
  getTeamDirectoryAccess,
  isGlobalAdministrator,
} from "../services/authorizationService.js";

import { createAuditLog } from "../../../services/auditLogService.js";

// =====================================================
// CONSTANTS
// =====================================================

const ALLOWED_CATEGORIES = [
  "GENERAL",
  "SECURITY",
  "NOTIFICATIONS",
  "RECRUITMENT",
];

// Never store credentials or authentication secrets
// in general Administrator settings.
const SENSITIVE_KEY_PATTERN =
  /password|token|secret|api.?key|credential|private.?key|authorization|oauth/i;

// =====================================================
// HELPERS
// =====================================================

const getSafeSetting = (setting) => ({
  _id: setting._id,
  key: setting.key,
  value: setting.value,
  category: setting.category,
  description: setting.description || "",
  isEditable: setting.isEditable,
  updatedBy: setting.updatedBy || null,
  createdAt: setting.createdAt,
  updatedAt: setting.updatedAt,
});

const containsSensitiveKey = (value) => {
  if (Array.isArray(value)) {
    return value.some(containsSensitiveKey);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([key, item]) =>
        SENSITIVE_KEY_PATTERN.test(key) ||
        containsSensitiveKey(item)
    );
  }

  return false;
};

const validateSettingValue = (value) => {
  if (value === undefined || value === null) {
    return "A setting value is required.";
  }

  if (typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean" &&
      !Array.isArray(value) &&
      typeof value !== "object") {
    return "Unsupported setting value.";
  }

  if (
    typeof value === "number" &&
    !Number.isFinite(value)
  ) {
    return "Setting value must be a finite number.";
  }

  if (containsSensitiveKey(value)) {
    return "Credential and secret fields cannot be stored in Administrator settings.";
  }

  let serialized;

  try {
    serialized = JSON.stringify(value);
  } catch {
    return "Setting value must be valid JSON data.";
  }

  if (!serialized || serialized.length > 10000) {
    return "Setting value cannot exceed 10 KB.";
  }

  return null;
};

const getAuditSnapshot = (setting) => ({
  _id: setting._id,
  key: setting.key,
  value: setting.value,
  category: setting.category,
  description: setting.description,
  isEditable: setting.isEditable,
});

// =====================================================
// 1. GET ADMIN SETTINGS
// GET /api/admin/settings
//
// Global and Department Administrators can view
// non-secret settings.
// =====================================================

export const getAdminSettings = async (req, res) => {
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
        message:
          "You do not have permission to view Administrator settings.",
      });
    }

    const filter = {
      key: { $not: SENSITIVE_KEY_PATTERN },
    };

    if (req.query.category) {
      const category = String(req.query.category)
        .trim()
        .toUpperCase();

      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid settings category.",
          allowedCategories: ALLOWED_CATEGORIES,
        });
      }

      filter.category = category;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim();

      if (search.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Search text cannot exceed 100 characters.",
        });
      }

      if (search) {
        const escaped = search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.$or = [
          { key: new RegExp(escaped, "i") },
          { description: new RegExp(escaped, "i") },
        ];
      }
    }

    const settings = await AdminSetting.find(filter)
      .select(
        "_id key value category description isEditable updatedBy createdAt updatedAt"
      )
      .sort({ category: 1, key: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: settings.length,
      settings,
      permissions: {
        canView: true,
        canUpdate: access.type === "GLOBAL",
      },
    });
  } catch (error) {
    console.error("Get Administrator settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve Administrator settings.",
    });
  }
};

// =====================================================
// 2. CREATE / UPDATE ADMIN SETTING
// PATCH /api/admin/settings
//
// Only Global Administrators can modify settings.
// =====================================================

export const updateAdminSettings = async (req, res) => {
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
          "Only Global Administrators can modify Administrator settings.",
      });
    }

    const body = req.body || {};

    const allowedFields = [
      "key",
      "value",
      "category",
      "description",
      "reason",
    ];

    const unexpectedFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Unexpected settings fields were provided.",
        unexpectedFields,
      });
    }

    const key = String(body.key || "")
      .trim()
      .toLowerCase();

    if (
      !key ||
      key.length > 150 ||
      !/^[a-z0-9._-]+$/.test(key)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid setting key is required.",
      });
    }

    if (SENSITIVE_KEY_PATTERN.test(key)) {
      return res.status(400).json({
        success: false,
        message:
          "Credentials and authentication secrets cannot be stored in Administrator settings.",
      });
    }

    const valueError = validateSettingValue(body.value);

    if (valueError) {
      return res.status(400).json({
        success: false,
        message: valueError,
      });
    }

    const category = String(
      body.category || "GENERAL"
    )
      .trim()
      .toUpperCase();

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings category.",
        allowedCategories: ALLOWED_CATEGORIES,
      });
    }

    const description = String(
      body.description || ""
    ).trim();

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Setting description cannot exceed 500 characters.",
      });
    }

    const reason = String(body.reason || "").trim();

    if (reason.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Reason cannot exceed 1000 characters.",
      });
    }

    session = await mongoose.startSession();

    let updatedSetting;
    let action;

    await session.withTransaction(async () => {
      let setting = await AdminSetting.findOne({
        key,
      }).session(session);

      const before = setting
        ? getAuditSnapshot(setting)
        : null;

      if (setting && setting.isEditable === false) {
        const error = new Error(
          "This setting is locked and cannot be modified."
        );
        error.statusCode = 403;
        throw error;
      }

      if (setting) {
        setting.value = body.value;
        setting.category = category;
        setting.description = description;
        setting.updatedBy = req.admin._id;

        action = "ADMIN_SETTING_UPDATED";
      } else {
        setting = new AdminSetting({
          key,
          value: body.value,
          category,
          description,
          isEditable: true,
          createdBy: req.admin._id,
          updatedBy: req.admin._id,
        });

        action = "ADMIN_SETTING_CREATED";
      }

      await setting.save({ session });

      await createAuditLog({
        req,
        action,
        targetType: "AdminSetting",
        targetId: setting._id,
        targetLabel: setting.key,
        department: "GLOBAL",
        before,
        after: getAuditSnapshot(setting),
        reason,
        session,
      });

      updatedSetting = setting;
    });

    return res.status(200).json({
      success: true,
      message:
        action === "ADMIN_SETTING_CREATED"
          ? "Administrator setting created successfully."
          : "Administrator setting updated successfully.",
      auditLogged: true,
      setting: getSafeSetting(updatedSetting),
    });
  } catch (error) {
    console.error("Update Administrator settings error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This setting was modified concurrently. Please retry.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update Administrator settings. The transaction was not committed.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
