import { apiRequest } from "./http.js";

// =====================================================
// ADMINISTRATOR CONSOLE API  (Global / Department Administrator)
// =====================================================

// ---- users (Admin + User collections) ----
export const listAdminUsers = (params, signal) =>
  apiRequest("/admin/users", { params, signal });

export const getAdminUser = (id, signal) =>
  apiRequest(`/admin/users/${id}`, { signal });

export const createAdminUser = (body) =>
  apiRequest("/admin/users", { method: "POST", body });

export const updateAdminUser = (id, body) =>
  apiRequest(`/admin/users/${id}`, { method: "PATCH", body });

export const updateAdminUserRole = (id, body) =>
  apiRequest(`/admin/users/${id}/role`, { method: "PATCH", body });

// ---- roles & permissions ----
export const listRoles = (params, signal) =>
  apiRequest("/admin/roles", { params, signal });

export const updateRolePermissions = (id, body) =>
  apiRequest(`/admin/roles/${id}/permissions`, { method: "PUT", body });

// ---- audit logs ----
export const listAuditLogs = (params, signal) =>
  apiRequest("/admin/audit-logs", { params, signal });

// ---- settings ----
export const listSettings = (params, signal) =>
  apiRequest("/admin/settings", { params, signal });

export const saveSetting = (body) =>
  apiRequest("/admin/settings", { method: "PATCH", body });

// ---- team members ----
export const setTeamMemberStatus = (id, status, reason) =>
  apiRequest(`/auth/team-members/${id}/status`, {
    method: "PATCH",
    body: { status, reason },
  });

export const deleteTeamMember = (id, reason) =>
  apiRequest(`/auth/team-members/${id}`, { method: "DELETE", body: { reason } });