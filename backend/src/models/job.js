import mongoose from "mongoose";

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
    // NEW: WORK ARRANGEMENT
    // ==========================================

    workArrangement: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
    },

    // ==========================================
    // NEW: NUMBER OF VACANCIES
    // ==========================================

    vacancies: {
      type: Number,
      min: 1,
      default: 1,
    },

    // ==========================================
    // NEW: REQUIRED SKILLS
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
    // NEW: APPLICATION DATES
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
    // NEW: JOB OWNER
    // Staff member responsible for this vacancy.
    // ==========================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ==========================================
    // JOB CREATION AUDIT INFORMATION
    // Staff member who created this job.
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
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;