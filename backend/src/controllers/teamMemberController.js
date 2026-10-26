import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Admin from "../models/Admin.js";
import { sendTemporaryPasswordEmail } from "../shared/services/emailService.js";
// =====================================================
// TEMPORARY DEVELOPMENT SETTING
// =====================================================

// false = allow authenticated users to view the directory
// true  = enforce role/department restrictions for GET APIs
//
// IMPORTANT: Keep false only during local development.
// Enable role-based read restrictions before deployment.
const ROLE_BASED_TEAM_MEMBER_READ_ACCESS = false;

// =====================================================
// CONSTANTS
// =====================================================

const MEMBER_FIELDS = [
  "_id",
  "name",
  "email",
  "role",
  "designation",
  "phone",
  "department",
  "adminScope",
  "status",
  "createdAt",
  "updatedAt",
].join(" ");

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const normalizeDepartment = (department = "") =>
  String(department).trim().toLowerCase();

const normalizeRole = (role = "") =>
  String(role).trim().toLowerCase();

const isAdministrator = (member) =>
  normalizeRole(member.role) === "administrator";

const isGlobalAdministrator = (member) =>
  isAdministrator(member) &&
  member.adminScope === "GLOBAL";

const isDepartmentAdministrator = (member) =>
  isAdministrator(member) &&
  member.adminScope === "DEPARTMENT" &&
  Boolean(String(member.department || "").trim());

const isActiveAccount = (member) =>
  member.status === "Active" && !member.deletedAt;

const hasField = (object, field) =>
  Object.prototype.hasOwnProperty.call(object, field);

const getAccessContext = (admin) => {
  if (!admin || !isActiveAccount(admin)) {
    return null;
  }

  const department = String(admin.department || "").trim();

  if (isGlobalAdministrator(admin)) {
    return { type: "GLOBAL" };
  }

  if (isDepartmentAdministrator(admin)) {
    return {
      type: "DEPARTMENT_ADMIN",
      department,
    };
  }

  // Regular staff must have a department and no administrator scope.
  if (
    !isAdministrator(admin) &&
    !admin.adminScope &&
    department
  ) {
    return {
      type: "MEMBER",
      department,
    };
  }

  return null;
};

const toSafeMember = (member) => ({
  _id: member._id.toString(),
  name: member.name || "",
  email: member.email || "",
  role: member.role || "",
  designation: member.designation || "",
  phone: member.phone || "",
  department: member.department || "",
  adminScope: member.adminScope ?? null,
  status: member.status || "Active",
  createdAt: member.createdAt || null,
  updatedAt: member.updatedAt || null,
});

const parseScope = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const scope = String(value).trim().toUpperCase();

  if (scope === "NONE") {
    return null;
  }

  if (["GLOBAL", "DEPARTMENT"].includes(scope)) {
    return scope;
  }

  return undefined;
};

const defaultRegularRole = (department) =>
  normalizeDepartment(department) === "hr"
    ? "HR"
    : "Employee";

const countActiveGlobalAdministrators = () =>
  Admin.countDocuments({
    role: /^Administrator$/i,
    adminScope: "GLOBAL",
    status: "Active",
    deletedAt: null,
  });

// =====================================================
// AUTHORIZE ACCOUNT MANAGEMENT
// =====================================================

// Global Administrators can manage accounts across departments.
// Department Administrators can manage accounts in their own
// department, including Department Administrator accounts.
// They cannot manage Global Administrators.
//
// Regular employees cannot manage accounts.

