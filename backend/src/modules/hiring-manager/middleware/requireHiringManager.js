
const ALLOWED_ROLES = ["hiring manager", "hiring lead"];

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

export const requireHiringManager = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required.",
    });
  }

  if (normalize(req.admin.status) !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive.",
    });
  }

  const role = normalize(req.admin.role);

  if (!ALLOWED_ROLES.includes(role)) {
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
  const role = normalize(req.admin?.role);

  if (!ALLOWED_ROLES.includes(role)) {
    return next("router");
  }

  return requireHiringManager(req, res, next);
};
