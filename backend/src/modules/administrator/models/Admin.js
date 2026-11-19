import mongoose from "mongoose";

import {
  ADMIN_ROLE,
  ADMIN_SCOPES,
} from "../../../shared/constants/roles.js";

const adminSchema = new mongoose.Schema(
  {
    // Login credentials
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

    // Personal information
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

    // The Admin collection holds Global and Department Administrators
    // only. All other staff roles belong in the User collection.
    role: {
      type: String,
      enum: [ADMIN_ROLE],
      default: ADMIN_ROLE,
    },

    designation: {
      type: String,
      trim: true,
      default: "Administrator",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    // GLOBAL = Global Administrator, DEPARTMENT = Department Administrator
    adminScope: {
      type: String,
      enum: ADMIN_SCOPES,
      default: null,
      // New administrators must always declare a scope. Existing
      // legacy records without one remain loadable and savable.
      required: function requiresScopeForNewAdmin() {
        return this.isNew;
      },
    },

    // Account status
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

    // Authentication and session management
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

const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;