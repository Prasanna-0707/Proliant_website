import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Admin from "../models/Admin.js";
import { sendTemporaryPasswordEmail } from "../services/emailService.js";
import { createAuditLog } from "../services/auditLogService.js";

import {
  isL0Screener,
} from "../modules/administrator/services/authorizationService.js";

import {
  retryPendingL0Assignments,
  reassignL0ApplicationsFromInactiveScreener,
} from "../services/screenerAssignmentService.js";

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

const normalizeRoleLabel = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");

// =====================================================
// ADMINISTRATOR ROLE VALIDATION
// =====================================================

// Global Administrator and Department Administrator
// are scopes, not separate portal role names.
//
// Global:
// role = Administrator
// adminScope = GLOBAL
//
// Department:
// role = Administrator
// adminScope = DEPARTMENT

const NON_CANONICAL_ADMIN_ROLE_NAMES = new Set([
  "hod",
  "head of department",
  "department head",
  "department administrator",
  "department admin",
  "dept administrator",
  "dept admin",
  "global administrator",
  "global admin",
]);

const isNonCanonicalAdminRole = (role) =>
  NON_CANONICAL_ADMIN_ROLE_NAMES.has(
    normalizeRoleLabel(role)
  );

const isAdministrator = (member) =>
  normalizeRole(member?.role) === "administrator";

const isRegularPortalRole = (member) =>
  Boolean(normalizeRole(member?.role)) &&
  !isAdministrator(member) &&
  !isNonCanonicalAdminRole(member.role);

// =====================================================
// ADMINISTRATOR CONFIGURATION VALIDATION
// =====================================================

const getAccountConfigurationError = (member) => {
  if (!member || !normalizeRole(member.role)) {
    return "A valid portal role is required.";
  }

  const department = String(
    member.department || ""
  ).trim();

  if (isAdministrator(member)) {
    if (
      !["GLOBAL", "DEPARTMENT"].includes(
        member.adminScope
      )
    ) {
      return "Administrator accounts require GLOBAL or DEPARTMENT scope.";
    }

    if (
      member.adminScope === "GLOBAL" &&
      department
    ) {
      return "A Global Administrator must not have a department assigned.";
    }

    if (
      member.adminScope === "DEPARTMENT" &&
      !department
    ) {
      return "A Department Administrator must have a department.";
    }

    return null;
  }

  if (
    member.adminScope !== null &&
    member.adminScope !== undefined &&
    member.adminScope !== ""
  ) {
    return "Regular staff accounts cannot have administrator scope.";
  }

  return null;
};

// =====================================================
// ACCOUNT HELPERS
// =====================================================

const isGlobalAdministrator = (member) =>
  isAdministrator(member) &&
  member.adminScope === "GLOBAL" &&
  !String(member.department || "").trim();

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

  const department = String(
    admin.department || ""
  ).trim();

  if (isGlobalAdministrator(admin)) {
    return { type: "GLOBAL" };
  }

  if (isDepartmentAdministrator(admin)) {
    return {
      type: "DEPARTMENT_ADMIN",
      department,
    };
  }

  if (
    isRegularPortalRole(admin) &&
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

// Only record relevant account fields. Never include passwords,
// tokens, OTPs, or other authentication credentials.

const toAuditSnapshot = (member) => {
  if (!member) return null;

  return {
    _id: member._id.toString(),
    name: member.name || "",
    email: member.email || "",
    role: member.role || "",
    designation: member.designation || "",
    phone: member.phone || "",
    department: member.department || "",
    adminScope: member.adminScope ?? null,
    status: member.status || "Active",
    deletedAt: member.deletedAt || null,
  };
};

const parseScope = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const scope = String(value).trim().toUpperCase();

  if (!scope || scope === "NONE") {
    return null;
  }

  if (["GLOBAL", "DEPARTMENT"].includes(scope)) {
    return scope;
  }

  return undefined;
};

const countActiveGlobalAdministrators = () =>
  Admin.countDocuments({
    role: /^Administrator$/i,
    adminScope: "GLOBAL",
    department: { $in: [null, ""] },
    status: "Active",
    deletedAt: null,
  });

// =====================================================
// ATOMIC ACCOUNT SAVE + AUDIT
// =====================================================

