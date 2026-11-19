import { apiRequest } from "./http.js";

// =====================================================
// STAFF NOTIFICATIONS  (any signed-in staff account)
// =====================================================

export const listStaffNotifications = (params, signal) =>
  apiRequest("/notifications", { params, signal });

export const markStaffNotificationRead = (id) =>
  apiRequest(`/notifications/${id}/read`, { method: "PATCH" });

export const markAllStaffNotificationsRead = () =>
  apiRequest("/notifications/read-all", { method: "PATCH" });

// Tells every mounted bell / page to reload after a change.
export const notifyStaffUpdated = () =>
  window.dispatchEvent(new Event("staff-notifications-updated"));
