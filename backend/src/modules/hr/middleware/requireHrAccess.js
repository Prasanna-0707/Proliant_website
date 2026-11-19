import {
  isActiveAccount,
  isGlobalAdministrator,
  isHrOrRecruiter,
} from "../../../shared/services/authorizationService.js";

// =====================================================
// REQUIRE HR ACCESS
//
// Allows active HR / Recruiter accounts (User collection)
// and active Global Administrators (Admin collection).
//
// Department Administrators, Interviewers, Hiring Managers
// and L0 Screeners are not allowed. They have their own
// role-specific modules.
// =====================================================

const requireHrAccess = (req, res, next) => {
  const user = req.user;

  if (!user || !isActiveAccount(user)) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (
    isGlobalAdministrator(user, req.activeRole) ||
    isHrOrRecruiter(user, req.activeRole)
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "HR or Global Administrator access is required.",
  });
};

export default requireHrAccess;
