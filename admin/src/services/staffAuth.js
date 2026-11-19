import { normalizeUserRole } from "../config/sidebarConfig.js";
import { getStoredUser, getToken } from "./http.js";

// =====================================================
// STAFF SESSION HELPERS
//
// The backend returns the signed-in user's `role` (Administrator, HR,
// L0_SCREENER, INTERVIEWER, HIRING_MANAGER, ...) and, for administrators,
// `adminAccessLevel` (GLOBAL | DEPARTMENT | NONE).
// =====================================================

export const isStaffSignedIn = () => Boolean(getToken("staff"));

// Portal role used by the frontend: ADMIN, HR, RECRUITER, L0_SCREENER,
// INTERVIEWER or HIRING_MANAGER (null when unknown).
export const getStaffRole = (user = getStoredUser("staff")) =>
  normalizeUserRole(user);

// First page shown after signing in.
export const getHomePath = (user = getStoredUser("staff")) => {
  switch (getStaffRole(user)) {
    case "ADMIN":
      if (user?.adminAccessLevel === "DEPARTMENT") return "/dept-admin-dashboard";
      if (user?.adminAccessLevel === "GLOBAL") return "/admin/dashboard";

      // An administrator account without effective administrator access.
      return "/admin/profile";
    case "HR":
    case "RECRUITER":
      return "/hr/dashboard";
    case "L0_SCREENER":
      return "/screener-dashboard";
    case "INTERVIEWER":
      return "/interviewer/dashboard";
    case "HIRING_MANAGER":
      return "/hiring-manager/dashboard";
    default:
      return "/login";
  }
};