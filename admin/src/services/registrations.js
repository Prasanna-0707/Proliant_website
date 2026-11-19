import { apiRequest } from "./http.js";

// =====================================================
// REGISTRATION CANDIDATES  (collection "candidates", /api/candidates)
// HR and Global Administrator. Separate from HR candidates
// (/api/hr-candidates).
// =====================================================

export const listRegistrations = (params, signal) =>
  apiRequest("/candidates", { params, signal });

export const getRegistration = (id, signal) =>
  apiRequest(`/candidates/${id}`, { signal });

export const updateRegistration = (id, body) =>
  apiRequest(`/candidates/${id}`, { method: "PUT", body });

export const deleteRegistration = (id) =>
  apiRequest(`/candidates/${id}`, { method: "DELETE" });

export const exportRegistrations = (params) =>
  apiRequest("/candidates/export/excel", { params, blob: true });

export const confirmJoining = (id, body) =>
  apiRequest(`/candidates/${id}/confirm-joining`, {
    method: "PATCH",
    body,
  });

export const correctJoiningDate = (id, body) =>
  apiRequest(`/candidates/${id}/correct-joining-date`, {
    method: "PATCH",
    body,
  });

export const getJoiningHistory = (id, signal) =>
  apiRequest(`/candidates/${id}/joining-history`, { signal });

// ---- application oversight (HR / admins) ----
export const getApplicationDetail = (id, signal) =>
  apiRequest(`/applications/${id}`, { signal });

export const downloadApplicationResume = (id) =>
  apiRequest(`/applications/${id}/resume`, { blob: true });

export const getApplicationScreenings = (id, signal) =>
  apiRequest(`/applications/${id}/screenings`, { signal });

// =====================================================
// HR CANDIDATES  (collection "hrcandidates", /api/hr-candidates)
// Kept separate from the registration candidates above.
// =====================================================

export const createHrCandidate = (body) =>
  apiRequest("/hr-candidates", { method: "POST", body });

export const exportHrCandidates = () =>
  apiRequest("/hr-candidates/export/excel", { blob: true });

// ---- aggregate recruitment summary report (HR / Global Administrator) ----
export const getRecruitmentSummary = (params, signal) =>
  apiRequest("/reports/recruitment-summary", { params, signal });

export const emailRecruitmentSummary = (body) =>
  apiRequest("/reports/recruitment-summary/email", { method: "POST", body });
