
import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    // Unique identifier, e.g. HR, L0_SCREENER, GLOBAL_ADMIN
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    // Display name of the role
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // Permission identifiers, e.g. admin.users.read
    permissions: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
    },

    // Maximum data scope associated with this role
    dataScope: {
      type: String,
      enum: [
        "GLOBAL",
        "DEPARTMENT",
        "ASSIGNED",
        "SELF",
      ],
      default: "SELF",
    },

    // System-defined roles are protected from deletion
    isSystemRole: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Query optimization
rolePermissionSchema.index({
  isActive: 1,
  name: 1,
});

const RolePermission =
  mongoose.models.RolePermission ||
  mongoose.model("RolePermission", rolePermissionSchema);

export default RolePermission;
