import { apiRequest } from "./http.js";

// =====================================================
// HIRING MANAGER ASSIGNMENTS  (HR / Global Administrator)
// The HR Jobs form and the Assignments page both use these records.
// =====================================================

export const listAssignments = (params, signal) =>
  apiRequest("/hiring/assignments", { params, signal });

export const listHiringManagers = (signal) =>
  apiRequest("/hiring/assignments/managers", { signal });

export const createAssignment = (body) =>
  apiRequest("/hiring/assignments", { method: "POST", body });

export const reassignAssignment = (id, body) =>
  apiRequest(`/hiring/assignments/${id}/reassign`, {
    method: "PATCH",
    body,
  });

export const revokeAssignment = (id, reason) =>
  apiRequest(`/hiring/assignments/${id}`, {
    method: "DELETE",
    body: { reason },
  });

// Jobs (with their active hiring managers) for the assignments page.
export const listJobsWithManagers = (signal) =>
  apiRequest("/jobs/manage", { signal });
