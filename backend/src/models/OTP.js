import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["login", "reset"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expireAfterSeconds: 0,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;