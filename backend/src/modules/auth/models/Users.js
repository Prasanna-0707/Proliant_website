import mongoose from "mongoose";

import { USER_ROLES } from "../../../shared/constants/roles.js";

// =====================================================
// USER MODEL
//
// Staff accounts that are NOT administrators:
// HR, Interviewer, Hiring Manager and L0 Screener
// (plus their related role variants).
//
// Global and Department Administrators are stored in the
// separate Admin collection and must never be stored here.
// =====================================================

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },

    designation: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Soft deletion: null means the account has not been deleted.
    deletedAt: {
      type: Date,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    resetTokenVersion: {
      type: Number,
      default: 0,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
