import { apiRequest } from "./http.js";

// =====================================================
// L0 SCREENER API  (staff session, role L0_SCREENER)
// =====================================================

export const getScreenerDashboard = (signal) =>
  apiRequest("/screenings/dashboard", { signal });

export const getRecentApplications = (signal) =>
  apiRequest("/screenings/dashboard/recent-applications", { signal });

export const getRecentActivity = (signal) =>
  apiRequest("/screenings/dashboard/recent-activity", { signal });

export const listScreeningApplications = (params, signal) =>
  apiRequest("/screenings/applications", { params, signal });

export const getScreeningApplication = (applicationId, signal) =>
  apiRequest(`/screenings/applications/${applicationId}`, { signal });

export const downloadScreeningResume = (applicationId) =>
  apiRequest(`/screenings/applications/${applicationId}/resume`, {
    blob: true,
  });

export const startScreening = (applicationId) =>
  apiRequest(`/screenings/applications/${applicationId}/start`, {
    method: "PATCH",
  });

export const getChecklist = (applicationId, signal) =>
  apiRequest(`/screenings/applications/${applicationId}/checklist`, { signal });

export const saveChecklist = (applicationId, checklist) =>
  apiRequest(`/screenings/applications/${applicationId}/checklist`, {
    method: "PUT",
    body: { checklist },
  });

// decision: "SHORTLIST" | "REJECT" | "ON_HOLD" (as accepted by the API)
export const submitDecision = (applicationId, body) =>
  apiRequest(`/screenings/applications/${applicationId}/decision`, {
    method: "POST",
    body,
  });

export const listHrReviewRequests = (signal) =>
  apiRequest("/screenings/hr-review-requests", { signal });

export const getScreeningHistory = (params, signal) =>
  apiRequest("/screenings/history", { params, signal });

export const getApplicationHistory = (applicationId, signal) =>
  apiRequest(`/screenings/history/${applicationId}`, { signal });

export const getScreenerProfile = (signal) =>
  apiRequest("/screenings/profile", { signal });

export const updateScreenerProfile = (body) =>
  apiRequest("/screenings/profile", { method: "PATCH", body });