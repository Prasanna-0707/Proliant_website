import mongoose from "mongoose";

// =====================================================
// APPLICATION DECISION MODEL
// =====================================================

const applicationDecisionSchema = new mongoose.Schema(
  {
    // Candidate application
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

    // Supports L0, L1, L2, L3, L4, and custom stages
    stageCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    // Preserve stage information at decision time
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

    // Actual decision, separate from interviewer recommendation
    decision: {
      type: String,
      enum: ["Advance", "Reject", "Hold"],
      required: true,
    },

    // Reason supporting the decision
    reason: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // Person recording the decision
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // Role used when making the decision
    roleUsed: {
      type: String,
      required: true,
      trim: true,
    },

    // Links a revised decision to its previous decision
    supersedes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplicationDecision",
      default: null,
    },

    decidedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

applicationDecisionSchema.index({
  application: 1,
  stageOrder: 1,
  decidedAt: -1,
});

applicationDecisionSchema.index({
  job: 1,
  stageCode: 1,
  decidedAt: -1,
});

// =====================================================
// EXPORT MODEL
// =====================================================

const ApplicationDecision =
  mongoose.models.ApplicationDecision ||
  mongoose.model(
    "ApplicationDecision",
    applicationDecisionSchema
  );

export default ApplicationDecision;