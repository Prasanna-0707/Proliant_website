import express from "express";

import {
  // Dashboard APIs
  getL0Dashboard,
  getL0DashboardRecentApplications,
  getL0DashboardRecentActivity,

  // My Applications APIs
  getAssignedL0Applications,
  getL0ApplicationDetails,
  startL0Screening,

  // Screening Checklist APIs
  getL0ScreeningChecklist,
  updateL0ScreeningChecklist,

  // Screening Decision API
  submitL0ScreeningDecision,

  // HR Review APIs
  getL0HRReviewRequests,
  getL0HRReviewRequestDetails,

  // Screening History APIs
  getL0ScreeningHistory,
  getL0ApplicationHistoryDetails,

  // Profile APIs
  getL0Profile,
  updateL0Profile,

  // Legacy API
  getL0ScreeningStats,
} from "../controllers/screeningController.js";

import {
  getScreenerApplicationResume,
} from "../../../controllers/applicationController.js";

import authMiddleware from "../../../middleware/authMiddleware.js";

import requirePermission from "../../administrator/middleware/requirePermission.js";

const router = express.Router();

// =====================================================
// L0 SCREENER PORTAL APIs
// Existing route paths are preserved.
// =====================================================


// =====================================================
// 1. DASHBOARD APIs
// =====================================================

router.get(
  "/dashboard",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0Dashboard
);

router.get(
  "/dashboard/recent-applications",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0DashboardRecentApplications
);

router.get(
  "/dashboard/recent-activity",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0DashboardRecentActivity
);


// =====================================================
// 2. MY APPLICATIONS APIs
// =====================================================

router.get(
  "/applications",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getAssignedL0Applications
);

router.get(
  "/applications/:applicationId",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0ApplicationDetails
);

router.get(
  "/applications/:id/resume",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getScreenerApplicationResume
);

// Starting a screening still uses authentication and
// the existing controller-level L0 assignment checks.
// A dedicated screening-start permission is not yet
// present in the permission catalogue.

router.patch(
  "/applications/:applicationId/start",
  authMiddleware,
  startL0Screening
);


// =====================================================
// 3. SCREENING CHECKLIST APIs
// =====================================================

router.get(
  "/applications/:applicationId/checklist",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0ScreeningChecklist
);

router.put(
  "/applications/:applicationId/checklist",
  authMiddleware,
  requirePermission("screening.checklist.update"),
  updateL0ScreeningChecklist
);


// =====================================================
// 4. SCREENING DECISION API
// =====================================================

router.post(
  "/applications/:applicationId/decision",
  authMiddleware,
  requirePermission("screening.decision.submit"),
  submitL0ScreeningDecision
);


// =====================================================
// 5. HR REVIEW REQUEST APIs
// =====================================================

router.get(
  "/hr-review-requests",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0HRReviewRequests
);

router.get(
  "/hr-review-requests/:applicationId",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0HRReviewRequestDetails
);


// =====================================================
// 6. SCREENING HISTORY APIs
// =====================================================

router.get(
  "/history",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0ScreeningHistory
);

router.get(
  "/history/:applicationId",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0ApplicationHistoryDetails
);


// =====================================================
// 7. L0 SCREENER PROFILE APIs
// =====================================================

// Dedicated profile permissions are not yet configured.
// Keep authentication and the existing controller checks.

router.get(
  "/profile",
  authMiddleware,
  getL0Profile
);

router.patch(
  "/profile",
  authMiddleware,
  updateL0Profile
);


// =====================================================
// 8. LEGACY L0 SCREENING APIs
// Retained for backward compatibility.
// =====================================================

router.get(
  "/l0/assigned",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getAssignedL0Applications
);

router.get(
  "/l0/stats",
  authMiddleware,
  requirePermission("screening.assigned.read"),
  getL0ScreeningStats
);


// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;