import { isDepartmentAdministrator } from "../services/authorizationService.js";

// Department Administrators have a read-only recruitment dashboard only.
// Use this on routes that must never be reachable by them (user and team
// management). The role check runs on the server, so hiding a button in the
// frontend is not what protects these routes.
const denyDepartmentAdministrator = (req, res, next) => {
  if (req.user && isDepartmentAdministrator(req.user, req.activeRole)) {
    return res.status(403).json({
      success: false,
      message:
        "Department Administrators have read-only recruitment access and cannot manage users or settings.",
    });
  }

  return next();
};

export default denyDepartmentAdministrator;