const authorizeTarget = async (req, res, id) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid team member ID.",
    });
    return null;
  }

  const access = getAccessContext(req.admin);

  if (!access) {
    res.status(403).json({
      success: false,
      message: "Your account permissions are not configured.",
    });
    return null;
  }

  if (req.admin._id.toString() === id) {
    res.status(403).json({
      success: false,
      message:
        "You cannot manage your own account through the Team Members API.",
    });
    return null;
  }

  const target = await Admin.findOne({
    _id: id,
    deletedAt: null,
  });

  if (!target) {
    res.status(404).json({
      success: false,
      message: "Team member not found.",
    });
    return null;
  }

  // Global Administrator: organization-wide account management.
  if (access.type === "GLOBAL") {
    return { access, target };
  }

  // Department Administrator: own department only.
  if (access.type === "DEPARTMENT_ADMIN") {
    const sameDepartment =
      normalizeDepartment(target.department) ===
      normalizeDepartment(access.department);

    const targetIsGlobal =
      isGlobalAdministrator(target) ||
      target.adminScope === "GLOBAL";

    const targetHasValidDepartmentScope =
      isDepartmentAdministrator(target);

    const targetIsRegularStaff =
      !isAdministrator(target) && !target.adminScope;

    if (
      !sameDepartment ||
      targetIsGlobal ||
      (!targetHasValidDepartmentScope && !targetIsRegularStaff)
    ) {
      res.status(403).json({
        success: false,
        message:
          "You can manage eligible accounts in your own department only.",
      });
      return null;
    }

    return { access, target };
  }

  res.status(403).json({
    success: false,
    message:
      "You do not have permission to manage team member accounts.",
  });

  return null;
};

// =====================================================
// GET TEAM MEMBERS
// GET /api/auth/team-members
// =====================================================

export const getTeamMembers = async (req, res) => {
  try {
    const members = await Admin.find({
      deletedAt: null,
    })
      .select(MEMBER_FIELDS)
      .sort({
        department: 1,
        name: 1,
        email: 1,
      })
      .lean();

    const safeMembers = members.map(toSafeMember);
    const currentUserId = req.admin._id.toString();

    // -------------------------------------------------
    // TEMPORARY DEVELOPMENT MODE
    // -------------------------------------------------
    // Authentication is still required by authMiddleware.
    // Only the role/department restriction on reading the
    // directory is temporarily bypassed.
    // -------------------------------------------------

    if (!ROLE_BASED_TEAM_MEMBER_READ_ACCESS) {
      const teamMembers = safeMembers.map((member) => ({
        ...member,
        isMe: member._id === currentUserId,
        canManage: false,
      }));

      return res.status(200).json({
        success: true,
        view: "team-members",
        currentUserId,
        memberCount: teamMembers.length,
        teamMembers,
      });
    }

    // -------------------------------------------------
    // FUTURE ROLE-BASED READ LOGIC
    // Enable by setting the constant to true.
    // -------------------------------------------------

    const access = getAccessContext(req.admin);

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Your account's role, department, or access scope is not configured. Please contact a Global Administrator.",
      });
    }

    // Regular employee: own department only.
    if (access.type === "MEMBER") {
      const teamMembers = safeMembers
        .filter(
          (member) =>
            !isGlobalAdministrator(member) &&
            normalizeDepartment(member.department) ===
              normalizeDepartment(access.department)
        )
        .map((member) => ({
          ...member,
          isMe: member._id === currentUserId,
          canManage: false,
        }));

      return res.status(200).json({
        success: true,
        view: "team-members",
        currentUserId,
        department: access.department,
        memberCount: teamMembers.length,
        teamMembers,
      });
    }

    // Department and Global Administrator views.
    const globalAdministrators = safeMembers
      .filter(isGlobalAdministrator)
      .map((member) => ({
        ...member,
        isMe: member._id === currentUserId,
        canManage:
          access.type === "GLOBAL" &&
          member._id !== currentUserId,
      }));

    const departmentMap = new Map();

    for (const member of safeMembers) {
      const department = String(member.department || "").trim();

      if (!department || isGlobalAdministrator(member)) {
        continue;
      }

      const key = normalizeDepartment(department);

      if (!departmentMap.has(key)) {
        departmentMap.set(key, {
          department,
          members: [],
        });
      }

      const sameDepartment =
        normalizeDepartment(department) ===
        normalizeDepartment(access.department);

      const eligibleDepartmentAccount =
        isDepartmentAdministrator(member) ||
        (!isAdministrator(member) && !member.adminScope);

      const canManage =
        member._id !== currentUserId &&
        (
          access.type === "GLOBAL" ||
          (
            access.type === "DEPARTMENT_ADMIN" &&
            sameDepartment &&
            eligibleDepartmentAccount
          )
        );

      departmentMap.get(key).members.push({
        ...member,
        isMe: member._id === currentUserId,
        canManage,
      });
    }

    const departments = Array.from(departmentMap.values())
      .map((group) => ({
        department: group.department,
        memberCount: group.members.length,
        canManage:
          access.type === "GLOBAL" ||
          normalizeDepartment(group.department) ===
            normalizeDepartment(access.department),
        members: group.members,
      }))
      .sort((a, b) =>
        a.department.localeCompare(b.department)
      );

    const response = {
      success: true,
      view:
        access.type === "GLOBAL"
          ? "global-admin"
          : "department-admin",
      currentUserId,
      currentDepartment:
        access.type === "DEPARTMENT_ADMIN"
          ? access.department
          : null,
      globalAdministratorCount: globalAdministrators.length,
      globalAdministrators,
      departments,
      canManageGlobalAdministrators: access.type === "GLOBAL",
    };

    if (access.type === "GLOBAL") {
      response.unassignedMembers = safeMembers
        .filter(
          (member) =>
            !String(member.department || "").trim() &&
            !isGlobalAdministrator(member)
        )
        .map((member) => ({
          ...member,
          isMe: member._id === currentUserId,
          canManage: member._id !== currentUserId,
        }));
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members.",
    });
  }
};

