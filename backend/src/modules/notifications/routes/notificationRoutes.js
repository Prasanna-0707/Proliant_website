import express from "express";

import authMiddleware from "../../auth/middleware/authMiddleware.js";
import validateObjectIdParam from "../../../shared/middleware/validateObjectId.js";

import {
  listNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController.js";

// Base URL: /api/notifications  (any signed-in staff account)
const router = express.Router();
router.param("id", validateObjectIdParam);

router.get("/", authMiddleware, listNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.patch("/:id/read", authMiddleware, markNotificationRead);

export default router;
