import mongoose from "mongoose";

// =====================================================
// COMMON ENUMS
// =====================================================

const ACTOR_TYPES = ["HUMAN", "SYSTEM", "AI_AGENT"];

const SCREENING_DECISIONS = [
  "SHORTLIST",
  "REJECT",
  "ON_HOLD",
  "ESCALATE",

  // Legacy decisions - retained for compatibility
  "Selected",
  "Rejected",
  "On Hold",
];

// =====================================================
// SCREENING CHECKLIST
// =====================================================

const screeningChecklistSchema = new mongoose.Schema(
  {
    skillsMatch: {
      type: Boolean,
      default: null,
    },

    experienceMatch: {
      type: Boolean,
      default: null,
    },

    educationMatch: {
      type: Boolean,
      default: null,
    },

    requirementsMatch: {
      type: Boolean,
      default: null,
    },

    additionalNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// SCREENING HISTORY ENTRY
// =====================================================

const screeningHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "ASSIGNED",
        "REASSIGNED",
        "STARTED",
        "CHECKLIST_UPDATED",
        "SUBMITTED",
        "HR_REVIEW_REQUESTED",
      ],
      required: true,
    },

    // Application and candidate snapshot
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },

    candidateName: {
      type: String,
      trim: true,
      default: "",
    },

    // Screener responsible for the application
    screenerName: {
      type: String,
      trim: true,
      default: "",
    },

    // Candidate application status transition
    previousStatus: {
      type: String,
      trim: true,
      default: "",
    },

    newStatus: {
      type: String,
      trim: true,
      default: "",
    },

    // L0 screening status transition
    previousScreeningStatus: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Cancelled",
        "",
      ],
      default: "",
    },

    newScreeningStatus: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Cancelled",
        "",
      ],
      default: "",
    },

    // Admin reference for human actions.
    // Null for system-generated actions.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    performedByType: {
      type: String,
      enum: ACTOR_TYPES,
      default: "HUMAN",
      required: true,
    },

    // Generic identifier for system and future AI actors.
    performedById: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    performedByName: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    decision: {
      type: String,
      enum: SCREENING_DECISIONS,
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // Date and time when this action occurred
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
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    level: {
      type: String,
      enum: ["L0"],
      default: "L0",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    // -------------------------------------------------
    // PENDING REASSIGNMENT TRACKING
    // -------------------------------------------------

    // True when the assigned screener is no longer
    // eligible and a replacement has not yet been found.
    //
    // assignedTo retains the previous screener reference
    // until a replacement is successfully assigned.
    assignmentPending: {
      type: Boolean,
      default: false,
      index: true,
    },

    assignmentPendingReason: {
      type: String,
      trim: true,
      default: "",
    },

    assignmentPendingSince: {
      type: Date,
      default: null,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    assignedByType: {
      type: String,
      enum: ACTOR_TYPES,
      default: "HUMAN",
      required: true,
    },

    assignedById: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    decision: {
      type: String,
      enum: SCREENING_DECISIONS,
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    escalationReason: {
      type: String,
      trim: true,
      default: "",
    },

    checklist: {
      type: screeningChecklistSchema,
      default: () => ({}),
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    history: {
      type: [screeningHistorySchema],
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

screeningSchema.index(
  {
    application: 1,
    level: 1,
  },
  {
    unique: true,
  }
);

screeningSchema.index({
  assignedTo: 1,
  level: 1,
  status: 1,
});

screeningSchema.index({
  level: 1,
  assignmentPending: 1,
  status: 1,
  createdAt: 1,
});

screeningSchema.index({
  status: 1,
  decision: 1,
  createdAt: -1,
});

// =====================================================
// MODEL
// =====================================================

const Screening =
  mongoose.models.Screening ||
  mongoose.model("Screening", screeningSchema);

export default Screening;