// =====================================================
// GET ONE TEAM MEMBER
// GET /api/auth/team-members/:id
// =====================================================

export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    // When role-based directory access is disabled, the
    // authenticated user can read any non-deleted member.
    const access = ROLE_BASED_TEAM_MEMBER_READ_ACCESS
      ? getAccessContext(req.admin)
      : { type: "TEMPORARY_READ_ALL" };

    if (!access) {
      return res.status(403).json({
        success: false,
        message: "Your account permissions are not configured.",
      });
    }

    const member = await Admin.findOne({
      _id: id,
      deletedAt: null,
    })
      .select(MEMBER_FIELDS)
      .lean();

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    // FUTURE: apply department restrictions when the switch is enabled.
    if (
      ROLE_BASED_TEAM_MEMBER_READ_ACCESS &&
      access.type === "MEMBER"
    ) {
      const sameDepartment =
        normalizeDepartment(member.department) ===
        normalizeDepartment(access.department);

      if (!sameDepartment || isGlobalAdministrator(member)) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view members of your own department.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      teamMember: {
        ...toSafeMember(member),
        isMe: member._id.toString() === req.admin._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team member.",
    });
  }
};

// =====================================================
// CREATE TEAM MEMBER
// POST /api/auth/team-members
// =====================================================

export const createTeamMember = async (req, res) => {
  try {
    const access = getAccessContext(req.admin);

    if (
      !access ||
      !["GLOBAL", "DEPARTMENT_ADMIN"].includes(access.type)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create accounts.",
      });
    }

    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    let role = String(
      req.body.role ||
        defaultRegularRole(
          access.type === "DEPARTMENT_ADMIN"
            ? access.department
            : req.body.department
        )
    ).trim();

    const name = String(req.body.name || "").trim();
    let designation = String(req.body.designation || "").trim();
    const phone = String(req.body.phone || "").trim();

    let department = "";
    let adminScope = null;

    // -------------------------------------------------
    // DEPARTMENT ADMINISTRATOR
    // Can create regular employees and Department Admins
    // within their own department, but never Global Admins.
    // -------------------------------------------------

    if (access.type === "DEPARTMENT_ADMIN") {
      department = access.department;

      if (
        req.body.department &&
        normalizeDepartment(req.body.department) !==
          normalizeDepartment(access.department)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can create members only in your own department.",
        });
      }

      const requestedScope = parseScope(req.body.adminScope);

      if (requestedScope === undefined) {
        return res.status(400).json({
          success: false,
          message: "Invalid adminScope value.",
        });
      }

      if (requestedScope === "GLOBAL") {
        return res.status(403).json({
          success: false,
          message:
            "Only Global Administrators can grant Global Administrator access.",
        });
      }

      // The backend determines the scope from the role.
      if (isAdministrator({ role })) {
        adminScope = "DEPARTMENT";
      } else {
        if (requestedScope) {
          return res.status(403).json({
            success: false,
            message:
              "Regular staff accounts cannot have administrator scope.",
          });
        }

        adminScope = null;
      }
    }

    // -------------------------------------------------
    // GLOBAL ADMINISTRATOR
    // Can assign organization-wide account permissions.
    // -------------------------------------------------

    if (access.type === "GLOBAL") {
      department = String(req.body.department || "").trim();
      adminScope = parseScope(req.body.adminScope);

      if (adminScope === undefined) {
        return res.status(400).json({
          success: false,
          message: "Invalid adminScope value.",
        });
      }

      if (isAdministrator({ role })) {
        if (!adminScope) {
          return res.status(400).json({
            success: false,
            message:
              "Administrator accounts require GLOBAL or DEPARTMENT scope.",
          });
        }

        if (adminScope === "DEPARTMENT" && !department) {
          return res.status(400).json({
            success: false,
            message:
              "A Department Administrator must have a department.",
          });
        }
      } else if (adminScope) {
        return res.status(400).json({
          success: false,
          message:
            "Regular staff accounts cannot have administrator scope.",
        });
      }

      if (
        !department &&
        !isGlobalAdministrator({ role, adminScope })
      ) {
        return res.status(400).json({
          success: false,
          message: "A department is required for this account.",
        });
      }
    }

    if (!designation) {
      designation = isAdministrator({ role })
        ? "Administrator"
        : normalizeDepartment(department) === "hr"
          ? "HR Employee"
          : "Employee";
    }

    const temporaryPassword =
      crypto.randomBytes(9).toString("base64url") + "@1";

    const password = await bcrypt.hash(temporaryPassword, 10);

    const teamMember = await Admin.create({
      email,
      password,
      name,
      phone,
      role,
      designation,
      department,
      adminScope,
      status: "Active",
      deletedAt: null,
      tokenVersion: 0,
      resetTokenVersion: 0,
      mustChangePassword: true,
    });

    try {
      await sendTemporaryPasswordEmail(
        teamMember.email,
        temporaryPassword
      );
    } catch (emailError) {
      // Avoid leaving a new account with an undelivered
      // temporary password.
      await Admin.deleteOne({ _id: teamMember._id });

      console.error(
        "Temporary password email failed:",
        emailError
      );

      return res.status(502).json({
        success: false,
        message:
          "The account was not completed because the temporary-password email failed.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Team member created successfully. A temporary password was sent by email.",
      teamMember: toSafeMember(teamMember),
    });
  } catch (error) {
    console.error("Create team member error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Team member creation failed.",
    });
  }
};

