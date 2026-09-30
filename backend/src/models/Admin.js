import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // =====================================================
    // LOGIN EMAIL
    // =====================================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // =====================================================
    // PASSWORD
    // =====================================================

    password: {
      type: String,
      required: true,
    },

    // =====================================================
    // ADMIN PROFILE
    // =====================================================

    name: {
      type: String,
      trim: true,
      default: "",
    },

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

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // TOKEN VERSION
    // =====================================================

    tokenVersion: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // RESET TOKEN VERSION
    // =====================================================

    resetTokenVersion: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // FIRST LOGIN PASSWORD CHANGE
    // =====================================================

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