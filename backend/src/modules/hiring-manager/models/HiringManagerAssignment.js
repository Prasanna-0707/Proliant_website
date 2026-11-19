import mongoose from "mongoose";

const hiringManagerAssignmentSchema = new mongoose.Schema(
  {
    // The Hiring Manager who receives access to the job.
    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    // The job assigned to that Hiring Manager.
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    // The authenticated user who made the assignment.
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    // Revoked assignments remain in the database for history.
    status: {
      type: String,
      enum: ["Active", "Revoked"],
      default: "Active",
      index: true,
    },

    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revocationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active assignments for the same
// Hiring Manager and job, while retaining revoked records.
hiringManagerAssignmentSchema.index(
  {
    hiringManager: 1,
    job: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "Active",
    },
    name: "unique_active_hiring_manager_job_assignment",
  }
);

hiringManagerAssignmentSchema.index({
  hiringManager: 1,
  status: 1,
});

hiringManagerAssignmentSchema.index({
  job: 1,
  status: 1,
});

const HiringManagerAssignment =
  mongoose.models.HiringManagerAssignment ||
  mongoose.model(
    "HiringManagerAssignment",
    hiringManagerAssignmentSchema
  );

export default HiringManagerAssignment;