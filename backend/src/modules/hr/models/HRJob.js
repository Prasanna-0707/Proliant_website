import mongoose from "mongoose";
import { STAFF_MODELS } from "../../../shared/constants/roles.js";

const jobWorkflowStageSchema = new mongoose.Schema(
  {
    stageCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
      match: /^[A-Z0-9_-]+$/,
    },
    stageName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    stageOrder: {
      type: Number,
      required: true,
      min: 0,
    },
    stageType: {
      type: String,
      enum: [
        "SCREENING",
        "INTERVIEW",
        "HR_FINAL",
        "OFFER",
        "CUSTOM",
      ],
      default: "INTERVIEW",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: [
        "Full Time",
        "Part Time",
        "Contract",
        "Internship",
      ],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
    },
    workArrangement: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
    },
    vacancies: {
      type: Number,
      min: 1,
      default: 1,
    },
    requiredSkills: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    applicationStartDate: {
      type: Date,
      default: null,
    },
    applicationEndDate: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "ownerModel",
      default: null,
    },

    // Which staff collection "owner" refers to.
    ownerModel: {
      type: String,
      enum: STAFF_MODELS,
      default: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      default: null,
      immutable: true,
    },

    // Which staff collection "createdBy" refers to.
    createdByModel: {
      type: String,
      enum: STAFF_MODELS,
      default: "User",
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    interviewWorkflow: {
      type: [jobWorkflowStageSchema],
      default: [],
      validate: {
        validator(stages) {
          const stageCodes = stages.map(
            (stage) => stage.stageCode
          );

          const stageOrders = stages.map(
            (stage) => stage.stageOrder
          );

          const hasUniqueCodes =
            new Set(stageCodes).size === stageCodes.length;

          const hasUniqueOrders =
            new Set(stageOrders).size === stageOrders.length;

          return hasUniqueCodes && hasUniqueOrders;
        },
        message:
          "Interview workflow stage codes and stage orders must be unique.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Job =
  mongoose.models.Job ||
  mongoose.model("Job", jobSchema);

export default Job;
