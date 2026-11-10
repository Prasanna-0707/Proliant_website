
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    // =====================================================
    // CANDIDATE INFORMATION
    // =====================================================

    position: {
      type: String,
      required: true,
      trim: true,
    },

    areaOfInterest: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    isFresher: {
      type: Boolean,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
    },

    highestQualification: {
      type: String,
      required: true,
      trim: true,
    },

    currentCompany: {
      type: String,
      trim: true,
    },

    noticePeriod: {
      type: String,
      enum: [
        "Immediately",
        "30 Days",
        "60 Days",
        "90 Days",
      ],
      required: true,
    },

    coverMessage: {
      type: String,
      trim: true,
    },

    resume: {
      type: String,
    },

    // =====================================================
    // JOB RELATIONSHIP
    // Connects the candidate application to a Job record.
    // Optional for existing legacy candidate records.
    // =====================================================

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
      index: true,
    },

    // Department is derived from the associated Job
    // by the backend, never trusted from the frontend.
    department: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    // =====================================================
    // RECRUITMENT WORKFLOW
    // =====================================================

    // Current recruitment stage.
    // Custom workflow stage codes are supported.
    currentStage: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 100,
      match: /^[A-Z0-9_-]+$/,
      default: "L0_SCREENING",
      index: true,
    },

    // Assigned L0 screener.
    assignedScreener: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      index: true,
    },

    // Current application status.
    // Legacy statuses are retained for backward compatibility.
    status: {
      type: String,
      enum: [
        // Existing application statuses
        "New",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
        "On Hold",

        // L0 recruitment workflow statuses
        "ASSIGNED_TO_L0",
        "L0_SHORTLISTED",
        "L0_REJECTED",
        "L0_ON_HOLD",
        "HR_REVIEW_REQUIRED",
      ],
      default: "New",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

// Support job-specific recruitment workflow queries.
candidateSchema.index({
  job: 1,
  currentStage: 1,
  status: 1,
});

// Support assigned screener application queries.
candidateSchema.index({
  assignedScreener: 1,
  status: 1,
  createdAt: -1,
});

// =====================================================
// EXPORT MODEL
// =====================================================

const Candidate =
  mongoose.models.Candidate ||
  mongoose.model("Candidate", candidateSchema);

export default Candidate;
