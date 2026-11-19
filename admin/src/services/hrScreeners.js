import { apiRequest } from "./http.js";

// =====================================================
// HR L0 SCREENER MANAGEMENT  (HR / Global Administrator)
// =====================================================

export const listScreeners = (params, signal) =>
  apiRequest("/hr-screeners", { params, signal });

export const listScreeningQueue = (params, signal) =>
  apiRequest("/hr-screeners/applications", { params, signal });

export const assignScreener = (body) =>
  apiRequest("/hr-screeners/assign", { method: "POST", body });

export const reassignScreener = (body) =>
  apiRequest("/hr-screeners/reassign", { method: "POST", body });

export const getAssignmentHistory = (params, signal) =>
  apiRequest("/hr-screeners/assignment-history", { params, signal });
