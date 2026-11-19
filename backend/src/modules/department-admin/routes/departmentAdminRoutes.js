
import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";

import requireDepartmentAdmin from "../middleware/requireDepartmentAdmin.js";

import requirePermission from "../../../shared/middleware/requirePermission.js";

import {
  getDashboardOverview,
  getDepartmentAdminCandidates,
  getDepartmentAdminCandidateDetails,
  getDepartmentAdminCandidateHistory,
  getDepartmentAdminCandidateInterviews,
  getDepartmentAdminRecruitmentReport,
} from "../controllers/departmentAdminDashboardController.js";

import { getDashboardStatistics } from "../controllers/departmentAdminStatisticsController.js";

const router = express.Router();

// =====================================================
// API 1: DASHBOARD OVERVIEW
// =====================================================

router.get(
  "/dashboard/overview",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.dashboard.read"),
  getDashboardOverview
);

// =====================================================
// API 1b: DASHBOARD STATISTICS (in interview / selected / joined,
// department-wise, with filters). Aggregate counts only.
// =====================================================

router.get(
  "/dashboard/statistics",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.dashboard.read"),
  getDashboardStatistics
);

// =====================================================
// API 2: CANDIDATE LISTING
// =====================================================

router.get(
  "/candidates",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.candidates.read"),
  getDepartmentAdminCandidates
);

// =====================================================
// API 3: CANDIDATE PROFILE DETAILS
// =====================================================

router.get(
  "/candidates/:candidateId",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.candidate.details.read"),
  getDepartmentAdminCandidateDetails
);

// =====================================================
// API 4: CANDIDATE RECRUITMENT HISTORY
// =====================================================

router.get(
  "/candidates/:candidateId/history",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.candidate.history.read"),
  getDepartmentAdminCandidateHistory
);

// =====================================================
// API 5: CANDIDATE INTERVIEW DETAILS
// =====================================================

router.get(
  "/candidates/:candidateId/interviews",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.interviews.feedback.read"),
  getDepartmentAdminCandidateInterviews
);

// =====================================================
// API 6: RECRUITMENT REPORT
// GET /api/department-admin/reports/recruitment
// =====================================================

router.get(
  "/reports/recruitment",
  authMiddleware,
  requireDepartmentAdmin,
  requirePermission("department.reports.read"),
  getDepartmentAdminRecruitmentReport
);

export default router;