// The account change and its audit record must commit together.
// If either operation fails, withTransaction aborts the transaction.

const saveAccountAndAuditAtomically = async ({
  req,
  target,
  action,
  before,
  reason = "",
}) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await target.save({ session });

      await createAuditLog({
        req,
        action,
        targetType: "Admin",
        targetId: target._id,
        targetLabel: target.email || target.name,
        department:
          target.department || before?.department || "",
        before,
        after: toAuditSnapshot(target),
        reason,
        session,
      });
    });
  } finally {
    await session.endSession();
  }
};

// =====================================================
// RETRY PENDING L0 ASSIGNMENTS
// =====================================================

const retryPendingAssignmentsForScreener = async ({
  member,
  req,
}) => {
  if (
    !isActiveAccount(member) ||
    !isL0Screener(member)
  ) {
    return null;
  }

  try {
    const result = await retryPendingL0Assignments({
      limit: 100,
      requestId: req.requestId || "",
      correlationId: req.correlationId || "",
    });

    return {
      triggered: true,
      completed: true,
      scanned: result.scanned,
      assigned: result.assigned,
      stillPending: result.stillPending,
      skipped: result.skipped,
      failed: result.failed,
      reassignments: result.reassignments || null,
    };
  } catch (error) {
    console.error(
      "Pending L0 assignment retry failed:",
      error
    );

    return {
      triggered: true,
      completed: false,
      message:
        "The account change was saved, but pending L0 assignments could not be retried.",
    };
  }
};

// =====================================================
// REASSIGN OPEN APPLICATIONS FROM A SCREENER
// =====================================================

const reassignOpenApplicationsForScreener = async ({
  member,
  req,
}) => {
  if (!member?._id) {
    return null;
  }

  try {
    const result =
      await reassignL0ApplicationsFromInactiveScreener(
        member._id,
        {
          limit: 500,
          requestId: req.requestId || "",
          correlationId: req.correlationId || "",
        }
      );

    return {
      triggered: true,
      completed: true,
      scanned: result.scanned,
      assigned: result.assigned,
      stillPending: result.stillPending,
      skipped: result.skipped,
      failed: result.failed,
    };
  } catch (error) {
    console.error(
      "L0 application reassignment failed:",
      error
    );

    return {
      triggered: true,
      completed: false,
      message:
        "The account change was saved, but open L0 applications could not be reassigned.",
    };
  }
};

