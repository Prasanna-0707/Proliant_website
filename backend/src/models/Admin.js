import mongoose from "mongoose";

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

    // Portal permissions and organizational information
    role: {
      type: String,
      trim: true,
      default: "Administrator",
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

    adminScope: {
      type: String,
      enum: ["GLOBAL", "DEPARTMENT"],
      default: null,
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

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;