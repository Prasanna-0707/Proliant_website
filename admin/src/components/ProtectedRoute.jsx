import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getStoredUser } from "../services/http.js";
import {
  getHomePath,
  getStaffRole,
  isStaffSignedIn,
} from "../services/staffAuth.js";

// Guards a group of staff routes.
//
//   <ProtectedRoute />                          signed-in staff only
//   <ProtectedRoute allowedRoles={["HR"]} />    signed in AND one of the roles
//   <ProtectedRoute allowedRoles={["ADMIN"]} allowedAccessLevels={["GLOBAL"]} />
//        administrators are further limited by access level (GLOBAL or
//        DEPARTMENT). The level only applies to the ADMIN role.
//
// Not signed in -> /login. Signed in with another role -> that user's own
// home page. The backend enforces the real permissions on every request.
function ProtectedRoute({ allowedRoles, allowedAccessLevels }) {
  const location = useLocation();

  if (!isStaffSignedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length) {
    const role = getStaffRole();

    if (!allowedRoles.includes(role)) {
      const home = getHomePath();

      return <Navigate to={home === location.pathname ? "/login" : home} replace />;
    }
  }

  if (allowedAccessLevels?.length && getStaffRole() === "ADMIN") {
    const level = getStoredUser("staff")?.adminAccessLevel;

    if (!allowedAccessLevels.includes(level)) {
      const home = getHomePath();

      return <Navigate to={home === location.pathname ? "/login" : home} replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;