// =====================================================
// UPDATE TEAM MEMBER
// PUT /api/auth/team-members/:id
// =====================================================

export const updateTeamMember = async (req, res) => {
  try {
    const authorized = await authorizeTarget(
      req,
      res,
      req.params.id
    );

    if (!authorized) return;

    const { access, target } = authorized;
    const body = req.body || {};

    // Capture the original state before modifying the record.
    const wasGlobalAdministrator =
      isGlobalAdministrator(target) &&
      isActiveAccount(target);

    const editableFields = [
      "name",
      "email",
      "designation",
      "phone",
      "role",
      "department",
      "adminScope",
    ];

    if (!editableFields.some((field) => hasField(body, field))) {
      return res.status(400).json({
        success: false,
        message: "No editable fields were provided.",
      });
    }

    if (hasField(body, "status") || hasField(body, "deletedAt")) {
      return res.status(400).json({
        success: false,
        message: "Use the dedicated status or delete endpoint.",
      });
    }

    const requestedScope = hasField(body, "adminScope")
      ? parseScope(body.adminScope)
      : null;

    if (requestedScope === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid adminScope value.",
      });
    }

    if (access.type === "DEPARTMENT_ADMIN") {
      if (
        requestedScope === "GLOBAL"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Department Administrators cannot grant Global Administrator access.",
        });
      }

      if (
        hasField(body, "department") &&
        normalizeDepartment(body.department) !==
          normalizeDepartment(access.department)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot move an account outside your department.",
        });
      }
    }

    if (hasField(body, "name")) {
      target.name = String(body.name || "").trim();
    }

    if (hasField(body, "designation")) {
      target.designation = String(body.designation || "").trim();
    }

    if (hasField(body, "phone")) {
      target.phone = String(body.phone || "").trim();
    }

    if (hasField(body, "email")) {
      const email = normalizeEmail(body.email);

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "A valid email address is required.",
        });
      }

      const duplicate = await Admin.findOne({
        email,
        _id: { $ne: target._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another account already uses this email.",
        });
      }

      target.email = email;
    }

    if (hasField(body, "role")) {
      const newRole = String(body.role || "").trim();

      if (!newRole) {
        return res.status(400).json({
          success: false,
          message: "Role cannot be empty.",
        });
      }

      target.role = newRole;
    }

    // Department Administrators can manage eligible accounts
    // within their department. The scope is always assigned
    // by the server, never by the client.
    if (access.type === "DEPARTMENT_ADMIN") {
      target.department = access.department;

      target.adminScope = isAdministrator(target)
        ? "DEPARTMENT"
        : null;
    }

    // Global Administrators can manage account scope and department.
    if (access.type === "GLOBAL") {
      if (hasField(body, "department")) {
        target.department = String(body.department || "").trim();
      }

      if (hasField(body, "adminScope")) {
        target.adminScope = requestedScope;
      } else if (
        hasField(body, "role") &&
        !isAdministrator(target)
      ) {
        target.adminScope = null;
      }

      if (
        isAdministrator(target) &&
        !["GLOBAL", "DEPARTMENT"].includes(target.adminScope)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Administrator accounts require GLOBAL or DEPARTMENT scope.",
        });
      }

      if (
        target.adminScope === "DEPARTMENT" &&
        !String(target.department || "").trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A Department Administrator must have a department.",
        });
      }

      if (!isAdministrator(target) && target.adminScope) {
        return res.status(400).json({
          success: false,
          message:
            "Regular staff accounts cannot have administrator scope.",
        });
      }

      const remainsGlobalAdministrator =
        isGlobalAdministrator(target);

      if (
        wasGlobalAdministrator &&
        !remainsGlobalAdministrator
      ) {
        const count = await countActiveGlobalAdministrators();

        if (count <= 1) {
          return res.status(409).json({
            success: false,
            message:
              "The last active Global Administrator cannot be demoted.",
          });
        }
      }
    }

    await target.save();

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      teamMember: toSafeMember(target),
    });
  } catch (error) {
    console.error("Update team member error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Team member update failed.",
    });
  }
};

