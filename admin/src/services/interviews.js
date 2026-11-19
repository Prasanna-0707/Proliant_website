import { apiRequest } from "./http.js";

// =====================================================
// INTERVIEWER API  (staff session, role INTERVIEWER)
// =====================================================

export const listMyInterviews = (params, signal) =>
  apiRequest("/interviews/my", { params, signal });

export const getInterview = (interviewId, signal) =>
  apiRequest(`/interviews/${interviewId}`, { signal });

export const submitEvaluation = (interviewId, body) =>
  apiRequest(`/interviews/${interviewId}/evaluation`, {
    method: "POST",
    body,
  });

export const updateEvaluation = (interviewId, body) =>
  apiRequest(`/interviews/${interviewId}/evaluation`, {
    method: "PATCH",
    body,
  });

export const getEvaluationForm = (stageCode, params, signal) =>
  apiRequest(`/evaluation-forms/${stageCode}`, { params, signal });

// ---- evaluation form management (HR / Global Administrator) ----
export const listEvaluationForms = (params, signal) =>
  apiRequest("/evaluation-forms/manage", { params, signal });

export const createEvaluationForm = (body) =>
  apiRequest("/evaluation-forms/manage", { method: "POST", body });

export const updateEvaluationFormDraft = (id, body) =>
  apiRequest(`/evaluation-forms/manage/${id}`, { method: "PUT", body });

export const setEvaluationFormStatus = (id, status) =>
  apiRequest(`/evaluation-forms/manage/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
// ---- interview scheduling and management (HR / Global Admin / L0 Screener) ----
export const listManagedInterviews = (params, signal) =>
  apiRequest("/interviews", { params, signal });

export const getManagedInterview = (id, signal) =>
  apiRequest(`/interviews/manage/${id}`, { signal });

export const listEligibleInterviewers = (stageCode, signal) =>
  apiRequest("/interviews/interviewers", { params: { stageCode }, signal });

export const scheduleInterview = (body) =>
  apiRequest("/interviews", { method: "POST", body });

export const rescheduleInterview = (id, body) =>
  apiRequest(`/interviews/${id}/reschedule`, { method: "PATCH", body });

export const reassignInterviewer = (id, body) =>
  apiRequest(`/interviews/${id}/assign`, { method: "PATCH", body });

export const cancelInterview = (id, reason) =>
  apiRequest(`/interviews/${id}/cancel`, {
    method: "PATCH",
    body: { reason },
  });
