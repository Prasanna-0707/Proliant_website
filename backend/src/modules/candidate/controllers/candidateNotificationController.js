
import mongoose from "mongoose";
import CandidateNotification from "../../../models/CandidateNotification.js";

// Get Candidate Notifications
export const getCandidateNotifications = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    const notifications = await CandidateNotification.find({
      candidate: candidateId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await CandidateNotification.countDocuments({
      candidate: candidateId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Candidate notifications fetched successfully",
      unreadCount,
      totalNotifications: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Candidate Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Get Unread Notifications Count
export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    const unreadCount = await CandidateNotification.countDocuments({
      candidate: candidateId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Unread notifications count fetched successfully",
      unreadCount,
    });
  } catch (error) {
    console.error("Unread Notifications Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications count",
    });
  }
};

// Mark One Notification as Read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const candidateId = req.candidate._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await CandidateNotification.findOneAndUpdate(
      {
        _id: notificationId,
        candidate: candidateId,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification As Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// Mark All Notifications as Read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    const result = await CandidateNotification.updateMany(
      {
        candidate: candidateId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark All Notifications As Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};
