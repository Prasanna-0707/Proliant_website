
// =====================================================
// CENTRALIZED AUTHORIZATION SERVICE
// Proliant Hiring Portal
// =====================================================

// -----------------------------------------------------
// NORMALIZATION
// -----------------------------------------------------

export const normalizeRole = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_/-]+/g, " ")
    .replace(/\s+/g, " ");

export const normalizeDepartment = normalizeRole;

// -----------------------------------------------------
// ACCOUNT HELPERS
// -----------------------------------------------------

export const isActiveAccount = (user) =>
  Boolean(user && user.status === "Active" && !user.deletedAt);

export const getUserRoles = (user) => {
  if (!user) return [];

  const values = [
    user.role,
    ...(Array.isArray(user.roles) ? user.roles : []),
  ];

  return [...new Set(values.map(normalizeRole).filter(Boolean))];
};

export const getActiveRole = (user, requestedRole) => {
  const assignedRoles = getUserRoles(user);

  const selected = normalizeRole(
    requestedRole ?? user?.activeRole ?? ""
  );

  if (selected) {
    return assignedRoles.includes(selected) ? selected : null;
  }

  return assignedRoles.length === 1
    ? assignedRoles[0]
    : null;
};

export const hasActiveRole = (
  user,
  allowedRoles = [],
  requestedRole
) => {
  const activeRole = getActiveRole(user, requestedRole);

  if (!activeRole) return false;

  return allowedRoles
    .map(normalizeRole)
    .includes(activeRole);
};

export const hasAssignedRole = (user, allowedRoles = []) => {
  const assignedRoles = getUserRoles(user);

  return allowedRoles
    .map(normalizeRole)
    .some((role) => assignedRoles.includes(role));
};

// -----------------------------------------------------
// ADMINISTRATOR
// -----------------------------------------------------

export const isAdministrator = (user, activeRole) =>
  hasActiveRole(user, ["Administrator"], activeRole);

export const isGlobalAdministrator = (user, activeRole) =>
  isActiveAccount(user) &&
  isAdministrator(user, activeRole) &&
  user.adminScope === "GLOBAL";

export const isDepartmentAdministrator = (user, activeRole) =>
  isActiveAccount(user) &&
  isAdministrator(user, activeRole) &&
  user.adminScope === "DEPARTMENT" &&
  Boolean(String(user.department || "").trim());

export const isGlobalAdministratorAccount = (user) =>
  hasAssignedRole(user, ["Administrator"]) &&
  user?.adminScope === "GLOBAL";

export const isDepartmentAdministratorAccount = (user) =>
  hasAssignedRole(user, ["Administrator"]) &&
  user?.adminScope === "DEPARTMENT" &&
  Boolean(String(user?.department || "").trim());

// -----------------------------------------------------
// HR / RECRUITER
// -----------------------------------------------------

export const isHrOrRecruiter = (user, activeRole) =>
  hasActiveRole(
    user,
    [
      "HR",
      "Recruiter",
      "HR Recruiter",
      "HR/Recruiter",
      "HR Admin",
      "HR Manager",
    ],
    activeRole
  );

// -----------------------------------------------------
// L0 SCREENER
// -----------------------------------------------------

export const isL0Screener = (user, activeRole) => {
  const currentRole = getActiveRole(user, activeRole);

  if (!currentRole) return false;

  const l0Roles = [
    "l0",
    "l0 screener",
    "l0 initial screener",
    "initial screener",
    "screener",
  ];

  return (
    l0Roles.includes(currentRole) ||
    (
      currentRole.includes("l0") &&
      (
        currentRole.includes("screener") ||
        currentRole.includes("interviewer")
      )
    )
  );
};

export const canAccessL0Screening = (user, activeRole) =>
  isActiveAccount(user) && isL0Screener(user, activeRole);

// -----------------------------------------------------
// INTERVIEWER
// -----------------------------------------------------

export const isInterviewer = (user, activeRole) => {
  const currentRole = getActiveRole(user, activeRole);

  return currentRole === "interviewer";
};

export const isActiveInterviewer = (user, activeRole) =>
  isActiveAccount(user) && isInterviewer(user, activeRole);

// L1/L2/L3 are configurable interview workflow stages.
// They are not separate interviewer roles or designations.
// Preserve this export for compatibility with existing imports.
export const getPermittedInterviewLevels = () => [];

// Stage assignment must be checked against Interview records
// in the interviewer controller.
export const canAccessInterviewStage = (
  user,
  stageCode,
  activeRole
) => {
  if (!isActiveInterviewer(user, activeRole)) {
    return false;
  }

  return /^[A-Z0-9_-]+$/.test(
    String(stageCode || "").trim().toUpperCase()
  );
};

