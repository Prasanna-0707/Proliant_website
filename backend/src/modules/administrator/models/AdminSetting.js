
import mongoose from "mongoose";

const adminSettingSchema = new mongoose.Schema(
  {
    // Unique setting identifier, e.g. portal.maintenanceMode
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
      match: /^[a-z0-9._-]+$/,
    },

    // Setting value
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Setting category
    category: {
      type: String,
      enum: [
        "GENERAL",
        "SECURITY",
        "NOTIFICATIONS",
        "RECRUITMENT",
      ],
      default: "GENERAL",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    // Prevent modification of fixed system settings
    isEditable: {
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

adminSettingSchema.index({
  category: 1,
  key: 1,
});

const AdminSetting =
  mongoose.models.AdminSetting ||
  mongoose.model("AdminSetting", adminSettingSchema);

export default AdminSetting;
