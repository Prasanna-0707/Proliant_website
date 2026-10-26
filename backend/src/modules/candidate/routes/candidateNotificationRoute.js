
import express from "express";

import candidateAuthMiddleware from "../../../middleware/candidateAuthMiddleware.js";

import {
  getCandidateNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/candidateNotificationController.js";

const router = express.Router();

// Get Candidate Notifications
router.get(
  "/",
  candidateAuthMiddleware,
  getCandidateNotifications
);

// Get Unread Notifications Count
router.get(
  "/unread-count",
  candidateAuthMiddleware,
  getUnreadNotificationsCount
);

// Mark All Notifications as Read
router.patch(
  "/read-all",
  candidateAuthMiddleware,
  markAllNotificationsAsRead
);

// Mark One Notification as Read
router.patch(
  "/:notificationId/read",
  candidateAuthMiddleware,
  markNotificationAsRead
);

export default router;
