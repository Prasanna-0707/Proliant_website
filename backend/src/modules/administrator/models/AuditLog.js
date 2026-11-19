
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // =====================================================
    // ACTOR INFORMATION
    // =====================================================

    // HUMAN: Administrator or staff member
    // SYSTEM: Automated backend operation
    // AI_AGENT: Future authorized AI agent
    // CANDIDATE: Public candidate-facing action
    actorType: {
      type: String,
      enum: [
        "HUMAN",
        "SYSTEM",
        "AI_AGENT",
        "CANDIDATE",
      ],
      default: "HUMAN",
      required: true,
      index: true,
    },

    // Existing Admin reference.
    // Null for system actors and non-admin actors.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      index: true,
    },

    // Generic actor identifier for future AI agents
    // and system-generated activities.
    actorId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    actorName: {
      type: String,
      default: "",
      trim: true,
    },

    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    // Role used when performing the action.
    roleUsed: {
      type: String,
      default: "",
      trim: true,
    },

    adminScope: {
      type: String,
      enum: ["GLOBAL", "DEPARTMENT"],
      default: null,
    },

    // =====================================================
    // ACTION INFORMATION
    // =====================================================

    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Resource affected by the action.
    targetType: {
      type: String,
      required: true,
      trim: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    targetLabel: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // =====================================================
    // ACTION OUTCOME
    // =====================================================

    outcome: {
      type: String,
      enum: [
        "SUCCESS",
        "FAILURE",
        "PENDING",
        "CANCELLED",
      ],
      default: "SUCCESS",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // BEFORE AND AFTER SNAPSHOTS
    // =====================================================

    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // =====================================================
    // REQUEST AND CORRELATION INFORMATION
    // =====================================================

    requestId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
      index: true,
    },

    correlationId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
      index: true,
    },

    // =====================================================
    // FUTURE AI AGENT INFORMATION
    // =====================================================

    agentId: {
      type: String,
      default: "",
      trim: true,
    },

    toolName: {
      type: String,
      default: "",
      trim: true,
    },

    approvalId: {
      type: String,
      default: "",
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // =====================================================
    // REQUEST SOURCE
    // =====================================================

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =====================================================
// INDEXES
// =====================================================

auditLogSchema.index({
  department: 1,
  createdAt: -1,
});

auditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

auditLogSchema.index({
  actorType: 1,
  createdAt: -1,
});

auditLogSchema.index({
  targetType: 1,
  targetId: 1,
  createdAt: -1,
});

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
