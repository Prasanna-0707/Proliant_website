import { apiRequest } from "./http.js";

// =====================================================
// HIRING MANAGER API  (staff session, role HIRING_MANAGER)
// =====================================================

export const getHiringPipeline = (params, signal) =>
  apiRequest("/hiring/pipeline", { params, signal });

export const getFeedbackHistory = (params, signal) =>
  apiRequest("/hiring/feedback-history", { params, signal });

export const getHiringApplication = (applicationId, signal) =>
  apiRequest(`/applications/${applicationId}`, { signal });

export const getApplicationFeedback = (applicationId, signal) =>
  apiRequest(`/applications/${applicationId}/feedback`, { signal });

export const listDecisions = (applicationId, signal) =>
  apiRequest(`/applications/${applicationId}/decisions`, { signal });

// decision: "Advance" | "Reject" | "Hold" (reason required for Reject / Hold)
export const submitHiringDecision = (applicationId, body) =>
  apiRequest(`/applications/${applicationId}/decisions`, {
    method: "POST",
    body,
  });
// Scheduled interviews for the manager's assigned jobs.
export const listHiringInterviews = (params, signal) =>
  apiRequest("/hiring/interviews", { params, signal });
