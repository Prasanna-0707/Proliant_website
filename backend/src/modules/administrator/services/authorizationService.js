
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

 // Returns all roles assigned to the account.
 // This does not mean the user can use all of them at once.

 export const getUserRoles = (user) => {
   if (!user) return [];

   const values = [
     user.role,
     ...(Array.isArray(user.roles) ? user.roles : []),
   ];

   return [...new Set(values.map(normalizeRole).filter(Boolean))];
 };

 // Returns the selected role only when it belongs to the
 // user's assigned roles.
 //
 // A legacy single-role account continues to work.
 // A multi-role account without a selected role is denied
 // role-specific access until a role is selected.

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

 // Checks assigned roles without granting the actor
 // permissions for those roles. Useful for protecting
 // target accounts during account management.

 export const hasAssignedRole = (user, allowedRoles = []) => {
   const assignedRoles = getUserRoles(user);

   return allowedRoles
     .map(normalizeRole)
     .some((role) => assignedRoles.includes(role));
 };

 const isLegacySingleRoleAccount = (user) =>
   user &&
   (!Array.isArray(user.roles) || user.roles.length === 0) &&
   getUserRoles(user).length === 1;

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

 // Account-level checks for target users. These do not
 // depend on the target's currently selected session role.

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
 // HOD
 // -----------------------------------------------------

 export const isHod = (user, activeRole) => {
   if (
     hasActiveRole(
       user,
       ["HOD", "Head of Department", "Department Head"],
       activeRole
     )
   ) {
     return true;
   }

   // Backward compatibility for existing single-role accounts
   // whose HOD responsibility is recorded only in designation.
   if (!isLegacySingleRoleAccount(user)) {
     return false;
   }

   const designation = normalizeRole(user.designation);

   return [
     "hod",
     "head of department",
     "department head",
   ].includes(designation);
 };

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

   if (
     l0Roles.includes(currentRole) ||
     (
       currentRole.includes("l0") &&
       (
         currentRole.includes("screener") ||
         currentRole.includes("interviewer")
       )
     )
   ) {
     return true;
   }

   // Legacy compatibility for an account whose role is
   // Interviewer and designation identifies it as L0.
   if (
     currentRole === "interviewer" ||
     (
       isLegacySingleRoleAccount(user) &&
       currentRole === normalizeRole(user.role)
     )
   ) {
     const designation = normalizeRole(user.designation);

     return (
       designation.includes("l0") ||
       designation.includes("screener")
     );
   }

   return false;
 };

 export const canAccessL0Screening = (user, activeRole) =>
   isActiveAccount(user) && isL0Screener(user, activeRole);

 // -----------------------------------------------------
 // INTERVIEWER
 // -----------------------------------------------------

 export const isInterviewer = (user, activeRole) => {
   const currentRole = getActiveRole(user, activeRole);

   if (!currentRole) return false;

   if (currentRole.includes("interviewer")) {
     return true;
   }

   // Preserve the previous designation-based behaviour only
   // for existing single-role accounts.
   if (
     isLegacySingleRoleAccount(user) &&
     !isHrOrRecruiter(user, currentRole) &&
     !isAdministrator(user, currentRole)
   ) {
     return normalizeRole(user.designation).includes("interviewer");
   }

   return false;
 };

 export const isActiveInterviewer = (user, activeRole) =>
   isActiveAccount(user) && isInterviewer(user, activeRole);

 export const getPermittedInterviewLevels = (
   user,
   activeRole
 ) => {
   const currentRole = getActiveRole(user, activeRole);

   if (!currentRole) return [];

   const explicitLevels =
     currentRole.toUpperCase().match(/\bL\d+\b/g) || [];

   if (explicitLevels.length > 0) {
     return [...new Set(explicitLevels)];
   }

   // Use designation as a fallback only for a generic
   // Interviewer role, not for another selected role.
   if (currentRole === "interviewer") {
     const designation = normalizeRole(user.designation);
     const levels =
       designation.toUpperCase().match(/\bL\d+\b/g) || [];

     return [...new Set(levels)];
   }

   return [];
 };

 export const canAccessInterviewStage = (
   user,
   stageCode,
   activeRole
 ) => {
   if (!isActiveInterviewer(user, activeRole)) {
     return false;
   }

   const permittedLevels = getPermittedInterviewLevels(
     user,
     activeRole
   );

   if (permittedLevels.length === 0) {
     return true;
   }

   return permittedLevels.includes(
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

   if (isGlobalAdministrator(user, activeRole)) {
     return {
       type: "GLOBAL",
       department: null,
       readOnly: false,
     };
   }

   const department = String(user.department || "").trim();

   if (!department) return null;

   if (isDepartmentAdministrator(user, activeRole)) {
     return {
       type: "DEPARTMENT_ADMIN",
       department,
       readOnly: false,
     };
   }

   if (isHrOrRecruiter(user, activeRole)) {
     return {
       type: "HR",
       department,
       readOnly: true,
     };
   }

   if (isHod(user, activeRole)) {
     return {
       type: "HOD",
       department,
       readOnly: true,
     };
   }

   return null;
 };

 export const canViewTeamMember = (
   actor,
   target,
   activeRole
 ) => {
   const access = getTeamDirectoryAccess(actor, activeRole);

   if (!access || !target || target.deletedAt) {
     return false;
   }

   if (access.type === "GLOBAL") {
     return true;
   }

   if (isGlobalAdministratorAccount(target)) {
     return false;
   }

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

   if (
     actor._id?.toString() === target._id?.toString()
   ) {
     return false;
   }

   if (access.type === "GLOBAL") {
     return true;
   }

   if (access.type !== "DEPARTMENT_ADMIN") {
     return false;
   }

   const sameDepartment =
     normalizeDepartment(target.department) ===
     normalizeDepartment(access.department);

   const targetIsEligible =
     isDepartmentAdministratorAccount(target) ||
     (
       !hasAssignedRole(target, ["Administrator"]) &&
       !target.adminScope
     );

   return (
     sameDepartment &&
     !isGlobalAdministratorAccount(target) &&
     targetIsEligible
   );
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

     // All roles are listed for role selection.
     assignedRoles: getUserRoles(user),

     // Only this role should be used for authorization.
     activeRole: selectedRole,

     designation: user.designation || "",
     department: user.department || "",
     adminScope: user.adminScope || null,

     isGlobalAdministrator:
       isGlobalAdministrator(user, selectedRole),

     isDepartmentAdministrator:
       isDepartmentAdministrator(user, selectedRole),

     isHrOrRecruiter:
       isHrOrRecruiter(user, selectedRole),

     isHod: isHod(user, selectedRole),

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
