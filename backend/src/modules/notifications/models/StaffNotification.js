import mongoose from "mongoose";
import { STAFF_MODELS } from "../../../shared/constants/roles.js";

// Notifications for staff accounts (Admin and User collections).
// Candidate-facing notifications stay in CandidateNotification.
const staffNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
      index: true,
    },

    // Which staff collection "recipient" refers to.
    recipientModel: {
      type: String,
      enum: STAFF_MODELS,
      required: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 200 },

    message: { type: String, required: true, trim: true, maxlength: 1000 },

    type: {
      type: String,
      enum: [
        "INTERVIEW",
        "SCREENING",
        "EVALUATION",
        "WORKFLOW",
        "ASSIGNMENT",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    // Optional in-app route the notification points to.
    link: { type: String, trim: true, default: "" },

    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },

    relatedInterview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      default: null,
    },

    isRead: { type: Boolean, default: false },

    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

staffNotificationSchema.index({
  recipient: 1,
  recipientModel: 1,
  isRead: 1,
  createdAt: -1,
});

const StaffNotification =
  mongoose.models.StaffNotification ||
  mongoose.model("StaffNotification", staffNotificationSchema);

export default StaffNotification;
