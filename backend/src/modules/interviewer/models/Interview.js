import mongoose from "mongoose";

// =====================================================
// INTERVIEW EVALUATION CRITERIA
// =====================================================

const evaluationCriteriaSchema = new mongoose.Schema(
  {
    questionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    answer: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    comments: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { _id: false }
);

// =====================================================
// INTERVIEW EVALUATION
// =====================================================

const evaluationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Draft", "Submitted"],
      default: "Draft",
    },

    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    strengths: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    concerns: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    recommendation: {
      type: String,
      enum: ["Advance", "Reject", "Hold"],
    },

    criteria: {
      type: [evaluationCriteriaSchema],
      default: [],
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// =====================================================
// EVALUATION CORRECTION HISTORY
// Preserves the previous evaluation when corrected.
// =====================================================

const evaluationHistorySchema = new mongoose.Schema(
  {
    previousEvaluation: {
      type: evaluationSchema,
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    correctionReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// =====================================================
// INTERVIEW SCHEMA
// =====================================================

const interviewSchema = new mongoose.Schema(
  {
    // Candidate application associated with the interview
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    // Job associated with this application
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    // Configurable stage: L1, L2, L3, L4, etc.
    // Custom codes are also supported.
    stageCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
      match: /^[A-Z0-9_-]+$/,
    },

    // Name and order are snapshots from the workflow
    // at the time the interview is assigned.
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

    // Assigned interviewer
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    // User who created the assignment
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // Interview schedule
    scheduledAt: {
      type: Date,
      required: true,
    },

    timeZone: {
      type: String,
      required: true,
      trim: true,
    },

    durationMinutes: {
      type: Number,
      min: 15,
      max: 480,
      default: 60,
    },

    mode: {
      type: String,
      enum: ["Online", "In Person", "Phone"],
      default: "Online",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // Interview lifecycle
    status: {
      type: String,
      enum: [
        "Scheduled",
        "Confirmed",
        "Completed",
        "Rescheduled",
        "Cancelled",
        "No-Show",
      ],
      default: "Scheduled",
      index: true,
    },

    // Current evaluation
    evaluation: {
      type: evaluationSchema,
      default: undefined,
    },

    // Previous submitted evaluations and correction reasons
    evaluationHistory: {
      type: [evaluationHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

interviewSchema.index({
  assignedTo: 1,
  status: 1,
  scheduledAt: 1,
});

interviewSchema.index({
  application: 1,
  stageOrder: 1,
  scheduledAt: -1,
});

interviewSchema.index({
  job: 1,
  stageCode: 1,
});

// =====================================================
// EXPORT MODEL
// =====================================================

const Interview =
  mongoose.models.Interview ||
  mongoose.model("Interview", interviewSchema);

export default Interview;