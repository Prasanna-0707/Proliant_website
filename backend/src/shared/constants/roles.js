// =====================================================
// ACCOUNT TYPES AND ROLES
//
// Two staff collections exist and must never be merged:
//
//   Admin  -> Global Administrator and Department Administrator
//             (role = "Administrator", adminScope = GLOBAL | DEPARTMENT)
//
//   User   -> HR, Interviewer, Hiring Manager and L0 Screener
//             (plus their closely related variants listed below)
//
// Candidates have their own separate CandidateAccount collection.
// =====================================================

export const ACCOUNT_TYPES = Object.freeze({
  ADMIN: "ADMIN",
  USER: "USER",
});

export const ADMIN_ROLE = "Administrator";

export const ADMIN_SCOPES = Object.freeze(["GLOBAL", "DEPARTMENT"]);

// Canonical role keys stored on User documents. These are also the
// keys used by RolePermission documents.
export const USER_ROLES = Object.freeze([
  "HR",
  "RECRUITER",
  "INTERVIEWER",
  "L1_INTERVIEWER",
  "L2_INTERVIEWER",
  "HIRING_MANAGER",
  "HIRING_LEAD",
  "L0_SCREENER",
  "EMPLOYEE",
]);

// Converts "L0 Screener", "l0-screener", "Hiring Manager" etc. into a
// canonical key such as "L0_SCREENER" or "HIRING_MANAGER".
export const toRoleKey = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s/\-]+/g, "_");

export const isAdministratorRole = (value) =>
  toRoleKey(value) === "ADMINISTRATOR";

// Returns the canonical User role for a supplied value,
// or null when it is not a valid User role.
export const resolveUserRole = (value) => {
  const key = toRoleKey(value);

  return USER_ROLES.includes(key) ? key : null;
};

// Decides which collection a role belongs to.
//   "Administrator"            -> ADMIN
//   any valid User role        -> USER
//   anything else              -> null
export const getAccountTypeForRole = (value) => {
  if (isAdministratorRole(value)) return ACCOUNT_TYPES.ADMIN;
  if (resolveUserRole(value)) return ACCOUNT_TYPES.USER;

  return null;
};

// Mongoose model names of the two staff collections. Used by polymorphic
// references (refPath) where either an Admin or a User may be the actor.
export const STAFF_MODELS = Object.freeze(["Admin", "User"]);

// =====================================================
// GLOBAL ADMINISTRATOR APPROVAL
//
// Only these accounts are Global Administrators. An Admin
// document whose adminScope is GLOBAL but whose email is not
// listed here is NOT treated as a Global Administrator by any
// authorization check, and cannot be given GLOBAL scope.
// =====================================================

export const APPROVED_GLOBAL_ADMIN_EMAILS = Object.freeze([
  "bogachandrapu@gmail.com",
]);

// Kept visible on purpose. This account exists in the database with
// adminScope GLOBAL, but it is NOT approved, so it has no Global
// Administrator access.
export const NOT_APPROVED_GLOBAL_ADMIN_EMAILS = Object.freeze([
  "aswini32933@gmail.com",
]);

export const isApprovedGlobalAdminEmail = (email) =>
  APPROVED_GLOBAL_ADMIN_EMAILS.includes(
    String(email || "").trim().toLowerCase()
  );