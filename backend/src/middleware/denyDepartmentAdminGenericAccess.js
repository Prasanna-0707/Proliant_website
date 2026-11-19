import {
  getActiveRole,
  isActiveAccount,
  isDepartmentAdministrator,
  isDepartmentAdministratorAccount,
} from "../modules/administrator/services/authorizationService.js";

// =====================================================
// DENY DEPARTMENT ADMIN ACCESS TO GENERIC APIs
//
// Department Administrators must use the dedicated,
// department-scoped, read-only Department Admin APIs.
//
// Other authorized roles retain their existing access.
// =====================================================

const denyDepartmentAdminGenericAccess = (
  req,
  res,
  next
) => {
  try {
    const user = req.admin;

    // Authentication middleware should run first.
    if (!user || !isActiveAccount(user)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const activeRole = getActiveRole(
      user,
      req.activeRole
    );

    // Check the currently selected role first.
    const isDepartmentAdmin =
      activeRole
        ? isDepartmentAdministrator(user, activeRole)
        : isDepartmentAdministratorAccount(user);

    if (isDepartmentAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Department Administrators must use the dedicated department-scoped APIs to access candidate and application information.",
      });
    }

    return next();
  } catch (error) {
    console.error(
      "Department Admin generic API access guard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify candidate access permissions.",
    });
  }
};

export default denyDepartmentAdminGenericAccess;