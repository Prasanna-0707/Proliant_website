import mongoose from "mongoose";

// =====================================================
// SCREENING HISTORY ENTRY
// =====================================================

const screeningHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["ASSIGNED", "REASSIGNED", "SUBMITTED"],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    decision: {
      type: String,
      enum: ["Selected", "Rejected", "On Hold"],
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// SCREENING ASSIGNMENT AND RESULT
// =====================================================

const screeningSchema = new mongoose.Schema(
  {
    // Existing application record in the Candidate collection
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    // Initial screening level
    level: {
      type: String,
      enum: ["L0"],
      default: "L0",
      required: true,
    },

    // Interviewer currently responsible for the screening
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    // HR/recruiter or authorized administrator who assigned it
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      index: true,
    },

    decision: {
      type: String,
      enum: ["Selected", "Rejected", "On Hold"],
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // Preserve previous assignments and screening submissions
    history: {
      type: [screeningHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// One current L0 screening record per application.
// Reassignment and previous decisions are preserved in history.
screeningSchema.index(
  { application: 1, level: 1 },
  { unique: true }
);

const Screening = mongoose.model("Screening", screeningSchema);

export default Screening;