import {
  canAccessHiringManagerModule,
  isHiringManager,
} from "../../../shared/services/authorizationService.js";

// Allows only active Hiring Manager / Hiring Lead accounts.
export const requireHiringManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required.",
    });
  }

  if (!canAccessHiringManagerModule(req.user, req.activeRole)) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to Hiring Manager APIs.",
    });
  }

  return next();
};

// Allows non-Hiring-Manager users to continue to existing
// application routes, such as the existing HR application-details API.
export const passThroughUnlessHiringManager = (req, res, next) => {
  if (!isHiringManager(req.user, req.activeRole)) {
    return next("router");
  }

  return requireHiringManager(req, res, next);
};
