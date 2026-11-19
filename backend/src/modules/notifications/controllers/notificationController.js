import StaffNotification from "../models/StaffNotification.js";
import { sendError } from "../../../shared/utils/httpErrors.js";

// Scope every query to the signed-in staff account.
const ownerFilter = (req) => ({
  recipient: req.user._id,
  recipientModel: req.user.constructor?.modelName || "User",
});

// GET /api/notifications?unread=true&limit=20&page=1
export const listNotifications = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const filter = ownerFilter(req);
    if (req.query.unread === "true") filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      StaffNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      StaffNotification.countDocuments(filter),
      StaffNotification.countDocuments({
        ...ownerFilter(req),
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch notifications.");
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await StaffNotification.countDocuments({
      ...ownerFilter(req),
      isRead: false,
    });

    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    return sendError(res, error, "Failed to fetch unread count.");
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await StaffNotification.updateMany(
      { ...ownerFilter(req), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update notifications.");
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await StaffNotification.findOneAndUpdate(
      { _id: req.params.id, ...ownerFilter(req) },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return sendError(res, error, "Failed to update notification.");
  }
};
