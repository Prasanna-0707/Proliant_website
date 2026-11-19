import { apiRequest } from "./http.js";

// =====================================================
// DEPARTMENT ADMIN API  (read-only, own department)
// =====================================================

export const getDepartmentOverview = (signal) =>
  apiRequest("/department-admin/dashboard/overview", { signal });

// limit must be 10, 20 or 50
export const listDepartmentCandidates = (params, signal) =>
  apiRequest("/department-admin/candidates", { params, signal });

export const getDepartmentCandidate = (candidateId, signal) =>
  apiRequest(`/department-admin/candidates/${candidateId}`, { signal });

export const getDepartmentCandidateHistory = (candidateId, signal) =>
  apiRequest(`/department-admin/candidates/${candidateId}/history`, { signal });

export const getDepartmentCandidateInterviews = (candidateId, signal) =>
  apiRequest(`/department-admin/candidates/${candidateId}/interviews`, {
    signal,
  });

export const getRecruitmentReport = (params, signal) =>
  apiRequest("/department-admin/reports/recruitment", { params, signal });
// Aggregate statistics for the dashboard (all departments, counts only).
// params: department, status (ALL | IN_INTERVIEW | SELECTED | JOINED),
//         from / to (YYYY-MM-DD) or year [+ month | quarter]
export const getDepartmentStatistics = (params, signal) =>
  apiRequest("/department-admin/dashboard/statistics", { params, signal });
