import mongoose from "mongoose";

// =====================================================
// CONFIGURABLE JOB WORKFLOW STAGE
// =====================================================

const jobWorkflowStageSchema = new mongoose.Schema(
  {
    // Examples: L0, L1, L2, L3, L4, TECHNICAL_ROUND
    stageCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
      match: /^[A-Z0-9_-]+$/,
    },

    // Readable name displayed in the hiring portal
    stageName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Determines the sequence of stages for this job
    stageOrder: {
      type: Number,
      required: true,
      min: 0,
    },

    // Identifies the general purpose of the stage
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

    // Allows a configured stage to be disabled
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// JOB SCHEMA
// =====================================================

const jobSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC JOB INFORMATION
    // ==========================================

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

    // ==========================================
    // WORK ARRANGEMENT
    // ==========================================

    workArrangement: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
    },

    // ==========================================
    // NUMBER OF VACANCIES
    // ==========================================

    vacancies: {
      type: Number,
      min: 1,
      default: 1,
    },

    // ==========================================
    // REQUIRED SKILLS
    // ==========================================

    requiredSkills: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    // ==========================================
    // APPLICATION DATES
    // ==========================================

    applicationStartDate: {
      type: Date,
      default: null,
    },

    applicationEndDate: {
      type: Date,
      default: null,
    },

    // ==========================================
    // JOB OWNER
    // ==========================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ==========================================
    // JOB CREATION AUDIT INFORMATION
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      immutable: true,
    },

    // ==========================================
    // JOB STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    // ==========================================
    // NEW: CONFIGURABLE INTERVIEW WORKFLOW
    // Each job can have a different sequence.
    // ==========================================

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

          // A workflow cannot contain duplicate stage codes.
          const hasUniqueCodes =
            new Set(stageCodes).size === stageCodes.length;

          // Each stage must have a unique sequence position.
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

// =====================================================
// EXPORT MODEL
// =====================================================

const Job =
  mongoose.models.Job ||
  mongoose.model("Job", jobSchema);

export default Job;