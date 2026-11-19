
import mongoose from "mongoose";

// =====================================================
// ADMINISTRATOR ROLE HELPER
// =====================================================

const isAdministratorRole = (role) =>
  String(role || "").trim().toLowerCase() === "administrator";

// =====================================================
// ADMIN SCHEMA
// =====================================================

const adminSchema = new mongoose.Schema(
  {
    // -------------------------------------------------
    // LOGIN CREDENTIALS
    // -------------------------------------------------

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

    // -------------------------------------------------
    // PERSONAL INFORMATION
    // -------------------------------------------------

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

    // -------------------------------------------------
    // PORTAL ROLE
    // Mandatory for every account.
    // No default role is assigned automatically.
    // -------------------------------------------------

    role: {
      type: String,
      required: true,
      trim: true,
    },

    // -------------------------------------------------
    // DESIGNATION
    // Optional for every account.
    // Never used for authorization.
    // -------------------------------------------------

    designation: {
      type: String,
      trim: true,
      default: undefined,
    },

    // -------------------------------------------------
    // DEPARTMENT
    // Required only for DEPARTMENT Administrator scope.
    // Regular staff may have a department or leave it empty.
    // -------------------------------------------------

    department: {
      type: String,
      trim: true,
      default: "",
    },

    // -------------------------------------------------
    // ADMINISTRATOR SCOPE
    //
    // GLOBAL     = Global Administrator
    // DEPARTMENT = Department Administrator
    // null       = Regular portal roles
    // -------------------------------------------------

    adminScope: {
      type: String,
      default: null,

      set: (value) => {
        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          return null;
        }

        return String(value).trim().toUpperCase();
      },

      validate: {
        validator: function (value) {
          return (
            value === null ||
            value === undefined ||
            value === "" ||
            ["GLOBAL", "DEPARTMENT"].includes(value)
          );
        },
        message:
          "adminScope must be GLOBAL, DEPARTMENT or null.",
      },
    },

    // -------------------------------------------------
    // ACCOUNT STATUS
    // -------------------------------------------------

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // -------------------------------------------------
    // SOFT DELETION
    // -------------------------------------------------

    deletedAt: {
      type: Date,
      default: null,
    },

    // -------------------------------------------------
    // AUTHENTICATION AND SESSION MANAGEMENT
    // -------------------------------------------------

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

// =====================================================
// CROSS-FIELD ACCOUNT CONFIGURATION VALIDATION
// =====================================================

adminSchema.pre("validate", function () {
  const role = String(this.role || "").trim();
  const department = String(this.department || "").trim();
  const scope = this.adminScope;

  // -------------------------------------------------
  // ROLE VALIDATION
  // -------------------------------------------------

  if (!role) {
    this.invalidate(
      "role",
      "A portal role is required for every account."
    );

    return;
  }

  // -------------------------------------------------
  // ADMINISTRATOR VALIDATION
  // -------------------------------------------------

  if (isAdministratorRole(role)) {
    // Administrator accounts must have a valid scope.

    if (!["GLOBAL", "DEPARTMENT"].includes(scope)) {
      this.invalidate(
        "adminScope",
        "Administrator accounts require GLOBAL or DEPARTMENT scope."
      );
    }

    // GLOBAL ADMINISTRATOR
    // Department must not be assigned.

    if (scope === "GLOBAL" && department) {
      this.invalidate(
        "department",
        "A Global Administrator must not have a department assigned."
      );
    }

    // DEPARTMENT ADMINISTRATOR
    // Department is mandatory.

    if (scope === "DEPARTMENT" && !department) {
      this.invalidate(
        "department",
        "A Department Administrator must have a department assigned."
      );
    }

    return;
  }

  // -------------------------------------------------
  // REGULAR PORTAL ROLE VALIDATION
  // -------------------------------------------------

  // HR, Screener, Interviewer, Recruiter,
  // Hiring Manager and other regular roles
  // must not have administrator scope.

  if (
    scope !== null &&
    scope !== undefined &&
    scope !== ""
  ) {
    this.invalidate(
      "adminScope",
      "Regular staff accounts cannot have administrator scope."
    );
  }
});

// =====================================================
// MODEL
// =====================================================

const Admin =
  mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);

export default Admin;
