import mongoose from "mongoose";

const candidateNotificationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateAccount",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION",
        "INTERVIEW",
        "STATUS_UPDATE",
        "GENERAL",
      ],
      default: "GENERAL",
      required: true,
    },

    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

candidateNotificationSchema.index({
  candidate: 1,
  isRead: 1,
  createdAt: -1,
});

const CandidateNotification = mongoose.model(
  "CandidateNotification",
  candidateNotificationSchema
);

export default CandidateNotification;