// =====================================================
// ACTIVATE / DEACTIVATE TEAM MEMBER
// PATCH /api/auth/team-members/:id/status
// =====================================================

export const updateTeamMemberStatus = async (req, res) => {
  try {
    const authorized = await authorizeTarget(
      req,
      res,
      req.params.id
    );

    if (!authorized) return;

    const { target } = authorized;
    const status = String(req.body.status || "").trim();

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "Active" or "Inactive".',
      });
    }

    if (target.status === status) {
      return res.status(200).json({
        success: true,
        message: `Account is already ${status}.`,
        teamMember: toSafeMember(target),
      });
    }

    if (
      status === "Inactive" &&
      isGlobalAdministrator(target) &&
      isActiveAccount(target)
    ) {
      const count = await countActiveGlobalAdministrators();

      if (count <= 1) {
        return res.status(409).json({
          success: false,
          message:
            "The last active Global Administrator cannot be deactivated.",
        });
      }
    }

    target.status = status;

    // Invalidate previously issued tokens.
    target.tokenVersion = (target.tokenVersion || 0) + 1;

    await target.save();

    return res.status(200).json({
      success: true,
      message: `Team member ${status.toLowerCase()} successfully.`,
      teamMember: toSafeMember(target),
    });
  } catch (error) {
    console.error("Update team member status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update team member status.",
    });
  }
};

// =====================================================
// SOFT DELETE TEAM MEMBER
// DELETE /api/auth/team-members/:id
// =====================================================

export const deleteTeamMember = async (req, res) => {
  try {
    const authorized = await authorizeTarget(
      req,
      res,
      req.params.id
    );

    if (!authorized) return;

    const { target } = authorized;

    if (
      isGlobalAdministrator(target) &&
      isActiveAccount(target)
    ) {
      const count = await countActiveGlobalAdministrators();

      if (count <= 1) {
        return res.status(409).json({
          success: false,
          message:
            "The last active Global Administrator cannot be deleted.",
        });
      }
    }

    // Preserve the document for references and future audit history.
    target.status = "Inactive";
    target.deletedAt = new Date();
    target.tokenVersion = (target.tokenVersion || 0) + 1;

    await target.save();

    return res.status(200).json({
      success: true,
      message:
        "Team member account removed. The record was retained for audit purposes.",
    });
  } catch (error) {
    console.error("Delete team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Team member removal failed.",
    });
  }
};