import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "employeeCount",
    },
    employeeCount: {
      type: Number,
      required: true,
      min: 0,
      default: 130,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSetting =
  mongoose.models.SiteSetting ||
  mongoose.model("SiteSetting", siteSettingSchema);

export default SiteSetting;