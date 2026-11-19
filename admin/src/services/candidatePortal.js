import { apiRequest, saveSession, clearSession, getStoredUser } from "./http.js";

// =====================================================
// CANDIDATE PORTAL API  (candidate session)
// =====================================================

export const registerCandidate = ({ name, email, phone, password }) =>
  apiRequest("/candidate/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, phone, password },
  });

export const loginCandidate = async ({ email, password }) => {
  const data = await apiRequest("/candidate/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  saveSession("candidate", data.token, data.candidate);

  // Kept for pages that still read the candidate's name directly.
  try {
    localStorage.setItem("candidateName", data.candidate?.name || "");
  } catch {
    /* storage unavailable */
  }

  return data;
};

export const logoutCandidate = () => {
  clearSession("candidate");

  try {
    localStorage.removeItem("candidateName");
  } catch {
    /* storage unavailable */
  }
};

export const getCandidateUser = () => getStoredUser("candidate");

// ---- jobs (published jobs are public to signed-in candidates) ----
export const listJobs = (params, signal) =>
  apiRequest("/candidate/jobs", { auth: "candidate", params, signal });

export const getJob = (jobId, signal) =>
  apiRequest(`/candidate/jobs/${jobId}`, { auth: "candidate", signal });

// ---- profile ----
export const getProfile = (signal) =>
  apiRequest("/candidate/profile", { auth: "candidate", signal });

export const updateProfile = (body) =>
  apiRequest("/candidate/profile", { method: "PUT", auth: "candidate", body });

export const saveResume = (body) =>
  apiRequest("/candidate/profile/resume", {
    method: "PUT",
    auth: "candidate",
    body,
  });

export const removeResume = () =>
  apiRequest("/candidate/profile/resume", {
    method: "DELETE",
    auth: "candidate",
  });

// ---- applications ----
export const applyForJob = (body) =>
  apiRequest("/candidate/applications", {
    method: "POST",
    auth: "candidate",
    body,
  });

export const listMyApplications = (signal) =>
  apiRequest("/candidate/applications", { auth: "candidate", signal });

export const getMyApplication = (applicationId, signal) =>
  apiRequest(`/candidate/applications/${applicationId}`, {
    auth: "candidate",
    signal,
  });

export const getCandidateDashboard = (signal) =>
  apiRequest("/candidate/dashboard", { auth: "candidate", signal });

// ---- notifications ----
export const listNotifications = (signal) =>
  apiRequest("/candidate/notifications", { auth: "candidate", signal });

export const getUnreadCount = (signal) =>
  apiRequest("/candidate/notifications/unread-count", {
    auth: "candidate",
    signal,
  });

export const markNotificationRead = (id) =>
  apiRequest(`/candidate/notifications/${id}/read`, {
    method: "PATCH",
    auth: "candidate",
  });

export const markAllNotificationsRead = () =>
  apiRequest("/candidate/notifications/read-all", {
    method: "PATCH",
    auth: "candidate",
  });
// ---- password reset (OTP by email) ----
export const requestPasswordReset = (email) =>
  apiRequest("/candidate/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });

export const verifyPasswordResetOtp = (email, otp) =>
  apiRequest("/candidate/auth/verify-reset-otp", {
    method: "POST",
    auth: false,
    body: { email, otp },
  });

export const resetPassword = ({ email, resetToken, newPassword }) =>
  apiRequest("/candidate/auth/reset-password", {
    method: "POST",
    auth: false,
    body: { email, resetToken, newPassword },
  });