// -----------------------------------------------------
// HIRING MANAGER
// -----------------------------------------------------

export const isHiringManager = (user, activeRole) =>
  hasActiveRole(user, ["Hiring Manager", "Hiring Lead"], activeRole);

export const canAccessHiringManagerModule = (
  user,
  activeRole
) =>
  isActiveAccount(user) && isHiringManager(user, activeRole);

// -----------------------------------------------------
// TEAM MEMBERS DIRECTORY
// -----------------------------------------------------

export const getTeamDirectoryAccess = (user, activeRole) => {
  if (!isActiveAccount(user)) return null;

  // Global Administrator:
  // Organization-wide team directory access.
  if (isGlobalAdministrator(user, activeRole)) {
    return {
      type: "GLOBAL",
      department: null,
      readOnly: false,
    };
  }

  const department = String(user.department || "").trim();

  if (!department) return null;

  // Department Administrator:
  // Read-only access to eligible members of their own department.
  // This does not grant portal-user management permissions.
  if (isDepartmentAdministrator(user, activeRole)) {
    return {
      type: "DEPARTMENT_ADMIN",
      department,
      readOnly: true,
    };
  }

  // HR / Recruiter:
  // Preserve the existing read-only directory behavior.
  if (isHrOrRecruiter(user, activeRole)) {
    return {
      type: "HR",
      department,
      readOnly: true,
    };
  }

  return null;
};

// -----------------------------------------------------
// TEAM MEMBER VIEW ACCESS
// -----------------------------------------------------

export const canViewTeamMember = (
  actor,
  target,
  activeRole
) => {
  const access = getTeamDirectoryAccess(actor, activeRole);

  if (!access || !target || target.deletedAt) {
    return false;
  }

  // Global Administrators can view members across departments.
  if (access.type === "GLOBAL") {
    return true;
  }

  // Department Administrators and HR cannot view
  // Global Administrator accounts through the directory.
  if (isGlobalAdministratorAccount(target)) {
    return false;
  }

  // Department-scoped directory visibility.
  // No cross-department member details.
  return (
    normalizeDepartment(target.department) ===
    normalizeDepartment(access.department)
  );
};

// -----------------------------------------------------
// TEAM MEMBER MANAGEMENT
// -----------------------------------------------------

export const canManageTeamMember = (
  actor,
  target,
  activeRole
) => {
  const access = getTeamDirectoryAccess(actor, activeRole);

  if (!access || !target || target.deletedAt) {
    return false;
  }

  // Prevent users from managing their own account through
  // the team-member management operations.
  if (
    actor._id?.toString() === target._id?.toString()
  ) {
    return false;
  }

  // Only Global Administrators can manage portal users.
  // Department Administrators have read-only directory access.
  // HR recruitment responsibilities do not grant user-management
  // authority through this administrator service.
  return access.type === "GLOBAL";
};

// -----------------------------------------------------
// SCREENING OVERSIGHT
// -----------------------------------------------------

export const canReadScreeningOversight = (
  user,
  activeRole
) =>
  isActiveAccount(user) &&
  (
    isGlobalAdministrator(user, activeRole) ||
    isDepartmentAdministrator(user, activeRole) ||
    isHrOrRecruiter(user, activeRole)
  );

// -----------------------------------------------------
// AUTHORIZATION CONTEXT
// -----------------------------------------------------

export const getAuthorizationContext = (
  user,
  activeRole
) => {
  if (!isActiveAccount(user)) return null;

  const selectedRole = getActiveRole(user, activeRole);

  return {
    userId: user._id?.toString() || null,

    assignedRoles: getUserRoles(user),

    activeRole: selectedRole,

    // Informational field only.
    // Designation does not grant or restrict authorization.
    designation: user.designation || "",

    department: user.department || "",
    adminScope: user.adminScope || null,

    isGlobalAdministrator:
      isGlobalAdministrator(user, selectedRole),

    isDepartmentAdministrator:
      isDepartmentAdministrator(user, selectedRole),

    isHrOrRecruiter:
      isHrOrRecruiter(user, selectedRole),

    isL0Screener:
      isL0Screener(user, selectedRole),

    isInterviewer:
      isInterviewer(user, selectedRole),

    isHiringManager:
      isHiringManager(user, selectedRole),

    teamDirectory:
      getTeamDirectoryAccess(user, selectedRole),
  };
};