// =====================================================
// AUTHORIZE ACCOUNT MANAGEMENT
// =====================================================

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

  if (access.type === "GLOBAL") {
    return { access, target };
  }

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
      isRegularPortalRole(target) &&
      !target.adminScope;

    if (
      !sameDepartment ||
      targetIsGlobal ||
      (
        !targetHasValidDepartmentScope &&
        !targetIsRegularStaff
      )
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
// TEAM MEMBER READ ACCESS
// =====================================================

// Global Administrators can read all accounts.
// Department Administrators and regular staff can read
// only valid accounts assigned to their own department.
// Global Administrator accounts and malformed account
// configurations are never exposed to department users.

const canReadDepartmentMember = (member, department) => {
  const sameDepartment =
    normalizeDepartment(member.department) ===
    normalizeDepartment(department);

  if (!sameDepartment) {
    return false;
  }

  if (isAdministrator(member)) {
    return isDepartmentAdministrator(member);
  }

  return (
    isRegularPortalRole(member) &&
    !member.adminScope
  );
};

// =====================================================
// GET TEAM MEMBERS
// GET /api/auth/team-members
// =====================================================

export const getTeamMembers = async (req, res) => {
  try {
    const access = getAccessContext(req.admin);

    if (!access) {
      return res.status(403).json({
        success: false,
        message:
          "Your account's role, department, or access scope is not configured. Please contact a Global Administrator.",
      });
    }

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

    // Global Administrators see all accounts.
    // Other users see only valid accounts in their department.

    const visibleMembers =
      access.type === "GLOBAL"
        ? members
        : members.filter((member) =>
            canReadDepartmentMember(
              member,
              access.department
            )
          );

    const safeMembers = visibleMembers.map(toSafeMember);

    const currentUserId = req.admin._id.toString();

    // Regular staff receive read-only access to their own department.

    if (access.type === "MEMBER") {
      const teamMembers = safeMembers.map((member) => ({
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

    // Only Global Administrators can see Global Administrator records.

    const globalAdministrators =
      access.type === "GLOBAL"
        ? safeMembers
            .filter(isGlobalAdministrator)
            .map((member) => ({
              ...member,
              isMe: member._id === currentUserId,
              canManage: member._id !== currentUserId,
            }))
        : [];

    const departmentMap = new Map();

    for (const member of safeMembers) {
      const department = String(
        member.department || ""
      ).trim();

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
        (
          isRegularPortalRole(member) &&
          !member.adminScope
        );

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
      canManageGlobalAdministrators:
        access.type === "GLOBAL",
    };

    // Only Global Administrators can see unassigned accounts.

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

    const access = getAccessContext(req.admin);

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

    // Global Administrators can view all accounts.
    // All other users are limited to eligible accounts
    // in their own department, including individual-ID lookups.

    if (
      access.type !== "GLOBAL" &&
      !canReadDepartmentMember(
        member,
        access.department
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only view eligible members of your own department.",
      });
    }

    return res.status(200).json({
      success: true,
      teamMember: {
        ...toSafeMember(member),
        isMe:
          member._id.toString() ===
          req.admin._id.toString(),
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
  let teamMember;

  try {
    const body = req.body || {};
    const access = getAccessContext(req.admin);

    if (
      !access ||
      !["GLOBAL", "DEPARTMENT_ADMIN"].includes(access.type)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to create accounts.",
      });
    }

    // -------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------

    const email = normalizeEmail(body.email);

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    if (await Admin.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // -------------------------------------------------
    // ROLE VALIDATION
    // Role is mandatory. Do not infer it from department.
    // -------------------------------------------------

    if (
      typeof body.role !== "string" ||
      !body.role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid portal role is required.",
      });
    }

    let role = body.role.trim();

    if (isNonCanonicalAdminRole(role)) {
      return res.status(400).json({
        success: false,
        message:
          "HOD, Global Admin and Department Admin are not separate portal roles. Use Administrator with the appropriate administrator scope.",
        allowedAdministratorConfiguration: [
          {
            role: "Administrator",
            adminScope: "GLOBAL",
          },
          {
            role: "Administrator",
            adminScope: "DEPARTMENT",
          },
        ],
      });
    }

    if (isAdministrator({ role })) {
      role = "Administrator";
    }

    // -------------------------------------------------
    // PERSONAL INFORMATION
    // Designation is optional and never controls access.
    // -------------------------------------------------

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();

    if (
      body.designation !== undefined &&
      body.designation !== null &&
      typeof body.designation !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Designation must be a string.",
      });
    }

    const designation =
      typeof body.designation === "string"
        ? body.designation.trim()
        : "";

    // -------------------------------------------------
    // DEPARTMENT INPUT VALIDATION
    // -------------------------------------------------

    if (
      body.department !== undefined &&
      body.department !== null &&
      typeof body.department !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Department must be a string.",
      });
    }

    let department = String(
      body.department || ""
    ).trim();

    // -------------------------------------------------
    // ADMIN SCOPE INPUT VALIDATION
    // -------------------------------------------------

    const requestedScope = parseScope(body.adminScope);

    if (requestedScope === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid adminScope. Allowed values are GLOBAL, DEPARTMENT or null for regular staff.",
      });
    }

    let adminScope = null;

    // -------------------------------------------------
    // DEPARTMENT ADMIN CREATION RULES
    // -------------------------------------------------

    if (access.type === "DEPARTMENT_ADMIN") {
      const creatorDepartment = access.department;

      if (
        department &&
        normalizeDepartment(department) !==
          normalizeDepartment(creatorDepartment)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can create members only in your own department.",
        });
      }

      // Accounts created by Department Administrators
      // belong to their own department.

      department = creatorDepartment;

      if (isAdministrator({ role })) {
        if (requestedScope === "GLOBAL") {
          return res.status(403).json({
            success: false,
            message:
              "Only Global Administrators can grant Global Administrator access.",
          });
        }

        // Administrator scope is explicitly required.

        if (requestedScope !== "DEPARTMENT") {
          return res.status(400).json({
            success: false,
            message:
              "Administrator accounts created by a Department Administrator must specify adminScope: DEPARTMENT.",
          });
        }

        adminScope = "DEPARTMENT";
      } else {
        if (requestedScope !== null) {
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
    // GLOBAL ADMINISTRATOR CREATION RULES
    // -------------------------------------------------

    if (access.type === "GLOBAL") {
      if (isAdministrator({ role })) {
        if (
          !["GLOBAL", "DEPARTMENT"].includes(
            requestedScope
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Administrator accounts require GLOBAL or DEPARTMENT scope.",
          });
        }

        adminScope = requestedScope;

        if (
          adminScope === "DEPARTMENT" &&
          !department
        ) {
          return res.status(400).json({
            success: false,
            message:
              "A Department Administrator must have a department.",
          });
        }

        if (
          adminScope === "GLOBAL" &&
          department
        ) {
          return res.status(400).json({
            success: false,
            message:
              "A Global Administrator must not have a department assigned.",
          });
        }
      } else {
        if (requestedScope !== null) {
          return res.status(400).json({
            success: false,
            message:
              "Regular staff accounts cannot have administrator scope.",
          });
        }

        adminScope = null;
      }
    }

    // -------------------------------------------------
    // FINAL ACCOUNT CONFIGURATION VALIDATION
    // -------------------------------------------------

    const configurationError =
      getAccountConfigurationError({
        role,
        adminScope,
        department,
      });

    if (configurationError) {
      return res.status(400).json({
        success: false,
        message: configurationError,
      });
    }

    // -------------------------------------------------
    // PASSWORD GENERATION
    // -------------------------------------------------

    const temporaryPassword =
      crypto.randomBytes(9).toString("base64url") + "@1";

    const password = await bcrypt.hash(
      temporaryPassword,
      10
    );

    // -------------------------------------------------
    // CREATE ACCOUNT AND AUDIT ATOMICALLY
    // -------------------------------------------------

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const accountData = {
          email,
          password,
          name,
          phone,
          role,
          department,
          adminScope,
          status: "Active",
          deletedAt: null,
          tokenVersion: 0,
          resetTokenVersion: 0,
          mustChangePassword: true,
        };

        // Do not force a designation value.

        if (designation) {
          accountData.designation = designation;
        }

        const created = await Admin.create(
          [accountData],
          { session }
        );

        teamMember = created[0];

        await createAuditLog({
          req,
          action: "ACCOUNT_CREATED",
          targetType: "Admin",
          targetId: teamMember._id,
          targetLabel:
            teamMember.email || teamMember.name,
          department: teamMember.department || "",
          before: null,
          after: toAuditSnapshot(teamMember),
          reason: String(body.reason || "").trim(),
          session,
        });
      });
    } finally {
      await session.endSession();
    }

    // -------------------------------------------------
    // SEND TEMPORARY PASSWORD AFTER TRANSACTION COMMIT
    // -------------------------------------------------

    try {
      await sendTemporaryPasswordEmail(
        teamMember.email,
        temporaryPassword
      );
    } catch (emailError) {
      console.error(
        "Temporary password email failed:",
        emailError
      );

      let cleanupSucceeded = false;

      const cleanupSession = await mongoose.startSession();

      try {
        await cleanupSession.withTransaction(async () => {
          const existingAccount = await Admin.findById(
            teamMember._id
          ).session(cleanupSession);

          if (existingAccount) {
            await Admin.deleteOne(
              { _id: teamMember._id },
              { session: cleanupSession }
            );
          }

          await createAuditLog({
            req,
            action: "ACCOUNT_CREATION_CANCELLED",
            targetType: "Admin",
            targetId: teamMember._id,
            targetLabel:
              teamMember.email || teamMember.name,
            department: teamMember.department || "",
            before: toAuditSnapshot(
              existingAccount || teamMember
            ),
            after: null,
            reason:
              "Temporary-password email delivery failed; account removal was requested.",
            session: cleanupSession,
          });
        });

        cleanupSucceeded = true;
      } catch (cleanupError) {
        console.error(
          "Account cleanup after email failure also failed:",
          cleanupError
        );
      } finally {
        await cleanupSession.endSession();
      }

      if (!cleanupSucceeded) {
        return res.status(500).json({
          success: false,
          message:
            "The account and its creation audit record were saved, but email delivery and account cleanup failed. Contact the system administrator.",
          auditLogged: true,
        });
      }

      return res.status(502).json({
        success: false,
        message:
          "The account was removed because the temporary-password email failed. The cancellation was recorded.",
        auditLogged: true,
      });
    }

    // A newly created active L0 Screener can receive
    // applications that were previously waiting for assignment.

    const pendingL0AssignmentRetry =
      await retryPendingAssignmentsForScreener({
        member: teamMember,
        req,
      });

    return res.status(201).json({
      success: true,
      message:
        "Team member created successfully. A temporary password was sent by email.",
      auditLogged: true,
      teamMember: toSafeMember(teamMember),
      ...(pendingL0AssignmentRetry
        ? { pendingL0AssignmentRetry }
        : {}),
    });
  } catch (error) {
    console.error(
      "Create team member or audit transaction failed:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Team member creation and audit could not be completed. No account was committed by this transaction.",
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
    const before = toAuditSnapshot(target);

    // Capture the screener's previous eligibility
    // before changing role or department.

    const wasEligibleL0Screener =
      isActiveAccount(target) &&
      isL0Screener(target);

    const previousDepartment =
      normalizeDepartment(target.department);

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

    if (
      hasField(body, "status") ||
      hasField(body, "deletedAt")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Use the dedicated status or delete endpoint.",
      });
    }

    // -------------------------------------------------
    // VALIDATE SCOPE INPUT
    // -------------------------------------------------

    const requestedScope = hasField(body, "adminScope")
      ? parseScope(body.adminScope)
      : null;

    if (requestedScope === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid adminScope value.",
      });
    }

    if (
      hasField(body, "department") &&
      body.department !== null &&
      typeof body.department !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Department must be a string.",
      });
    }

    if (
      hasField(body, "designation") &&
      body.designation !== null &&
      typeof body.designation !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Designation must be a string.",
      });
    }

    // -------------------------------------------------
    // DEPARTMENT ADMINISTRATOR RESTRICTIONS
    // -------------------------------------------------

    if (access.type === "DEPARTMENT_ADMIN") {
      if (requestedScope === "GLOBAL") {
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

      if (
        hasField(body, "adminScope") &&
        requestedScope !== null &&
        requestedScope !== "DEPARTMENT"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A Department Administrator can assign only DEPARTMENT scope.",
        });
      }
    }

    // -------------------------------------------------
    // UPDATE NAME
    // -------------------------------------------------

    if (hasField(body, "name")) {
      target.name = String(body.name || "").trim();
    }

    // -------------------------------------------------
    // UPDATE DESIGNATION
    // Designation is optional and does not control access.
    // No HOD designation-based authorization is performed.
    // -------------------------------------------------

    if (hasField(body, "designation")) {
      target.designation = String(
        body.designation || ""
      ).trim();
    }

    // -------------------------------------------------
    // UPDATE PHONE
    // -------------------------------------------------

    if (hasField(body, "phone")) {
      target.phone = String(body.phone || "").trim();
    }

    // -------------------------------------------------
    // UPDATE EMAIL
    // -------------------------------------------------

    if (hasField(body, "email")) {
      const email = normalizeEmail(body.email);

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
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
          message:
            "Another account already uses this email.",
        });
      }

      target.email = email;
    }

    // -------------------------------------------------
    // UPDATE ROLE
    // -------------------------------------------------

    if (hasField(body, "role")) {
      if (
        typeof body.role !== "string" ||
        !body.role.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Role cannot be empty.",
        });
      }

      const newRole = body.role.trim();

      if (isNonCanonicalAdminRole(newRole)) {
        return res.status(400).json({
          success: false,
          message:
            "HOD, Global Admin and Department Admin are not separate portal roles. Use Administrator with the appropriate administrator scope.",
          allowedAdministratorConfiguration: [
            {
              role: "Administrator",
              adminScope: "GLOBAL",
            },
            {
              role: "Administrator",
              adminScope: "DEPARTMENT",
            },
          ],
        });
      }

      target.role = isAdministrator({ role: newRole })
        ? "Administrator"
        : newRole;
    }

    // -------------------------------------------------
    // UPDATE DEPARTMENT
    // -------------------------------------------------

    if (access.type === "GLOBAL") {
      if (hasField(body, "department")) {
        target.department = String(
          body.department || ""
        ).trim();
      }
    }

    // Department Administrators cannot move accounts
    // outside their own department.

    if (access.type === "DEPARTMENT_ADMIN") {
      target.department = access.department;
    }

    // -------------------------------------------------
    // UPDATE ADMINISTRATOR SCOPE
    // -------------------------------------------------

    if (access.type === "GLOBAL") {
      if (hasField(body, "adminScope")) {
        target.adminScope = requestedScope;
      } else if (
        hasField(body, "role") &&
        !isAdministrator(target)
      ) {
        // When an Administrator becomes regular staff,
        // remove the old administrator scope.

        target.adminScope = null;
      }

      if (isAdministrator(target)) {
        if (
          !["GLOBAL", "DEPARTMENT"].includes(
            target.adminScope
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Administrator accounts require GLOBAL or DEPARTMENT scope.",
          });
        }

        if (target.adminScope === "DEPARTMENT") {
          if (
            !String(target.department || "").trim()
          ) {
            return res.status(400).json({
              success: false,
              message:
                "A Department Administrator must have a department.",
            });
          }
        }

        if (target.adminScope === "GLOBAL") {
          // A Global Administrator cannot have a department.
          // When changing scope from DEPARTMENT to GLOBAL,
          // clear the previous department assignment.

          if (
            hasField(body, "department") &&
            String(body.department || "").trim()
          ) {
            return res.status(400).json({
              success: false,
              message:
                "A Global Administrator must not have a department assigned.",
            });
          }

          target.department = "";
        }
      } else if (target.adminScope) {
        return res.status(400).json({
          success: false,
          message:
            "Regular staff accounts cannot have administrator scope.",
        });
      }
    }

    // Department Administrators can only create or retain
    // Department Administrator scope within their own department.

    if (access.type === "DEPARTMENT_ADMIN") {
      target.adminScope = isAdministrator(target)
        ? "DEPARTMENT"
        : null;
    }

    // -------------------------------------------------
    // FINAL CONFIGURATION VALIDATION
    // -------------------------------------------------

    const configurationError =
      getAccountConfigurationError(target);

    if (configurationError) {
      return res.status(400).json({
        success: false,
        message: configurationError,
      });
    }

    // -------------------------------------------------
    // PREVENT DEMOTION OF THE LAST GLOBAL ADMINISTRATOR
    // -------------------------------------------------

    if (
      access.type === "GLOBAL" &&
      wasGlobalAdministrator &&
      !isGlobalAdministrator(target)
    ) {
      const count =
        await countActiveGlobalAdministrators();

      if (count <= 1) {
        return res.status(409).json({
          success: false,
          message:
            "The last active Global Administrator cannot be demoted.",
        });
      }
    }

    // -------------------------------------------------
    // SAVE ACCOUNT AND AUDIT ATOMICALLY
    // -------------------------------------------------

    await saveAccountAndAuditAtomically({
      req,
      target,
      action: "ACCOUNT_UPDATED",
      before,
      reason: String(body.reason || "").trim(),
    });

    // -------------------------------------------------
    // HANDLE SCREENER ELIGIBILITY CHANGES
    // -------------------------------------------------

    const isEligibleNow =
      isActiveAccount(target) &&
      isL0Screener(target);

    const departmentChanged =
      previousDepartment !==
      normalizeDepartment(target.department);

    // An existing screener's old department applications
    // need reassignment if their department changes.

    const shouldReassignApplications =
      wasEligibleL0Screener &&
      (!isEligibleNow || departmentChanged);

    let openApplicationsReassignment = null;

    if (shouldReassignApplications) {
      openApplicationsReassignment =
        await reassignOpenApplicationsForScreener({
          member: target,
          req,
        });
    }

    // A newly eligible screener or a screener moved into
    // another department can receive pending applications.

    const shouldRetryPendingAssignments =
      isEligibleNow &&
      (!wasEligibleL0Screener || departmentChanged);

    let pendingL0AssignmentRetry = null;

    if (shouldRetryPendingAssignments) {
      pendingL0AssignmentRetry =
        await retryPendingAssignmentsForScreener({
          member: target,
          req,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      auditLogged: true,
      teamMember: toSafeMember(target),

      ...(openApplicationsReassignment
        ? { openApplicationsReassignment }
        : {}),

      ...(pendingL0AssignmentRetry
        ? { pendingL0AssignmentRetry }
        : {}),
    });
  } catch (error) {
    console.error(
      "Update team member or audit transaction failed:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Another account already uses this email.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Team member update and audit could not be completed. The transaction was not committed.",
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

    const status = String(
      req.body.status || ""
    ).trim();

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Status must be "Active" or "Inactive".',
      });
    }

    if (target.status === status) {
      return res.status(200).json({
        success: true,
        message: `Account is already ${status}.`,
        teamMember: toSafeMember(target),
      });
    }

    const before = toAuditSnapshot(target);

    // Capture eligibility before the status changes.

    const wasEligibleL0Screener =
      isActiveAccount(target) &&
      isL0Screener(target);

    if (
      status === "Inactive" &&
      isGlobalAdministrator(target) &&
      isActiveAccount(target)
    ) {
      const count =
        await countActiveGlobalAdministrators();

      if (count <= 1) {
        return res.status(409).json({
          success: false,
          message:
            "The last active Global Administrator cannot be deactivated.",
        });
      }
    }

    // -------------------------------------------------
    // UPDATE ACCOUNT STATUS
    // -------------------------------------------------

    target.status = status;

    target.tokenVersion =
      (target.tokenVersion || 0) + 1;

    await saveAccountAndAuditAtomically({
      req,
      target,
      action: "ACCOUNT_STATUS_CHANGED",
      before,
      reason: String(req.body.reason || "").trim(),
    });

    // -------------------------------------------------
    // REASSIGN APPLICATIONS IF SCREENER IS DEACTIVATED
    // -------------------------------------------------

    let openApplicationsReassignment = null;

    if (
      wasEligibleL0Screener &&
      status === "Inactive"
    ) {
      openApplicationsReassignment =
        await reassignOpenApplicationsForScreener({
          member: target,
          req,
        });
    }

    // -------------------------------------------------
    // RETRY PENDING APPLICATIONS IF SCREENER IS ACTIVATED
    // -------------------------------------------------

    let pendingL0AssignmentRetry = null;

    const isEligibleNow =
      isActiveAccount(target) &&
      isL0Screener(target);

    if (
      status === "Active" &&
      isEligibleNow
    ) {
      pendingL0AssignmentRetry =
        await retryPendingAssignmentsForScreener({
          member: target,
          req,
        });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        `Team member ${status.toLowerCase()} successfully.`,
      auditLogged: true,
      teamMember: toSafeMember(target),

      ...(openApplicationsReassignment
        ? { openApplicationsReassignment }
        : {}),

      ...(pendingL0AssignmentRetry
        ? { pendingL0AssignmentRetry }
        : {}),
    });
  } catch (error) {
    console.error(
      "Status change or audit transaction failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Status change and audit could not be completed. The transaction was not committed.",
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

    const before = toAuditSnapshot(target);

    const wasEligibleL0Screener =
      isActiveAccount(target) &&
      isL0Screener(target);

    if (
      isGlobalAdministrator(target) &&
      isActiveAccount(target)
    ) {
      const count =
        await countActiveGlobalAdministrators();

      if (count <= 1) {
        return res.status(409).json({
          success: false,
          message:
            "The last active Global Administrator cannot be deleted.",
        });
      }
    }

    target.status = "Inactive";
    target.deletedAt = new Date();

    target.tokenVersion =
      (target.tokenVersion || 0) + 1;

    await saveAccountAndAuditAtomically({
      req,
      target,
      action: "ACCOUNT_SOFT_DELETED",
      before,
      reason: String(req.body?.reason || "").trim(),
    });

    // Reassign open applications belonging to a screener
    // whose account has now been soft-deleted.

    let openApplicationsReassignment = null;

    if (wasEligibleL0Screener) {
      openApplicationsReassignment =
        await reassignOpenApplicationsForScreener({
          member: target,
          req,
        });
    }

    return res.status(200).json({
      success: true,
      message:
        "Team member account removed. The record was retained for audit purposes.",
      auditLogged: true,

      ...(openApplicationsReassignment
        ? { openApplicationsReassignment }
        : {}),
    });
  } catch (error) {
    console.error(
      "Account deletion or audit transaction failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Account deletion and audit could not be completed. The transaction was not committed.",
    });
  }
};